'use client';

import { useState, useEffect } from 'react';
import { Wallet, Gift, TrendingUp, AlertCircle } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Toast } from '@/utils/toast.utils';
import { rewardService } from '@/services/reward.service';
import {
  RewardBalance,
  RewardTransaction,
  Campaign,
  RewardStatistics,
  EligibilityCheck,
} from '@/types/rewards.types';
import Link from 'next/link';

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

  const loadRewardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [balanceData, statsData, campaignsData, transactionsData, eligibilityData] =
        await Promise.all([
          rewardService.getRewardBalance(),
          rewardService.getRewardStatistics(),
          rewardService.getActiveCampaigns(),
          rewardService.getRewardTransactions(10),
          rewardService.checkEligibility(),
        ]);

      setBalance(balanceData);
      setStatistics(statsData);
      setCampaigns(campaignsData);
      setTransactions(transactionsData);
      setEligibility(eligibilityData);
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

    if (balance && Number(redeemAmount) > balance.available_balance) {
      setError('Insufficient available balance');
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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rewards & Loyalty</h1>
        <p className="mt-2 text-gray-600">
          Earn rewards on every transaction and unlock amazing benefits
        </p>
      </div>

      {/* Eligibility Alert */}
      {eligibility && !eligibility.eligible_for_rewards && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Complete Verification</h3>
              <div className="mt-2 space-y-1 text-sm text-yellow-800">
                {eligibility.eligibility_messages.map((msg, idx) => (
                  <div key={idx}>• {msg}</div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-[#d71927] to-[#c91620] text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Balance</p>
              <h2 className="text-3xl font-bold mt-2">
                ₦{balance?.available_balance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
              {balance && balance.locked_balance > 0 && (
                <p className="text-xs text-white/60 mt-2">
                  ₦{balance.locked_balance.toFixed(2)} locked
                </p>
              )}
            </div>
            <Wallet className="h-10 w-10 text-white/20" />
          </div>
        </Card>

        {/* Earned Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earned</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900">
                ₦{statistics?.total_earned.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
            <TrendingUp className="h-10 w-10 text-[#4a5ff7]" />
          </div>
        </Card>

        {/* Redeemed Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Redeemed</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900">
                ₦{statistics?.total_redeemed.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
            <Gift className="h-10 w-10 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Redemption Section */}
      <Card className="border-2 border-dashed border-[#4a5ff7]">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Redeem to Wallet
            </label>
            <input
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder="Enter amount (minimum ₦1)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
              disabled={isRedeeming || !balance || balance.available_balance === 0}
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: ₦{balance?.available_balance.toFixed(2)}
            </p>
          </div>
          <Button
            onClick={handleRedeem}
            isLoading={isRedeeming}
            disabled={isRedeeming || !balance || balance.available_balance === 0}
            className="bg-[#4a5ff7] hover:bg-[#3d4fe0] text-white px-6 py-2"
          >
            Redeem
          </Button>
        </div>
      </Card>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <Badge className="mt-1">
                      {campaign.type === 'cashback'
                        ? `${campaign.reward_percentage}% Cashback`
                        : campaign.type === 'bonus'
                          ? `₦${campaign.reward_amount} Bonus`
                          : 'Streak Bonus'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Reward for you: ₦{campaign.reward_for_you.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {campaign.start_date} to {campaign.end_date}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/rewards/history">
              <Button variant="secondary">View All</Button>
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-gray-200">
              {transactions.map((txn) => (
                <div key={txn.id} className="py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">{txn.type}</p>
                    <p className="text-sm text-gray-600">{txn.reason}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        txn.type === 'redemption' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {txn.type === 'redemption' ? '-' : '+'}₦{txn.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
