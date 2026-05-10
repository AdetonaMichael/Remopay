'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Share2,
  Loader,
  AlertCircle,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Spinner } from '@/components/shared/Spinner';
import { useAlert } from '@/hooks/useAlert';
import { referralService, ReferralLink, ReferralStats, ReferralMilestone, ReferralProgram } from '@/services/referral.service';

function formatCurrency(amount?: number | null) {
  if (amount === undefined || amount === null) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function normalizeReferralLink(link: string, code: string) {
  // Transform the referral link to the correct format
  // From: http://remopay-nginx/register?ref=CODE
  // To: https://remopay.vercel.app/auth/register?ref=CODE
  return `https://remopay.vercel.app/auth/register?ref=${code}`;
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-500/10 text-green-600';
    case 'eligible':
      return 'bg-amber-500/10 text-amber-600';
    case 'pending':
    default:
      return 'bg-gray-500/10 text-gray-600';
  }
}

export default function ReferralPage() {
  // State management
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
  const [programs, setPrograms] = useState<ReferralProgram[]>([]);

  // Loading states
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Error states
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorMilestones, setErrorMilestones] = useState<string | null>(null);
  const [errorPrograms, setErrorPrograms] = useState<string | null>(null);

  // UI states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const { success: showSuccess, error: showError } = useAlert();

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    Promise.all([
      fetchReferralLinks(),
      fetchStats(),
      fetchMilestones(),
      fetchPrograms(),
    ]);
  };

  const fetchReferralLinks = async () => {
    try {
      setLoadingLinks(true);
      setErrorLinks(null);
      const links = await referralService.getMyReferralLinks();
      setReferralLinks(links);
    } catch (error: any) {
      setErrorLinks(error.message || 'Failed to load referral links');
    } finally {
      setLoadingLinks(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const data = await referralService.getStats();
      setStats(data);
    } catch (error: any) {
      setErrorStats(error.message || 'Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      setLoadingMilestones(true);
      setErrorMilestones(null);
      const data = await referralService.getMilestones();
      setMilestones(data);
    } catch (error: any) {
      setErrorMilestones(error.message || 'Failed to load milestones');
    } finally {
      setLoadingMilestones(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      setErrorPrograms(null);
      const data = await referralService.getPrograms();
      setPrograms(data);
    } catch (error: any) {
      setErrorPrograms(error.message || 'Failed to load programs');
    } finally {
      setLoadingPrograms(false);
    }
  };

  const copyToClipboard = async (text: string, code: string) => {
    const success = await referralService.copyToClipboard(text);
    if (success) {
      setCopiedCode(code);
      showSuccess('Copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      showError('Failed to copy. Please try again.');
    }
  };

  const shareLink = async (link: string, code: string) => {
    try {
      await referralService.shareReferralLink(link, code);
      showSuccess('Shared successfully!');
    } catch (error) {
      showError('Failed to share. Copied to clipboard instead.');
      await referralService.copyToClipboard(link);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);

    if (!amount || amount < 100) {
      showError('Minimum withdrawal is ₦100');
      return;
    }

    if (stats && amount > stats.available_balance) {
      showError('Insufficient balance');
      return;
    }

    try {
      setIsWithdrawing(true);
      await referralService.requestWithdrawal(amount);
      showSuccess('Withdrawal request submitted!');
      setWithdrawalAmount('');
      // Refresh stats
      await fetchStats();
    } catch (error: any) {
      showError(error.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section - Referral Links */}
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#100303] px-6 py-8 shadow-[0_20px_70px_rgba(16,3,3,0.16)] sm:px-8 sm:py-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#d71927]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Earn rewards by inviting friends to Remopay.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Share your unique referral link and earn ₦200 for every friend who completes all signup milestones.
            </p>
          </div>

          {/* Loading State */}
          {loadingLinks && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Error State */}
          {errorLinks && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {errorLinks}
              </p>
            </div>
          )}

          {/* Referral Links */}
          {!loadingLinks && referralLinks.length > 0 && (
            <div className="space-y-4">
              {referralLinks.map((link) => (
                <div key={link.code} className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/40 mb-3">
                    {link.program}
                  </p>

                  <div className="space-y-3">
                    {/* Link Display */}
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1 break-all rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white/90">
                        {normalizeReferralLink(link.link, link.code)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => copyToClipboard(normalizeReferralLink(link.link, link.code), link.code)}
                          className="h-10 rounded-xl bg-[#d71927] px-4 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
                        >
                          <Copy size={14} />
                          {copiedCode === link.code ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => shareLink(normalizeReferralLink(link.link, link.code), link.code)}
                          className="h-10 rounded-xl bg-white/10 px-4 font-black text-white border border-white/20 hover:bg-white/20"
                        >
                          <Share2 size={14} />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Code Display */}
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/40">Code:</p>
                      <div className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-2xl font-black tracking-wide text-[#ff6b76]">
                        {link.code}
                      </div>
                      <Button
                        type="button"
                        onClick={() => copyToClipboard(link.code, `code-${link.code}`)}
                        className="h-10 rounded-xl bg-white/10 px-4 font-black text-white border border-white/20 hover:bg-white/20"
                      >
                        <Copy size={14} />
                        {copiedCode === `code-${link.code}` ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>

                    {/* Created Date */}
                    <p className="text-xs text-white/40">
                      Created: {formatDate(link.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingLinks && referralLinks.length === 0 && !errorLinks && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-200 flex items-center gap-2">
                <AlertCircle size={16} />
                No referral links found. Create one to get started.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          <div className="col-span-full flex justify-center py-8">
            <Spinner />
          </div>
        ) : errorStats ? (
          <div className="col-span-full rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
              {errorStats}
            </p>
          </div>
        ) : stats ? (
          <>
            <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-black/40">Total Referrals</p>
                  <p className="mt-3 text-3xl font-black text-[#111]">{stats.total_referrals}</p>
                </div>
                <div className="rounded-2xl bg-[#d71927]/10 p-3">
                  <Users className="h-5 w-5 text-[#d71927]" />
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-black/40">Active Referrals</p>
                  <p className="mt-3 text-3xl font-black text-[#111]">{stats.active_referrals}</p>
                </div>
                <div className="rounded-2xl bg-green-500/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-black/40">Total Earnings</p>
                  <p className="mt-3 text-3xl font-black text-[#d71927]">{formatCurrency(stats.total_earnings)}</p>
                </div>
                <div className="rounded-2xl bg-[#d71927]/10 p-3">
                  <TrendingUp className="h-5 w-5 text-[#d71927]" />
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-black/40">Available Balance</p>
                  <p className="mt-3 text-3xl font-black text-green-600">{formatCurrency(stats.available_balance)}</p>
                </div>
                <div className="rounded-2xl bg-green-500/10 p-3">
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </section>

      {/* Referral Programs Section */}
      <section>
        <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
          <h2 className="text-2xl font-black tracking-tight text-[#111]">Available Programs</h2>
          <p className="mt-1 text-sm font-medium text-black/50">Earn rewards from multiple referral programs</p>

          {loadingPrograms ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : errorPrograms ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {errorPrograms}
              </p>
            </div>
          ) : programs.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {programs.map((program) => (
                <div key={program.id} className="rounded-[24px] border border-black/5 bg-[#f8f8f8] p-5">
                  <h3 className="font-black text-[#111]">{program.name}</h3>
                  <p className="mt-2 text-sm text-black/60">
                    Duration: {program.lifetime_minutes} minutes ({Math.round(program.lifetime_minutes / 1440)} days)
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-black/40">Earn ₦200 per referral</p>
                    <ArrowRight className="h-4 w-4 text-[#d71927]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-600">No programs available at the moment.</p>
            </div>
          )}
        </Card>
      </section>

      {/* Milestones Section */}
      <section>
        <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
          <h2 className="text-2xl font-black tracking-tight text-[#111]">Your Referrals</h2>
          <p className="mt-1 text-sm font-medium text-black/50">Track milestones and earnings from referred users</p>

          {loadingMilestones ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : errorMilestones ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMilestones}
              </p>
            </div>
          ) : milestones.length > 0 ? (
            <div className="mt-6 space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.milestone_id} className="rounded-[24px] border border-black/5 bg-[#f8f8f8] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[#111]">{milestone.referred_user.name}</h3>
                      <p className="text-sm text-black/60">{milestone.referred_user.email}</p>
                      <p className="text-xs text-black/40 mt-1">{milestone.program} • Code: {milestone.referral_code}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusBadgeStyle(milestone.status)}`}>
                      {milestone.status}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-black/60">Progress</span>
                      <span className="font-black text-[#111]">{milestone.progress_percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[#d71927]"
                        style={{ width: `${milestone.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="mt-4 space-y-2">
                    {Object.entries({
                      'Email Verified': milestone.milestones.email_verified,
                      'Phone Verified': milestone.milestones.phone_verified,
                      'Wallet Funded ₦100': milestone.milestones.wallet_funded_100,
                      'First Transaction': milestone.milestones.first_transaction,
                    }).map(([label, m]) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          m.completed
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-black/20 bg-transparent'
                        }`}>
                          {m.completed && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <span className={m.completed ? 'text-black/80 font-bold' : 'text-black/50'}>
                          {label}
                        </span>
                        {m.completed_at && (
                          <span className="ml-auto text-xs text-black/40">
                            {formatDate(m.completed_at)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Payout Info */}
                  {milestone.is_fully_qualified && (
                    <div className={`mt-4 rounded-xl border p-3 ${
                      milestone.status === 'paid'
                        ? 'border-green-500/20 bg-green-500/10'
                        : milestone.status === 'eligible'
                        ? 'border-amber-500/20 bg-amber-500/10'
                        : 'border-gray-500/20 bg-gray-500/10'
                    }`}>
                      <p className={`text-sm font-black ${
                        milestone.status === 'paid'
                          ? 'text-green-600'
                          : milestone.status === 'eligible'
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}>
                        {milestone.status === 'paid' ? (
                          <>✓ Earned ₦{milestone.payout_earned.toFixed(2)} - {milestone.payout_paid_at ? `Paid on ${formatDate(milestone.payout_paid_at)}` : 'Processing'}</>
                        ) : milestone.status === 'eligible' ? (
                          <>⏳ Ready for Payout - ₦{milestone.payout_earned.toFixed(2)}</>
                        ) : (
                          <>🎯 Complete all milestones to earn ₦200</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Incomplete Referral Info */}
                  {!milestone.is_fully_qualified && (
                    <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                      <p className="text-sm font-black text-blue-600 mb-2">⏳ In Progress ({milestone.progress_percentage}%)</p>
                      <p className="text-xs text-blue-600">Waiting for remaining milestones to be completed. You'll earn ₦200 once all 4 are done.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-600">No referrals yet. Share your link to get started!</p>
            </div>
          )}
        </Card>
      </section>

      {/* Withdrawal Section */}
      {stats && stats.available_balance > 0 && (
        <section>
          <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
            <h2 className="text-2xl font-black tracking-tight text-[#111]">Withdraw Earnings</h2>
            <p className="mt-1 text-sm font-medium text-black/50">
              Available Balance: <span className="font-black text-[#d71927]">{formatCurrency(stats.available_balance)}</span>
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-black uppercase tracking-wide text-black/60">Amount (₦)</label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount (minimum ₦100)"
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8f8f8] px-4 py-3 text-[#111] placeholder-black/40 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/20"
                  min="100"
                  max={stats.available_balance}
                />
                <p className="mt-2 text-xs text-black/50">Minimum: ₦100 | Maximum: {formatCurrency(stats.available_balance)}</p>
              </div>

              <Button
                onClick={handleWithdrawal}
                disabled={isWithdrawing || !withdrawalAmount}
                className="h-11 w-full rounded-xl bg-[#d71927] font-black text-white hover:bg-[#b91521] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Request Withdrawal'
                )}
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* How It Works Section */}
      <section>
        <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
          <h2 className="text-2xl font-black tracking-tight text-[#111]">How It Works</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Share Your Link',
                description: 'Copy and share your unique referral link',
              },
              {
                step: '2',
                title: 'User Registers',
                description: 'They sign up using your referral link',
              },
              {
                step: '3',
                title: 'Complete Milestones',
                description: 'They verify email, phone, fund wallet, and transact',
              },
              {
                step: '4',
                title: 'Earn ₦200',
                description: 'You get ₦200 once all milestones are completed',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-[24px] border border-black/5 bg-[#f8f8f8] p-5 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d71927] text-lg font-black text-white shadow-lg shadow-[#d71927]/20">
                  {item.step}
                </div>
                <h3 className="mt-4 font-black text-[#111]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/60">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
