'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
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

export default function AdminRewardTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<AdminRewardTransaction[]>([]);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | any>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter, statusFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await rewardService.getAllRewardTransactions(
        20,
        typeFilter === 'all' ? undefined : typeFilter,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setTransactions(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    searchTerm === '' || t.user_id.toString().includes(searchTerm) || t.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  if (loading && page === 1) {
    return <TableSkeleton />;
  }

  return (
    <div className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reward Transactions</h1>
        <p className="mt-2 text-gray-600">View all reward transactions</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="cashback">Cashback</option>
              <option value="bonus">Bonus</option>
              <option value="streak">Streak Bonus</option>
              <option value="referral">Referral</option>
              <option value="first_transaction">First Transaction</option>
              <option value="redemption">Redemption</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Search</label>
            <Input
              placeholder="User ID or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadTransactions}
              className="w-full px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              <Filter className="inline h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </Card>

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
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
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
