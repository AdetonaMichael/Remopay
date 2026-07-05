'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { BatchItem, BatchItemType } from '@/types/settlement.types';
import type { PaginationMeta } from '@/types/api.types';
import { formatCurrency } from '@/utils/format.utils';

interface BatchItemTableProps {
  items: BatchItem[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  totals?: {
    amount: number;
    commission: number;
    fees: number;
  };
}

const typeOptions: { value: BatchItemType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'vtu', label: 'VTU' },
  { value: 'funding', label: 'Funding' },
  { value: 'reversal', label: 'Reversal' },
];

export const BatchItemTable = ({
  items,
  isLoading,
  pagination,
  typeFilter,
  onTypeFilterChange,
  totals,
}: BatchItemTableProps) => {
  const totalPages = pagination?.last_page || 1;
  const currentPage = pagination?.current_page || 1;

  return (
    <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
      {/* Totals Bar */}
      {totals && (
        <div className="grid grid-cols-3 gap-4 border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-3">
          <div>
            <p className="text-xs font-medium text-[#6b7280]">Total Amount</p>
            <p className="text-sm font-bold text-[#111827]">{formatCurrency(totals.amount)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6b7280]">Total Commission</p>
            <p className="text-sm font-bold text-[#111827]">{formatCurrency(totals.commission)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6b7280]">Total Fees</p>
            <p className="text-sm font-bold text-[#111827]">{formatCurrency(totals.fees)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-3">
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#d71927]"
        >
          {typeOptions.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#d71927] border-t-transparent" />
              <p className="text-sm font-medium text-[#6b7280]">Loading items...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm font-medium text-[#9ca3af]">No items found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">User</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Commission</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Provider Payable</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#111827] whitespace-nowrap">
                    {item.transaction_reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                    {item.transaction_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                    {item.user ? `${item.user.first_name} ${item.user.last_name}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                    {formatCurrency(parseFloat(item.amount))}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151] text-right whitespace-nowrap">
                    {formatCurrency(parseFloat(item.commission_amount))}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151] text-right whitespace-nowrap">
                    {formatCurrency(parseFloat(item.provider_payable_amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SettlementStatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && items.length > 0 && pagination && (
        <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-6 py-4">
          <p className="text-sm text-[#6b7280]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
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
