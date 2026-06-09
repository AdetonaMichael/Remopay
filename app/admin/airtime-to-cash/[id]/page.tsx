'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Send,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  User,
  Phone,
  Calendar,
  DollarSign,
  Award,
  X,
  ChevronDown,
  Copy,
  Download,
  Eye,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { airtimeToCashService } from '@/services/airtime-to-cash.service';
import { AdminTransactionView, AirtimeCashTransactionStatus } from '@/types/airtime-to-cash.types';

const STATUS_CONFIG: Record<AirtimeCashTransactionStatus, { color: string; label: string }> = {
  pending: { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
  transfer_submitted: { color: 'bg-blue-100 text-blue-700', label: 'Proof Submitted' },
  verification_in_progress: { color: 'bg-yellow-100 text-yellow-700', label: 'Verifying' },
  approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
  processing: { color: 'bg-blue-100 text-blue-700', label: 'Processing' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
  rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
};

export default function AdminTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();

  const transactionId = Number(params.id);

  const [transaction, setTransaction] = useState<AdminTransactionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  
  // Approval form state
  const [approvalNotes, setApprovalNotes] = useState('');
  
  // UI state
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  const REJECTION_REASONS = [
    'Screenshot is blurry or unclear',
    'Amount doesn\'t match',
    'Screenshot is invalid',
    'Transaction not visible',
    'Duplicate request',
    'Other reason',
  ];

  // Fetch transaction details
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const data = await airtimeToCashService.getAdminTransaction(transactionId);
        setTransaction(data);
      } catch (error: any) {
        addToast({
          message: 'Failed to load transaction',
          type: 'error',
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, router, addToast]);

  const handleApproveClick = () => {
    setConfirmAction('approve');
    setShowConfirmDialog(true);
  };

  const handleRejectClick = () => {
    if (!rejectionReason.trim()) {
      addToast({
        message: 'Please select a rejection reason',
        type: 'error',
      });
      return;
    }

    if (rejectionReason === 'Other reason' && !customRejectionReason.trim()) {
      addToast({
        message: 'Please provide a custom rejection reason',
        type: 'error',
      });
      return;
    }

    setConfirmAction('reject');
    setShowConfirmDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!transaction) return;

    try {
      setActionLoading(true);
      await airtimeToCashService.approveConversion(transaction.id, {
        notes: approvalNotes,
      });

      addToast({
        message: '✓ Conversion approved successfully!',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/airtime-to-cash');
      }, 2000);
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || 'Failed to approve conversion',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!transaction) return;

    try {
      setActionLoading(true);
      const finalReason =
        rejectionReason === 'Other reason' ? customRejectionReason : rejectionReason;

      await airtimeToCashService.rejectConversion(transaction.id, {
        rejection_reason: finalReason,
        notes: rejectionNotes,
      });

      addToast({
        message: '✓ Conversion rejected successfully',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/airtime-to-cash');
      }, 2000);
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || 'Failed to reject conversion',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(false);
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#d71927]" size={24} />
          <p className="text-gray-600">Loading transaction...</p>
        </div>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-4">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="font-bold text-red-900">Transaction not found</p>
          </div>
        </div>
        <Button
          onClick={() => router.back()}
          className="mt-4 rounded-2xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Go Back
        </Button>
      </Card>
    );
  }

  const config = STATUS_CONFIG[transaction.status];
  const canApprove =
    transaction.status === 'transfer_submitted' ||
    transaction.status === 'verification_in_progress';
  const canReject = !transaction.completed_at && transaction.status !== 'rejected';

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            onClick={() => router.back()}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction #{transaction.id}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-gray-600">{transaction.reference}</p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(transaction.reference);
                  addToast({
                    message: 'Reference ID copied!',
                    type: 'success',
                  });
                }}
                className="rounded-lg bg-gray-100 p-1 hover:bg-gray-200"
              >
                <Copy size={14} className="text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main Content - Left Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900">
                  {config.label}
                </p>
              </div>
              <div className={`inline-flex rounded-full px-4 py-2 text-sm font-bold uppercase ${config.color}`}>
                {config.label}
              </div>
            </div>
          </Card>

          {/* User Information */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="mb-4 text-sm font-bold text-gray-900">User Information</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Full Name</p>
                  <p className="font-bold text-gray-900">
                    {transaction.user?.first_name} {transaction.user?.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Phone (Registered)</p>
                  <p className="font-bold text-gray-900">{transaction.user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <AlertCircle className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-bold text-gray-900">{transaction.user?.email}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction Details */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="mb-4 text-sm font-bold text-gray-900">
              Conversion Details
            </p>

            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-600">Provider</p>
                <p className="mt-1 text-lg font-extrabold text-gray-900">
                  {transaction.provider.toUpperCase()}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-600">Phone Number (Sender)</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-bold text-gray-900">
                    {transaction.phone_number}
                  </p>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(transaction.phone_number);
                      addToast({
                        message: 'Phone number copied!',
                        type: 'success',
                      });
                    }}
                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
                  >
                    <Copy size={14} className="text-gray-600" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-600">Airtime Amount</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#d71927]">
                    ₦{transaction.airtime_amount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-600">Service Fee</p>
                  <p className="mt-1 font-bold text-gray-900">
                    ₦{transaction.service_fee.toLocaleString()} (
                    {(transaction.service_fee_percentage * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-600">Net Amount</p>
                  <p className="mt-1 font-bold text-gray-900">
                    ₦{transaction.net_amount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                  <p className="mt-1 font-bold text-gray-900">
                    {(transaction.conversion_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {transaction.cash_credited > 0 && (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-xs text-green-600">Cash Credited</p>
                  <p className="mt-1 text-2xl font-extrabold text-green-900">
                    ₦{transaction.cash_credited.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Screenshot */}
          {transaction.screenshot_url && (
            <Card className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-900">Transfer Proof</p>
                <Button
                  onClick={() => setShowScreenshotModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <Eye size={14} />
                  View Full Size
                </Button>
              </div>

              <img
                src={transaction.screenshot_url}
                alt="Transfer proof"
                className="w-full rounded-2xl border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition"
                onClick={() => setShowScreenshotModal(true)}
              />

              <p className="mt-3 text-xs text-gray-600">
                Uploaded{' '}
                {new Date(
                  transaction.screenshot_uploaded_at || ''
                ).toLocaleString()}
              </p>
            </Card>
          )}

          {/* Action Section */}
          {(transaction.status === 'transfer_submitted' || transaction.status === 'verification_in_progress') && (
            <>
              {/* Approval Card */}
              <Card className={`rounded-2xl border-2 bg-white p-6 cursor-pointer transition ${
                showApprovalForm
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}>
                <div
                  onClick={() => !showApprovalForm && setShowApprovalForm(true)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Check className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">✓ Approve</p>
                      <p className="text-xs text-gray-600">Accept this conversion</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition ${showApprovalForm ? 'rotate-180' : ''}`}
                  />
                </div>

                {showApprovalForm && (
                  <div className="mt-6 space-y-4 border-t border-green-200 pt-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-900">
                        Cash to Credit: <span className="text-lg text-green-600 font-bold">₦{Number(transaction.cash_credited || 0) > 0 ? Number(transaction.cash_credited).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (transaction.net_amount * transaction.conversion_rate).toFixed(2)}</span>
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        This amount will be credited to user's wallet
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-2">
                        Internal Notes (Optional)
                      </label>
                      <textarea
                        placeholder="Add internal notes about this approval..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => setShowApprovalForm(false)}
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApproveClick}
                        disabled={actionLoading}
                        className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Approve & Process
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Rejection Card */}
              <Card className={`rounded-2xl border-2 bg-white p-6 cursor-pointer transition ${
                showRejectionForm
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}>
                <div
                  onClick={() => !showRejectionForm && setShowRejectionForm(true)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <X className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">✗ Reject</p>
                      <p className="text-xs text-gray-600">Decline this conversion</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition ${showRejectionForm ? 'rotate-180' : ''}`}
                  />
                </div>

                {showRejectionForm && (
                  <div className="mt-6 space-y-4 border-t border-red-200 pt-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-2">
                        Rejection Reason <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="">Select a reason...</option>
                        {REJECTION_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>

                    {rejectionReason === 'Other reason' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-2">
                          Custom Reason <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          placeholder="Please specify the rejection reason..."
                          value={customRejectionReason}
                          onChange={(e) => setCustomRejectionReason(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-2">
                        Internal Notes (Optional)
                      </label>
                      <textarea
                        placeholder="Add internal notes about this rejection..."
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => setShowRejectionForm(false)}
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRejectClick}
                        disabled={actionLoading || !rejectionReason}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <X size={16} />
                            Reject Request
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Timeline */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="mb-4 text-sm font-bold text-gray-900">Timeline</p>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600">Created</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>

              {transaction.screenshot_uploaded_at && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-600">Proof Submitted</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {new Date(transaction.screenshot_uploaded_at).toLocaleString()}
                  </p>
                </div>
              )}

              {transaction.approved_at && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-600">Approved</p>
                  <p className="mt-1 text-sm font-semibold text-green-900">
                    {new Date(transaction.approved_at).toLocaleString()}
                  </p>
                  {transaction.approvedBy && (
                    <p className="mt-1 text-xs text-gray-600">
                      By {transaction.approvedBy.first_name}{' '}
                      {transaction.approvedBy.last_name}
                    </p>
                  )}
                </div>
              )}

              {transaction.completed_at && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="mt-1 text-sm font-semibold text-green-900">
                    {new Date(transaction.completed_at).toLocaleString()}
                  </p>
                </div>
              )}

              {transaction.rejected_at && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-600">Rejected</p>
                  <p className="mt-1 text-sm font-semibold text-red-900">
                    {new Date(transaction.rejected_at).toLocaleString()}
                  </p>
                  {transaction.rejection_reason && (
                    <p className="mt-2 text-xs bg-red-50 rounded px-2 py-1 text-red-700">
                      {transaction.rejection_reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Settlement */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="mb-4 text-sm font-bold text-gray-900">Settlement</p>

            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-600">Method</p>
                <p className="mt-1 font-bold text-gray-900">
                  {transaction.settlement_method}
                </p>
              </div>

              {transaction.cash_credited > 0 && (
                <div className="rounded-xl bg-green-50 p-3">
                  <p className="text-xs text-green-600">Credited</p>
                  <p className="mt-1 font-bold text-green-900">
                    ₦{transaction.cash_credited.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="rounded-2xl border border-gray-200 bg-white p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                confirmAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {confirmAction === 'approve' ? (
                  <Check className="text-green-600" size={24} />
                ) : (
                  <AlertCircle className="text-red-600" size={24} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {confirmAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {confirmAction === 'approve'
                    ? `Are you sure you want to approve this conversion?`
                    : `Are you sure you want to reject this conversion?`}
                </p>
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-600">Reference</p>
                  <p className="text-sm font-bold text-gray-900">{transaction?.reference}</p>
                  <p className="text-xs text-gray-600 mt-2">User</p>
                  <p className="text-sm font-bold text-gray-900">
                    {transaction?.user?.first_name} {transaction?.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">Amount</p>
                  <p className="text-sm font-bold text-gray-900">
                    ₦{transaction?.airtime_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction === 'approve' ? handleConfirmApprove : handleConfirmReject}
                disabled={actionLoading}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 ${
                  confirmAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-60`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmAction === 'approve' ? (
                      <>
                        <Check size={16} />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Confirm Rejection
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Screenshot Modal */}
      {showScreenshotModal && transaction?.screenshot_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setShowScreenshotModal(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => setShowScreenshotModal(false)}
              className="absolute -top-12 right-0 rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100"
            >
              <X size={24} />
            </Button>
            <img
              src={transaction.screenshot_url}
              alt="Full size transfer proof"
              className="w-full rounded-2xl"
            />
            <p className="mt-4 text-center text-sm text-gray-300">
              Uploaded {new Date(transaction.screenshot_uploaded_at || '').toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}

