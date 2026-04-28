'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { rewardService } from '@/services/reward.service';
import { RewardTransaction, RewardTransactionType } from '@/types/rewards.types';

const transactionTypes: { value: RewardTransactionType; label: string }[] = [
  { value: 'cashback', label: 'Cashback' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'streak', label: 'Streak' },
  { value: 'referral', label: 'Referral' },
  { value: 'first_transaction', label: 'First Transaction' },
  { value: 'redemption', label: 'Redemption' },
];

export default function RewardHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [selectedType, setSelectedType] = useState<RewardTransactionType | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [selectedType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await rewardService.getRewardTransactions(100, selectedType || undefined);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reward History</h1>
        <p className="mt-2 text-gray-600">Track all your reward transactions</p>
      </div>

      {/* Filter */}
      <Card className="bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as RewardTransactionType | '')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
          >
            <option value="">All Transactions</option>
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
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
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {txn.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      <span
                        className={txn.type === 'redemption' ? 'text-red-600' : 'text-green-600'}
                      >
                        {txn.type === 'redemption' ? '-' : '+'}₦{txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          txn.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(txn.created_at).toLocaleDateString('en-NG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-600">No reward transactions found</p>
        </Card>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
