'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Circle, Target, Zap, Award } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { rewardService } from '@/services/reward.service';
import { CurrentTier, LoyaltyTier } from '@/types/rewards.types';

const tierColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Bronze: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: 'text-amber-600',
  },
  Silver: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-900',
    icon: 'text-slate-600',
  },
  Gold: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-600' },
  None: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', icon: 'text-gray-600' },
};

export default function LoyaltyTiersPage() {
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<CurrentTier | null>(null);
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTierData();
  }, []);

  const loadTierData = async () => {
    try {
      setLoading(true);
      const [tierData, tiersData] = await Promise.all([
        rewardService.getCurrentTier(),
        rewardService.getAllTiers(),
      ]);
      setCurrentTier(tierData);
      setAllTiers(tiersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tier data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (!currentTier) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-600">Failed to load loyalty tier information</p>
      </Card>
    );
  }

  const tierName = currentTier.current_tier.name as keyof typeof tierColors;
  const colors = tierColors[tierName] || tierColors.None;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Loyalty Tiers</h1>
        <p className="mt-2 text-gray-600">Unlock exclusive benefits as you climb the loyalty ladder</p>
      </div>

      {/* Current Tier Card */}
      <Card className={`border-2 ${colors.border} ${colors.bg}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className={`text-sm font-semibold ${colors.text}`}>Current Tier</p>
            <h2 className={`text-4xl font-black mt-2 ${colors.text}`}>{tierName}</h2>
          </div>
          <Award className={`h-12 w-12 ${colors.icon}`} />
        </div>

        {/* Benefits */}
        <div className="mb-6 pb-6 border-b border-gray-300 border-opacity-50">
          <h3 className={`text-sm font-semibold ${colors.text} mb-3`}>Current Benefits</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
              <p className="text-xs text-gray-600">Cashback Multiplier</p>
              <p className="text-xl font-bold text-gray-900">
                {currentTier.benefits.cashback_multiplier}x
              </p>
            </div>
            <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
              <p className="text-xs text-gray-600">Referral Multiplier</p>
              <p className="text-xl font-bold text-gray-900">
                {currentTier.benefits.referral_multiplier}x
              </p>
            </div>
            <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
              <p className="text-xs text-gray-600">Bonus Multiplier</p>
              <p className="text-xl font-bold text-gray-900">
                {currentTier.benefits.bonus_multiplier}x
              </p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {currentTier.progress_to_next.next_tier_level > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold ${colors.text}`}>Progress to {currentTier.progress_to_next.next_tier_name}</p>
              <span className={`text-xs font-bold ${colors.text}`}>
                {Math.round(
                  (currentTier.current_metrics.transactions /
                    parseInt(currentTier.progress_to_next.transaction_progress.split(' ')[2]) || 1) *
                    100
                )}
                %
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-semibold">{currentTier.progress_to_next.transaction_progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4a5ff7] h-2 rounded-full"
                    style={{
                      width: `${
                        (currentTier.current_metrics.transactions /
                          parseInt(currentTier.progress_to_next.transaction_progress.split(' ')[2]) || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Total Volume</span>
                  <span className="font-semibold">{currentTier.progress_to_next.volume_progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4a5ff7] h-2 rounded-full"
                    style={{
                      width: `${
                        (currentTier.current_metrics.total_volume /
                          parseInt(currentTier.progress_to_next.volume_progress.split(' ')[2]) || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Wallet Funding</span>
                  <span className="font-semibold">{currentTier.progress_to_next.funding_progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4a5ff7] h-2 rounded-full"
                    style={{
                      width: `${
                        (currentTier.current_metrics.total_funding /
                          parseInt(currentTier.progress_to_next.funding_progress.split(' ')[2]) || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Days Active</span>
                  <span className="font-semibold">{currentTier.progress_to_next.days_active_progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4a5ff7] h-2 rounded-full"
                    style={{
                      width: `${
                        (currentTier.current_metrics.days_active /
                          parseInt(currentTier.progress_to_next.days_active_progress.split(' ')[2]) || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* All Tiers Comparison */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tier Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allTiers.map((tier) => {
            const isCurrent = tier.level === currentTier.current_tier.level;
            const tierColor = tierColors[tier.name as keyof typeof tierColors];

            return (
              <Card
                key={tier.id}
                className={`border-2 transition ${
                  isCurrent
                    ? `${tierColor.border} ${tierColor.bg} shadow-lg`
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">TIER {tier.level}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{tier.name}</h3>
                  </div>
                  {isCurrent && <CheckCircle className="h-6 w-6 text-green-600" />}
                </div>

                {/* Requirements */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Requirements</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>• {tier.requirements?.min_transactions} transactions</div>
                    <div>• ₦{tier.requirements?.min_volume.toLocaleString('en-NG')} volume</div>
                    <div>• ₦{tier.requirements?.min_funding.toLocaleString('en-NG')} funding</div>
                    <div>• {tier.requirements?.min_days_active} days active</div>
                  </div>
                </div>

                {/* Multipliers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Cashback</span>
                    <span className="font-bold text-gray-900">{tier.multipliers.cashback}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Referral</span>
                    <span className="font-bold text-gray-900">{tier.multipliers.referral}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Bonus</span>
                    <span className="font-bold text-gray-900">{tier.multipliers.bonus}x</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
