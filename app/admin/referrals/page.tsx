'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
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

  if (error) {
    return (
      <div className="min-h-screen space-y-8 bg-[#fafafa] px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-50 dark:text-red-900">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      {/* Header Stats - Key Metrics */}
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-1 sm:px-0 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                Total Referrals
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                {dashboard ? (dashboard.total_referrals || 0).toLocaleString() : '—'}
              </h2>
              <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                Active referral program participants
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
              <Users className="h-5 w-5 text-red-600 dark:text-red-700" />
            </div>
          </div>
        </Card>

        <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                Qualified for Payout
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                {dashboard ? (dashboard.qualified_for_payout || 0).toLocaleString() : '—'}
              </h2>
              <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                Ready for commission distribution
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
              <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-700" />
            </div>
          </div>
        </Card>

        <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280] dark:text-slate-400">
                Pending Payout
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                {dashboard ? (dashboard.pending_payout || 0).toLocaleString() : '—'}
              </h2>
              <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                Pending Payout
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-700" />
            </div>
          </div>
        </Card>

        <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                Completed Payouts
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                {dashboard ? (dashboard.completed_payouts || 0).toLocaleString() : '—'}
              </h2>
              <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                Successfully distributed
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
              <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-700" />
            </div>
          </div>
        </Card>
      </div>

      {dashboard && (
        <>
          {/* Financial Metrics */}
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-1 sm:px-0 sm:gap-4 md:grid-cols-3">
            <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                    Total Paid Out
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                    ₦{(dashboard.total_paid_out || 0).toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                  <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                    Cumulative disbursements
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
                  <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-700" />
                </div>
              </div>
            </Card>

            <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                    Outstanding Balance
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                    ₦{(dashboard.outstanding_balance || 0).toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                  <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                    Pending disbursement
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-700" />
                </div>
              </div>
            </Card>

            <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                    Average Referral Value
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#111827] dark:text-slate-950">
                    ₦{(dashboard.average_referral_value || 0).toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                  <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                    Average payout per referral
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
                  <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-700" />
                </div>
              </div>
            </Card>
          </div>

          {/* Referral Status Distribution */}
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-1 sm:px-0 sm:gap-4 md:grid-cols-3">
            <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                    Pending Milestones
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[#111827] dark:text-slate-950">
                    {(dashboard.referrals_by_status?.pending_milestone || 0).toLocaleString()}
                  </h3>
                  <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                    In progress
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
                  <Users className="h-5 w-5 text-red-600 dark:text-red-700" />
                </div>
              </div>
            </Card>

            <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                    Ready for Payout
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[#111827] dark:text-slate-950">
                    {(dashboard.referrals_by_status?.ready_for_payout || 0).toLocaleString()}
                  </h3>
                  <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                    Action required
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
                  <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-700" />
                </div>
              </div>
            </Card>

            <Card className="min-w-[280px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-slate-700">
                    Completed
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[#111827] dark:text-slate-950">
                    {(dashboard.referrals_by_status?.completed || 0).toLocaleString()}
                  </h3>
                  <p className="mt-2 text-xs text-[#6b7280] dark:text-slate-600">
                    Successfully distributed
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-100">
                  <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-700" />
                </div>
              </div>
            </Card>
          </div>

          {/* Milestone Completion Rates */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white">
            <h2 className="mb-6 text-lg font-bold text-[#111827] dark:text-slate-950">
              Milestone Completion Rates
            </h2>

            <div className="space-y-5">
              {[
                { label: 'Email Verified', rate: dashboard.milestone_completion_rates?.email_verified || 0 },
                { label: 'Phone Verified', rate: dashboard.milestone_completion_rates?.phone_verified || 0 },
                { label: 'Wallet Funded', rate: dashboard.milestone_completion_rates?.wallet_funded || 0 },
                { label: 'First Transaction', rate: dashboard.milestone_completion_rates?.first_transaction || 0 },
              ].map((milestone, idx) => (
                <div key={idx}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-800">
                      {milestone.label}
                    </span>
                    <span className="text-sm font-black text-[#620707] dark:text-[#620707]">
                      {(milestone.rate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full bg-[#620707] transition-all duration-500"
                      style={{ width: `${milestone.rate || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {!dashboard && !error && (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white">
          <div className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-700">No data available</p>
          </div>
        </Card>
      )}
    </div>
  );
}
