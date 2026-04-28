'use client';

import { useState, useEffect } from 'react';
import { Gift, TrendingUp, AlertCircle, Users, CreditCard } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { rewardService } from '@/services/reward.service';
import { RewardDashboard, AdminRewardTransaction } from '@/types/rewards.types';
import Link from 'next/link';

export default function AdminRewardDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<RewardDashboard | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<AdminRewardTransaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashData, txnData] = await Promise.all([
        rewardService.getRewardDashboard(),
        rewardService.getAllRewardTransactions(10),
      ]);
      setDashboard(dashData);
      setRecentTransactions(txnData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reward Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage the rewards system</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/rewards/campaigns">
            <Button className="bg-[#4a5ff7] hover:bg-[#3d4fe0] text-white">
              Manage Campaigns
            </Button>
          </Link>
          <Link href="/admin/rewards/manual-issue">
            <Button variant="secondary">Issue Manual Reward</Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Issued */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Issued</p>
                  <h2 className="text-3xl font-bold mt-2">
                    ₦{dashboard.total_issued.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <Gift className="h-10 w-10 text-blue-300" />
              </div>
            </Card>

            {/* Outstanding Liability */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Outstanding Liability</p>
                  <h2 className="text-3xl font-bold mt-2">
                    ₦{dashboard.outstanding_liability.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h2>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-300" />
              </div>
            </Card>

            {/* Unique Beneficiaries */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Users</p>
                  <h2 className="text-3xl font-bold mt-2">{dashboard.unique_beneficiaries.toLocaleString()}</h2>
                </div>
                <Users className="h-10 w-10 text-green-300" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Redeemed */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Redeemed</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    ₦{dashboard.total_redeemed.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <CreditCard className="h-10 w-10 text-green-500" />
              </div>
            </Card>

            {/* Pending Rewards */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Rewards</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    ₦{dashboard.pending_rewards.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <TrendingUp className="h-10 w-10 text-yellow-500" />
              </div>
            </Card>

            {/* Total Transactions */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Transactions</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {dashboard.total_transactions.toLocaleString()}
                  </h3>
                </div>
                <Gift className="h-10 w-10 text-[#4a5ff7]" />
              </div>
            </Card>
          </div>

          {/* Redemption Rate */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Redemption Analysis</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Redemption Rate</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${
                        dashboard.total_issued > 0
                          ? (dashboard.total_redeemed / dashboard.total_issued) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {(
                    (dashboard.total_redeemed /
                      (dashboard.total_issued || 1)) *
                    100
                  ).toFixed(1)}
                  % of issued rewards have been redeemed
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    (dashboard.total_redeemed /
                      (dashboard.total_issued || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <Link href="/admin/rewards/transactions">
            <Button variant="secondary">View All</Button>
          </Link>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    User
                  </th>
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/rewards/users/${txn.user.id}`}>
                        <p className="text-sm font-medium text-[#4a5ff7] hover:underline">
                          {txn.user.name}
                        </p>
                        <p className="text-xs text-gray-600">{txn.user.email}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                        {txn.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₦{txn.amount.toFixed(2)}
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(txn.created_at).toLocaleDateString('en-NG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
