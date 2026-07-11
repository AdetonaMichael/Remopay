'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Copy,
  Share2,
  Check,
  Users,
  TrendingUp,
  Wallet,
  Award,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gift,
  UserCheck,
  Target,
  DollarSign,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useAlert } from '@/hooks/useAlert';
import { useAuth } from '@/hooks/useAuth';
import { referralService } from '@/services/referral.service';
import type {
  ReferralApiResponseData,
  ReferralFilters,
  ReferralRecord,
  ReferralPaginationMeta,
  ReferralLinkInfo,
  ReferralStatus,
} from '@/types/referral.types';
import {
  REFERRAL_STATUS_CONFIG,
  MILESTONE_LABELS,
} from '@/types/referral.types';

// ==============================
// Constants
// ==============================

const REFERRAL_LINK_BASE = 'https://remopay.remonode.com/auth/register?ref=';

// ==============================
// Utility Functions
// ==============================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Construct the correct referral link from a referral code
 */
function buildReferralLink(code: string): string {
  return `${REFERRAL_LINK_BASE}${code}`;
}

// ==============================
// Sub-Components
// ==============================

function StatCard({
  icon: Icon,
  label,
  value,
  valueColor = 'text-gray-900',
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-600',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            {label}
          </p>
          <p className={`text-2xl font-extrabold tracking-tight ${valueColor}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-xl ${iconBg} p-3`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  const config = REFERRAL_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

function MilestoneProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage === 100
      ? 'bg-emerald-500'
      : percentage >= 50
      ? 'bg-blue-500'
      : 'bg-amber-500';

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-bold text-gray-500">
        {percentage}%
      </span>
    </div>
  );
}

function MilestoneChecklist({ record }: { record: ReferralRecord }) {
  const completedCount = MILESTONE_LABELS.filter(
    (m) => record.milestones[m.key].completed
  ).length;
  const totalCount = MILESTONE_LABELS.length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-gray-500">
          Milestones ({completedCount}/{totalCount})
        </p>
        {record.is_fully_qualified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            <Check className="h-3 w-3" />
            Complete
          </span>
        )}
      </div>
      <div className="space-y-2">
        {MILESTONE_LABELS.map(({ key, label }) => {
          const milestone = record.milestones[key];
          return (
            <div key={key} className="flex items-center gap-2.5">
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  milestone.completed
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {milestone.completed && (
                  <Check className="h-3 w-3 text-emerald-600" />
                )}
              </div>
              <span
                className={`text-sm ${
                  milestone.completed
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {milestone.completed_at && (
                <span className="ml-auto text-xs text-gray-400">
                  {formatDate(milestone.completed_at)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PayoutStatus({ record }: { record: ReferralRecord }) {
  if (record.status === 'paid') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
          <Check className="h-4 w-4" />
          <span>
            Earned {formatCurrency(record.payout_earned)}
            {record.payout_paid_at
              ? ` · Paid ${formatDate(record.payout_paid_at)}`
              : ''}
          </span>
        </div>
      </div>
    );
  }

  if (record.status === 'eligible') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
          <DollarSign className="h-4 w-4" />
          <span>
            Ready for Payout — {formatCurrency(record.payout_earned)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        <Target className="h-4 w-4" />
        <span>
          Complete all milestones to earn{' '}
          <span className="font-bold">₦200</span>
        </span>
      </div>
    </div>
  );
}

function ReferralRow({ record }: { record: ReferralRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-sm">
      {/* Main Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 text-left sm:px-6"
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#d71927]/10 text-sm font-extrabold text-[#d71927]">
          {record.referred_user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {record.referred_user.name}
          </p>
          <p className="truncate text-xs text-gray-500">
            {record.referred_user.email}
          </p>
        </div>

        {/* Program & Date */}
        <div className="hidden min-w-0 sm:block sm:max-w-[140px]">
          <p className="truncate text-xs font-semibold text-gray-700">
            {record.program}
          </p>
          <p className="truncate text-xs text-gray-400">
            {formatDate(record.referred_at)}
          </p>
        </div>

        {/* Progress */}
        <div className="hidden w-32 md:block">
          <MilestoneProgressBar percentage={record.progress_percentage} />
        </div>

        {/* Status */}
        <div className="hidden sm:block">
          <StatusBadge status={record.status} />
        </div>

        {/* Earnings */}
        <div className="text-right">
          <p className="text-sm font-extrabold text-gray-900">
            {record.payout_earned > 0
              ? formatCurrency(record.payout_earned)
              : '—'}
          </p>
        </div>

        {/* Expand indicator */}
        <ChevronRight
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Milestone Checklist */}
            <MilestoneChecklist record={record} />

            {/* Right: Details */}
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-gray-500">
                  Referred User
                </p>
                <div className="space-y-1.5 text-sm">
                  {record.referred_user.phone && (
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-500">Phone:</span>{' '}
                      {record.referred_user.phone}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-500">Joined:</span>{' '}
                    {formatDate(record.referred_user.joined_at)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-500">Referred:</span>{' '}
                    {formatDateTime(record.referred_at)}
                  </p>
                </div>
              </div>

              {/* Referral Code */}
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Referral Code
                    </p>
                    <p className="font-mono text-sm font-bold text-gray-900">
                      {record.referral_code}
                    </p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
              </div>

              {/* Payout Info */}
              <PayoutStatus record={record} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReferralFiltersBar({
  filters,
  onChange,
  total,
}: {
  filters: ReferralFilters;
  onChange: (filters: ReferralFilters) => void;
  total: number;
}) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onChange({ ...filtersRef.current, search: value || undefined, page: 1 });
    }, 400);
  };

  const clearFilters = () => {
    setSearchInput('');
    onChange({ page: 1, per_page: 15 });
  };

  const hasActiveFilters = !!(
    filters.status ||
    filters.search ||
    filters.date_from ||
    filters.date_to
  );

  return (
    <div className="space-y-4">
      {/* Search & Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/10"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onChange({ ...filtersRef.current, search: undefined, page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) =>
            onChange({
              ...filtersRef.current,
              status: (e.target.value as ReferralStatus) || undefined,
              page: 1,
            })
          }
          className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/10"
        >
          <option value="">All Statuses</option>
          <option value="pending">In Progress</option>
          <option value="eligible">Ready for Payout</option>
          <option value="paid">Paid</option>
        </select>

        {/* Date From */}
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) =>
              onChange({
                ...filtersRef.current,
                date_from: e.target.value || undefined,
                page: 1,
              })
            }
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3.5 text-sm font-medium text-gray-700 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/10"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) =>
              onChange({
                ...filtersRef.current,
                date_to: e.target.value || undefined,
                page: 1,
              })
            }
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3.5 text-sm font-medium text-gray-700 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-[#d71927]/10"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-bold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{total}</span>{' '}
          {total === 1 ? 'referral' : 'referrals'}
          {hasActiveFilters && ' found'}
        </p>
      </div>
    </div>
  );
}

function ReferralPagination({
  meta,
  onPageChange,
}: {
  meta: ReferralPaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const delta = 2;
    const range: (number | 'ellipsis')[] = [];
    const left = Math.max(2, meta.current_page - delta);
    const right = Math.min(meta.last_page - 1, meta.current_page + delta);

    range.push(1);
    if (left > 2) range.push('ellipsis');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < meta.last_page - 1) range.push('ellipsis');
    if (meta.last_page > 1) range.push(meta.last_page);

    return range;
  }, [meta.current_page, meta.last_page]);

  if (meta.last_page <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing{' '}
        <span className="font-semibold text-gray-700">{meta.from}</span>–
        <span className="font-semibold text-gray-700">{meta.to}</span> of{' '}
        <span className="font-semibold text-gray-700">{meta.total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl px-2 text-sm font-bold transition ${
                page === meta.current_page
                  ? 'bg-[#d71927] text-white shadow-sm shadow-red-200'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ReferralLinkCard({
  link,
  constructedLink,
}: {
  link: ReferralLinkInfo;
  constructedLink: string;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const { success: showSuccess } = useAlert();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(constructedLink);
      setLinkCopied(true);
      showSuccess('Referral link copied!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      showSuccess('Referral link copied!');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(link.code);
      setCodeCopied(true);
      showSuccess('Referral code copied!');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      showSuccess('Referral code copied!');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join me on Remopay`,
        text: `Use my referral code ${link.code} to sign up and earn rewards!`,
        url: constructedLink,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {link.program}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
              {link.total_referred}{' '}
              {link.total_referred === 1 ? 'referral' : 'referrals'}
            </span>
            {link.qualified_referred > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {link.qualified_referred} qualified
              </span>
            )}
          </div>

          {/* Code row with separate copy button */}
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-gray-50 px-2.5 py-1 font-mono text-sm font-bold text-[#d71927]">
              {link.code}
            </code>
            <button
              onClick={handleCopyCode}
              className="flex h-7 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-[#d71927]"
              title="Copy referral code"
            >
              {codeCopied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {codeCopied ? 'Copied' : 'Copy Code'}
            </button>
            <span className="hidden text-xs text-gray-400 sm:inline">
              Created {formatDate(link.created_at)}
            </span>
          </div>

          <p className="truncate text-xs text-gray-400">{constructedLink}</p>
        </div>

        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={handleCopyLink}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-[#d71927]"
            title="Copy referral link"
          >
            {linkCopied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-[#d71927]"
            title="Share referral link"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Main Page Component
// ==============================

const INITIAL_FILTERS: ReferralFilters = {
  page: 1,
  per_page: 15,
};

export default function ReferralPage() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();

  // Data state
  const [data, setData] = useState<ReferralApiResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ReferralFilters>(INITIAL_FILTERS);

  // Copy state for main referral link
  const [mainLinkCopied, setMainLinkCopied] = useState(false);

  // Construct the main referral link from user's first referral code
  const mainReferralLink = useMemo(() => {
    if (data?.authReferralLink) {
      // If backend provides authReferralLink, extract the code from it
      // and construct the proper URL
      const match = data.authReferralLink.match(/ref=([A-Za-z0-9]+)/);
      const code = match?.[1];
      if (code) return buildReferralLink(code);
    }
    // Fallback: use first referral link's code
    if (data?.referral_links?.[0]?.code) {
      return buildReferralLink(data.referral_links[0].code);
    }
    return null;
  }, [data?.authReferralLink, data?.referral_links]);

  // Fetch referrals
  const fetchReferrals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const result = await referralService.fetchMyReferrals(filters, user.id);
      setData(result);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load referrals';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, showError]);

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: ReferralFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Copy main referral link
  const handleCopyMainLink = async () => {
    if (!mainReferralLink) return;
    try {
      await navigator.clipboard.writeText(mainReferralLink);
      setMainLinkCopied(true);
      showSuccess('Referral link copied!');
      setTimeout(() => setMainLinkCopied(false), 2000);
    } catch {
      showSuccess('Referral link copied!');
    }
  };

  // Compute stat cards
  const statsCards = useMemo(() => {
    if (!data?.stats) return [];
    const s = data.stats;
    return [
      {
        icon: Users,
        label: 'Total Referrals',
        value: s.total_referrals.toLocaleString(),
        valueColor: 'text-gray-900',
        iconBg: 'bg-[#d71927]/10',
        iconColor: 'text-[#d71927]',
      },
      {
        icon: UserCheck,
        label: 'Fully Qualified',
        value: s.fully_qualified_referrals.toLocaleString(),
        valueColor: 'text-emerald-700',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        icon: TrendingUp,
        label: 'Total Earnings',
        value: formatCurrency(s.total_earnings),
        valueColor: 'text-[#d71927]',
        iconBg: 'bg-[#d71927]/10',
        iconColor: 'text-[#d71927]',
      },
      {
        icon: Wallet,
        label: 'Available Balance',
        value: formatCurrency(s.available_balance),
        valueColor: 'text-emerald-700',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
    ];
  }, [data?.stats]);

  // ==============================
  // Loading State
  // ==============================
  if (loading && !data) {
    return (
      <div className="space-y-8">
        {/* Skeleton Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded-lg bg-gray-200" />
            <div className="h-4 w-96 rounded-lg bg-gray-100" />
            <div className="h-12 w-full rounded-xl bg-gray-100" />
          </div>
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="space-y-3">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-7 w-28 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton Table */}
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-56 rounded bg-gray-100" />
                </div>
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==============================
  // Error State
  // ==============================
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-red-900">
            Failed to load referrals
          </h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button
            onClick={fetchReferrals}
            className="mt-6 rounded-xl bg-[#d71927] px-6 font-bold text-white hover:bg-[#b81420]"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ==============================
  // Empty State (no referrals at all)
  // ==============================
  const hasNoReferrals = data && data.referrals.data.length === 0 && !filters.status && !filters.search && !filters.date_from && !filters.date_to;

  if (hasNoReferrals) {
    return (
      <div className="space-y-8">
        {/* Hero / Share Link */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d71927]/10">
                <Gift className="h-6 w-6 text-[#d71927]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Refer & Earn
                </h1>
                <p className="text-sm text-gray-500">
                  Invite friends and earn ₦200 per referral
                </p>
              </div>
            </div>
            {mainReferralLink && (
              <div className="mt-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-gray-500">
                  Your Referral Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 truncate rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
                    {mainReferralLink}
                  </div>
                  <button
                    onClick={handleCopyMainLink}
                    className="flex h-12 items-center gap-2 rounded-xl bg-[#d71927] px-5 font-bold text-white shadow-lg shadow-[#d71927]/20 transition hover:bg-[#b81420]"
                  >
                    {mainLinkCopied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {data.stats && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statsCards.map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        )}

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
            <Users className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">
            No referrals yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
            Share your referral link with friends and family. You'll earn ₦200
            for every friend who completes all milestones.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '1', title: 'Share Your Link' },
              { step: '2', title: 'They Sign Up' },
              { step: '3', title: 'Complete Milestones' },
              { step: '4', title: 'You Earn ₦200' },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#d71927] text-xs font-extrabold text-white">
                  {item.step}
                </div>
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // Main Data View
  // ==============================
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#d71927]/10">
                <Gift className="h-7 w-7 text-[#d71927]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Refer & Earn Rewards
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  Share your unique link and earn{' '}
                  <span className="font-bold text-gray-900">₦200</span> for every
                  friend who completes all signup milestones.
                </p>
              </div>
            </div>

            {/* Earnings Summary Badge */}
            {data?.stats && (
              <div className="flex flex-shrink-0 items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500">
                    Total Earned
                  </p>
                  <p className="text-lg font-extrabold text-emerald-600">
                    {formatCurrency(data.stats.total_earnings)}
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500">
                    Balance
                  </p>
                  <p className="text-lg font-extrabold text-gray-900">
                    {formatCurrency(data.stats.available_balance)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Referral Link */}
          {mainReferralLink && (
            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-gray-500">
                Your Referral Link
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 truncate rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
                  {mainReferralLink}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyMainLink}
                    className="flex h-12 items-center gap-2 rounded-xl bg-[#d71927] px-5 font-bold text-white shadow-lg shadow-[#d71927]/20 transition hover:bg-[#b81420]"
                  >
                    {mainLinkCopied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>
      )}

      {/* Referral Links */}
      {data?.referral_links && data.referral_links.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
              Referral Links
            </h2>
            <span className="text-xs text-gray-400">
              {data.referral_links.length}{' '}
              {data.referral_links.length === 1 ? 'link' : 'links'}
            </span>
          </div>
          <div className="space-y-2">
            {data.referral_links.map((link) => (
              <ReferralLinkCard
                key={link.id}
                link={link}
                constructedLink={buildReferralLink(link.code)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Referrals Section */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                Referrals
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Track progress and earnings from referred users
              </p>
            </div>
            <Award className="h-6 w-6 text-gray-300" />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Filters */}
          <ReferralFiltersBar
            filters={filters}
            onChange={handleFilterChange}
            total={data?.referrals.meta.total || 0}
          />

          {/* Loading Overlay for filter changes */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#d71927]" />
            </div>
          )}

          {/* Referrals List */}
          {!loading && data?.referrals.data && (
            <>
              {data.referrals.data.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {data.referrals.data.map((record, idx) => (
                    <ReferralRow
                      key={record.milestone_id ?? `referral-${idx}`}
                      record={record}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    <Search className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    No referrals match your filters
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    onClick={() => setFilters(INITIAL_FILTERS)}
                    className="mt-4 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && data?.referrals.meta && data.referrals.data.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 sm:px-8">
            <ReferralPagination
              meta={data.referrals.meta}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
