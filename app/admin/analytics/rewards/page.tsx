'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Gift, Target } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { rewardService } from '@/services/reward.service';
import {
  RewardImpactMetrics,
  CashbackLiability,
  ConversionFunnel,
  TopRewardedUser,
} from '@/types/rewards.types';

export default function AdminAnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [impactMetrics, setImpactMetrics] = useState<RewardImpactMetrics | null>(null);
  const [liability, setLiability] = useState<CashbackLiability | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [topUsers, setTopUsers] = useState<TopRewardedUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [impactData, liabilityData, funnelData, topUsersData] = await Promise.all([
        rewardService.getRewardImpactMetrics(30),
        rewardService.getCashbackLiability(),
        rewardService.getConversionFunnel(),
        rewardService.getTopRewardedUsers(15),
      ]);

      setImpactMetrics(impactData);
      setLiability(liabilityData);
      setFunnel(funnelData);
      setTopUsers(topUsersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor system metrics and reward impact</p>
      </div>

      {/* Impact Metrics */}
      {impactMetrics && (
        <>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reward Impact (Last 30 Days)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Transactions with Rewards</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {impactMetrics.transactions_with_rewards.toLocaleString()}
                    </h3>
                  </div>
                  <TrendingUp className="h-10 w-10 text-blue-500" />
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Transactions</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {impactMetrics.total_transactions.toLocaleString()}
                    </h3>
                  </div>
                  <Gift className="h-10 w-10 text-purple-500" />
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {impactMetrics.active_users.toLocaleString()}
                    </h3>
                  </div>
                  <Users className="h-10 w-10 text-green-500" />
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Reward Coverage</p>
                    <h3 className="text-3xl font-bold text-[#d71927] mt-2">
                      {impactMetrics.reward_coverage_percentage.toFixed(1)}%
                    </h3>
                  </div>
                  <Target className="h-10 w-10 text-red-500" />
                </div>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction & Reward Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <p className="text-gray-600 text-sm mb-2">Average Transaction Value</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  ₦{impactMetrics.average_transaction_value.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </Card>
              <Card>
                <p className="text-gray-600 text-sm mb-2">Average Reward Value</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  ₦{impactMetrics.average_reward_value.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p className="text-xs text-gray-600 mt-2">
                  {((impactMetrics.average_reward_value / impactMetrics.average_transaction_value) * 100).toFixed(1)}% of transaction value
                </p>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Cashback Liability */}
      {liability && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cashback Liability Analysis</h2>
          <Card>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Outstanding Liability</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      ₦{liability.outstanding_liability.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Users with Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{liability.users_with_balance.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Avg: ₦{liability.average_liability_per_user.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Issued</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{liability.total_cashback_issued.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Redeemed</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₦{liability.total_cashback_redeemed.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Redemption Rate</span>
                  <span className="text-sm font-bold text-gray-900">
                    {((liability.total_cashback_redeemed / (liability.total_cashback_issued || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${((liability.total_cashback_redeemed / (liability.total_cashback_issued || 1)) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Conversion Funnel */}
      {funnel && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Conversion Funnel</h2>
          <Card>
            <div className="space-y-4">
              {[
                { label: 'Registered Users', value: funnel.registered_users, rate: 100 },
                { label: 'Email Verified', value: funnel.email_verified, rate: funnel.conversion_rates.registration_to_email },
                { label: 'Phone Verified', value: funnel.phone_verified, rate: funnel.conversion_rates.email_to_phone },
                { label: 'Wallet Funded', value: funnel.wallet_funded, rate: funnel.conversion_rates.phone_to_funding },
                { label: 'First Transaction', value: funnel.first_transaction, rate: funnel.conversion_rates.funding_to_transaction },
                { label: 'Earned Reward', value: funnel.reward_earned, rate: funnel.conversion_rates.transaction_to_reward },
              ].map((step, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{step.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{step.value.toLocaleString()}</span>
                      <span className="text-xs text-gray-600 ml-2">({step.rate.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#4a5ff7] h-2 rounded-full transition-all"
                      style={{ width: `${step.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Top Rewarded Users */}
      {topUsers.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Rewarded Users (Last 30 Days)</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Reward Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Total Rewards
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topUsers.map((user, idx) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#4a5ff7] text-white font-bold text-sm">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{user.user_id}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {user.reward_count}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        ₦{user.total_rewards.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
