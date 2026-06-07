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

  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

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

  const handleApprove = async () => {
    if (!transaction) return;

    try {
      setActionLoading(true);
      await airtimeToCashService.approveConversion(transaction.id, {
        notes: approvalNotes,
      });

      addToast({
        message: 'Conversion approved successfully!',
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
    }
  };

  const handleReject = async () => {
    if (!transaction || !rejectionReason.trim()) {
      addToast({
        message: 'Please provide a rejection reason',
        type: 'error',
      });
      return;
    }

    try {
      setActionLoading(true);
      await airtimeToCashService.rejectConversion(transaction.id, {
        rejection_reason: rejectionReason,
        notes: approvalNotes,
      });

      addToast({
        message: 'Conversion rejected successfully',
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
    }
  };

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
      <div className="flex items-center gap-4">
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
          <p className="mt-1 text-sm text-gray-600">{transaction.reference}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main Content */}
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
                <p className="mt-1 font-bold text-gray-900">
                  {transaction.phone_number}
                </p>
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
              <p className="mb-4 text-sm font-bold text-gray-900">Transfer Proof</p>

              <img
                src={transaction.screenshot_url}
                alt="Transfer proof"
                className="w-full rounded-2xl border border-gray-200 object-cover"
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
          {(canApprove || canReject) && (
            <Card className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="mb-4 text-sm font-bold text-gray-900">Admin Actions</p>

              {!showRejectionForm ? (
                <div className="flex gap-3">
                  {canApprove && (
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 rounded-2xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          Approve
                        </>
                      )}
                    </Button>
                  )}

                  {canReject && (
                    <Button
                      onClick={() => setShowRejectionForm(true)}
                      className="flex-1 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
                    >
                      <AlertCircle size={20} />
                      Reject
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    placeholder="Rejection reason (required)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-red-600 focus:outline-none resize-none"
                  />

                  <textarea
                    placeholder="Internal notes (optional)"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-red-600 focus:outline-none resize-none"
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowRejectionForm(false)}
                      className="flex-1 rounded-2xl border border-gray-300 bg-white px-6 py-2.5 font-bold text-gray-900 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="flex-1 rounded-2xl bg-red-600 px-6 py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Rejecting...
                        </>
                      ) : (
                        'Confirm Rejection'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
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

      <Toast />
    </div>
  );
}
