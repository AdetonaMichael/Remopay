'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Award } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { LoyaltyDashboard } from '@/types/rewards.types';

const tierColors = {
  Bronze: 'bg-gradient-to-br from-amber-50 to-amber-100',
  Silver: 'bg-gradient-to-br from-slate-50 to-slate-100',
  Gold: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
};

const tierIcons = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
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
      const data = await rewardService.getLoyaltyDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loyalty dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  const totalUsers = dashboard
    ? dashboard.users_per_tier.reduce((sum, t) => sum + t.user_count, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Tier Management</h1>
          <p className="mt-2 text-gray-600">Monitor user tier distribution and progression</p>
        </div>
      </div>

      {/* Summary Stats */}
      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {totalUsers.toLocaleString()}
                  </h3>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg. Tier Level</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {(
                      dashboard.users_per_tier.reduce((sum, t, idx) => sum + idx * t.user_count, 0) /
                      totalUsers
                    ).toFixed(2)}
                  </h3>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Gold Tier Users</p>
                  <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                    {dashboard.users_per_tier[2]?.user_count.toLocaleString() || '0'}
                  </h3>
                </div>
                <Award className="h-10 w-10 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Tier Distribution */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Distribution by Tier</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboard.users_per_tier.map((tier, idx) => {
                const tierName = ['Bronze', 'Silver', 'Gold'][idx];
                const percentage =
                  totalUsers > 0 ? ((tier.user_count / totalUsers) * 100).toFixed(1) : 0;

                return (
                  <div
                    key={tierName}
                    className={`${tierColors[tierName as keyof typeof tierColors]} rounded-lg p-6 text-center`}
                  >
                    <div className="text-4xl mb-2">{tierIcons[tierName as keyof typeof tierIcons]}</div>
                    <h3 className="text-xl font-bold text-gray-900">{tierName}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tier.user_count}</p>
                    <p className="text-sm text-gray-600 mt-1">{percentage}% of users</p>

                    <div className="mt-4 pt-4 border-t border-gray-300 border-opacity-30">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Avg Multiplier</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {tier.average_multiplier.toFixed(2)}x
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Distribution Bar */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Overall Distribution</p>
              <div className="flex gap-1 h-8 rounded-full overflow-hidden">
                {dashboard.users_per_tier.map((tier, idx) => {
                  const tierName = ['Bronze', 'Silver', 'Gold'][idx];
                  const percentage = totalUsers > 0 ? (tier.user_count / totalUsers) * 100 : 0;
                  const bgClasses = {
                    Bronze: 'bg-amber-500',
                    Silver: 'bg-slate-500',
                    Gold: 'bg-yellow-500',
                  };

                  return (
                    <div
                      key={tierName}
                      className={`${bgClasses[tierName as keyof typeof bgClasses]}`}
                      style={{ width: `${percentage}%` }}
                      title={`${tierName}: ${percentage.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Tier Requirements Info */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tier Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3">Bronze</h3>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li>• 10+ transactions</li>
                  <li>• ₦500k total volume</li>
                  <li>• 30+ days active</li>
                  <li>• Multiplier: 1.0x</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3">Silver</h3>
                <ul className="space-y-2 text-sm text-slate-900">
                  <li>• 50+ transactions</li>
                  <li>• ₦2M total volume</li>
                  <li>• ₦100k wallet funding</li>
                  <li>• Multiplier: 1.25x</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-yellow-900 mb-3">Gold</h3>
                <ul className="space-y-2 text-sm text-yellow-900">
                  <li>• 100+ transactions</li>
                  <li>• ₦5M total volume</li>
                  <li>• 90+ days active</li>
                  <li>• Multiplier: 1.5x</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
