'use client';

import { Card } from '@/components/shared/Card';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { SettlementBatchRecord, BatchSummary } from '@/types/settlement.types';
import { formatCurrency, formatDate } from '@/utils/format.utils';

interface BatchDetailCardProps {
  batch: SettlementBatchRecord;
  summary: BatchSummary;
  itemsCount: number;
  itemsByType?: {
    funding: number;
    vtu: number;
    reversals: number;
  };
}

export const BatchDetailCard = ({
  batch,
  summary,
  itemsCount,
  itemsByType,
}: BatchDetailCardProps) => {
  const financialSummaryRows = [
    { label: 'Opening Clearing Balance', value: summary.opening_clearing_balance },
    { label: 'Total Clearing Inflow', value: summary.total_clearing_inflow },
    { label: 'Total Customer Funding', value: summary.total_customer_funding },
    { label: 'Total VTU Purchases', value: summary.total_vtu_purchases },
    { label: 'Total Remopay Commission', value: summary.total_remopay_commission },
    { label: 'Total Provider Payable', value: summary.total_provider_payable },
    { label: 'Total Reversals / Refunds', value: summary.total_reversals_refunds },
    { label: 'Net Clearing Balance', value: summary.net_clearing_balance },
    { label: 'Closing Clearing Balance', value: summary.closing_clearing_balance },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="rounded-2xl border border-[#e5e7eb] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-[#111827]">{batch.batch_reference}</h2>
              <SettlementStatusBadge status={batch.status} />
            </div>
            <p className="text-sm text-[#6b7280] mt-2">
              Settlement Date: <span className="font-semibold text-[#111827]">{formatDate(batch.settlement_date)}</span>
              {' — '}
              Period: <span className="font-semibold text-[#111827]">{formatDate(batch.batch_period_start)}</span> to{' '}
              <span className="font-semibold text-[#111827]">{formatDate(batch.batch_period_end)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#6b7280]">Items Count</p>
            <p className="text-2xl font-bold text-[#111827]">{itemsCount}</p>
            {itemsByType && (
              <div className="flex gap-3 mt-1 text-xs text-[#6b7280]">
                <span>VTU: {itemsByType.vtu}</span>
                <span>Funding: {itemsByType.funding}</span>
                <span>Reversals: {itemsByType.reversals}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-[#111827]">Financial Summary</h3>
        </div>
        <div className="divide-y divide-[#e5e7eb]">
          {financialSummaryRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-6 py-3 hover:bg-[#f8fafc] transition-colors"
            >
              <span className="text-sm text-[#6b7280]">{row.label}</span>
              <span
                className={`text-sm font-bold ${
                  row.label === 'Net Clearing Balance' || row.label === 'Closing Clearing Balance'
                    ? 'text-[#111827]'
                    : 'text-[#374151]'
                }`}
              >
                {formatCurrency(row.value)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
