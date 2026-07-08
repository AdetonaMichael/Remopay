'use client';

import React from 'react';
import Image from 'next/image';
import { VirtualCard, CardPaginationMeta, CardStatus } from '@/types/card.types';
import { CardListItem } from './CardListItem';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Snowflake,
  Ban,
} from 'lucide-react';

interface CardListProps {
  cards: VirtualCard[];
  pagination: CardPaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetails?: (cardId: string) => void;
  onFund?: (cardId: string, maskedPan: string | null) => void;
  onWithdraw?: (cardId: string, maskedPan: string | null) => void;
}

const statusBadgeConfig: Record<string, { label: string; bg: string; text: string; Icon: React.ComponentType<{ className?: string }> }> = {
  [CardStatus.ACTIVE]: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', Icon: Check },
  [CardStatus.FROZEN]: { label: 'Frozen', bg: 'bg-blue-50', text: 'text-blue-700', Icon: Snowflake },
  [CardStatus.DISABLED]: { label: 'Disabled', bg: 'bg-amber-50', text: 'text-amber-700', Icon: Ban },
  [CardStatus.TERMINATED]: { label: 'Terminated', bg: 'bg-red-50', text: 'text-red-700', Icon: Ban },
};

function getStatusConfig(status: CardStatus) {
  return statusBadgeConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700', Icon: Ban };
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onFund,
  onWithdraw,
}) => {
  const { current_page, total_pages, total_records, page_size } = pagination;

  const handlePreviousPage = () => {
    if (current_page > 1) onPageChange(current_page - 1);
  };

  const handleNextPage = () => {
    if (current_page < total_pages) onPageChange(current_page + 1);
  };

  // Empty state
  if (cards.length === 0 && !isLoading) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <CreditCard className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">No cards yet</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
          Create your first virtual card to start making secure online payments worldwide.
        </p>
      </div>
    );
  }

  // Loading skeleton (mobile cards + desktop table skeleton)
  if (isLoading && cards.length === 0) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 w-12 bg-gray-100 rounded" />
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop skeleton */}
        <div className="hidden lg:block rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="h-10 w-16 bg-gray-200 rounded-lg" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-8 w-28 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── Mobile: Card Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
        {cards.map((card) => (
          <CardListItem
            key={card.id}
            card={card}
            onViewDetails={onViewDetails}
            onFund={onFund}
            onWithdraw={onWithdraw}
          />
        ))}
      </div>

      {/* ─── Desktop: Table ─── */}
      <div className="hidden lg:block rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Brand</th>
                <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Card Number</th>
                <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Expiry</th>
                <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Cardholder</th>
                <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Balance</th>
                <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-right font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map((card) => {
                const statusConfig = getStatusConfig(card.status);
                const StatusIcon = statusConfig.Icon;
                const maskedPan = card.masked_pan || card.card_number || '';
                const displayPan = maskedPan.length > 8
                  ? `•••• ${maskedPan.slice(-4)}`
                  : maskedPan;
                const isActive = card.status === CardStatus.ACTIVE;

                return (
                  <tr key={card.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Brand */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0">
                          <Image
                            src={card.brand === 'VISA' ? '/visa.webp' : '/mastercard.svg'}
                            alt={card.brand}
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-gray-900">{card.brand}</span>
                      </div>
                    </td>

                    {/* Card Number */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900 tracking-wider">
                        {displayPan}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">{card.expiry}</span>
                    </td>

                    {/* Cardholder */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {card.cardholder_name || card.name || '—'}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-extrabold text-gray-900">
                        ${card.balance?.toFixed(2) ?? '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${statusConfig.bg}`}>
                        <StatusIcon className={`h-3 w-3 ${statusConfig.text}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetails?.(card.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <Zap className="h-3 w-3" />
                          Details
                        </button>
                        {isActive && (
                          <>
                            <button
                              onClick={() => onFund?.(card.id, card.masked_pan || null)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <ArrowDownLeft className="h-3 w-3" />
                              Fund
                            </button>
                            <button
                              onClick={() => onWithdraw?.(card.id, card.masked_pan || null)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                            >
                              <ArrowUpRight className="h-3 w-3" />
                              Withdraw
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      {total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{cards.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{total_records}</span> cards
            {total_records > page_size && (
              <span>
                {' '}· Page <span className="font-semibold text-gray-900">{current_page}</span> of{' '}
                <span className="font-semibold text-gray-900">{total_pages}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Show:</label>
              <select
                value={page_size}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="6">6</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePreviousPage}
                disabled={isLoading || current_page === 1}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(total_pages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (current_page <= 3) {
                    pageNum = i + 1;
                  } else if (current_page >= total_pages - 2) {
                    pageNum = total_pages - 4 + i;
                  } else {
                    pageNum = current_page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      disabled={isLoading}
                      className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                        current_page === pageNum
                          ? 'bg-[#d71927] text-white shadow-md shadow-red-200'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={isLoading || current_page === total_pages}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
