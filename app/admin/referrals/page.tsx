'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Wallet,
  BarChart3,
} from 'lucide-react';

import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { rewardService } from '@/services/reward.service';
import { ReferralDashboard } from '@/types/rewards.types';

const formatMoney = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
      setError('');

      const data = await rewardService.getReferralDashboard();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load referral dashboard',
      );
    } finally {
      setLoading(false);
    }
  };

  const mainMetrics = dashboard
    ? [
        {
          title: 'Total Referrals',
          value: dashboard.total_referrals || 0,
          helper: 'Active participants',
          icon: Users,
        },
        {
          title: 'Qualified for Payout',
          value: dashboard.qualified_for_payout || 0,
          helper: 'Ready for distribution',
          icon: CheckCircle,
        },
        {
          title: 'Pending Payout',
          value: dashboard.pending_payout || 0,
          helper: 'In progress',
          icon: AlertCircle,
        },
        {
          title: 'Completed Payouts',
          value: dashboard.completed_payouts || 0,
          helper: 'Successfully distributed',
          icon: TrendingUp,
        },
      ]
    : [];

  const financialMetrics = dashboard
    ? [
        {
          title: 'Total Paid Out',
          value: formatMoney(dashboard.total_paid_out || 0),
          helper: 'Cumulative disbursements',
          icon: Wallet,
        },
        {
          title: 'Outstanding Balance',
          value: formatMoney(dashboard.outstanding_balance || 0),
          helper: 'Pending disbursement',
          icon: AlertCircle,
        },
        {
          title: 'Average Referral Value',
          value: formatMoney(dashboard.average_referral_value || 0),
          helper: 'Per referral average',
          icon: BarChart3,
        },
      ]
    : [];

  const statusMetrics = dashboard
    ? [
        {
          title: 'Pending Milestones',
          value: dashboard.referrals_by_status?.pending_milestone || 0,
          helper: 'In progress',
        },
        {
          title: 'Ready for Payout',
          value: dashboard.referrals_by_status?.ready_for_payout || 0,
          helper: 'Action required',
        },
        {
          title: 'Completed',
          value: dashboard.referrals_by_status?.completed || 0,
          helper: 'Successfully distributed',
        },
      ]
    : [];

  const milestones = dashboard
    ? [
        {
          label: 'Email Verified',
          rate: dashboard.milestone_completion_rates?.email_verified || 0,
        },
        {
          label: 'Phone Verified',
          rate: dashboard.milestone_completion_rates?.phone_verified || 0,
        },
        {
          label: 'Wallet Funded',
          rate: dashboard.milestone_completion_rates?.wallet_funded || 0,
        },
        {
          label: 'First Transaction',
          rate: dashboard.milestone_completion_rates?.first_transaction || 0,
        },
      ]
    : [];

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 lg:px-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                <Users className="h-3.5 w-3.5 text-gray-700" />
                Referral Control Center
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                Referral Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Track referral performance, qualification progress, payout status,
                commission distribution, and milestone completion rates.
              </p>
            </div>

            <Button
              onClick={loadReferralDashboard}
              variant="secondary"
              size="sm"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-700 hover:bg-gray-100 sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </section>

        {error && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardBody>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  <AlertCircle className="h-5 w-5 text-black" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-black">
                    Unable to Load Referral Dashboard
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {dashboard && (
          <>
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      Referral Overview
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-black">
                      Program Performance
                    </h3>
                  </div>

                  <Badge variant="success">Live Data</Badge>
                </div>
              </CardHeader>

              <CardBody>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {mainMetrics.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                      >
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100 transition-all duration-300 group-hover:scale-110" />

                        <div className="relative flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-500">
                              {item.title}
                            </p>

                            <p className="mt-3 text-3xl font-black tracking-tight text-black">
                              {item.value.toLocaleString()}
                            </p>

                            <p className="mt-2 text-xs font-medium text-gray-500">
                              {item.helper}
                            </p>
                          </div>

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {financialMetrics.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    <CardBody>
                      <div className="relative overflow-hidden rounded-3xl bg-white">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100" />

                        <div className="relative flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-500">
                              {item.title}
                            </p>

                            <p className="mt-3 break-words text-2xl font-black text-black">
                              {item.value}
                            </p>

                            <p className="mt-2 text-xs font-medium text-gray-500">
                              {item.helper}
                            </p>
                          </div>

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Referral Status
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-black">
                    Status Distribution
                  </h3>
                </div>
              </CardHeader>

              <CardBody>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {statusMetrics.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <p className="text-sm font-semibold text-gray-500">
                        {item.title}
                      </p>

                      <p className="mt-3 text-3xl font-black text-black">
                        {item.value.toLocaleString()}
                      </p>

                      <p className="mt-2 text-xs font-medium text-gray-500">
                        {item.helper}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Milestone Tracking
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-black">
                    Milestone Completion Rates
                  </h3>
                </div>
              </CardHeader>

              <CardBody>
                <div className="space-y-5 rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  {milestones.map((milestone) => {
                    const safeRate = Math.min(Math.max(milestone.rate || 0, 0), 100);

                    return (
                      <div key={milestone.label}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-gray-600">
                            {milestone.label}
                          </span>

                          <span className="text-sm font-black text-black">
                            {safeRate.toFixed(1)}%
                          </span>
                        </div>

                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-black transition-all duration-500"
                            style={{ width: `${safeRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {!dashboard && !error && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardBody>
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50">
                  <BarChart3 className="h-7 w-7 text-black" />
                </div>

                <h3 className="mt-5 text-xl font-black text-black">
                  No Referral Data Available
                </h3>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  Referral metrics will appear here once dashboard data is
                  available.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}