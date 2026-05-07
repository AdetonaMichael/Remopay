'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Gift,
  History,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Toast } from '@/utils/toast.utils';
import { rewardService } from '@/services/reward.service';
import {
  RewardBalance,
  RewardTransaction,
  Campaign,
  RewardStatistics,
  EligibilityCheck,
} from '@/types/rewards.types';

const formatCurrency = (amount?: number) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date?: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatRewardType = (type: string) =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export default function RewardsPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<RewardBalance | null>(null);
  const [statistics, setStatistics] = useState<RewardStatistics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [error, setError] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    loadRewardData();
  }, []);

  const availableBalance = balance?.available_balance || 0;
  const lockedBalance = balance?.locked_balance || 0;
  const redeemValue = Number(redeemAmount || 0);

  const canRedeem = useMemo(
    () => redeemValue > 0 && redeemValue <= availableBalance && !isRedeeming,
    [redeemValue, availableBalance, isRedeeming]
  );

  const loadRewardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        balanceResult,
        statsResult,
        campaignsResult,
        transactionsResult,
        eligibilityResult,
      ] = await Promise.allSettled([
        rewardService.getRewardBalance(),
        rewardService.getRewardStatistics(),
        rewardService.getActiveCampaigns(),
        rewardService.getRewardTransactions(10),
        rewardService.checkEligibility(),
      ]);

      // Handle balance
      if (balanceResult.status === 'fulfilled') {
        setBalance(balanceResult.value);
      } else {
        console.error('[RewardsPage] Balance error:', balanceResult.reason);
      }

      // Handle statistics
      if (statsResult.status === 'fulfilled') {
        setStatistics(statsResult.value);
      } else {
        console.error('[RewardsPage] Stats error:', statsResult.reason);
      }

      // Handle campaigns
      if (campaignsResult.status === 'fulfilled') {
        setCampaigns(campaignsResult.value || []);
      } else {
        console.error('[RewardsPage] Campaigns error:', campaignsResult.reason);
        setCampaigns([]);
      }

      // Handle transactions
      if (transactionsResult.status === 'fulfilled') {
        setTransactions(transactionsResult.value || []);
      } else {
        console.error('[RewardsPage] Transactions error:', transactionsResult.reason);
        setTransactions([]);
      }

      // Handle eligibility
      if (eligibilityResult.status === 'fulfilled') {
        setEligibility(eligibilityResult.value);
      } else {
        console.error('[RewardsPage] Eligibility error:', eligibilityResult.reason);
        setEligibility(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemAmount || isNaN(Number(redeemAmount)) || Number(redeemAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (Number(redeemAmount) > availableBalance) {
      setError('Insufficient available reward balance');
      return;
    }

    try {
      setIsRedeeming(true);
      setError('');

      await rewardService.redeemRewards(Number(redeemAmount));

      setRedeemAmount('');
      Toast.success('Rewards redeemed successfully');
      loadRewardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem rewards');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {eligibility && !eligibility.eligible_for_rewards && (
        <Card className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={22} />
            <div>
              <h3 className="text-sm font-extrabold text-amber-900">
                Complete Verification
              </h3>
              <div className="mt-2 space-y-1 text-sm leading-6 text-amber-800">
                {Array.isArray(eligibility.eligibility_messages) && eligibility.eligibility_messages.length > 0 ? (
                  eligibility.eligibility_messages.map((message, index) => (
                    <p key={index}>• {message}</p>
                  ))
                ) : (
                  <p>• You do not meet the eligibility requirements for rewards</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="rounded-[28px] border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={22} />
            <p className="text-sm font-semibold leading-6 text-red-800">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex min-w-min gap-4 md:grid md:min-w-full md:grid-cols-3 md:gap-4">
              <Card className="relative shrink-0 overflow-hidden rounded-[32px] border border-[#4A5FF7]/20 bg-[#4A5FF7] p-6 text-white shadow-[0_18px_45px_rgba(74,95,247,0.24)] w-full sm:w-80 md:w-auto">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/75">
                      Available Balance
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
                      {formatCurrency(availableBalance)}
                    </h2>
                    {lockedBalance > 0 && (
                      <p className="mt-2 text-xs font-medium text-white/70">
                        {formatCurrency(lockedBalance)} locked
                      </p>
                    )}
                  </div>
                  <Wallet className="text-white/35" size={42} />
                </div>
              </Card>

              <Card className="relative shrink-0 rounded-[32px] border border-[#E6E9F5] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] w-full sm:w-80 md:w-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">
                      Total Earned
                    </p>
                    <h3 className="mt-3 text-2xl font-extrabold text-[#111827]">
                      {formatCurrency(statistics?.total_earned)}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4A5FF7]">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </Card>

              <Card className="relative shrink-0 rounded-[32px] border border-[#E6E9F5] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] w-full sm:w-80 md:w-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">
                      Total Redeemed
                    </p>
                    <h3 className="mt-3 text-2xl font-extrabold text-[#111827]">
                      {formatCurrency(statistics?.total_redeemed)}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4A5FF7]">
                    <Gift size={24} />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="rounded-[32px] border border-[#DCE3FF] bg-[#FCFCFF] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4A5FF7]">
                    <Wallet size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#111827]">
                      Redeem to Wallet
                    </h2>
                    <p className="text-sm text-[#667085]">
                      Convert your available rewards into spendable wallet balance.
                    </p>
                  </div>
                </div>

                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(event) => {
                    setRedeemAmount(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter amount"
                  disabled={isRedeeming || availableBalance === 0}
                  className="h-13 w-full rounded-2xl border border-[#E6E9F5] bg-white px-4 text-base font-semibold text-[#111827] outline-none transition focus:border-[#4A5FF7] focus:ring-4 focus:ring-[#4A5FF7]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs font-semibold text-[#667085]">
                  Available: {formatCurrency(availableBalance)}
                </p>
              </div>

              <Button
                onClick={handleRedeem}
                isLoading={isRedeeming}
                disabled={!canRedeem || availableBalance === 0}
                className="h-13 rounded-2xl bg-[#4A5FF7] px-8 text-base font-bold text-white shadow-[0_14px_30px_rgba(74,95,247,0.24)] hover:bg-[#3B4FE0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem Rewards'}
              </Button>
            </div>
          </Card>

          {campaigns.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#111827]">
                    Active Campaigns
                  </h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    Current reward opportunities available to you.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex min-w-min gap-4 md:grid md:min-w-full md:grid-cols-2 md:gap-4">
                  {campaigns.map((campaign) => (
                    <Card
                      key={campaign.id}
                      className="relative shrink-0 rounded-[28px] border border-[#E6E9F5] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.04)] transition hover:border-[#A9B7FF] hover:shadow-[0_18px_45px_rgba(74,95,247,0.09)] w-full sm:w-96 md:w-auto"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4A5FF7]">
                            <Trophy size={22} />
                          </div>

                          <h3 className="text-base font-extrabold text-[#111827]">
                            {campaign.name}
                          </h3>

                          <Badge className="mt-3">
                            {campaign.type === 'cashback'
                              ? `${campaign.reward_percentage}% Cashback`
                              : campaign.type === 'bonus'
                                ? `${formatCurrency(campaign.reward_amount ?? 0)} Bonus`
                                : 'Streak Bonus'}
                          </Badge>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                            Reward
                          </p>
                          <p className="mt-2 text-lg font-extrabold text-[#4A5FF7]">
                            {formatCurrency(campaign.reward_for_you)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl bg-[#FCFCFF] px-4 py-3">
                        <p className="text-xs font-semibold text-[#667085]">
                          {formatDate(campaign.start_date)} —{' '}
                          {formatDate(campaign.end_date)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside>
          <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:sticky xl:top-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-[#111827]">
                  Recent Activity
                </h3>
                <p className="mt-1 text-sm text-[#667085]">
                  Latest reward movements.
                </p>
              </div>

              <Link href="/dashboard/rewards/history">
                <Button variant="secondary" className="rounded-2xl font-bold">
                  View All
                </Button>
              </Link>
            </div>

            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isDebit = transaction.type === 'redemption';

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-2xl border border-[#EEF2F7] bg-[#FCFCFF] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-extrabold text-[#111827]">
                            {formatRewardType(transaction.type)}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#667085]">
                            {transaction.reason}
                          </p>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-extrabold ${
                            isDebit ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {isDebit ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>

                      <p className="mt-3 text-xs font-semibold text-[#98A2B3]">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#E6E9F5] bg-[#FCFCFF] p-8 text-center">
                <History className="mx-auto text-[#98A2B3]" size={28} />
                <p className="mt-3 text-sm font-semibold text-[#667085]">
                  No reward activity yet.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-[#DCE3FF] bg-[#F7F8FF] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#4A5FF7]">
                <Lock size={13} />
                Secure Rewards
              </p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                Your reward balance and redemption activity are protected by
                Remopay account security.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}