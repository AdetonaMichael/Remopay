'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Crown,
  RefreshCw,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { LoyaltyDashboard } from '@/types/rewards.types';

export default function AdminLoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<LoyaltyDashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLoyaltyDashboard();
  }, []);

  const loadLoyaltyDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await rewardService.getLoyaltyDashboard();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load loyalty dashboard',
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageSkeleton />;

  const tiersArray: Array<{
    tier: string;
    user_count: number;
    average_multiplier: number;
  }> = dashboard?.users_per_tier
    ? Array.isArray(dashboard.users_per_tier)
      ? dashboard.users_per_tier
      : Object.entries(dashboard.users_per_tier)
          .filter(([tier]) => tier !== 'None')
          .map(([tier, count]: [string, any]) => ({
            tier,
            user_count:
              typeof count === 'object' && count !== null
                ? count.user_count || 0
                : count || 0,
            average_multiplier:
              typeof count === 'object' && count !== null
                ? count.average_multiplier || 1.0
                : 1.0,
          }))
    : [];

  const totalUsers = tiersArray.reduce(
    (sum, tier) => sum + (tier.user_count || 0),
    0,
  );

  const averageTierLevel =
    totalUsers > 0
      ? tiersArray.reduce(
          (sum, tier, index) => sum + (index + 1) * (tier.user_count || 0),
          0,
        ) / totalUsers
      : 0;

  const goldUsers =
    tiersArray.find((tier) => tier.tier?.toLowerCase() === 'gold')?.user_count ??
    tiersArray[2]?.user_count ??
    0;

  const metricCards = [
    {
      title: 'Total Loyalty Users',
      value: totalUsers.toLocaleString(),
      helper: 'Users enrolled in loyalty program',
      icon: Users,
    },
    {
      title: 'Average Tier Level',
      value: averageTierLevel.toFixed(2),
      helper: 'Weighted average across all tiers',
      icon: TrendingUp,
    },
    {
      title: 'Gold Tier Users',
      value: goldUsers.toLocaleString(),
      helper: 'Premium loyalty users',
      icon: Award,
    },
  ];

  const tierRequirements = [
    {
      tier: 'Bronze',
      description: 'Entry-level loyalty tier for early active users.',
      reqs: ['10+ transactions', '₦500k total volume', '30+ days active', 'Multiplier: 1.0x'],
    },
    {
      tier: 'Silver',
      description: 'Mid-level tier for users with consistent transaction activity.',
      reqs: ['50+ transactions', '₦2M total volume', '₦100k wallet funding', 'Multiplier: 1.25x'],
    },
    {
      tier: 'Gold',
      description: 'Premium tier for high-value and highly active users.',
      reqs: ['100+ transactions', '₦5M total volume', '90+ days active', 'Multiplier: 1.5x'],
    },
  ];

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
                <Crown className="h-3.5 w-3.5 text-gray-700" />
                Loyalty Control Center
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                Loyalty Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Monitor loyalty tier distribution, user progression, reward
                multipliers, and upgrade requirements from one operational view.
              </p>
            </div>

            <Button
              onClick={loadLoyaltyDashboard}
              variant="secondary"
              size="sm"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-700 hover:bg-gray-100 sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
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
                    Unable to Load Loyalty Dashboard
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {dashboard && (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {metricCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    <CardBody>
                      <div className="group relative overflow-hidden rounded-3xl bg-white">
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
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      Tier Distribution
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-black">
                      User Distribution by Tier
                    </h3>
                  </div>

                  <Badge variant="success">Live Data</Badge>
                </div>
              </CardHeader>

              <CardBody>
                {tiersArray.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      {tiersArray.map((tier, index) => {
                        const tierName =
                          tier.tier ||
                          (['Bronze', 'Silver', 'Gold'][index] as string);

                        const percentage =
                          totalUsers > 0
                            ? (tier.user_count / totalUsers) * 100
                            : 0;

                        return (
                          <div
                            key={`${tierName}-${index}`}
                            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-500">
                                  {tierName} Tier
                                </p>

                                <p className="mt-3 text-3xl font-black text-black">
                                  {tier.user_count.toLocaleString()}
                                </p>

                                <p className="mt-2 text-xs font-medium text-gray-500">
                                  {percentage.toFixed(1)}% of loyalty users
                                </p>
                              </div>

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                                <Crown className="h-5 w-5 text-black" />
                              </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                                Multiplier
                              </p>

                              <p className="mt-1 text-xl font-black text-black">
                                {tier.average_multiplier.toFixed(2)}x
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-lg font-black text-black">
                            Overall Distribution
                          </h4>

                          <p className="text-sm text-gray-500">
                            Percentage share of users across loyalty tiers.
                          </p>
                        </div>

                        <p className="text-sm font-bold text-black">
                          {totalUsers.toLocaleString()} total users
                        </p>
                      </div>

                      <div className="flex h-3 overflow-hidden rounded-full bg-gray-200">
                        {tiersArray.map((tier, index) => {
                          const tierName =
                            tier.tier ||
                            (['Bronze', 'Silver', 'Gold'][index] as string);

                          const percentage =
                            totalUsers > 0
                              ? (tier.user_count / totalUsers) * 100
                              : 0;

                          return (
                            <div
                              key={`${tierName}-bar-${index}`}
                              className={
                                index === 0
                                  ? 'bg-gray-500'
                                  : index === 1
                                    ? 'bg-gray-700'
                                    : 'bg-black'
                              }
                              style={{ width: `${percentage}%` }}
                              title={`${tierName}: ${percentage.toFixed(1)}%`}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {tiersArray.map((tier, index) => {
                          const tierName =
                            tier.tier ||
                            (['Bronze', 'Silver', 'Gold'][index] as string);

                          const percentage =
                            totalUsers > 0
                              ? (tier.user_count / totalUsers) * 100
                              : 0;

                          return (
                            <div
                              key={`${tierName}-legend-${index}`}
                              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    index === 0
                                      ? 'h-2.5 w-2.5 rounded-full bg-gray-500'
                                      : index === 1
                                        ? 'h-2.5 w-2.5 rounded-full bg-gray-700'
                                        : 'h-2.5 w-2.5 rounded-full bg-black'
                                  }
                                />

                                <span className="text-sm font-semibold text-gray-600">
                                  {tierName}
                                </span>
                              </div>

                              <span className="text-sm font-black text-black">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 py-14 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-200 bg-white">
                      <BarChart3 className="h-7 w-7 text-black" />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-black">
                      No Tier Data Available
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Loyalty tier data will appear here once users are assigned
                      to Bronze, Silver, or Gold tiers.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Upgrade Criteria
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-black">
                    Tier Requirements
                  </h3>
                </div>
              </CardHeader>

              <CardBody>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {tierRequirements.map((tier, index) => (
                    <div
                      key={tier.tier}
                      className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                            Level {index + 1}
                          </p>

                          <h4 className="mt-2 text-xl font-black text-black">
                            {tier.tier}
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-gray-500">
                            {tier.description}
                          </p>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                          <ShieldCheck className="h-5 w-5 text-black" />
                        </div>
                      </div>

                      <ul className="mt-5 space-y-3">
                        {tier.reqs.map((req) => (
                          <li
                            key={req}
                            className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {!dashboard && !error && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardBody>
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50">
                  <BarChart3 className="h-7 w-7 text-black" />
                </div>

                <h3 className="mt-5 text-xl font-black text-black">
                  No Loyalty Data Available
                </h3>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  Loyalty metrics will appear here once dashboard data is
                  available.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}