'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  Gift,
  Megaphone,
  Share2,
  ShieldCheck,
  TrendingUp,
  Users2,
  Wallet,
} from 'lucide-react';

import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Spinner } from '@/components/shared/Spinner';

type ReferralStatus = 'active' | 'pending';
type ReferralTier = 'starter' | 'growth' | 'partner';

type RecentReferral = {
  id: string;
  name: string;
  email: string;
  date: string;
  status: ReferralStatus;
  earnings: number;
};

type TierBenefit = {
  tier: ReferralTier;
  min_referrals: number;
  commission: string;
  description: string;
};

type ReferralData = {
  code: string;
  link: string;
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  available_balance: number;
  referral_tier: ReferralTier;
  recent_referrals: RecentReferral[];
  tier_benefits: TierBenefit[];
};

const mockReferralData: ReferralData = {
  code: 'REMOPAY2026',
  link: 'https://remopay.remonode.com/ref/REMOPAY2026',
  total_referrals: 28,
  active_referrals: 22,
  total_earnings: 45000,
  pending_earnings: 8500,
  available_balance: 36500,
  referral_tier: 'growth',
  recent_referrals: [
    {
      id: '1',
      name: 'Chidi Okafor',
      email: 'chidi@example.com',
      date: '2026-04-18',
      status: 'active',
      earnings: 2000,
    },
    {
      id: '2',
      name: 'Amara Eze',
      email: 'amara@example.com',
      date: '2026-04-20',
      status: 'pending',
      earnings: 1500,
    },
    {
      id: '3',
      name: 'Tunde Adebayo',
      email: 'tunde@example.com',
      date: '2026-04-22',
      status: 'pending',
      earnings: 1200,
    },
  ],
  tier_benefits: [
    {
      tier: 'starter',
      min_referrals: 5,
      commission: '2%',
      description: 'For users beginning their Remopay affiliate journey.',
    },
    {
      tier: 'growth',
      min_referrals: 25,
      commission: '3.5%',
      description: 'For consistent referrers with active transaction volume.',
    },
    {
      tier: 'partner',
      min_referrals: 50,
      commission: '5%',
      description: 'For high-performing affiliates, agents, and resellers.',
    },
  ],
};

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

function getTierStyles(tier: ReferralTier, currentTier: ReferralTier) {
  const isCurrent = tier === currentTier;

  return isCurrent
    ? 'border-[#d71927] bg-[#fff1f2] shadow-[0_18px_45px_rgba(215,25,39,0.12)]'
    : 'border-black/5 bg-white';
}

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReferrals(mockReferralData);
    setLoading(false);
  }, []);

  const nextTier = useMemo(() => {
    if (!referrals) return null;

    return referrals.tier_benefits.find(
      (tier) => tier.min_referrals > referrals.total_referrals
    );
  }, [referrals]);

  const remainingToNextTier = useMemo(() => {
    if (!referrals || !nextTier) return 0;

    return Math.max(nextTier.min_referrals - referrals.total_referrals, 0);
  }, [referrals, nextTier]);

  const copyToClipboard = async () => {
    if (!referrals?.link) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referrals.link);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = referrals.link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
      alert('Unable to copy link. Please try again.');
    }
  };

  if (loading || !referrals) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#100303] px-6 py-8 shadow-[0_20px_70px_rgba(16,3,3,0.16)] sm:px-8 sm:py-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#d71927]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Earn recurring rewards by bringing people into Remopay.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Share your referral link with customers, agents, resellers, and everyday
              users. Earn commission when your referrals sign up and transact on Remopay.
            </p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/40">
                Your Referral Link
              </p>

              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1 break-all rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white/90">
                  {referrals?.link || 'No referral link available'}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={copyToClipboard}
                    className="h-11 rounded-xl bg-[#d71927] px-5 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Copy size={16} />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                  </Button>

                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                Code: <span className="font-black">{referrals?.code || 'N/A'}</span>
              </div>

              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white capitalize">
                Tier: <span className="font-black">{referrals?.referral_tier || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Total Referrals',
                  value: referrals?.total_referrals ?? 0,
                  icon: Users2,
                },
                {
                  label: 'Active Referrals',
                  value: referrals?.active_referrals ?? 0,
                  icon: CheckCircle2,
                },
                {
                  label: 'Available Balance',
                  value: formatCurrency(referrals?.available_balance),
                  icon: Wallet,
                },
                {
                  label: 'Pending Earnings',
                  value: formatCurrency(referrals?.pending_earnings),
                  icon: TrendingUp,
                },
              ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-white/40">
                        {item.label}
                      </p>
                      <p className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl">
                        {item.value}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#d71927]/15 p-3">
                      <Icon className="h-5 w-5 text-[#ff6b76]" />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="col-span-2 rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white/40">
                    Total Earned
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-white">
                    {formatCurrency(referrals?.total_earnings)}
                  </p>
                </div>

                <Button className="h-11 rounded-xl bg-white px-5 font-black text-[#100303] hover:bg-[#fff1f2]">
                  Request Withdrawal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#111]">
                Affiliate Tiers
              </h2>
              <p className="mt-1 text-sm font-medium text-black/50">
                Grow your referrals and unlock better commission rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {referrals.tier_benefits.map((tier) => {
              const isCurrent = tier.tier === referrals.referral_tier;

              return (
                <div
                  key={tier.tier}
                  className={`rounded-[24px] border p-5 transition-all ${getTierStyles(
                    tier.tier,
                    referrals.referral_tier
                  )}`}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black capitalize text-[#111]">
                        {tier.tier}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-black/50">
                        {tier.description}
                      </p>
                    </div>

                    {isCurrent ? (
                      <Badge variant="success" size="sm">
                        Current
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#f8f8f8] p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-black/40">
                        Minimum Referrals
                      </p>
                      <p className="mt-2 text-2xl font-black tracking-tight text-[#111]">
                        {tier.min_referrals}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8f8f8] p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-black/40">
                        Commission Rate
                      </p>
                      <p className="mt-2 text-2xl font-black tracking-tight text-[#d71927]">
                        {tier.commission}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)]">
          <span className="inline-flex rounded-full border border-[#d71927]/15 bg-[#fff1f2] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#d71927]">
            Growth Insight
          </span>

          <h3 className="mt-4 text-xl font-black tracking-tight text-[#111]">
            Next Tier Progress
          </h3>

          {nextTier ? (
            <>
              <p className="mt-2 text-sm leading-7 text-black/50">
                You need{' '}
                <span className="font-black text-[#111]">{remainingToNextTier}</span>{' '}
                more referral{remainingToNextTier === 1 ? '' : 's'} to reach{' '}
                <span className="font-black capitalize text-[#111]">
                  {nextTier.tier}
                </span>{' '}
                and unlock a {nextTier.commission} commission rate.
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-black/45">Progress</span>
                  <span className="font-black text-[#111]">
                    {referrals.total_referrals}/{nextTier.min_referrals}
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[#d71927]"
                    style={{
                      width: `${Math.min(
                        (referrals.total_referrals / nextTier.min_referrals) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm leading-7 text-black/50">
              You are already at the highest affiliate tier available.
            </p>
          )}

          <div className="mt-8 rounded-[22px] border border-black/5 bg-[#f8f8f8] p-5">
            <h4 className="text-base font-black text-[#111]">
              Best target audience
            </h4>
            <p className="mt-2 text-sm leading-7 text-black/50">
              Invite agents, resellers, students, businesses, and users who frequently
              buy airtime, data, electricity, cable TV, and other digital services.
            </p>
          </div>
        </Card>
      </section>

      <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)] sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#111]">
              Recent Referrals
            </h2>
            <p className="mt-1 text-sm font-medium text-black/50">
              Monitor signups, activation status, and generated earnings.
            </p>
          </div>

          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm font-black text-[#d71927] hover:underline"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                {['Name', 'Email', 'Date', 'Status', 'Earnings'].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-2 text-left text-xs font-black uppercase tracking-wide text-black/40"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {referrals.recent_referrals.map((referral) => (
                <tr key={referral.id} className="rounded-2xl bg-[#f8f8f8]">
                  <td className="rounded-l-2xl border-y border-l border-black/5 px-4 py-4 text-sm font-black text-[#111]">
                    {referral.name}
                  </td>
                  <td className="border-y border-black/5 px-4 py-4 text-sm font-medium text-black/50">
                    {referral.email}
                  </td>
                  <td className="border-y border-black/5 px-4 py-4 text-sm font-medium text-black/50">
                    {formatDate(referral.date)}
                  </td>
                  <td className="border-y border-black/5 px-4 py-4 text-sm">
                    <Badge
                      variant={referral.status === 'active' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {referral.status}
                    </Badge>
                  </td>
                  <td className="rounded-r-2xl border-y border-r border-black/5 px-4 py-4 text-sm font-black text-[#d71927]">
                    {formatCurrency(referral.earnings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(16,3,3,0.05)] sm:p-7">
          <h2 className="text-2xl font-black tracking-tight text-[#111]">
            How the Affiliate Program Works
          </h2>
          <p className="mt-1 text-sm font-medium text-black/50">
            A simple flow for users, agents, and resellers.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Share Link',
                description: 'Send your Remopay referral link to your audience.',
              },
              {
                step: '02',
                title: 'User Registers',
                description: 'Your referral creates an account using your link.',
              },
              {
                step: '03',
                title: 'User Transacts',
                description: 'They fund wallet, buy services, or use Remopay features.',
              },
              {
                step: '04',
                title: 'You Earn',
                description: 'Commission is tracked and added to your affiliate balance.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-[24px] border border-black/5 bg-[#f8f8f8] p-5"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d71927] text-sm font-black text-white shadow-lg shadow-[#d71927]/20">
                  {item.step}
                </div>
                <h3 className="mt-4 text-base font-black text-[#111]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-black/50">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-[#d71927]/10 bg-[#fff8f8] p-6 shadow-[0_10px_35px_rgba(215,25,39,0.06)] sm:p-7">
          <span className="inline-flex rounded-full border border-[#d71927]/15 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#d71927]">
            Affiliate Playbook
          </span>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#111]">
            Tips to Boost Your Earnings
          </h2>

          <div className="mt-6 space-y-4">
            {[
              {
                icon: Megaphone,
                text: 'Promote your link on WhatsApp status, Telegram groups, and social channels.',
              },
              {
                icon: Users2,
                text: 'Target people who buy data, airtime, electricity, cable TV, and betting wallet top-ups regularly.',
              },
              {
                icon: TrendingUp,
                text: 'Focus on active referrals, not just signups. Active users generate better commission value.',
              },
              {
                icon: ShieldCheck,
                text: 'Explain Remopay clearly and avoid misleading promises when promoting your link.',
              },
            ].map((tip) => {
              const Icon = tip.icon;

              return (
                <div
                  key={tip.text}
                  className="flex items-start gap-3 rounded-2xl border border-[#d71927]/10 bg-white p-4"
                >
                  <div className="rounded-xl bg-[#fff1f2] p-2">
                    <Icon className="h-4 w-4 text-[#d71927]" />
                  </div>
                  <p className="text-sm leading-7 text-black/60">{tip.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <Button
              onClick={copyToClipboard}
              className="h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
            >
              <span className="inline-flex items-center gap-2">
                Start Sharing
                <ArrowRight size={16} />
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}