'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { ReferralMilestone, PayoutStatus } from '@/types/rewards.types';

export default function ReferralMilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const [milestonesData, payoutData] = await Promise.all([
        rewardService.getReferralMilestones(),
        rewardService.getPayoutStatus(),
      ]);
      setMilestones(milestonesData);
      setPayoutStatus(payoutData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'eligible':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
        <p className="mt-2 text-gray-600">Earn ₦200 for each successful referral</p>
      </div>

      {/* Payout Status Cards */}
      {payoutStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earned</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{payoutStatus.total_earned.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{payoutStatus.total_pending.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Already Paid</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{payoutStatus.total_paid.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Qualified Referrals</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {payoutStatus.referrals_qualified}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {payoutStatus.referrals_pending} pending
                </p>
              </div>
              <Users className="h-8 w-8 text-[#4a5ff7]" />
            </div>
          </Card>
        </div>
      )}

      {/* Milestones List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referrals</h2>
        {milestones.length > 0 ? (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.referral_link_id} className="border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{milestone.referred_user.name}</h3>
                    <p className="text-sm text-gray-600">{milestone.referred_user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status === 'paid'
                        ? 'Paid'
                        : milestone.is_fully_qualified
                          ? 'Ready for Payout'
                          : 'In Progress'}
                    </Badge>
                    {milestone.payout_earned > 0 && (
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₦{milestone.payout_earned.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Progress</span>
                    <span className="text-xs font-bold text-gray-700">{milestone.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#4a5ff7] h-2 rounded-full transition-all"
                      style={{ width: `${milestone.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className={`p-3 rounded-lg border ${
                      milestone.milestones.email_verified.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {milestone.milestones.email_verified.completed && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-xs font-semibold text-gray-700">Email Verified</span>
                    </div>
                    {milestone.milestones.email_verified.completed_at && (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(milestone.milestones.email_verified.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      milestone.milestones.phone_verified.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {milestone.milestones.phone_verified.completed && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-xs font-semibold text-gray-700">Phone Verified</span>
                    </div>
                    {milestone.milestones.phone_verified.completed_at && (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(milestone.milestones.phone_verified.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      milestone.milestones.wallet_funded_100.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {milestone.milestones.wallet_funded_100.completed && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-xs font-semibold text-gray-700">Wallet Funded</span>
                    </div>
                    {milestone.milestones.wallet_funded_100.completed_at && (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(milestone.milestones.wallet_funded_100.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      milestone.milestones.first_transaction.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {milestone.milestones.first_transaction.completed && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-xs font-semibold text-gray-700">1st Transaction</span>
                    </div>
                    {milestone.milestones.first_transaction.completed_at && (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(milestone.milestones.first_transaction.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {milestone.payout_paid_at && (
                  <p className="text-xs text-gray-600 mt-4">
                    Payout received: {new Date(milestone.payout_paid_at).toLocaleDateString()}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No referrals yet. Start referring friends to earn rewards!</p>
          </Card>
        )}
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
