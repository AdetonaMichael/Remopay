'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  Tv,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { vtuService } from '@/services/vtu.service';
import { useUIStore } from '@/store/ui.store';
import { VTUProvider, VTUVariation } from '@/types/vtu.types';

interface TVFormData {
  provider: string;
  providerName: string;
  variation?: string;
  variationCode?: string;
  variationName?: string;
  variationAmount?: string;
  smartcard?: string;
}

type TVStep = 'select' | 'plan' | 'verify';

export default function TVPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [providers, setProviders] = useState<VTUProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [variations, setVariations] = useState<VTUVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [smartcard, setSmartcard] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [step, setStep] = useState<TVStep>('select');
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
        const data = await vtuService.getTVProviders();

        if (Array.isArray(data) && data.length > 0) {
          setProviders(data);
          setSelectedProvider(data[0].serviceID);
        } else {
          addToast({
            message: 'Failed to load TV providers',
            type: 'error',
          });
        }
      } catch {
        addToast({
          message: 'Failed to load TV providers. Please try again.',
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
        setSmartcard('');

        const response = await vtuService.getTVVariations(selectedProvider);

        if (response?.variations && Array.isArray(response.variations)) {
          setVariations(response.variations);
        } else {
          addToast({
            message: 'Failed to load TV plans',
            type: 'error',
          });
        }
      } catch {
        addToast({
          message: 'Failed to load TV plans. Please try again.',
          type: 'error',
        });
      } finally {
        setLoadingVariations(false);
      }
    };

    fetchVariations();
  }, [selectedProvider, addToast]);

  const validateSmartcard = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 30;
  };

  const handleContinue = () => {
    setErrors({});

    if (step === 'select') {
      if (!selectedProvider) {
        setErrors({ provider: 'Please select a TV provider' });
        return;
      }

      setStep('plan');
      return;
    }

    if (step === 'plan') {
      if (!selectedVariation) {
        setErrors({ variation: 'Please select a subscription plan' });
        return;
      }

      setStep('verify');
      return;
    }

    if (!smartcard.trim()) {
      setErrors({ smartcard: 'Smartcard or IUC number is required' });
      return;
    }

    if (!validateSmartcard(smartcard)) {
      setErrors({
        smartcard: 'Please enter a valid smartcard or IUC number',
      });
      return;
    }

    if (!activeProvider || !activeVariation) {
      addToast({
        message: 'Invalid selection. Please try again.',
        type: 'error',
      });
      return;
    }

    const dataToStore: TVFormData = {
      provider: selectedProvider,
      providerName: activeProvider.name,
      variation: selectedVariation,
      variationCode: activeVariation.variation_code,
      variationName: activeVariation.name,
      variationAmount: activeVariation.variation_amount,
      smartcard: smartcard.replace(/\D/g, ''),
    };

    sessionStorage.setItem('tvFormData', JSON.stringify(dataToStore));
    router.push('/dashboard/tv/review');
  };

  const handleBack = () => {
    setErrors({});

    if (step === 'verify') {
      setStep('plan');
      return;
    }

    if (step === 'plan') {
      setStep('select');
      return;
    }

    router.push('/dashboard');
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
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            {[
              ['select', '1', 'Provider', 'Choose TV provider'],
              ['plan', '2', 'Plan', 'Select subscription'],
              ['verify', '3', 'Smartcard', 'Enter IUC number'],
              ['pay', '4', 'Pay', 'Confirm payment'],
            ].map(([key, number, title, subtitle], index) => {
              const active =
                key === step ||
                (step === 'plan' && key === 'select') ||
                (step === 'verify' && ['select', 'plan', 'verify'].includes(key));

              return (
                <div key={key} className="flex flex-1 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                      active
                        ? 'bg-[#d71927] text-white'
                        : 'border border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    {number}
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-600">{subtitle}</p>
                  </div>

                  {index < 3 && (
                    <div className="hidden h-[2px] flex-1 bg-gray-200 lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {step === 'select' && (
              <div>
                <label className="mb-4 block text-sm font-bold text-gray-900">
                  Select TV Provider
                </label>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                        className={`rounded-2xl border p-4 text-center transition-all ${
                          active
                            ? 'border-[#d71927]  shadow-sm shadow-red-200'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                          {provider.image ? (
                            <Image
                              src={provider.image}
                              alt={provider.name}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <Tv className="text-[#d71927]" size={26} />
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
            )}

            {step === 'plan' && (
              <div>
                <label className="mb-4 block text-sm font-bold text-gray-900">
                  Select Subscription Plan
                </label>

                {loadingVariations ? (
                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10">
                    <div className="text-center">
                      <Loader2
                        className="mx-auto animate-spin text-[#d71927]"
                        size={26}
                      />
                      <p className="mt-3 text-sm font-semibold text-gray-600">
                        Loading subscription plans...
                      </p>
                    </div>
                  </div>
                ) : variations.length > 0 ? (
                  <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
                    {variations.map((variation) => {
                      const active =
                        selectedVariation === variation.variation_code;

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
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-extrabold text-gray-900">
                                {variation.name}
                              </p>
                              <p className="mt-1 text-xs font-medium text-gray-500">
                                Code: {variation.variation_code}
                              </p>
                            </div>

                            <p className="shrink-0 text-lg font-extrabold text-[#d71927]">
                              ₦
                              {Number(
                                variation.variation_amount || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                    <Tv className="mx-auto text-gray-400" size={28} />
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
            )}

            {step === 'verify' && (
              <div>
                <label className="mb-4 block text-sm font-bold text-gray-900">
                  Smartcard / IUC Number
                </label>

                <Input
                  type="text"
                  placeholder="Enter smartcard or IUC number"
                  value={smartcard}
                  onChange={(event) => {
                    setSmartcard(event.target.value.replace(/\D/g, ''));
                    setErrors({});
                  }}
                  className="h-13 rounded-2xl border-gray-200 bg-white text-base focus:border-[#d71927]"
                />

                {errors.smartcard && (
                  <p className="mt-3 text-sm font-medium text-red-600">
                    {errors.smartcard}
                  </p>
                )}

                <div className="mt-5 rounded-2xl border border-red-200  p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d71927]">
                    Verification
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Your smartcard will be verified on the review page before
                    payment is authorized.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="h-13 rounded-2xl font-bold sm:w-[160px]"
              >
                <ChevronLeft className="mr-2" size={18} />
                Back
              </Button>

              <Button
                fullWidth
                onClick={handleContinue}
                className="h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420]"
              >
                {step === 'verify' ? 'Continue to Review' : 'Continue'}
                <ChevronRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-bold text-gray-900">TV Summary</p>

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
                  Plan
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-gray-900">
                  {activeVariation?.name || 'Not selected'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Smartcard / IUC
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {smartcard || 'Not entered'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Amount
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#d71927]">
                  ₦
                  {Number(
                    activeVariation?.variation_amount || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d71927]">
                Secure Flow
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Provider, subscription plan and smartcard verification are
                checked before final payment.
              </p>
            </div>
          </aside>
        </div>
      </Card>

      <Toast />
    </div>
  );
}