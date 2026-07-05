'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { ActionButton } from '@/components/admin/settlement/ActionButton';
import { BatchDetailCard } from '@/components/admin/settlement/BatchDetailCard';
import { BatchItemTable } from '@/components/admin/settlement/BatchItemTable';
import { SettlementStatusBadge } from '@/components/admin/settlement/SettlementStatusBadge';
import { useSettlement } from '@/hooks/useSettlement';
import { formatCurrency, formatDateTime } from '@/utils/format.utils';

export default function SettlementBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = Number(params.id);

  const {
    state,
    fetchBatch,
    fetchBatchItems,
    approveBatch,
    settleBatch,
  } = useSettlement();

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'settlements' | 'payouts'>('overview');
  const [itemTypeFilter, setItemTypeFilter] = useState('');

  useEffect(() => {
    if (batchId) {
      fetchBatch(batchId);
    }
  }, [batchId, fetchBatch]);

  const handleApprove = useCallback(async () => {
    const success = await approveBatch(batchId, { notes: 'Approved by admin' });
    if (success) {
      fetchBatch(batchId);
    }
  }, [batchId, approveBatch, fetchBatch]);

  const handleSettle = useCallback(async () => {
    const success = await settleBatch(batchId, { dry_run: false });
    if (success) {
      fetchBatch(batchId);
    }
  }, [batchId, settleBatch, fetchBatch]);

  const handleFetchItems = useCallback(
    (type?: string) => {
      fetchBatchItems(batchId, { type: type as any, per_page: 50 });
    },
    [batchId, fetchBatchItems]
  );

  useEffect(() => {
    if (activeTab === 'items') {
      handleFetchItems(itemTypeFilter || undefined);
    }
  }, [activeTab, itemTypeFilter, handleFetchItems]);

  const batchDetail = state.currentBatch;
  const batch = batchDetail?.batch;
  const summary = batchDetail?.summary;

  if (state.isLoadingBatch && !batch) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!batch || !summary) {
    return (
      <Card className="rounded-2xl border border-[#e5e7eb] p-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[#9ca3af]" />
        <h3 className="text-lg font-bold text-[#111827] mb-2">Batch Not Found</h3>
        <p className="text-sm text-[#6b7280] mb-6">The requested batch could not be loaded.</p>
        <Button variant="outline" onClick={() => router.push('/admin/settlements/batches')}>
          Back to Batches
        </Button>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'items' as const, label: `Items (${batchDetail.items_count})` },
    { id: 'settlements' as const, label: 'Settlements' },
    { id: 'payouts' as const, label: 'Payouts' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settlements/batches"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#f8fafc] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#6b7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-[#111827]">{batch.batch_reference}</h1>
              <SettlementStatusBadge status={batch.status} />
            </div>
            <p className="text-sm text-[#6b7280] mt-1">
              Created {formatDateTime(batch.created_at)}
              {batch.creator && ` by ${batch.creator.first_name} ${batch.creator.last_name}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {batch.status === 'pending' && (
            <>
              <ActionButton
                label="Approve"
                icon={CheckCircle}
                variant="primary"
                onClick={handleApprove}
                isLoading={state.isApprovingBatch}
                confirmMessage="Are you sure you want to approve this batch for settlement?"
                confirmTitle="Approve Batch"
              />
              <ActionButton
                label="Settle Now"
                icon={Send}
                variant="secondary"
                onClick={handleSettle}
                isLoading={state.isSettlingBatch}
                confirmMessage="This will execute the settlement for this batch. Continue?"
                confirmTitle="Settle Batch"
              />
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e5e7eb]">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#d71927] text-[#d71927]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <BatchDetailCard
          batch={batch}
          summary={summary}
          itemsCount={batchDetail.items_count}
          itemsByType={batchDetail.items_by_type}
        />
      )}

      {activeTab === 'items' && (
        <BatchItemTable
          items={state.batchItems}
          isLoading={state.isLoadingBatchItems}
          pagination={state.batchItemsPagination}
          typeFilter={itemTypeFilter}
          onTypeFilterChange={(type) => setItemTypeFilter(type)}
          totals={state.batchItemsTotals || undefined}
        />
      )}

      {activeTab === 'settlements' && (
        <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
            <h3 className="text-lg font-bold text-[#111827]">Settlement Transactions</h3>
          </div>
          {batch.settlement_transactions && batch.settlement_transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Gross</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Beneficiary</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">External Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {batch.settlement_transactions.map((stx) => (
                    <tr key={stx.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#111827] whitespace-nowrap">
                        {stx.settlement_reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                          {stx.settlement_type === 'commission' ? 'Commission' : 'VTU Principal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                        {formatCurrency(parseFloat(stx.gross_amount))}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                        {formatCurrency(parseFloat(stx.net_amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SettlementStatusBadge status={stx.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                        {stx.beneficiary_account_name} ({stx.beneficiary_account_number})
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap font-mono">
                        {stx.external_reference || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-sm font-medium text-[#9ca3af]">No settlement transactions recorded yet</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'payouts' && (
        <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
            <h3 className="text-lg font-bold text-[#111827]">Provider Payouts</h3>
          </div>
          {batch.payouts && batch.payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Provider</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {batch.payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#111827] whitespace-nowrap">
                        {payout.provider}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                        {formatCurrency(parseFloat(payout.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SettlementStatusBadge status={payout.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap font-mono">
                        {payout.reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                        {formatDateTime(payout.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-sm font-medium text-[#9ca3af]">No payout records found</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
