'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { transactionService } from '@/services/transaction.service';
import { formatDateTime } from '@/utils/format.utils';
import type { TransactionDetailData } from '@/types/transaction-detail.types';

import {
  StatusBadge,
  FinancialBreakdown,
  SourceInfo,
  Timeline,
  UserInfo,
  MetadataViewer,
  LoadingSkeleton,
  ErrorState,
} from '@/components/transactions';

// ─── Type Icons ────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  wallet_funding:        { label: 'Wallet Funding',        icon: '💳' },
  airtime_purchase:     { label: 'Airtime Purchase',      icon: '📱' },
  data_purchase:        { label: 'Data Purchase',         icon: '🌐' },
  airtime_conversion:   { label: 'Airtime Conversion',    icon: '🔄' },
  bill_payment:         { label: 'Bill Payment',          icon: '📄' },
  transfer_out:         { label: 'Transfer Sent',         icon: '💸' },
  transfer_in:          { label: 'Transfer Received',     icon: '💰' },
  card_funding:         { label: 'Card Funding',          icon: '💳' },
};

function getTypeDisplay(type: string): { label: string; icon: string } {
  const normalized = type?.toLowerCase() || '';
  return TYPE_CONFIG[normalized] ?? { label: type?.replace(/_/g, ' ') || 'Transaction', icon: '📋' };
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function AdminTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<TransactionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransaction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getTransactionDetail(Number(params.id));
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to load transaction details');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Transaction not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this transaction');
      } else {
        setError(err.message || 'Failed to load transaction details');
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const handleBack = useCallback(() => {
    router.push('/admin/transactions');
  }, [router]);

  if (loading) {
    return <div className="px-4 py-6"><LoadingSkeleton /></div>;
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <ErrorState message={error} onRetry={loadTransaction} onBack={handleBack} />
      </div>
    );
  }

  if (!data) return null;

  const typeInfo = getTypeDisplay(data.basic.transaction_type);

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-[#f8f8f8] px-4 py-6 sm:px-6 lg:px-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── Back Button ── */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition-colors hover:text-[#d71927]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </button>

        {/* ── Header Card ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                {typeInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">{typeInfo.label}</h1>
                  <StatusBadge status={data.basic.status} size="md" />
                </div>
                <p className="mt-1.5 font-mono text-sm text-gray-500">{data.basic.reference}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDateTime(data.timeline.transaction_date || data.timeline.created_at)}
                </p>
              </div>
            </div>
            {data.basic.service_logo && (
              <img
                src={data.basic.service_logo}
                alt="Service logo"
                className="h-10 w-10 rounded-lg border border-gray-100 object-contain"
              />
            )}
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* ── LEFT COLUMN: Main Content ── */}
          <div className="space-y-6">
            {/* Financial Breakdown */}
            <FinancialBreakdown financial={data.financial} />

            {/* Source Info */}
            {data.source && <SourceInfo source={data.source} />}

            {/* Metadata & Details */}
            <MetadataViewer metadata={data.metadata} details={data.details} />
          </div>

          {/* ── RIGHT COLUMN: Sidebar ── */}
          <aside className="space-y-6">
            {/* Purchase Code */}
            {data.basic.purchased_code && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-base font-bold text-gray-900">Purchase Code</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="font-mono text-lg font-bold tracking-wider text-gray-900 break-all">
                    {data.basic.purchased_code}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Use this code to track your VTU purchase
                  </p>
                </div>
              </div>
            )}

            {/* User Info */}
            {data.user && <UserInfo user={data.user} />}

            {/* Timeline */}
            <Timeline timeline={data.timeline} />

            {/* Info Note */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Transaction ID</p>
              <p className="mt-2 font-mono text-sm font-bold text-gray-900">#{data.basic.id}</p>
              <p className="mt-3 text-xs leading-5 text-gray-600">
                This page shows the complete details of this transaction including financial breakdown, source context, and timeline events.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
