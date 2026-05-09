'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Circle, Target, Zap, Award } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { rewardService } from '@/services/reward.service';
import { CurrentTier, LoyaltyTier } from '@/types/rewards.types';

const tierColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Bronze: {
    bg: 'bg-[#FCFCFF]',
    border: 'border-[#E6E9F5]',
    text: 'text-[#111827]',
    icon: 'text-[#d71927]',
  },
  Silver: {
    bg: 'bg-[#FCFCFF]',
    border: 'border-[#E6E9F5]',
    text: 'text-[#111827]',
    icon: 'text-[#d71927]',
  },
  Gold: { bg: 'bg-[#FCFCFF]', border: 'border-[#E6E9F5]', text: 'text-[#111827]', icon: 'text-[#d71927]' },
  None: { bg: 'bg-[#FCFCFF]', border: 'border-[#E6E9F5]', text: 'text-[#111827]', icon: 'text-[#d71927]' },
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
        <p className="text-[#667085]">Failed to load loyalty tier information</p>
      </Card>
    );
  }

  if (!currentTier.benefits) {
    return (
      <Card className="text-center py-12">
        <p className="text-[#667085]">Unable to load tier benefits. Please refresh the page.</p>
      </Card>
    );
  }

  const tierName = currentTier.current_tier?.name as keyof typeof tierColors;
  const colors = tierColors[tierName] || tierColors.None;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="space-y-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Loyalty Tiers</h1>
        <p className="mt-2 text-[#667085]">Unlock exclusive benefits as you climb the loyalty ladder</p>
      </div>

      {/* Current Tier Card */}
      <Card className={`border-2 rounded-[32px] p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)] ${colors.border} ${colors.bg}`}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className={`text-sm font-bold uppercase tracking-[0.16em] text-[#d71927]`}>Current Tier</p>
            <h2 className={`text-4xl font-black mt-3 ${colors.text}`}>{tierName}</h2>
          </div>
          <Award className={`h-16 w-16 ${colors.icon}`} />
        </div>

        {/* Benefits Grid */}
        <div className="mb-8 pb-8 border-b border-[#E6E9F5]">
          <h3 className={`text-sm font-bold uppercase tracking-[0.16em] text-[#d71927] mb-4`}>Current Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-[24px] border border-[#ffe5e8] bg-[#fff1f2]`}>
              <p className="text-xs font-semibold text-[#667085]">Cashback Multiplier</p>
              <p className="text-2xl font-extrabold text-[#d71927] mt-3">
                {currentTier.benefits.cashback_multiplier}x
              </p>
            </div>
            <div className={`p-5 rounded-[24px] border border-[#ffe5e8] bg-[#fff1f2]`}>
              <p className="text-xs font-semibold text-[#667085]">Referral Multiplier</p>
              <p className="text-2xl font-extrabold text-[#d71927] mt-3">
                {currentTier.benefits.referral_multiplier}x
              </p>
            </div>
            <div className={`p-5 rounded-[24px] border border-[#ffe5e8] bg-[#fff1f2]`}>
              <p className="text-xs font-semibold text-[#667085]">Bonus Multiplier</p>
              <p className="text-2xl font-extrabold text-[#d71927] mt-3">
                {currentTier.benefits.bonus_multiplier}x
              </p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {currentTier.progress_to_next?.next_tier_level > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#d71927]">Progress to {currentTier.progress_to_next?.next_tier_name}</p>
              <span className="text-sm font-extrabold text-[#111827]">
                {Math.round(
                  ((currentTier.current_metrics?.transactions || 0) /
                    parseInt(currentTier.progress_to_next?.transaction_progress?.split(' ')[2] || '1') || 1) *
                    100
                )}
                %
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#667085]">Transactions</span>
                  <span className="font-extrabold text-[#111827]">{currentTier.progress_to_next?.transaction_progress}</span>
                </div>
                <div className="w-full bg-[#E6E9F5] rounded-full h-2">
                  <div
                    className="bg-[#d71927] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentTier.current_metrics?.transactions || 0) /
                          parseInt(currentTier.progress_to_next?.transaction_progress?.split(' ')[2] || '1') || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#667085]">Total Volume</span>
                  <span className="font-extrabold text-[#111827]">{currentTier.progress_to_next?.volume_progress}</span>
                </div>
                <div className="w-full bg-[#E6E9F5] rounded-full h-2">
                  <div
                    className="bg-[#d71927] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentTier.current_metrics?.total_volume || 0) /
                          parseInt(currentTier.progress_to_next?.volume_progress?.split(' ')[2] || '1') || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#667085]">Wallet Funding</span>
                  <span className="font-extrabold text-[#111827]">{currentTier.progress_to_next?.funding_progress}</span>
                </div>
                <div className="w-full bg-[#E6E9F5] rounded-full h-2">
                  <div
                    className="bg-[#d71927] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentTier.current_metrics?.total_funding || 0) /
                          parseInt(currentTier.progress_to_next?.funding_progress?.split(' ')[2] || '1') || 0) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#667085]">Days Active</span>
                  <span className="font-extrabold text-[#111827]">{currentTier.progress_to_next?.days_active_progress}</span>
                </div>
                <div className="w-full bg-[#E6E9F5] rounded-full h-2">
                  <div
                    className="bg-[#d71927] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentTier.current_metrics?.days_active || 0) /
                          parseInt(currentTier.progress_to_next?.days_active_progress?.split(' ')[2] || '1') || 0) *
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
        <h2 className="text-xl font-extrabold tracking-tight text-[#111827] mb-5">Tier Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allTiers.map((tier) => {
            const isCurrent = tier.level === currentTier.current_tier?.level;

            return (
              <Card
                key={tier.id}
                className={`rounded-[28px] p-6 border shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition ${
                  isCurrent
                    ? `border-[#d71927] bg-[#fff1f2] shadow-[0_18px_45px_rgba(215,25,39,0.15)]`
                    : 'border-[#E6E9F5] bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">TIER {tier.level}</p>
                    <h3 className="text-2xl font-extrabold text-[#111827] mt-2">{tier.name}</h3>
                  </div>
                  {isCurrent && <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />}
                </div>

                {/* Requirements */}
                <div className="mb-5 pb-5 border-b border-[#E6E9F5]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3] mb-3">Requirements</p>
                  <div className="space-y-2 text-sm leading-6 text-[#667085]">
                    <div className="flex items-center gap-2">
                      <Circle size={6} className="fill-[#d71927] text-[#d71927]" />
                      {tier.requirements?.min_transactions} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle size={6} className="fill-[#d71927] text-[#d71927]" />
                      ₦{tier.requirements?.min_volume.toLocaleString('en-NG')} volume
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle size={6} className="fill-[#d71927] text-[#d71927]" />
                      ₦{tier.requirements?.min_funding.toLocaleString('en-NG')} funding
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle size={6} className="fill-[#d71927] text-[#d71927]" />
                      {tier.requirements?.min_days_active} days active
                    </div>
                  </div>
                </div>

                {/* Multipliers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#667085]">Cashback</span>
                    <span className="font-extrabold text-[#d71927] text-lg">{tier.multipliers.cashback}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#667085]">Referral</span>
                    <span className="font-extrabold text-[#d71927] text-lg">{tier.multipliers.referral}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#667085]">Bonus</span>
                    <span className="font-extrabold text-[#d71927] text-lg">{tier.multipliers.bonus}x</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {error && (
        <Card className="rounded-[28px] border border-red-200 bg-red-50 p-5">
          <p className="text-red-800 font-semibold">{error}</p>
        </Card>
      )}
    </div>
  );
}
