/**
 * Settlement Batches List Component
 * Date: June 12, 2026
 * 
 * Component for viewing and managing settlement batches with:
 * - Batch listing with filters
 * - Batch generation
 * - Status updates
 * - Pagination support
 */

'use client';

import React, { useState } from 'react';
import { SettlementBatch, BatchFilters, BatchStatus } from '@/types/ledger.types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useLedger } from '@/hooks/useLedger';

interface SettlementBatchesListProps {
  batches: SettlementBatch[];
  isLoading: boolean;
  pagination: any;
  filters: BatchFilters;
  onFiltersChange: (filters: BatchFilters) => void;
}

const statusColors: Record<BatchStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

export const SettlementBatchesList: React.FC<SettlementBatchesListProps> = ({
  batches,
  isLoading,
  pagination,
  filters,
  onFiltersChange,
}) => {
  const { generateSettlementBatch, updateBatchStatus } = useLedger();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerateBatch = async () => {
    const result = await generateSettlementBatch({
      settlement_date: selectedDate,
    });
    if (result) {
      setShowGenerateModal(false);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleStatusUpdate = async (batchId: number, newStatus: BatchStatus) => {
    await updateBatchStatus(batchId, { status: newStatus });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading batches...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settlement Batches</h2>
        <Button
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Generate Batch
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as BatchStatus) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <input
          type="date"
          value={filters.start_date || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              start_date: e.target.value || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />

        <input
          type="date"
          value={filters.end_date || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              end_date: e.target.value || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Batches Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Settlement Date</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Entries</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{batch.batch_reference}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(batch.settlement_date).toLocaleDateString('en-NG')}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{batch.total_entries}</td>
                <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                  ₦{batch.total_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[batch.status]}`}>
                    {batch.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <select
                    defaultValue={batch.status}
                    onChange={(e) => handleStatusUpdate(batch.id, e.target.value as BatchStatus)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Batch Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Settlement Batch</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <p className="text-sm text-gray-600">
                This will create a settlement batch for all pending entries on the selected date.
              </p>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerateBatch}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate
                </Button>
                <Button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
