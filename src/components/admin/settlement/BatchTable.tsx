'use client';

import { useState } from 'react';
import { Eye, CheckCircle, Send, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Input } from '@/components/shared/Input';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import { ActionButton } from './ActionButton';
import type { SettlementBatchRecord, BatchListFilters, SettlementBatchStatus } from '@/types/settlement.types';
import type { PaginationMeta } from '@/types/api.types';
import { formatCurrency, formatDate } from '@/utils/format.utils';

interface BatchTableProps {
  batches: SettlementBatchRecord[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  filters: BatchListFilters;
  onFiltersChange: (filters: BatchListFilters) => void;
  onApprove: (id: number) => Promise<void>;
  onSettle: (id: number) => Promise<void>;
  onView: (id: number) => void;
  onGenerate: (data: { settlement_date: string; period_days: number }) => Promise<void>;
  isGenerating?: boolean;
}

const statusOptions: { value: SettlementBatchStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'settled', label: 'Settled' },
  { value: 'failed', label: 'Failed' },
  { value: 'partially_settled', label: 'Partially Settled' },
];

export const BatchTable = ({
  batches,
  isLoading,
  pagination,
  filters,
  onFiltersChange,
  onApprove,
  onSettle,
  onView,
  onGenerate,
  isGenerating = false,
}: BatchTableProps) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateDate, setGenerateDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodDays, setPeriodDays] = useState(1);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [settlingId, setSettlingId] = useState<number | null>(null);

  const handleGenerate = async () => {
    await onGenerate({ settlement_date: generateDate, period_days: periodDays });
    setShowGenerateModal(false);
  };

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    await onApprove(id);
    setApprovingId(null);
  };

  const handleSettle = async (id: number) => {
    setSettlingId(id);
    await onSettle(id);
    setSettlingId(null);
  };

  const totalPages = pagination?.last_page || 1;
  const currentPage = pagination?.current_page || 1;

  return (
    <>
      <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#111827]">Settlement Batches</h2>
              {pagination && (
                <p className="text-sm text-[#6b7280] mt-1">
                  {pagination.total} batch{pagination.total !== 1 ? 'es' : ''} total
                </p>
              )}
            </div>
            <Button onClick={() => setShowGenerateModal(true)}>
              <Plus className="h-4 w-4" />
              Generate Batch
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_from: e.target.value || undefined, page: 1 })
                }
                className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 pl-10 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#d71927]"
                placeholder="From date"
              />
            </div>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, date_to: e.target.value || undefined, page: 1 })
              }
              className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#d71927]"
            />
            <select
              value={filters.status || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: (e.target.value as SettlementBatchStatus) || undefined,
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#d71927] border-t-transparent" />
                <p className="text-sm font-medium text-[#6b7280]">Loading batches...</p>
              </div>
            </div>
          ) : batches.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-sm font-medium text-[#9ca3af]">No batches found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Settlement Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Period</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">VTU Purchases</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Commission</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-[#6b7280]">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[#6b7280]">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="hover:bg-[#f8fafc] transition-colors cursor-pointer"
                    onClick={() => onView(batch.id)}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-[#111827] whitespace-nowrap">
                      {batch.batch_reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                      {formatDate(batch.settlement_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                      {formatDate(batch.batch_period_start)} — {formatDate(batch.batch_period_end)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                      {formatCurrency(parseFloat(batch.total_vtu_purchases))}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right whitespace-nowrap">
                      {formatCurrency(parseFloat(batch.total_remopay_commission))}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-[#6b7280] whitespace-nowrap">
                      {batch.items_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SettlementStatusBadge status={batch.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(batch.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {batch.status === 'pending' && (
                          <>
                            <ActionButton
                              label=""
                              icon={CheckCircle}
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(batch.id)}
                              isLoading={approvingId === batch.id}
                              confirmMessage="Are you sure you want to approve this batch?"
                              confirmTitle="Approve Batch"
                            />
                            <ActionButton
                              label=""
                              icon={Send}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSettle(batch.id)}
                              isLoading={settlingId === batch.id}
                              confirmMessage="This will execute the settlement for this batch. Continue?"
                              confirmTitle="Settle Batch"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && batches.length > 0 && pagination && (
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

      {/* Generate Batch Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Settlement Batch"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} isLoading={isGenerating}>
              Generate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Settlement Date"
            type="date"
            value={generateDate}
            onChange={(e) => setGenerateDate(e.target.value)}
            required
          />
          <Input
            label="Period (Days)"
            type="number"
            min={1}
            max={365}
            value={periodDays}
            onChange={(e) => setPeriodDays(parseInt(e.target.value) || 1)}
            helperText="Number of days to include in this batch"
            required
          />
          <p className="text-xs text-[#6b7280]">
            This will create a settlement batch for all transactions in the specified period.
          </p>
        </div>
      </Modal>
    </>
  );
};
