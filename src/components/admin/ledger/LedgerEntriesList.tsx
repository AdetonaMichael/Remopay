/**
 * Ledger Entries List Component
 * Date: June 12, 2026
 * 
 * Component for viewing and managing ledger entries with:
 * - Entry listing with comprehensive filters
 * - Reverse and void operations
 * - Manual entry creation
 * - Pagination support
 */

'use client';

import React, { useState } from 'react';
import {
  LedgerEntry,
  LedgerAccount,
  EntryFilters,
  EntryType,
  EntryStatus,
  CreateLedgerEntryRequest,
} from '@/types/ledger.types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useLedger } from '@/hooks/useLedger';

interface LedgerEntriesListProps {
  entries: LedgerEntry[];
  accounts: LedgerAccount[];
  isLoading: boolean;
  pagination: any;
  filters: EntryFilters;
  onFiltersChange: (filters: EntryFilters) => void;
}

const ENTRY_TYPES: EntryType[] = [
  'FUNDING',
  'COMMISSION_ACCRUAL',
  'PROVIDER_ACCRUAL',
  'CHARGE_DEDUCTION',
  'SETTLEMENT_TRANSFER',
  'PAYOUT_COMPLETE',
  'REVERSAL',
  'REFUND',
  'DISPUTE_RESERVE',
  'INTEREST_CREDIT',
  'MANUAL_ADJUSTMENT',
];

export const LedgerEntriesList: React.FC<LedgerEntriesListProps> = ({
  entries,
  accounts,
  isLoading,
  pagination,
  filters,
  onFiltersChange,
}) => {
  const { createEntry, reverseEntry, voidEntry } = useLedger();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [formData, setFormData] = useState<CreateLedgerEntryRequest>({
    entry_type: 'MANUAL_ADJUSTMENT',
    debit_account_id: 0,
    credit_account_id: 0,
    amount: 0,
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
  });

  const statusColors: Record<EntryStatus, string> = {
    recorded: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    reversed: 'bg-red-100 text-red-800',
    voided: 'bg-gray-100 text-gray-800',
  };

  const handleCreateEntry = async () => {
    const result = await createEntry(formData);
    if (result) {
      setFormData({
        entry_type: 'MANUAL_ADJUSTMENT',
        debit_account_id: 0,
        credit_account_id: 0,
        amount: 0,
        description: '',
        entry_date: new Date().toISOString().split('T')[0],
      });
      setShowCreateModal(false);
    }
  };

  const handleReverseEntry = async () => {
    if (!selectedEntry) return;
    const result = await reverseEntry(selectedEntry.id, { reason: reverseReason });
    if (result) {
      setShowReverseModal(false);
      setReverseReason('');
      setSelectedEntry(null);
    }
  };

  const handleVoidEntry = async () => {
    if (!selectedEntry) return;
    const result = await voidEntry(selectedEntry.id, { reason: voidReason });
    if (result) {
      setShowVoidModal(false);
      setVoidReason('');
      setSelectedEntry(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading entries...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ledger Entries</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.entry_type || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              entry_type: (e.target.value as EntryType) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Entry Types</option>
          {ENTRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as EntryStatus) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="recorded">Recorded</option>
          <option value="pending">Pending</option>
          <option value="reversed">Reversed</option>
          <option value="voided">Voided</option>
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
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Debit Account</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credit Account</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.entry_reference}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{entry.entry_type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{entry.debit_account.account_code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{entry.credit_account.account_code}</td>
                <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                  ₦{entry.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[entry.status]}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm space-x-2">
                  {entry.status === 'recorded' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowReverseModal(true);
                        }}
                      >
                        Reverse
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowVoidModal(true);
                        }}
                      >
                        Void
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Entry</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
                <select
                  value={formData.entry_type}
                  onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as EntryType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {ENTRY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debit Account</label>
                <select
                  value={formData.debit_account_id}
                  onChange={(e) => setFormData({ ...formData, debit_account_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select debit account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {acc.account_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Account</label>
                <select
                  value={formData.credit_account_id}
                  onChange={(e) => setFormData({ ...formData, credit_account_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select credit account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {acc.account_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Entry description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Date</label>
                <input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateEntry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reverse Entry Modal */}
      {showReverseModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reverse Entry</h3>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Reference:</strong> {selectedEntry.entry_reference}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Amount:</strong> ₦{selectedEntry.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Reversal</label>
                <textarea
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Why are you reversing this entry?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleReverseEntry}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Reverse
                </Button>
                <Button
                  onClick={() => {
                    setShowReverseModal(false);
                    setReverseReason('');
                    setSelectedEntry(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Void Entry Modal */}
      {showVoidModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Void Entry</h3>

            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Reference:</strong> {selectedEntry.entry_reference}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Amount:</strong> ₦{selectedEntry.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Void</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Why are you voiding this entry?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleVoidEntry}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Void
                </Button>
                <Button
                  onClick={() => {
                    setShowVoidModal(false);
                    setVoidReason('');
                    setSelectedEntry(null);
                  }}
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
