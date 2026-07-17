'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  CreditCard,
  Wallet,
  ArrowUpFromLine,
  ArrowRightLeft,
  Calendar,
  Globe,
  ShieldAlert,
  XCircle,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Search,
  ChevronRight,
} from 'lucide-react';
import type { FeeConfig, FeeType } from '@/types/card-fee.types';
import { FEE_TYPE_META } from '@/types/card-fee.types';

interface FeeConfigTableProps {
  fees: FeeConfig[];
  isLoading?: boolean;
  onToggle: (feeType: FeeType) => void;
  togglingId?: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard,
  Wallet,
  ArrowUpFromLine,
  ArrowRightLeft,
  Calendar,
  Globe,
  ShieldAlert,
  XCircle,
  TrendingUp,
};

function formatFeeValue(fee: FeeConfig): string {
  switch (fee.fee_calculation_type) {
    case 'fixed':
      return fee.fixed_amount ? `$${parseFloat(fee.fixed_amount).toFixed(2)}` : '$0.00';
    case 'percentage':
      return fee.percentage_rate ? `${parseFloat(fee.percentage_rate).toFixed(1)}%` : '0%';
    case 'hybrid': {
      const parts: string[] = [];
      if (fee.fixed_amount && parseFloat(fee.fixed_amount) > 0) parts.push(`$${parseFloat(fee.fixed_amount).toFixed(2)}`);
      if (fee.percentage_rate && parseFloat(fee.percentage_rate) > 0) parts.push(`${parseFloat(fee.percentage_rate).toFixed(1)}%`);
      return parts.length > 0 ? parts.join(' + ') : '$0.00';
    }
    case 'threshold': {
      const threshold = fee.threshold_amount ? `$${parseFloat(fee.threshold_amount).toFixed(2)}` : '$0';
      const below = fee.below_threshold_fixed
        ? `$${parseFloat(fee.below_threshold_fixed).toFixed(2)}`
        : fee.below_threshold_percentage
          ? `${parseFloat(fee.below_threshold_percentage).toFixed(1)}%`
          : null;
      const above = fee.above_threshold_fixed
        ? `$${parseFloat(fee.above_threshold_fixed).toFixed(2)}`
        : fee.above_threshold_percentage
          ? `${parseFloat(fee.above_threshold_percentage).toFixed(1)}%`
          : null;
      return `<${threshold}: ${below || '$0'} / ≥${threshold}: ${above || '$0'}`;
    }
    default:
      return '$0.00';
  }
}

function formatProviderFee(fee: FeeConfig): string {
  if (fee.provider_fixed_amount && parseFloat(fee.provider_fixed_amount) > 0) {
    return `$${parseFloat(fee.provider_fixed_amount).toFixed(2)}`;
  }
  if (fee.provider_percentage_rate && parseFloat(fee.provider_percentage_rate) > 0) {
    return `${parseFloat(fee.provider_percentage_rate).toFixed(1)}%`;
  }
  return '$0.00';
}

export function FeeConfigTable({ fees, isLoading, onToggle, togglingId }: FeeConfigTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = fees.filter((fee) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      fee.display_name.toLowerCase().includes(q) ||
      fee.fee_type.toLowerCase().includes(q) ||
      fee.description.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-500">No fee configurations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search fee types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-4 focus:ring-[#d71927]/10 transition-all"
        />
      </div>

      {/* Fee Cards */}
      <div className="grid gap-3">
        {filtered.map((fee) => {
          const meta = FEE_TYPE_META[fee.fee_type];
          const IconComponent = ICON_MAP[meta?.icon] || CreditCard;
          const isToggling = togglingId === fee.fee_type;

          return (
            <Link
              key={fee.id}
              href={`/admin/cards/fees/${fee.fee_type}`}
              className="group block rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-red-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={clsx(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                  fee.is_active ? 'bg-red-50 text-[#d71927]' : 'bg-gray-100 text-gray-400'
                )}>
                  <IconComponent size={24} />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">{fee.display_name}</h3>
                    <span className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      fee.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {fee.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{fee.description}</p>

                  {/* Fee details */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span><strong>Our Fee:</strong> {formatFeeValue(fee)}</span>
                    <span><strong>Provider:</strong> {formatProviderFee(fee)}</span>
                    <span className="capitalize"><strong>Type:</strong> {fee.fee_calculation_type}</span>
                  </div>
                </div>

                {/* Toggle & Arrow */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isToggling) onToggle(fee.fee_type);
                    }}
                    disabled={isToggling}
                    className={clsx(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all',
                      fee.is_active
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      isToggling && 'opacity-50 cursor-wait'
                    )}
                    title={fee.is_active ? 'Disable fee' : 'Enable fee'}
                  >
                    {isToggling ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : fee.is_active ? (
                      <ToggleRight size={16} />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                    {fee.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <ChevronRight size={18} className="text-gray-300 transition group-hover:text-[#d71927]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && searchQuery && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            No fee configurations match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
