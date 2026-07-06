'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { Loader2, AlertCircle } from 'lucide-react';
import { vtuService } from '@/services/vtu.service';
import type { VTUVariation } from '@/types/vtu.types';

// ─── Types ───────────────────────────────────────────────────────────

interface NetworkData {
  id: string;
  name: string;
  serviceId: string;
  logo: string;
  loading: boolean;
  error: string | null;
  variations: VTUVariation[];
}

// ─── Constants ───────────────────────────────────────────────────────

const NETWORKS: Omit<NetworkData, 'loading' | 'error' | 'variations'>[] = [
  {
    id: 'mtn',
    name: 'MTN',
    serviceId: 'mtn-data',
    logo: 'https://vtpass.com/resources/products/200X200/MTN-Data.jpg',
  },
  {
    id: 'airtel',
    name: 'Airtel',
    serviceId: 'airtel-data',
    logo: 'https://vtpass.com/resources/products/200X200/Airtel-Data.jpg',
  },
  {
    id: 'glo',
    name: 'Glo',
    serviceId: 'glo-data',
    logo: 'https://vtpass.com/resources/products/200X200/GLO-Data.jpg',
  },
  {
    id: '9mobile',
    name: '9mobile',
    serviceId: '9mobile-sme-data',
    logo: 'https://vtpass.com/resources/products/200X200/9mobile-SME-Data.jpg',
  },
];

const INITIAL_NETWORKS: NetworkData[] = NETWORKS.map((n) => ({
  ...n,
  loading: false,
  error: null,
  variations: [],
}));

// ─── Helpers ─────────────────────────────────────────────────────────

function extractValidity(name: string): string {
  const parenMatch = name.match(/\((\d+)\s*(Day|Days|Week|Weeks|Month|Year)\)/i);
  if (parenMatch) return `${parenMatch[1]} ${parenMatch[2]}`;

  const named = name.match(/(\d+)\s*(Day|Days|Week|Weeks|Monthly|Yearly)/i);
  if (named) {
    const v = named[2].toLowerCase();
    if (v === 'daily' || v === 'day') return '1 Day';
    if (v === 'weekly' || v === 'week') return '7 Days';
    if (v === 'monthly') return '30 Days';
    if (v === 'yearly') return '1 Year';
    return `${named[1]} ${named[2]}`;
  }

  return '—';
}

function formatPrice(variation: VTUVariation): {
  display: string;
  original: number | null;
} {
  const amount = Number(variation.variation_amount || 0);
  const hasSubsidy = variation.subsidized?.enabled === true;
  return {
    display: `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    original:
      hasSubsidy && variation.subsidized!.original_amount
        ? variation.subsidized!.original_amount
        : null,
  };
}

// ─── Component ───────────────────────────────────────────────────────

export function DataPricingShowcase() {
  const [activeTab, setActiveTab] = useState('mtn');
  const [networks, setNetworks] = useState<NetworkData[]>(INITIAL_NETWORKS);

  const currentNetwork = networks.find((n) => n.id === activeTab) ?? networks[0];

  const fetchVariations = useCallback(async (network: NetworkData) => {
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === network.id ? { ...n, loading: true, error: null } : n,
      ),
    );

    try {
      const data = await vtuService.getVariations(network.serviceId);
      const variations = data?.variations ?? [];
      setNetworks((prev) =>
        prev.map((n) =>
          n.id === network.id ? { ...n, loading: false, variations } : n,
        ),
      );
    } catch {
      setNetworks((prev) =>
        prev.map((n) =>
          n.id === network.id
            ? { ...n, loading: false, error: 'Failed to load plans' }
            : n,
        ),
      );
    }
  }, []);

  useEffect(() => {
    networks.forEach((network) => fetchVariations(network));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeVariations = currentNetwork.variations.slice(0, 12);
  const isLoading = currentNetwork.loading;
  const hasError = currentNetwork.error;

  return (
    <section className="bg-[#100303] px-5 py-16 sm:py-20 md:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Data Pricing
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm leading-6 text-white/60">
            Affordable data plans across all major networks. See the latest
            prices and buy instantly.
          </p>
        </div>

        {/* Network Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
          {networks.map((network) => {
            const isActive = activeTab === network.id;
            return (
              <button
                key={network.id}
                onClick={() => setActiveTab(network.id)}
                className={clsx(
                  'inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all',
                  isActive
                    ? 'border-white/20 bg-white text-gray-900 shadow-sm'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80',
                )}
              >
                <div className="relative h-5 w-5 overflow-hidden rounded">
                  <Image
                    src={network.logo}
                    alt={network.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                {network.name}
              </button>
            );
          })}
        </div>

        {/* Content Card - dark blend */}
        <div className="rounded-xl border border-white/10 bg-[#1c0606] shadow-sm">
          {/* Card Header */}
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1">
                <Image
                  src={currentNetwork.logo}
                  alt={currentNetwork.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {currentNetwork.name} Data Plans
                </h3>
                <p className="text-xs text-white/50">
                  {isLoading
                    ? 'Loading...'
                    : `${activeVariations.length} of ${currentNetwork.variations.length} plans`}
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-white/40" />
              <p className="mt-3 text-sm font-medium text-white/60">
                Loading plans...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && hasError && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <AlertCircle className="h-6 w-6 text-white/40" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">
                Unable to load plans
              </p>
              <p className="mt-1 text-xs text-white/50">{hasError}</p>
              <button
                onClick={() => fetchVariations(currentNetwork)}
                className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !hasError && activeVariations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <AlertCircle className="h-6 w-6 text-white/40" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">
                No plans available
              </p>
              <p className="mt-1 text-xs text-white/50">
                Check back later for updated pricing.
              </p>
            </div>
          )}

          {/* Plans - Mobile Cards */}
          {!isLoading && !hasError && activeVariations.length > 0 && (
            <>
              <div className="divide-y divide-white/10 sm:hidden">
                {activeVariations.map((variation) => {
                  const price = formatPrice(variation);
                  return (
                    <div key={variation.variation_code} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                            {variation.name}
                          </p>
                          <p className="mt-1 text-xs text-white/50">
                            {extractValidity(variation.name)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-white">
                            {price.display}
                          </p>
                          {price.original && (
                            <p className="mt-0.5 text-xs text-white/40 line-through">
                              ₦{price.original.toLocaleString()}.00
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Plans - Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-white/50">
                        Plan Name
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-white/50">
                        Validity
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-white/50 w-40">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {activeVariations.map((variation, idx) => {
                      const price = formatPrice(variation);
                      return (
                        <tr
                          key={variation.variation_code}
                          className={clsx(
                            'transition-colors hover:bg-white/[0.04]',
                            idx % 2 === 1 && 'bg-white/[0.02]',
                          )}
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-white leading-snug max-w-lg truncate">
                              {variation.name}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-white/60">
                              {extractValidity(variation.name)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div>
                              <span className="text-sm font-bold text-white">
                                {price.display}
                              </span>
                              {price.original && (
                                <p className="mt-0.5 text-xs text-white/40 line-through">
                                  ₦{price.original.toLocaleString()}.00
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Footer CTA */}
          {!isLoading && !hasError && activeVariations.length > 0 && (
            <div className="border-t border-white/10 px-5 py-4 sm:px-6">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-white/50">
                  Prices update in real-time. Log in to see personalized rates.
                </p>
                <a
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-white/90"
                >
                  Buy {currentNetwork.name} Data
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
