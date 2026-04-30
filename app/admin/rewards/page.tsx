'use client';

import { useState, useEffect } from 'react';
import {
  Gift,
  TrendingUp,
  AlertCircle,
  Users,
  CreditCard,
  ArrowUpRight,
  WalletCards,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { rewardService } from '@/services/reward.service';
import { RewardDashboard, AdminRewardTransaction } from '@/types/rewards.types';
import Link from 'next/link';

const formatMoney = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30';
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30';
    default:
      return 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30';
  }
};

const typeClass =
  'bg-[#d71927]/15 text-[#ff737b] ring-1 ring-[#d71927]/25';

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
      setError('');

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

  const redemptionRate =
    dashboard && dashboard.total_issued > 0
      ? (dashboard.total_redeemed / dashboard.total_issued) * 100
      : 0;

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/admin/rewards/campaigns">
              <Button className="w-full rounded-2xl bg-[#d71927] px-5 py-3 text-white shadow-lg shadow-[#d71927]/25 hover:bg-[#b91420] sm:w-auto">
                Manage Campaigns
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/admin/rewards/manual-issue">
              <Button
                variant="secondary"
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-950 hover:bg-slate-50 sm:w-auto dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Issue Manual Reward
              </Button>
            </Link>
          </div>

      {error && (
        <Card className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {dashboard && (
        <>
          {/* Main Stats - Horizontal Scrollable Cards */}
          <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3">
            {/* Total Issued Card */}
            <Card className="relative min-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm flex-shrink-0 md:min-w-0">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#d71927]/10" />
              <div className="relative">
                <p className="text-sm font-medium text-slate-600">Total Issued</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  {formatMoney(dashboard.total_issued)}
                </h2>
                <p className="mt-3 text-xs text-slate-600">All rewards credited to users.</p>
              </div>
            </Card>

            {/* Outstanding Liability Card */}
            <Card className="relative min-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex-shrink-0 md:min-w-0">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10" />
              <div className="relative">
                <p className="text-sm font-medium text-slate-600">
                  Outstanding Liability
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  {formatMoney(dashboard.outstanding_liability)}
                </h2>
                <p className="mt-3 text-xs text-slate-600">
                  Rewards not yet redeemed.
                </p>
              </div>
            </Card>

            {/* Active Beneficiaries Card */}
            <Card className="relative min-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex-shrink-0 md:min-w-0">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10" />
              <div className="relative">
                <p className="text-sm font-medium text-slate-600">
                  Active Beneficiaries
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  {dashboard.unique_beneficiaries.toLocaleString()}
                </h2>
                <p className="mt-3 text-xs text-slate-600">
                  Unique users receiving rewards.
                </p>
              </div>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                label: 'Total Redeemed',
                value: formatMoney(dashboard.total_redeemed),
                icon: CreditCard,
              },
              {
                label: 'Pending Rewards',
                value: formatMoney(dashboard.pending_rewards),
                icon: TrendingUp,
              },
              {
                label: 'Total Transactions',
                value: dashboard.total_transactions.toLocaleString(),
                icon: WalletCards,
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {item.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-slate-950">
                    {item.value}
                  </h3>
                </div>
              </Card>
            ))}
          </div>

          {/* Redemption Analysis */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-950">
                  Redemption Analysis
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Tracks how much of issued rewards has been redeemed.
                </p>

                <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#d71927] transition-all duration-500"
                    style={{ width: `${Math.min(redemptionRate, 100)}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {redemptionRate.toFixed(1)}% of issued rewards have been redeemed.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-8 py-6 text-center">
                <p className="text-4xl font-black text-[#d71927]">
                  {redemptionRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Redeemed
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Recent Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Latest reward activity across Remopay users.
            </p>
          </div>

          <Link href="/admin/rewards/transactions">
            <Button
              variant="secondary"
              className="w-full rounded-2xl border border-slate-200 bg-white text-slate-950 hover:bg-slate-50 sm:w-auto"
            >
              View All
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['User', 'Type', 'Amount', 'Status', 'Date'].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/admin/rewards/users/${txn.user.id}`}>
                          <p className="text-sm font-bold text-[#d71927] hover:underline">
                            {txn.user.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {txn.user.email}
                          </p>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${typeClass}`}
                        >
                          {txn.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-black text-slate-950">
                        {formatMoney(txn.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                            txn.status,
                          )}`}
                        >
                          {txn.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(txn.created_at).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <h3 className="text-sm font-black text-slate-950">
                          No reward transactions yet
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Recent reward activities will appear here once users start earning or redeeming rewards.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}