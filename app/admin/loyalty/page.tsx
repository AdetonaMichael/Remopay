'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  ShieldCheck,
  BarChart3,
  Crown,
} from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { rewardService } from '@/services/reward.service';
import { LoyaltyDashboard } from '@/types/rewards.types';

const tierMeta = {
  Bronze: {
    icon: '🥉',
    card: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20',
    text: 'text-amber-800 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  Silver: {
    icon: '🥈',
    card: 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5',
    text: 'text-slate-800 dark:text-slate-200',
    bar: 'bg-slate-500',
  },
  Gold: {
    icon: '🥇',
    card: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    bar: 'bg-yellow-500',
  },
};

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

  if (error) {
    return (
      <div className="min-h-screen space-y-8 bg-[#faf7f7] px-4 py-6 text-slate-950 dark:bg-[#090707] dark:text-white">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Convert users_per_tier object to array if needed
  const tiersArray: Array<{ tier: string; user_count: number; average_multiplier: number }> = dashboard?.users_per_tier
    ? Array.isArray(dashboard.users_per_tier)
      ? dashboard.users_per_tier
      : Object.entries(dashboard.users_per_tier)
          .filter(([tier]) => tier !== 'None')
          .map(([tier, count]: [string, any]) => ({
            tier,
            user_count: typeof count === 'object' && count !== null ? (count.user_count || 0) : (count || 0),
            average_multiplier: typeof count === 'object' && count !== null ? (count.average_multiplier || 1.0) : 1.0,
          }))
    : [];

  const totalUsers = tiersArray.reduce((sum, tier) => sum + (tier.user_count || 0), 0) || 0;

  const averageTierLevel =
    totalUsers > 0
      ? tiersArray.reduce(
          (sum, tier, index) => sum + (index + 1) * (tier.user_count || 0),
          0,
        ) / totalUsers
      : 0;

  const goldUsers = tiersArray[2]?.user_count || 0;

  return (
    <div className="min-h-screen space-y-8 bg-[#faf7f7] px-4 py-6 text-slate-950 dark:bg-[#090707] dark:text-white sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#620707]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#120d0d] md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#620707]/10 blur-3xl dark:bg-[#ffdddd]/10" />
        <div className="absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#620707]/15 bg-[#620707]/5 px-3 py-1 text-xs font-bold text-[#620707] dark:border-white/10 dark:bg-white/5 dark:text-[#ffb3b3]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Remopay Loyalty Engine
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Loyalty Tier Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Monitor customer loyalty distribution, tier progression, reward
            multipliers, and high-value users across Remopay.
          </p>
        </div>
      </div>

      {error && (
        <Card className="rounded-3xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-300" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        </Card>
      )}

      {dashboard && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden rounded-3xl border border-[#620707]/10 bg-[#620707] p-6 text-white shadow-sm">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/75">
                    Total Loyalty Users
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight">
                    {totalUsers.toLocaleString()}
                  </h3>
                  <p className="mt-3 text-xs text-white/65">
                    Users currently assigned to loyalty tiers.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <Users className="h-7 w-7" />
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#120d0d]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Average Tier Level
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight">
                    {averageTierLevel.toFixed(2)}
                  </h3>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Weighted average across all loyalty users.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#620707]/10 p-3 text-[#620707] dark:bg-white/10 dark:text-[#ffb3b3]">
                  <TrendingUp className="h-7 w-7" />
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-yellow-200 bg-white p-6 shadow-sm dark:border-yellow-900/50 dark:bg-[#120d0d]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Gold Tier Users
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight text-yellow-700 dark:text-yellow-300">
                    {goldUsers.toLocaleString()}
                  </h3>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Highest-value Remopay loyalty customers.
                  </p>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-3 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
                  <Award className="h-7 w-7" />
                </div>
              </div>
            </Card>
          </div>

          {/* Distribution */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#120d0d]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#620707]/10 p-3 text-[#620707] dark:bg-white/10 dark:text-[#ffb3b3]">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  User Distribution by Tier
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Breakdown of users across Bronze, Silver, and Gold levels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tiersArray.map((tier, index) => {
                const tierName = ['Bronze', 'Silver', 'Gold'][
                  index
                ] as keyof typeof tierMeta;

                const meta = tierMeta[tierName];

                const percentage =
                  totalUsers > 0 ? (tier.user_count / totalUsers) * 100 : 0;

                return (
                  <div
                    key={tierName}
                    className={`rounded-3xl border p-6 text-center ${meta.card}`}
                  >
                    <div className="text-4xl">{meta.icon}</div>

                    <h3 className={`mt-3 text-xl font-black ${meta.text}`}>
                      {tierName}
                    </h3>

                    <p className="mt-3 text-4xl font-black text-slate-950 dark:text-white">
                      {tier.user_count.toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {percentage.toFixed(1)}% of users
                    </p>

                    <div className="mt-5 border-t border-black/10 pt-5 dark:border-white/10">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Average Multiplier
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                        {tier.average_multiplier.toFixed(2)}x
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-white/10">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                  Overall Distribution
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total: {totalUsers.toLocaleString()} users
                </p>
              </div>

              <div className="flex h-8 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                {tiersArray.map((tier, index) => {
                  const tierName = ['Bronze', 'Silver', 'Gold'][
                    index
                  ] as keyof typeof tierMeta;

                  const percentage =
                    totalUsers > 0 ? (tier.user_count / totalUsers) * 100 : 0;

                  return (
                    <div
                      key={tierName}
                      className={tierMeta[tierName].bar}
                      style={{ width: `${percentage}%` }}
                      title={`${tierName}: ${percentage.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#120d0d]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#620707]/10 p-3 text-[#620707] dark:bg-white/10 dark:text-[#ffb3b3]">
                <Crown className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-black">Tier Requirements</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Qualification rules for each Remopay loyalty level.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                <h3 className="font-black text-amber-900 dark:text-amber-300">
                  Bronze
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-amber-900 dark:text-amber-200">
                  <li>10+ transactions</li>
                  <li>₦500k total volume</li>
                  <li>30+ days active</li>
                  <li className="font-black">Multiplier: 1.0x</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="font-black text-slate-900 dark:text-slate-100">
                  Silver
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>50+ transactions</li>
                  <li>₦2M total volume</li>
                  <li>₦100k wallet funding</li>
                  <li className="font-black">Multiplier: 1.25x</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-900/50 dark:bg-yellow-950/20">
                <h3 className="font-black text-yellow-900 dark:text-yellow-300">
                  Gold
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-yellow-900 dark:text-yellow-200">
                  <li>100+ transactions</li>
                  <li>₦5M total volume</li>
                  <li>90+ days active</li>
                  <li className="font-black">Multiplier: 1.5x</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}