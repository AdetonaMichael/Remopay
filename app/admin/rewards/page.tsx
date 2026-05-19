'use client';

import { useState, useEffect } from 'react';
import {
  Gift,
  TrendingUp,
  AlertCircle,
  Users,
  CreditCard,
  WalletCards,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { RewardDashboard, AdminRewardTransaction } from '@/types/rewards.types';

const formatMoney = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminRewardDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<RewardDashboard | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    AdminRewardTransaction[]
  >([]);
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

  const overviewCards = dashboard
    ? [
        {
          title: 'Total Issued',
          value: formatMoney(dashboard.total_issued),
          helper: 'All rewards credited',
          icon: Gift,
        },
        {
          title: 'Outstanding Liability',
          value: formatMoney(dashboard.outstanding_liability),
          helper: 'Not yet redeemed',
          icon: CreditCard,
        },
        {
          title: 'Active Beneficiaries',
          value: dashboard.unique_beneficiaries.toLocaleString(),
          helper: 'Unique users',
          icon: Users,
        },
        {
          title: 'Redemption Rate',
          value: `${redemptionRate.toFixed(1)}%`,
          helper: 'Issued rewards redeemed',
          icon: TrendingUp,
        },
      ]
    : [];

  const secondaryCards = dashboard
    ? [
        {
          title: 'Total Redeemed',
          value: formatMoney(dashboard.total_redeemed),
          helper: 'Successfully processed',
          icon: ShieldCheck,
        },
        {
          title: 'Pending Rewards',
          value: formatMoney(dashboard.pending_rewards),
          helper: 'Awaiting redemption',
          icon: WalletCards,
        },
        {
          title: 'Total Transactions',
          value: dashboard.total_transactions.toLocaleString(),
          helper: 'All reward activity',
          icon: ArrowUpRight,
        },
      ]
    : [];

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 lg:px-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                <Gift className="h-3.5 w-3.5 text-gray-700" />
                Rewards Control Center
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                Rewards Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Monitor reward issuance, outstanding liability, redemption
                performance, beneficiaries, and recent reward activity.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/admin/rewards/campaigns">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full rounded-xl bg-black px-4 text-white hover:bg-gray-900 sm:w-auto"
                >
                  Manage Campaigns
                </Button>
              </Link>

              <Link href="/admin/rewards/manual-issue">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-700 hover:bg-gray-100 sm:w-auto"
                >
                  Issue Reward
                </Button>
              </Link>

              <Button
                onClick={loadDashboardData}
                variant="secondary"
                size="sm"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-700 hover:bg-gray-100 sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardBody>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  <AlertCircle className="h-5 w-5 text-black" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-black">
                    Unable to Load Rewards Dashboard
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {dashboard && (
          <>
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      Reward Overview
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-black">
                      Key Reward Metrics
                    </h3>
                  </div>

                  <Badge variant="success">Live Data</Badge>
                </div>
              </CardHeader>

              <CardBody>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {overviewCards.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                      >
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100 transition-all duration-300 group-hover:scale-110" />

                        <div className="relative flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-500">
                              {item.title}
                            </p>

                            <p className="mt-3 break-words text-3xl font-black tracking-tight text-black">
                              {item.value}
                            </p>

                            <p className="mt-2 text-xs font-medium text-gray-500">
                              {item.helper}
                            </p>
                          </div>

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {secondaryCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    <CardBody>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500">
                            {item.title}
                          </p>

                          <p className="mt-3 break-words text-3xl font-black text-black">
                            {item.value}
                          </p>

                          <p className="mt-2 text-xs font-medium text-gray-500">
                            {item.helper}
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Redemption Analysis
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-black">
                    Redemption Progress
                  </h3>
                </div>
              </CardHeader>

              <CardBody>
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-gray-600">
                      Issued Rewards Redeemed
                    </span>

                    <span className="text-sm font-black text-black">
                      {redemptionRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-black transition-all duration-500"
                      style={{ width: `${Math.min(redemptionRate, 100)}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    {redemptionRate.toFixed(1)}% of issued rewards have been
                    redeemed by users.
                  </p>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                Recent Activity
              </p>

              <h3 className="mt-1 text-2xl font-black text-black">
                Recent Transactions
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Latest reward issuance and redemption activity.
              </p>
            </div>

            <Link href="/admin/rewards/transactions">
              <Button
                variant="secondary"
                size="sm"
                className="w-full rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 sm:w-auto"
              >
                View All
              </Button>
            </Link>
          </CardHeader>

          <CardBody>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-gray-50">
                    <tr>
                      {['User', 'Type', 'Amount', 'Status', 'Date'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-gray-500"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((txn) => (
                        <tr
                          key={txn.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <Link href={`/admin/rewards/users/${txn.user.id}`}>
                              <p className="text-sm font-bold text-black hover:underline">
                                {txn.user.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {txn.user.email}
                              </p>
                            </Link>
                          </td>

                          <td className="px-5 py-4">
                            <Badge variant="default" className="text-xs capitalize">
                              {txn.type.replace('_', ' ')}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 text-sm font-black text-black">
                            {formatMoney(txn.amount)}
                          </td>

                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                txn.status === 'completed'
                                  ? 'success'
                                  : txn.status === 'pending'
                                    ? 'warning'
                                    : 'danger'
                              }
                              className="text-xs capitalize"
                            >
                              {txn.status}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 text-xs font-medium text-gray-500">
                            {new Date(txn.created_at).toLocaleDateString(
                              'en-NG',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                              <Gift className="h-6 w-6 text-black" />
                            </div>

                            <h4 className="mt-4 text-base font-black text-black">
                              No Reward Transactions Yet
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                              Reward activity will appear here once users start
                              earning or redeeming rewards.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}