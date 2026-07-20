'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { vtuService } from '@/services/vtu.service';
import { useUIStore } from '@/store/ui.store';
import { VTUProvider } from '@/types/vtu.types';

interface DataFormData {
  provider: string;
  providerName: string;
  variation?: string;
  variationCode?: string;
  variationName?: string;
  variationAmount?: string;
  subsidizedAmount?: string;
  savings?: number;
}

export default function DataPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [providers, setProviders] = useState<VTUProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [variations, setVariations] = useState<any[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.serviceID === selectedProvider),
    [providers, selectedProvider]
  );

  const activeVariation = useMemo(
    () =>
      variations.find(
        (variation) => variation.variation_code === selectedVariation
      ),
    [variations, selectedVariation]
  );

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const data = await vtuService.getDataProviders();

        if (Array.isArray(data) && data.length > 0) {
          setProviders(data);
          setSelectedProvider(data[0].serviceID);
        } else {
          setProviders([]);
          addToast({
            message: 'Failed to load data providers',
            type: 'error',
          });
        }
      } catch {
        addToast({
          message: 'Failed to load data providers. Please try again.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [addToast]);

  useEffect(() => {
    if (!selectedProvider) return;

    const fetchVariations = async () => {
      try {
        setLoadingVariations(true);
        setVariations([]);
        setSelectedVariation('');

        const response = await vtuService.getDataVariations(selectedProvider);

        if (response?.variations && Array.isArray(response.variations)) {
          setVariations(response.variations);
        } else {
          setVariations([]);
          addToast({
            message: 'Failed to load data plans',
            type: 'error',
          });
        }
      } catch {
        addToast({
          message: 'Failed to load data plans. Please try again.',
          type: 'error',
        });
      } finally {
        setLoadingVariations(false);
      }
    };

    fetchVariations();
  }, [selectedProvider, addToast]);

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedProvider) {
      newErrors.provider = 'Please select a provider';
    }

    if (!selectedVariation) {
      newErrors.variation = 'Please select a data plan';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const provider = providers.find((item) => item.serviceID === selectedProvider);
    const variation = variations.find(
      (item) => item.variation_code === selectedVariation
    );

    if (!provider || !variation) {
      addToast({
        message: 'Invalid selection. Please try again.',
        type: 'error',
      });
      return;
    }

    const hasSubsidy = variation.subsidized?.enabled === true;
    const isZeroAmount = Number(variation.variation_amount || 0) === 0;

    const dataToStore: DataFormData = {
      provider: selectedProvider,
      providerName: provider.name,
      variation: selectedVariation,
      variationCode: variation.variation_code,
      variationName: variation.name,
      variationAmount: variation.variation_amount,
      subsidizedAmount: hasSubsidy && !isZeroAmount
        ? String(variation.subsidized?.subsidized_amount ?? variation.variation_amount)
        : undefined,
      savings: hasSubsidy && !isZeroAmount
        ? Number(variation.subsidized?.savings ?? 0)
        : undefined,
    };

    sessionStorage.setItem('dataFormData', JSON.stringify(dataToStore));
    router.push('/dashboard/data/review');
  };

  if (loading) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>



      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Select Provider & Plan
                </p>
                <p className="text-xs text-gray-600">
                  Choose network and data bundle.
                </p>
              </div>
            </div>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-extrabold text-gray-500">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Confirm & Pay</p>
                <p className="text-xs text-gray-600">
                  Review and authorize transaction.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div>
              <label className="mb-4 block text-sm font-bold text-gray-900">
                Select Network Provider
              </label>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {providers.map((provider) => {
                  const active = selectedProvider === provider.serviceID;

                  return (
                    <button
                      key={provider.serviceID}
                      type="button"
                      onClick={() => {
                        setSelectedProvider(provider.serviceID);
                        setErrors({});
                      }}
                      className={`group relative rounded-2xl border p-4 text-center transition-all ${
                        active
                          ? 'border-[#d71927]  shadow-sm shadow-red-200'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                        {provider.image ? (
                          <Image
                            src={provider.image}
                            alt={provider.name}
                            width={42}
                            height={42}
                            className="object-contain"
                          />
                        ) : (
                          <Wifi className="text-[#d71927]" size={22} />
                        )}
                      </div>

                      <p className="text-sm font-extrabold text-gray-900">
                        {provider.name}
                      </p>

                      <div
                        className={`mx-auto mt-3 h-1.5 w-8 rounded-full transition ${
                          active ? 'bg-[#d71927]' : 'bg-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {errors.provider && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.provider}
                </p>
              )}
            </div>

            <div>
              <label className="mb-4 block text-sm font-bold text-gray-900">
                Select Data Plan
              </label>

              {loadingVariations ? (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10">
                  <div className="text-center">
                    <Loader2
                      className="mx-auto animate-spin text-[#d71927]"
                      size={26}
                    />
                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      Loading available data plans...
                    </p>
                  </div>
                </div>
              ) : variations.length > 0 ? (
                <div className="grid max-h-[460px] gap-3 overflow-y-auto pr-1">
                  {variations.map((variation: any) => {
                    const active =
                      selectedVariation === variation.variation_code;
                    const hasSubsidy = variation.subsidized?.enabled === true;
                    const isZeroAmount =
                      Number(variation.variation_amount || 0) === 0;

                    return (
                      <button
                        key={variation.variation_code}
                        type="button"
                        onClick={() => {
                          setSelectedVariation(variation.variation_code);
                          setErrors({});
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? 'border-[#d71927] shadow-sm shadow-red-200'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        } ${
                          hasSubsidy && !isZeroAmount
                            ? 'border-green-200 bg-green-50/30'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-gray-900">
                              {variation.name}
                            </p>
                            <p className="mt-1 text-xs font-medium text-gray-500">
                              Code: {variation.variation_code}
                            </p>

                            {/* Savings badge - only when subsidy active */}
                            {hasSubsidy &&
                              !isZeroAmount &&
                              (variation.subsidized?.savings ?? 0) > 0 && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                  💰 Save ₦
                                  {Number(
                                    variation.subsidized?.savings ?? 0,
                                  ).toLocaleString()}
                                </span>
                              )}
                          </div>

                          <div className="shrink-0 text-right">
                            {/* Subsidized (payable) price - when subsidy is ON, show subsidized_amount */}
                            <p
                              className={`text-lg font-extrabold ${
                                hasSubsidy && !isZeroAmount
                                  ? 'text-green-600'
                                  : 'text-[#d71927]'
                              }`}
                            >
                              ₦
                              {(
                                hasSubsidy && !isZeroAmount
                                  ? Number(variation.subsidized?.subsidized_amount ?? variation.variation_amount)
                                  : Number(variation.variation_amount || 0)
                              ).toLocaleString()}
                            </p>

                            {/* Strikethrough original price - show variation_amount when subsidy is active */}
                            {hasSubsidy && !isZeroAmount && (
                              <p className="mt-0.5 text-xs font-medium text-gray-400 line-through">
                                ₦
                                {Number(
                                  variation.variation_amount,
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                  <Wifi className="mx-auto text-gray-400" size={28} />
                  <p className="mt-3 text-sm font-semibold text-gray-600">
                    No plans available for this provider.
                  </p>
                </div>
              )}

              {errors.variation && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.variation}
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-bold text-gray-900">Data Summary</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Provider
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {activeProvider?.name || 'Not selected'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Selected Plan
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-gray-900">
                  {activeVariation?.name || 'Not selected'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Amount
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#d71927]">
                  ₦
                  {(() => {
                    const hasSubsidy = activeVariation?.subsidized?.enabled === true;
                    const isZeroAmount = Number(activeVariation?.variation_amount || 0) === 0;
                    const displayAmount = hasSubsidy && !isZeroAmount
                      ? Number(activeVariation?.subsidized?.subsidized_amount ?? activeVariation?.variation_amount)
                      : Number(activeVariation?.variation_amount || 0);
                    return displayAmount.toLocaleString();
                  })()}
                </p>
                {activeVariation?.subsidized?.enabled === true && Number(activeVariation?.variation_amount || 0) > 0 && (
                  <p className="mt-1 text-xs font-medium text-gray-400 line-through">
                    ₦{Number(activeVariation.variation_amount).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <Button
              fullWidth
              onClick={handleContinue}
              disabled={!selectedProvider || !selectedVariation}
              className="mt-6 h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Continue to Review</span>
              <ChevronRight className="ml-2" size={20} />
            </Button>

            <div className="mt-5 rounded-2xl border border-red-200  p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d71927]">
                Delivery
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Your data purchase will be processed after PIN authorization.
              </p>
            </div>
          </aside>
        </div>
      </Card>

      <Toast />
    </div>
  );
}