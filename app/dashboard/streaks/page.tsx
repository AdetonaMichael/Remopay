'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, AlertCircle } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { TransactionStreak } from '@/types/rewards.types';

export default function StreaksPage() {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<TransactionStreak | null>(null);
  const [weekly, setWeekly] = useState<TransactionStreak | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStreaks();
  }, []);

  const loadStreaks = async () => {
    try {
      setLoading(true);
      const data = await rewardService.getTransactionStreaks();
      setDaily(data.daily_streak);
      setWeekly(data.weekly_streak);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load streaks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  const getDaysAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction Streaks</h1>
        <p className="mt-2 text-gray-600">Build streaks for bonus rewards</p>
      </div>

      {/* Daily Streak */}
      {daily && (
        <Card>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                Daily Streak
              </h2>
              <p className="text-sm text-gray-600 mt-1">Transact daily to maintain streak</p>
            </div>
            <Badge variant={daily.current_count > 0 ? 'success' : 'default'}>
              {daily.current_count > 0 ? 'Active' : 'Not Active'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Current Streak</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-2">{daily.current_count}</h3>
              <p className="text-xs text-gray-600 mt-1">days</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Best Streak</p>
              <h3 className="text-3xl font-bold text-yellow-600 mt-2">{daily.best_count}</h3>
              <p className="text-xs text-gray-600 mt-1">days</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Started</p>
              <h3 className="text-lg font-bold text-blue-600 mt-2 truncate">
                {new Date(daily.started_at).toLocaleDateString()}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{getDaysAgo(daily.started_at)}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Last Transaction</p>
              <h3 className="text-lg font-bold text-green-600 mt-2 truncate">
                {new Date(daily.last_transaction_at).toLocaleDateString()}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{getDaysAgo(daily.last_transaction_at)}</p>
            </div>
          </div>

          {daily.current_count === 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Streak Broken</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Your daily streak was broken. Complete a transaction today to start a new streak!
                </p>
              </div>
            </div>
          )}

          {daily.current_count > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Keep it Going!</p>
                <p className="text-sm text-blue-800 mt-1">
                  You're on a {daily.current_count}-day streak. Complete a transaction daily to earn streak bonuses!
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Weekly Streak */}
      {weekly && (
        <Card>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Flame className="h-6 w-6 text-red-500" />
                Weekly Streak
              </h2>
              <p className="text-sm text-gray-600 mt-1">Complete transactions weekly to maintain streak</p>
            </div>
            <Badge variant={weekly.current_count > 0 ? 'success' : 'default'}>
              {weekly.current_count > 0 ? 'Active' : 'Not Active'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Current Streak</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">{weekly.current_count}</h3>
              <p className="text-xs text-gray-600 mt-1">weeks</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Best Streak</p>
              <h3 className="text-3xl font-bold text-pink-600 mt-2">{weekly.best_count}</h3>
              <p className="text-xs text-gray-600 mt-1">weeks</p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Started</p>
              <h3 className="text-lg font-bold text-violet-600 mt-2 truncate">
                {new Date(weekly.started_at).toLocaleDateString()}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{getDaysAgo(weekly.started_at)}</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Last Transaction</p>
              <h3 className="text-lg font-bold text-cyan-600 mt-2 truncate">
                {new Date(weekly.last_transaction_at).toLocaleDateString()}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{getDaysAgo(weekly.last_transaction_at)}</p>
            </div>
          </div>

          {weekly.current_count === 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Streak Broken</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Your weekly streak was broken. Complete a transaction this week to start a new streak!
                </p>
              </div>
            </div>
          )}

          {weekly.current_count > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900">Amazing Performance!</p>
                <p className="text-sm text-purple-800 mt-1">
                  You're on a {weekly.current_count}-week streak. Keep transacting weekly for amazing rewards!
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Streak Bonuses Info */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Streak Bonus Multipliers</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">3-Day Streak</span>
            <Badge>1.5x Rewards</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">7-Day Streak</span>
            <Badge>2x Rewards</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">14-Day Streak</span>
            <Badge>3x Rewards</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">30-Day Streak</span>
            <Badge variant="success">5x Rewards</Badge>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
