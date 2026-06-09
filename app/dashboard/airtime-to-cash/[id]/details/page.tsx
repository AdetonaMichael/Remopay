'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Copy,
  Share2,
  Download,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { airtimeToCashService } from '@/services/airtime-to-cash.service';
import { AirtimeToCashTransaction, AirtimeCashTransactionStatus } from '@/types/airtime-to-cash.types';

const STATUS_CONFIG: Record<AirtimeCashTransactionStatus, { color: string; bgColor: string; icon: any; label: string }> = {
  pending: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: Clock,
    label: 'Pending',
  },
  transfer_submitted: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Clock,
    label: 'Proof Submitted',
  },
  verification_in_progress: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
    label: 'Verifying',
  },
  approved: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    label: 'Approved',
  },
  processing: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Clock,
    label: 'Processing',
  },
  completed: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    label: 'Completed',
  },
  rejected: {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle,
    label: 'Rejected',
  },
};

export default function AirtimeToCashDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();

  const transactionId = Number(params.id);

  const [transaction, setTransaction] = useState<AirtimeToCashTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction details on mount
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await airtimeToCashService.getTransaction(transactionId);
        setTransaction(data);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Failed to load transaction details';
        setError(message);
        addToast({
          message,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, addToast]);

  const handleCopyReference = () => {
    if (transaction?.reference) {
      navigator.clipboard.writeText(transaction.reference);
      addToast({
        message: 'Reference copied to clipboard',
        type: 'success',
      });
    }
  };

  const handleCopyPhone = () => {
    if (transaction?.phone_number) {
      navigator.clipboard.writeText(transaction.phone_number);
      addToast({
        message: 'Phone number copied to clipboard',
        type: 'success',
      });
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#d71927]" size={24} />
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-4">
          <AlertCircle className="text-red-600" size={24} />
          <div className="flex-1">
            <p className="font-bold text-red-900">Failed to load transaction</p>
            <p className="text-sm text-red-700">{error || 'Transaction not found'}</p>
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

  const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-6"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-2 font-bold text-gray-900 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <h1 className="text-2xl font-extrabold text-gray-900">Transaction Details</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Status Banner */}
        <div className={`border-b px-6 py-4 sm:px-8 ${statusConfig.bgColor}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={statusConfig.color} size={24} />
            <div>
              <p className={`text-sm font-bold ${statusConfig.color}`}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-gray-600">
                Updated {new Date(transaction.updated_at).toLocaleDateString()} at{' '}
                {new Date(transaction.updated_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px]">
          {/* Main Info */}
          <div className="space-y-8">
            {/* Transaction Reference */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Reference</h2>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="flex-1 font-mono text-sm font-bold text-gray-900">
                  {transaction.reference}
                </p>
                <button
                  onClick={handleCopyReference}
                  className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300"
                  title="Copy reference"
                >
                  <Copy size={16} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Conversion Details Grid */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Conversion Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Airtime Amount */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase text-gray-600">Airtime Amount</p>
                  <p className="mt-2 text-2xl font-extrabold text-gray-900">
                    ₦{Number(transaction.airtime_amount).toLocaleString()}
                  </p>
                </div>

                {/* Provider */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase text-gray-600">Provider</p>
                  <p className="mt-2 text-2xl font-extrabold text-gray-900">
                    {transaction.provider.toUpperCase()}
                  </p>
                </div>

                {/* Service Fee */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase text-gray-600">Service Fee</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    ₦{Number(transaction.service_fee).toLocaleString()}
                    <span className="text-sm text-gray-600"> ({(Number(transaction.service_fee_percentage) * 100).toFixed(1)}%)</span>
                  </p>
                </div>

                {/* Net Amount */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase text-gray-600">Net Amount</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    ₦{Number(transaction.net_amount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Conversion Rate & Cash Credited */}
            <div className="grid gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Conversion Rate</p>
                <p className="mt-2 text-2xl font-extrabold text-green-900">
                  {(Number(transaction.conversion_rate) * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">You'll Receive</p>
                <p className="mt-2 text-2xl font-extrabold text-green-900">
                  ₦{Number(transaction.cash_credited > 0 ? transaction.cash_credited : Math.round(Number(transaction.net_amount) * Number(transaction.conversion_rate))).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Your Information</h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs font-bold uppercase text-gray-600">Phone Number</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {transaction.phone_number}
                    </p>
                    <button
                      onClick={handleCopyPhone}
                      className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300"
                      title="Copy phone number"
                    >
                      <Copy size={16} className="text-gray-700" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs font-bold uppercase text-gray-600">Settlement Method</p>
                  <p className="mt-2 text-lg font-bold text-gray-900 capitalize">
                    {transaction.settlement_method}
                  </p>
                </div>
              </div>
            </div>

            {/* Screenshot */}
            {transaction.screenshot_url && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-900">Proof Screenshot</h2>
                <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={transaction.screenshot_url}
                    alt="Transfer proof screenshot"
                    className="h-auto max-h-96 w-full object-cover"
                  />
                  <a
                    href={transaction.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-4 top-4 rounded-lg bg-black/70 p-2 hover:bg-black/90"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} className="text-white" />
                  </a>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Uploaded {new Date(transaction.screenshot_uploaded_at!).toLocaleDateString()} at{' '}
                  {new Date(transaction.screenshot_uploaded_at!).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Notes */}
            {transaction.notes && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-900">Notes</h2>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-900">{transaction.notes}</p>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {transaction.status === 'rejected' && transaction.rejection_reason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-sm font-bold uppercase text-red-700">Rejection Reason</p>
                <p className="text-red-900">{transaction.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Timeline */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-4 text-sm font-bold uppercase text-gray-700">Timeline</p>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold text-gray-900">Initiated</p>
                  <p className="text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>

                {transaction.screenshot_uploaded_at && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="font-bold text-gray-900">Proof Submitted</p>
                    <p className="text-gray-600">
                      {new Date(transaction.screenshot_uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {transaction.approved_at && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="font-bold text-green-900">Approved</p>
                    <p className="text-green-600">
                      {new Date(transaction.approved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {transaction.completed_at && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="font-bold text-green-900">Completed</p>
                    <p className="text-green-600">
                      {new Date(transaction.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {transaction.rejected_at && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="font-bold text-red-900">Rejected</p>
                    <p className="text-red-600">
                      {new Date(transaction.rejected_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction ID */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase text-gray-600">Transaction ID</p>
              <p className="mt-2 font-mono text-lg font-bold text-gray-900">#{transaction.id}</p>
            </div>

            {/* Status Badge */}
            <div className={`rounded-2xl p-4 ${statusConfig.bgColor}`}>
              <p className={`text-xs font-bold uppercase ${statusConfig.color}`}>Current Status</p>
              <div className="mt-3 flex items-center gap-2">
                <StatusIcon className={statusConfig.color} size={20} />
                <span className={`text-sm font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Submit Proof CTA - Show if no proof uploaded yet */}
            {!transaction.screenshot_url && transaction.status === 'pending' && (
              <Button
                onClick={() => router.push(`/dashboard/airtime-to-cash/${transaction.id}/submit-proof`)}
                className="w-full rounded-2xl bg-[#d71927] px-4 py-3 text-sm font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420]"
              >
                Upload Proof
              </Button>
            )}

            {/* Rates Info */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase text-gray-600">Exchange Rate</p>
              <p className="mt-2 text-sm font-bold text-gray-900">
                1 ₦ = ₦{Number(transaction.conversion_rate).toFixed(2)}
              </p>
              <p className="mt-3 text-xs font-bold uppercase text-gray-600">Service Fee</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {(Number(transaction.service_fee_percentage) * 100).toFixed(1)}%
              </p>
            </div>
          </aside>
        </div>
      </Card>

      <Toast />
    </div>
  );
}
