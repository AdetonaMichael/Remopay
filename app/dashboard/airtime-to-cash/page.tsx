'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Phone,
  AlertCircle,
  ArrowRight,
  Send,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { useUIStore } from '@/store/ui.store';
import { useAirtimeToCash } from '@/hooks/useAirtimeToCash';
import {
  AirtimeCashProvider,
  AirtimeToCashFormData,
} from '@/types/airtime-to-cash.types';

const PROVIDER_LOGOS: Record<string, string> = {
  mtn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/MTN_logo.svg/512px-MTN_logo.svg.png',
  airtel:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Airtel_logo.svg/512px-Airtel_logo.svg.png',
  glo: 'https://upload.wikimedia.org/wikipedia/thumb/0/0f/Globacom_Limited.svg/512px-Globacom_Limited.svg.png',
  '9mobile':
    'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/9mobile_logo.jpg/512px-9mobile_logo.jpg',
};

interface ConversionFormData extends AirtimeToCashFormData {
  phone_number: string;
  provider: string;
  airtime_amount: string;
  settlement_method: 'wallet';
  notes?: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AirtimeToCashPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const {
    adminProviders,
    adminProvidersLoading,
    adminProvidersError,
    fetchAdminProviders,
    transaction,
    isInitiating,
    conversionError,
    initiateConversion,
    clearError,
    resetTransaction,
  } = useAirtimeToCash();

  // Use adminProviders as the source of truth (has real updated logo_url values)
  const providers = adminProviders;

  const [formData, setFormData] = useState<ConversionFormData>({
    phone_number: '',
    provider: '',
    airtime_amount: '',
    settlement_method: 'wallet',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const selectedProvider = useMemo(
    () => providers.find((p) => p.code === formData.provider),
    [providers, formData.provider]
  );

  const airtimeAmount = Number(formData.airtime_amount || 0);

  // Calculate conversion amounts
  const conversionCalculation = useMemo(() => {
    if (!selectedProvider || !airtimeAmount) {
      return {
        serviceFee: 0,
        netAmount: 0,
        cashCredited: 0,
      };
    }

    const serviceFee = airtimeAmount * selectedProvider.service_fee_percentage;
    const netAmount = airtimeAmount - serviceFee;
    const cashCredited = netAmount * selectedProvider.conversion_rate;

    return {
      serviceFee: Math.round(serviceFee),
      netAmount: Math.round(netAmount),
      cashCredited: Math.round(cashCredited),
    };
  }, [selectedProvider, airtimeAmount]);

  // Load providers on mount
  useEffect(() => {
    if (adminProviders.length === 0) {
      fetchAdminProviders();
    }
  }, [fetchAdminProviders, adminProviders.length]);

  // Debug: Log providers and their logos
  useEffect(() => {
    if (providers && providers.length > 0) {
      console.log('[AirtimeToCash Dashboard] Providers loaded from admin endpoint:', providers);
    }
  }, [providers]);

  // Set first provider as default
  useEffect(() => {
    if (Array.isArray(providers) && providers.length > 0 && !formData.provider) {
      setFormData((prev) => ({
        ...prev,
        provider: providers[0].code,
      }));
    }
  }, [providers, formData.provider]);

  // Handle error toast
  useEffect(() => {
    if (conversionError) {
      addToast({
        message: conversionError,
        type: 'error',
      });
    }
  }, [conversionError, addToast]);

  // Handle successful conversion
  useEffect(() => {
    if (transaction && transaction.reference) {
      addToast({
        message: 'Conversion initiated! Please upload proof of transfer.',
        type: 'success',
      });

      // Store transaction reference and redirect
      sessionStorage.setItem('airtimeToCashTransaction', JSON.stringify(transaction));
      router.push(`/dashboard/airtime-to-cash/${transaction.id}/submit-proof`);
    }
  }, [transaction, router, addToast]);

  const getProviderLogo = (provider: AirtimeCashProvider): string => {
    if (provider.logo_url) return provider.logo_url;

    const key = provider.code.toLowerCase();
    return PROVIDER_LOGOS[key] || '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const phone = formData.phone_number.replace(/\s/g, '');
    const amount = Number(formData.airtime_amount);

    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }

    if (!phone) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^0[789]\d{9}$/.test(phone)) {
      newErrors.phone_number = 'Please enter a valid Nigerian phone number';
    }

    if (!formData.airtime_amount) {
      newErrors.airtime_amount = 'Amount is required';
    } else if (amount < (selectedProvider?.min_amount || 100)) {
      newErrors.airtime_amount = `Minimum amount is ₦${selectedProvider?.min_amount || 100}`;
    } else if (amount > (selectedProvider?.max_amount || 50000)) {
      newErrors.airtime_amount = `Maximum amount is ₦${selectedProvider?.max_amount || 50000}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    if (!value || typeof value !== 'string') {
      setFormData((prev) => ({ ...prev, phone_number: '' }));
      return;
    }

    let phone = value.replace(/\D/g, '').slice(0, 11);

    if (phone && phone.length > 7) {
      phone = `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
    } else if (phone && phone.length > 3) {
      phone = `${phone.slice(0, 3)} ${phone.slice(3)}`;
    }

    setFormData((prev) => ({ ...prev, phone_number: phone }));
    setErrors((prev) => ({ ...prev, phone_number: '' }));
  };

  const handleConvert = async () => {
    if (!validateForm()) return;

    const phone = formData.phone_number.replace(/\s/g, '');
    await initiateConversion({
      phone_number: phone,
      provider: formData.provider,
      airtime_amount: formData.airtime_amount,
      settlement_method: 'wallet',
      notes: formData.notes,
    });
  };

  if (adminProvidersLoading) {
    return <CardSkeleton count={3} />;
  }

  if (adminProvidersError) {
    return (
      <Card className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-4">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="font-bold text-red-900">Failed to load providers</p>
            <p className="text-sm text-red-700">{adminProvidersError}</p>
          </div>
        </div>
        <Button
          onClick={() => fetchAdminProviders()}
          className="mt-4 rounded-2xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Retry
        </Button>
      </Card>
    );
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
                  Initiate Conversion
                </p>
                <p className="text-xs text-gray-600">
                  Choose network, amount, and phone number.
                </p>
              </div>
            </div>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-extrabold text-gray-500">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Submit Proof</p>
                <p className="text-xs text-gray-600">
                  Upload transfer screenshot for verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Provider Selection */}
            <div>
              <label className="mb-4 block text-sm font-bold text-gray-900">
                Select Network Provider
              </label>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {providers.map((provider) => {
                  const logoUrl = getProviderLogo(provider);
                  const active = formData.provider === provider.code;

                  return (
                    <button
                      key={provider.code}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          provider: provider.code,
                        }));
                        setErrors((prev) => ({ ...prev, provider: '' }));
                      }}
                      disabled={!provider.is_active}
                      className={`group rounded-2xl border p-4 text-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? 'border-[#d71927] shadow-sm shadow-red-200'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={provider.name}
                            className="max-h-10 max-w-10 object-contain"
                          />
                        ) : (
                          <Send className="text-[#d71927]" size={22} />
                        )}
                      </div>

                      <p className="text-sm font-extrabold text-gray-900">
                        {provider.name.split(' ')[0]}
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
                <p className="mt-3 text-sm font-medium text-red-600">{errors.provider}</p>
              )}
            </div>

            {/* Sender Phone Number */}
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                Your Phone Number (Sender)
              </label>

              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="tel"
                  placeholder="080 1234 5678"
                  value={formData.phone_number}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  className="h-13 rounded-2xl border-gray-200 bg-white pl-12 text-base focus:border-[#d71927]"
                />
              </div>

              {errors.phone_number && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.phone_number}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-600">
                The phone number you'll send airtime from
              </p>
            </div>

            {/* Airtime Amount */}
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                Airtime Amount
              </label>

              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.airtime_amount}
                onChange={(event) => {
                  setFormData((prev) => ({
                    ...prev,
                    airtime_amount: event.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, airtime_amount: '' }));
                }}
                min={selectedProvider?.min_amount}
                max={selectedProvider?.max_amount}
                className="h-13 rounded-2xl border-gray-200 bg-white text-base focus:border-[#d71927]"
              />

              {selectedProvider && (
                <p className="mt-2 text-xs text-gray-600">
                  Min: ₦{selectedProvider.min_amount.toLocaleString()} • Max: ₦
                  {selectedProvider.max_amount.toLocaleString()}
                </p>
              )}

              {/* Quick Amount Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                {[1000, 2500, 5000, 10000, 20000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        airtime_amount: amount.toString(),
                      }));
                      setErrors((prev) => ({ ...prev, airtime_amount: '' }));
                    }}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                      formData.airtime_amount === amount.toString()
                        ? 'bg-[#d71927] text-white shadow-sm shadow-red-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              {errors.airtime_amount && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.airtime_amount}
                </p>
              )}
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                Notes (Optional)
              </label>

              <textarea
                placeholder="Add any notes about this conversion..."
                value={formData.notes || ''}
                onChange={(event) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }));
                }}
                rows={3}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none resize-none"
              />
            </div>

            <Button
              onClick={handleConvert}
              disabled={isInitiating}
              className="h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:opacity-60"
            >
              <span>{isInitiating ? 'Initiating...' : 'Initiate Conversion'}</span>
              {!isInitiating && <ChevronRight className="ml-2" size={20} />}
            </Button>
          </div>

          {/* Right Sidebar: Conversion Summary */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-bold text-gray-900">Conversion Summary</p>

            <div className="mt-5 space-y-4">
              {/* Provider */}
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Provider</span>
                <span className="text-sm font-bold text-gray-900">
                  {selectedProvider?.name || 'Not selected'}
                </span>
              </div>

              {/* Phone Number */}
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span className="text-sm text-gray-600">Your Phone</span>
                <span className="text-sm font-bold text-gray-900">
                  {formData.phone_number || 'Not entered'}
                </span>
              </div>

              {/* Airtime Amount */}
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span className="text-sm text-gray-600">Airtime Amount</span>
                <span className="text-lg font-extrabold text-[#d71927]">
                  ₦{airtimeAmount.toLocaleString()}
                </span>
              </div>

              {/* Breakdown */}
              {airtimeAmount > 0 && selectedProvider && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      {/* Service Fee */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Service Fee ({selectedProvider.service_fee_percentage * 100}%)</span>
                        <span className="font-semibold text-gray-900">
                          -₦{conversionCalculation.serviceFee.toLocaleString()}
                        </span>
                      </div>

                      {/* Net Amount */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Net Amount</span>
                        <span className="font-semibold text-gray-900">
                          ₦{conversionCalculation.netAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Conversion Rate */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rate ({selectedProvider.conversion_rate * 100}%)</span>
                        <span className="font-semibold text-gray-900">
                          × {selectedProvider.conversion_rate}
                        </span>
                      </div>
                    </div>

                    {/* Total Cash Credit */}
                    <div className="mt-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                        You'll Receive
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-green-900">
                        ₦{conversionCalculation.cashCredited.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-green-700">to your wallet</p>
                    </div>
                  </div>
                </>
              )}

              {/* Info Box */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  📝 Next Step
                </p>
                <p className="mt-2 text-xs text-blue-900">
                  After initiating, you'll upload a screenshot of your transfer as proof.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Card>

      <Toast />
    </div>
  );
}
