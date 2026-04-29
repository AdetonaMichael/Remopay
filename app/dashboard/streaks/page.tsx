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
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="space-y-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">Transaction Streaks</h1>
        <p className="mt-2 text-[#667085]">Build streaks for bonus rewards</p>
      </div>

      {/* Daily Streak */}
      {daily && (
        <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827] flex items-center gap-3">
                <Flame className="h-7 w-7 text-orange-500" />
                Daily Streak
              </h2>
              <p className="text-[#667085] mt-2">Transact daily to maintain streak</p>
            </div>
            <Badge className={daily.current_count > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}>
              {daily.current_count > 0 ? 'Active' : 'Not Active'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-[24px] border border-[#DCE3FF] bg-[#F7F8FF] p-5">
              <p className="text-xs font-semibold text-[#667085]">Current Streak</p>
              <h3 className="text-4xl font-extrabold text-[#4A5FF7] mt-3">{daily.current_count}</h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">days</p>
            </div>

            <div className="rounded-[24px] border border-[#DCE3FF] bg-[#F7F8FF] p-5">
              <p className="text-xs font-semibold text-[#667085]">Best Streak</p>
              <h3 className="text-4xl font-extrabold text-[#4A5FF7] mt-3">{daily.best_count}</h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">days</p>
            </div>

            <div className="rounded-[24px] border border-[#E6E9F5] bg-white p-5">
              <p className="text-xs font-semibold text-[#667085]">Started</p>
              <h3 className="text-lg font-extrabold text-[#111827] mt-3 truncate">
                {new Date(daily.started_at).toLocaleDateString()}
              </h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">{getDaysAgo(daily.started_at)}</p>
            </div>

            <div className="rounded-[24px] border border-[#E6E9F5] bg-white p-5">
              <p className="text-xs font-semibold text-[#667085]">Last Transaction</p>
              <h3 className="text-lg font-extrabold text-[#111827] mt-3 truncate">
                {new Date(daily.last_transaction_at).toLocaleDateString()}
              </h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">{getDaysAgo(daily.last_transaction_at)}</p>
            </div>
          </div>

          {daily.current_count === 0 && (
            <div className="flex items-start gap-3 p-5 rounded-[24px] bg-amber-50 border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">Streak Broken</p>
                <p className="text-sm text-amber-800 mt-1">
                  Your daily streak was broken. Complete a transaction today to start a new streak!
                </p>
              </div>
            </div>
          )}

          {daily.current_count > 0 && (
            <div className="flex items-start gap-3 p-5 rounded-[24px] bg-[#F7F8FF] border border-[#DCE3FF]">
              <TrendingUp className="h-5 w-5 text-[#4A5FF7] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-[#111827]">Keep it Going!</p>
                <p className="text-sm text-[#667085] mt-1">
                  You're on a {daily.current_count}-day streak. Complete a transaction daily to earn streak bonuses!
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Weekly Streak */}
      {weekly && (
        <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827] flex items-center gap-3">
                <Flame className="h-7 w-7 text-red-500" />
                Weekly Streak
              </h2>
              <p className="text-[#667085] mt-2">Complete transactions weekly to maintain streak</p>
            </div>
            <Badge className={weekly.current_count > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}>
              {weekly.current_count > 0 ? 'Active' : 'Not Active'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-[24px] border border-[#DCE3FF] bg-[#F7F8FF] p-5">
              <p className="text-xs font-semibold text-[#667085]">Current Streak</p>
              <h3 className="text-4xl font-extrabold text-[#4A5FF7] mt-3">{weekly.current_count}</h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">weeks</p>
            </div>

            <div className="rounded-[24px] border border-[#DCE3FF] bg-[#F7F8FF] p-5">
              <p className="text-xs font-semibold text-[#667085]">Best Streak</p>
              <h3 className="text-4xl font-extrabold text-[#4A5FF7] mt-3">{weekly.best_count}</h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">weeks</p>
            </div>

            <div className="rounded-[24px] border border-[#E6E9F5] bg-white p-5">
              <p className="text-xs font-semibold text-[#667085]">Started</p>
              <h3 className="text-lg font-extrabold text-[#111827] mt-3 truncate">
                {new Date(weekly.started_at).toLocaleDateString()}
              </h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">{getDaysAgo(weekly.started_at)}</p>
            </div>

            <div className="rounded-[24px] border border-[#E6E9F5] bg-white p-5">
              <p className="text-xs font-semibold text-[#667085]">Last Transaction</p>
              <h3 className="text-lg font-extrabold text-[#111827] mt-3 truncate">
                {new Date(weekly.last_transaction_at).toLocaleDateString()}
              </h3>
              <p className="text-xs font-semibold text-[#98A2B3] mt-2">{getDaysAgo(weekly.last_transaction_at)}</p>
            </div>
          </div>

          {weekly.current_count === 0 && (
            <div className="flex items-start gap-3 p-5 rounded-[24px] bg-amber-50 border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">Streak Broken</p>
                <p className="text-sm text-amber-800 mt-1">
                  Your weekly streak was broken. Complete a transaction this week to start a new streak!
                </p>
              </div>
            </div>
          )}

          {weekly.current_count > 0 && (
            <div className="flex items-start gap-3 p-5 rounded-[24px] bg-[#F7F8FF] border border-[#DCE3FF]">
              <TrendingUp className="h-5 w-5 text-[#4A5FF7] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-[#111827]">Amazing Performance!</p>
                <p className="text-sm text-[#667085] mt-1">
                  You're on a {weekly.current_count}-week streak. Keep transacting weekly for amazing rewards!
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Streak Bonuses Info */}
      <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        <h3 className="text-xl font-extrabold tracking-tight text-[#111827] mb-6">Streak Bonus Multipliers</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-[#FCFCFF] rounded-[24px] border border-[#E6E9F5]">
            <span className="font-semibold text-[#111827]">3-Day Streak</span>
            <span className="inline-flex rounded-full border border-[#DCE3FF] bg-[#F7F8FF] px-4 py-2 text-sm font-extrabold text-[#4A5FF7]">1.5x Rewards</span>
          </div>
          <div className="flex items-center justify-between p-5 bg-[#FCFCFF] rounded-[24px] border border-[#E6E9F5]">
            <span className="font-semibold text-[#111827]">7-Day Streak</span>
            <span className="inline-flex rounded-full border border-[#DCE3FF] bg-[#F7F8FF] px-4 py-2 text-sm font-extrabold text-[#4A5FF7]">2x Rewards</span>
          </div>
          <div className="flex items-center justify-between p-5 bg-[#FCFCFF] rounded-[24px] border border-[#E6E9F5]">
            <span className="font-semibold text-[#111827]">14-Day Streak</span>
            <span className="inline-flex rounded-full border border-[#DCE3FF] bg-[#F7F8FF] px-4 py-2 text-sm font-extrabold text-[#4A5FF7]">3x Rewards</span>
          </div>
          <div className="flex items-center justify-between p-5 bg-[#F7F8FF] rounded-[24px] border border-[#DCE3FF]">
            <span className="font-semibold text-[#111827]">30-Day Streak</span>
            <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-extrabold text-green-700">5x Rewards</span>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="rounded-[28px] border border-red-200 bg-red-50 p-5">
          <p className="text-red-800 font-semibold">{error}</p>
        </Card>
      )}
    </div>
  );
}
