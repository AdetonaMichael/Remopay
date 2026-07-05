'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { SettlementTransaction, SettlementTxFilters, SettlementBatchType, SettlementTransactionStatus } from '@/types/settlement.types';
import type { PaginationMeta } from '@/types/api.types';
import { formatCurrency, formatDateTime } from '@/utils/format.utils';

interface TransactionTableProps {
  transactions: SettlementTransaction[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  filters: SettlementTxFilters;
  onFiltersChange: (filters: SettlementTxFilters) => void;
}

const statusOptions: { value: SettlementTransactionStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

const typeOptions: { value: SettlementBatchType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'commission', label: 'Commission' },
  { value: 'vtu_principal', label: 'VTU Principal' },
  { value: 'provider_settlement', label: 'Provider Settlement' },
];

const typeBadgeColors: Record<SettlementBatchType, string> = {
  commission: 'bg-purple-100 text-purple-800',
  vtu_principal: 'bg-blue-100 text-blue-800',
  provider_settlement: 'bg-orange-100 text-orange-800',
};

const settlementTypeLabels: Record<SettlementBatchType, string> = {
  commission: 'Commission',
  vtu_principal: 'VTU Principal',
  provider_settlement: 'Provider',
};

export const TransactionTable = ({
  transactions,
  isLoading,
  pagination,
  filters,
  onFiltersChange,
}: TransactionTableProps) => {
  const totalPages = pagination?.last_page || 1;
  const currentPage = pagination?.current_page || 1;

  return (
    <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Settlement Transactions</h2>
            {pagination && (
              <p className="text-sm text-[#6b7280] mt-1">
                {pagination.total} transaction{pagination.total !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value as SettlementTransactionStatus) || undefined,
                page: 1,
              })
            }
            className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#d71927]"
          >
            {statusOptions.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filters.type || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                type: (e.target.value as SettlementBatchType) || undefined,
                page: 1,
              })
            }
            className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#d71927]"
          >
            {typeOptions.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#d71927] border-t-transparent" />
              <p className="text-sm font-medium text-[#6b7280]">Loading transactions...</p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm font-medium text-[#9ca3af]">No transactions found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Gross Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Net Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">External Ref</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Initiated</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#111827] whitespace-nowrap">
                    {tx.settlement_reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeBadgeColors[tx.settlement_type]}`}
                    >
                      {settlementTypeLabels[tx.settlement_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                    {formatCurrency(parseFloat(tx.gross_amount))}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                    {formatCurrency(parseFloat(tx.net_amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SettlementStatusBadge status={tx.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                    {tx.settlement_batch.batch_reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap font-mono">
                    {tx.external_reference || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                    {formatDateTime(tx.initiated_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                    {tx.completed_at ? formatDateTime(tx.completed_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && transactions.length > 0 && pagination && (
        <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-6 py-4">
          <p className="text-sm text-[#6b7280]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, page: currentPage - 1 })}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, page: currentPage + 1 })}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
