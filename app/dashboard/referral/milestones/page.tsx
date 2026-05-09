'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, TrendingUp, Gift } from 'lucide-react';
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
        return 'bg-[#fff1f2] text-[#d71927]';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="space-y-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Referral Milestones</h1>
        <p className="mt-2 text-[#667085]">Track your referrals and earn rewards for every successful signup</p>
      </div>

      {/* Payout Status Cards */}
      {payoutStatus && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#d71927] mb-4">Earnings Summary</h2>
          <div className="overflow-x-auto -mx-6 px-6 pb-2">
            <div className="flex gap-4 min-w-min md:grid md:grid-cols-4">
              <Card className="flex-shrink-0 w-72 md:w-auto border-0 rounded-[28px] bg-gradient-to-br from-[#FCFCFF] to-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">Total Earned</p>
                    <h3 className="text-2xl font-extrabold text-[#d71927] mt-2">
                      ₦{(payoutStatus?.total_earned || 0).toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="p-3 rounded-[16px] bg-[#fff1f2]">
                    <TrendingUp className="h-6 w-6 text-[#d71927]" />
                  </div>
                </div>
              </Card>

              <Card className="flex-shrink-0 w-72 md:w-auto border-0 rounded-[28px] bg-gradient-to-br from-[#FCFCFF] to-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">Pending</p>
                    <h3 className="text-2xl font-extrabold text-[#d71927] mt-2">
                      ₦{(payoutStatus?.total_pending || 0).toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="p-3 rounded-[16px] bg-[#fff1f2]">
                    <Clock className="h-6 w-6 text-[#d71927]" />
                  </div>
                </div>
              </Card>

              <Card className="flex-shrink-0 w-72 md:w-auto border-0 rounded-[28px] bg-gradient-to-br from-[#FCFCFF] to-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">Already Paid</p>
                    <h3 className="text-2xl font-extrabold text-[#d71927] mt-2">
                      ₦{(payoutStatus?.total_paid || 0).toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="p-3 rounded-[16px] bg-[#fff1f2]">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="flex-shrink-0 w-72 md:w-auto border-0 rounded-[28px] bg-gradient-to-br from-[#FCFCFF] to-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">Qualified Referrals</p>
                    <h3 className="text-2xl font-extrabold text-[#111827] mt-2">
                      {payoutStatus.referrals_qualified}
                    </h3>
                    <p className="text-xs text-[#667085] mt-1">
                      {payoutStatus.referrals_pending} pending
                    </p>
                  </div>
                  <div className="p-3 rounded-[16px] bg-[#fff1f2]">
                      <Users className="h-6 w-6 text-[#d71927]" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-5">Your Referrals</h2>
        {milestones.length > 0 ? (
          <div className="space-y-5">
            {milestones.map((milestone) => (
              <Card key={milestone.referral_link_id} className="border-0 rounded-[28px] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-[#111827] text-lg">{milestone.referred_user.name}</h3>
                    <p className="text-sm text-[#667085] mt-1">{milestone.referred_user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`rounded-full font-semibold ${getStatusColor(milestone.status)}`}>
                      {milestone.status === 'paid'
                        ? '✓ Paid'
                        : milestone.is_fully_qualified
                          ? '✓ Ready for Payout'
                          : 'In Progress'}
                    </Badge>
                    {milestone.payout_earned > 0 && (
                      <p className="text-lg font-extrabold text-[#d71927] mt-3">
                        ₦{milestone.payout_earned.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6 pb-6 border-b border-[#E6E9F5]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold uppercase tracking-[0.16em] text-[#d71927]">Progress</span>
                    <span className="text-sm font-extrabold text-[#111827]">{milestone.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#E6E9F5] rounded-full h-3">
                    <div
                      className="bg-[#d71927] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${milestone.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Milestones - Horizontal Scroll on Mobile */}
                <div className="overflow-x-auto -mx-6 px-6 pb-2">
                  <div className="flex gap-3 min-w-min md:grid md:grid-cols-4 md:gap-3">
                    <div
                      className={`flex-shrink-0 w-32 md:w-auto p-4 rounded-[20px] border transition ${
                        milestone.milestones.email_verified.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-[#F5F6FA] border-[#E6E9F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {milestone.milestones.email_verified.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-[#667085]">Email Verified</span>
                      </div>
                      {milestone.milestones.email_verified.completed_at && (
                        <p className="text-xs text-[#667085] mt-2">
                          {new Date(milestone.milestones.email_verified.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex-shrink-0 w-32 md:w-auto p-4 rounded-[20px] border transition ${
                        milestone.milestones.phone_verified.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-[#F5F6FA] border-[#E6E9F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {milestone.milestones.phone_verified.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-[#667085]">Phone Verified</span>
                      </div>
                      {milestone.milestones.phone_verified.completed_at && (
                        <p className="text-xs text-[#667085] mt-2">
                          {new Date(milestone.milestones.phone_verified.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex-shrink-0 w-32 md:w-auto p-4 rounded-[20px] border transition ${
                        milestone.milestones.wallet_funded_100.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-[#F5F6FA] border-[#E6E9F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {milestone.milestones.wallet_funded_100.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-[#667085]">Wallet Funded</span>
                      </div>
                      {milestone.milestones.wallet_funded_100.completed_at && (
                        <p className="text-xs text-[#667085] mt-2">
                          {new Date(milestone.milestones.wallet_funded_100.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex-shrink-0 w-32 md:w-auto p-4 rounded-[20px] border transition ${
                        milestone.milestones.first_transaction.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-[#F5F6FA] border-[#E6E9F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {milestone.milestones.first_transaction.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-[#667085]">1st Transaction</span>
                      </div>
                      {milestone.milestones.first_transaction.completed_at && (
                        <p className="text-xs text-[#667085] mt-2">
                          {new Date(milestone.milestones.first_transaction.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {milestone.payout_paid_at && (
                  <p className="text-xs text-[#667085] mt-4 pt-4 border-t border-[#E6E9F5]">
                    Payout received: {new Date(milestone.payout_paid_at).toLocaleDateString()}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 rounded-[28px] text-center py-12 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <Gift className="h-12 w-12 text-[#E6E9F5] mx-auto mb-3" />
            <p className="text-[#667085] font-medium">No referrals yet. Start referring friends to earn rewards!</p>
          </Card>
        )}
      </div>

      {error && (
        <Card className="border-0 rounded-[28px] bg-red-50 text-[#d71927] shadow-[0_18px_45px_rgba(215,25,39,0.08)]">
          <p className="font-semibold">{error}</p>
        </Card>
      )}
    </div>
  );
}
