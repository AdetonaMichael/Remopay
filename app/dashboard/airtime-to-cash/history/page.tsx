'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Check,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { useUIStore } from '@/store/ui.store';
import { useAirtimeToCash } from '@/hooks/useAirtimeToCash';
import { AirtimeToCashTransaction, AirtimeCashTransactionStatus } from '@/types/airtime-to-cash.types';

const STATUS_CONFIG: Record<AirtimeCashTransactionStatus, { color: string; label: string; icon: any }> = {
  pending: {
    color: 'bg-gray-100 text-gray-700 border border-gray-300',
    label: 'Pending',
    icon: Clock,
  },
  transfer_submitted: {
    color: 'bg-blue-100 text-blue-700 border border-blue-300',
    label: 'Proof Submitted',
    icon: Clock,
  },
  verification_in_progress: {
    color: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    label: 'Verifying',
    icon: Clock,
  },
  approved: {
    color: 'bg-green-100 text-green-700 border border-green-300',
    label: 'Approved',
    icon: Check,
  },
  processing: {
    color: 'bg-blue-100 text-blue-700 border border-blue-300',
    label: 'Processing',
    icon: TrendingUp,
  },
  completed: {
    color: 'bg-green-100 text-green-700 border border-green-300',
    label: 'Completed',
    icon: Check,
  },
  rejected: {
    color: 'bg-red-100 text-red-700 border border-red-300',
    label: 'Rejected',
    icon: X,
  },
};

interface FilterState {
  status?: AirtimeCashTransactionStatus | '';
  provider?: string;
}

export default function AirtimeToCashHistoryPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const {
    history,
    historyLoading,
    historyError,
    stats,
    statsLoading,
    fetchHistory,
    fetchStats,
    clearError,
  } = useAirtimeToCash();

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    provider: '',
  });

  // Fetch history and stats on mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [fetchHistory, fetchStats]);

  // Apply filters
  useEffect(() => {
    const params: any = {};
    if (filters.status) params.status = filters.status;
    if (filters.provider) params.provider = filters.provider;

    fetchHistory(params);
  }, [filters, fetchHistory]);

  // Handle error
  useEffect(() => {
    if (historyError) {
      addToast({
        message: historyError,
        type: 'error',
      });
    }
  }, [historyError, addToast]);

  const getStatusConfig = (status: AirtimeCashTransactionStatus) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  if (historyLoading || statsLoading) {
    return <CardSkeleton count={5} />;
  }

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900">
                  {stats.total_requests}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <Send className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="mt-2 text-2xl font-extrabold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                <Check className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Converted</p>
                <p className="mt-2 text-xl font-extrabold text-[#d71927]">
                  ₦{stats.total_converted.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                <DollarSign className="text-[#d71927]" size={24} />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fees Paid</p>
                <p className="mt-2 text-xl font-extrabold text-gray-900">
                  ₦{stats.total_fees_paid.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <AlertCircle className="text-gray-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Header */}
      <Card className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-gray-900">Conversion History</h2>

          <Button
            onClick={() => router.push('/dashboard/airtime-to-cash')}
            className="flex items-center gap-2 rounded-2xl bg-[#d71927] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#b81420]"
          >
            <Send size={18} />
            New Conversion
          </Button>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-600">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as any) || '',
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#d71927] focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="transfer_submitted">Proof Submitted</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-600">
              Provider
            </label>
            <select
              value={filters.provider}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  provider: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-[#d71927] focus:outline-none"
            >
              <option value="">All Providers</option>
              <option value="mtn">MTN</option>
              <option value="airtel">Airtel</option>
              <option value="glo">Globacom</option>
              <option value="9mobile">9mobile</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilters({ status: '', provider: '' });
                clearError();
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      {history.length === 0 ? (
        <Card className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Send className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg font-bold text-gray-900">No conversions yet</p>
          <p className="mt-2 text-gray-600">
            Start converting your airtime to cash now!
          </p>
          <Button
            onClick={() => router.push('/dashboard/airtime-to-cash')}
            className="mt-6 rounded-2xl bg-[#d71927] px-8 py-3 font-bold text-white hover:bg-[#b81420]"
          >
            New Conversion
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((transaction) => {
            const config = getStatusConfig(transaction.status);
            const StatusIcon = config.icon;

            return (
              <Card
                key={transaction.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition cursor-pointer"
                onClick={() =>
                  router.push(
                    `/dashboard/airtime-to-cash/${transaction.id}/details`
                  )
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <Send className="text-gray-600" size={24} />
                    </div>

                    <div>
                      <p className="font-bold text-gray-900">
                        {transaction.provider.toUpperCase()} Conversion
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Ref: {transaction.reference}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-gray-900">
                        ₦{transaction.airtime_amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.cash_credited > 0
                          ? `Received: ₦${transaction.cash_credited.toLocaleString()}`
                          : 'Pending...'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase ${config.color}`}
                      >
                        <StatusIcon size={14} />
                        {config.label}
                      </div>

                      {transaction.status === 'pending' &&
                        !transaction.screenshot_uploaded_at && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/airtime-to-cash/${transaction.id}/submit-proof`
                              );
                            }}
                            className="rounded-lg bg-[#d71927] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#b81420]"
                          >
                            Upload Proof
                          </Button>
                        )}

                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                {/* Error message if rejected */}
                {transaction.status === 'rejected' && transaction.rejection_reason && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700">
                      Rejection Reason:
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {transaction.rejection_reason}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Toast />
    </div>
  );
}
