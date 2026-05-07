'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { FilterPanel, type FilterField } from '@/components/shared/FilterPanel';
import { useFilters } from '@/hooks/useFilters';
import { rewardService } from '@/services/reward.service';
import { AdminRewardTransaction } from '@/types/rewards.types';

const transactionTypeLabels = {
  cashback: 'Cashback',
  bonus: 'Bonus',
  streak: 'Streak Bonus',
  referral: 'Referral',
  first_transaction: 'First Transaction',
  redemption: 'Redemption',
};

const REWARD_TRANSACTION_FILTER_FIELDS: FilterField[] = [
  {
    id: 'search',
    label: 'Search',
    type: 'text',
    helpText: 'Search by user ID or reason',
  },
  {
    id: 'type',
    label: 'Transaction Type',
    type: 'select',
    options: [
      { label: 'Cashback', value: 'cashback' },
      { label: 'Bonus', value: 'bonus' },
      { label: 'Streak Bonus', value: 'streak' },
      { label: 'Referral', value: 'referral' },
      { label: 'First Transaction', value: 'first_transaction' },
      { label: 'Redemption', value: 'redemption' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Completed', value: 'completed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Failed', value: 'failed' },
    ],
  },
];

export default function AdminRewardTransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<AdminRewardTransaction[]>([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { filters, isOpen, openFilters, closeFilters, applyFilters, resetFilters, hasActiveFilters, getActiveFilterCount } = useFilters({
    fields: REWARD_TRANSACTION_FILTER_FIELDS,
    onFiltersChange: async (filterValues) => {
      setCurrentPage(1);
      await loadTransactions(filterValues);
    },
  });

  useEffect(() => {
    loadTransactions(filters);
  }, [currentPage]);

  const loadTransactions = async (filterValues = filters) => {
    try {
      setIsLoading(true);
      const data = await rewardService.getAllRewardTransactions(
        20,
        filterValues.type ? filterValues.type : undefined,
        filterValues.status ? filterValues.status : undefined
      );
      setTransactions(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    !filters.search || t.user_id.toString().includes(filters.search) || t.reason?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  if (isLoading && currentPage === 1) {
    return <TableSkeleton />;
  }

  return (
    <div className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reward Transactions</h1>
        <p className="mt-2 text-gray-600">View all reward transactions</p>
      </div>

      {/* Filter Button */}
      <div className="flex gap-2">
        <Button onClick={openFilters} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        title="Filter Transactions"
        description="Search and filter reward transactions by type and status."
        isOpen={isOpen}
        fields={REWARD_TRANSACTION_FILTER_FIELDS}
        onApply={applyFilters}
        onClose={closeFilters}
        onReset={resetFilters}
      />

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      #{tx.user_id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge>
                        {transactionTypeLabels[tx.type as keyof typeof transactionTypeLabels]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {tx.type === 'redemption' ? '-' : '+'}₦{tx.amount.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[tx.status as keyof typeof statusColors]}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.reason || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-gray-600">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={filteredTransactions.length < 20}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
