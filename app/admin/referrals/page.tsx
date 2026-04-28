'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { ReferralDashboard } from '@/types/rewards.types';

export default function AdminReferralDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReferralDashboard();
  }, []);

  const loadReferralDashboard = async () => {
    try {
      setLoading(true);
      const data = await rewardService.getReferralDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor referral program metrics and payouts</p>
      </div>

      {dashboard && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Referrals</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboard.total_referrals.toLocaleString()}
                  </h3>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Qualified for Payout</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">
                    {dashboard.qualified_for_payout.toLocaleString()}
                  </h3>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Payout</p>
                  <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                    {dashboard.pending_payout.toLocaleString()}
                  </h3>
                </div>
                <Clock className="h-10 w-10 text-yellow-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed Payouts</p>
                  <h3 className="text-3xl font-bold text-purple-600 mt-2">
                    {dashboard.completed_payouts.toLocaleString()}
                  </h3>
                </div>
                <DollarSign className="h-10 w-10 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-gray-600 text-sm mb-2">Total Paid Out</p>
              <h3 className="text-3xl font-bold text-green-600">
                ₦{dashboard.total_paid_out.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </Card>

            <Card>
              <p className="text-gray-600 text-sm mb-2">Outstanding Balance</p>
              <h3 className="text-3xl font-bold text-orange-600">
                ₦{dashboard.outstanding_balance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </Card>

            <Card>
              <p className="text-gray-600 text-sm mb-2">Average Referral Value</p>
              <h3 className="text-3xl font-bold text-blue-600">
                ₦{dashboard.average_referral_value.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </Card>
          </div>

          {/* Referral Status Distribution */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Status Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">
                  {dashboard.referrals_by_status.pending_milestone}
                </div>
                <p className="text-sm text-gray-600 mt-2">Pending Milestones</p>
                <Badge className="mt-3">In Progress</Badge>
              </div>

              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-4xl font-bold text-yellow-600">
                  {dashboard.referrals_by_status.ready_for_payout}
                </div>
                <p className="text-sm text-gray-600 mt-2">Ready for Payout</p>
                <Badge variant="success" className="mt-3">Action Required</Badge>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600">
                  {dashboard.referrals_by_status.completed}
                </div>
                <p className="text-sm text-gray-600 mt-2">Completed</p>
                <Badge className="mt-3">Done</Badge>
              </div>
            </div>
          </Card>

          {/* Milestones Overview */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Milestone Completion Rates</h2>

            <div className="space-y-4">
              {[
                { label: 'Email Verified', rate: dashboard.milestone_completion_rates.email_verified },
                { label: 'Phone Verified', rate: dashboard.milestone_completion_rates.phone_verified },
                { label: 'Wallet Funded', rate: dashboard.milestone_completion_rates.wallet_funded },
                { label: 'First Transaction', rate: dashboard.milestone_completion_rates.first_transaction },
              ].map((milestone, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{milestone.label}</span>
                    <span className="text-sm font-bold text-gray-900">{milestone.rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#4a5ff7] h-3 rounded-full transition-all"
                      style={{ width: `${milestone.rate}%` }}
                    />
                  </div>
                </div>
              ))}
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
