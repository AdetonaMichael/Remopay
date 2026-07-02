'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Copy, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Landmark } from 'lucide-react';

/**
 * A single account, already normalized from whichever endpoint it came from
 * (dedicated account service, virtual account / DVA service, or any future
 * source). The carousel only ever knows about this shape, so adding a third
 * or fourth account source later is just "map it to a UnifiedAccount and
 * push it into the array" — no UI changes required.
 */
export interface UnifiedAccount {
  /** Stable, unique key across all sources — e.g. `dedicated-0123456789` */
  key: string;
  /** Where this account came from. Used only for a subtle label, never for layout branching. */
  source: 'dedicated' | 'virtual' | (string & {});
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  countryCode: string;
  /** Show a "Primary" pill on this card */
  isPrimary?: boolean;
}

interface AccountsCarouselProps {
  accounts: UnifiedAccount[];
  /** True while the primary/dedicated account source is still loading and nothing has resolved yet */
  isLoadingPrimary?: boolean;
  /** True while additional accounts (e.g. virtual accounts) are still being fetched */
  isLoadingMore?: boolean;
  /** Error from the "more accounts" source. Dedicated-account errors are handled by the caller (fails silently, as before). */
  error?: string | null;
  isDarkTheme?: boolean;
  onRetry?: () => void;
}

function CopyButton({
  value,
  isDarkTheme,
  label,
}: {
  value: string;
  isDarkTheme?: boolean;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable — fail silently
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label}
      aria-label={label}
      className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
        isDarkTheme
          ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
          : 'bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-800'
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function AccountsCarousel({
  accounts,
  isLoadingPrimary = false,
  isLoadingMore = false,
  error = null,
  isDarkTheme = false,
  onRetry,
}: AccountsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // A trailing skeleton card is appended while a secondary source (e.g.
  // virtual accounts) is still resolving, so the collection visibly grows
  // instead of popping in — reinforcing that it's one continuous set.
  const showTrailingSkeleton = isLoadingMore && accounts.length > 0;
  const slideCount = accounts.length + (showTrailingSkeleton ? 1 : 0);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();

    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth || 1;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), Math.max(slideCount - 1, 0)));
  }, [slideCount, updateScrollButtons]);

  useEffect(() => {
    updateScrollButtons();
    // Keep the active index valid if the collection shrinks/grows.
    setActiveIndex((prev) => Math.min(prev, Math.max(slideCount - 1, 0)));
  }, [slideCount, updateScrollButtons]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const step = (dir: 1 | -1) => {
    const next = Math.min(Math.max(activeIndex + dir, 0), slideCount - 1);
    scrollToIndex(next);
  };

  const initials = useMemo(
    () => (name: string) =>
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('') || '—',
    []
  );

  // ---------- Fully empty + still loading (nothing resolved yet) ----------
  if (isLoadingPrimary && accounts.length === 0) {
    return (
      <div
        className={`h-[172px] w-full animate-pulse rounded-[22px] ${
          isDarkTheme ? 'bg-white/10' : 'bg-gray-100'
        }`}
      />
    );
  }

  // ---------- Nothing loaded and nothing loading — hard error / truly empty ----------
  if (!isLoadingPrimary && accounts.length === 0) {
    if (error) {
      return (
        <div
          className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3.5 ${
            isDarkTheme
              ? 'border-white/10 bg-white/5 text-white/70'
              : 'border-red-100 bg-red-50 text-red-700'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="truncate text-xs font-semibold">{error}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                isDarkTheme
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-white text-red-700 hover:bg-red-100'
              }`}
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        className={`rounded-[20px] border border-dashed px-4 py-5 text-center text-xs font-semibold ${
          isDarkTheme ? 'border-white/15 text-white/40' : 'border-gray-200 text-gray-400'
        }`}
      >
        No accounts yet
      </div>
    );
  }

  // ---------- Cards ----------
  // Every account, regardless of which endpoint it came from, is rendered as
  // one uniform card type in one uniform scroll track — so the set reads as
  // a single collection the user can page through with the arrows or dots.
  return (
    <div className="relative">
      <div className="mb-2.5">
        {(accounts.length > 1 || showTrailingSkeleton) && (
          <p className={`text-[11px] font-semibold ${isDarkTheme ? 'text-white/40' : 'text-gray-400'}`}>
            {Math.min(activeIndex + 1, slideCount)} of {slideCount} accounts
          </p>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {accounts.map((account, index) => {
            return (
              <div
                key={account.key}
                onClick={() => scrollToIndex(index)}
                className={`w-full flex-shrink-0 snap-start rounded-[20px] border p-4 ${
                  isDarkTheme
                    ? 'border-white/12 bg-white/[0.04]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Header: bank avatar + name + currency, primary pill */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-black ${
                      isDarkTheme ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {initials(account.bankName)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-black leading-tight ${
                        isDarkTheme ? 'text-white' : 'text-gray-950'
                      }`}
                    >
                      {account.bankName}
                    </p>
                    <p
                      className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide leading-tight ${
                        isDarkTheme ? 'text-white/45' : 'text-gray-400'
                      }`}
                    >
                      {account.currency} · {account.countryCode}
                    </p>
                  </div>

                  {account.isPrimary && (
                    <span
                      className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        isDarkTheme ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Primary
                    </span>
                  )}
                </div>

                {/* Account Holder row */}
                <div
                  className={`mt-3 rounded-xl px-3 py-2 ${
                    isDarkTheme ? 'bg-white/5' : 'border border-gray-100 bg-white'
                  }`}
                >
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      isDarkTheme ? 'text-white/35' : 'text-gray-400'
                    }`}
                  >
                    Account Holder
                  </p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={`truncate text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-gray-950'}`}>
                      {account.accountName || '—'}
                    </p>
                    {account.accountName && (
                      <CopyButton value={account.accountName} isDarkTheme={isDarkTheme} label="Copy account holder" />
                    )}
                  </div>
                </div>

                {/* Account Number row */}
                <div
                  className={`mt-2 rounded-xl px-3 py-2 ${
                    isDarkTheme ? 'bg-white/5' : 'border border-gray-100 bg-white'
                  }`}
                >
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      isDarkTheme ? 'text-white/35' : 'text-gray-400'
                    }`}
                  >
                    Account Number
                  </p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`truncate font-mono text-sm font-black tracking-wide ${
                        isDarkTheme ? 'text-white' : 'text-gray-950'
                      }`}
                    >
                      {account.accountNumber || '—'}
                    </p>
                    {account.accountNumber && (
                      <CopyButton value={account.accountNumber} isDarkTheme={isDarkTheme} label="Copy account number" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {showTrailingSkeleton && (
            <div
              className={`w-full flex-shrink-0 snap-start animate-pulse rounded-[22px] border ${
                isDarkTheme ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-xl ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className="flex-1 space-y-1.5">
                    <div className={`h-3 w-2/3 rounded ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className={`h-2 w-1/3 rounded ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`} />
                  </div>
                </div>
                <div className={`mt-3 h-11 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-white'}`} />
                <div className={`mt-2 h-11 rounded-xl ${isDarkTheme ? 'bg-white/5' : 'bg-white'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Nav arrows overlaid on the card edges — desktop only, appear on overflow */}
        {slideCount > 1 && (canScrollLeft || canScrollRight) && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={!canScrollLeft}
              aria-label="Previous account"
              className={`absolute -left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full p-1.5 shadow-md transition-opacity disabled:opacity-0 sm:flex ${
                isDarkTheme ? 'bg-white/90 text-black' : 'bg-white text-gray-700'
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={!canScrollRight}
              aria-label="Next account"
              className={`absolute -right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full p-1.5 shadow-md transition-opacity disabled:opacity-0 sm:flex ${
                isDarkTheme ? 'bg-white/90 text-black' : 'bg-white text-gray-700'
              }`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {slideCount > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {Array.from({ length: slideCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to account ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === activeIndex
                  ? isDarkTheme
                    ? 'w-4 bg-white'
                    : 'w-4 bg-[#d71927]'
                  : isDarkTheme
                    ? 'w-1.5 bg-white/25'
                    : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Non-blocking notice when the secondary source failed but we still have at least one account to show */}
      {error && accounts.length > 0 && (
        <div
          className={`mt-2.5 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
            isDarkTheme ? 'bg-white/5 text-white/50' : 'bg-red-50 text-red-600'
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Landmark className="h-3 w-3 flex-shrink-0" />
            Couldn&apos;t load additional accounts
          </span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="flex-shrink-0 underline underline-offset-2">
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}