'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Phone,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { vtuService } from '@/services/vtu.service';
import { useUIStore } from '@/store/ui.store';
import { VTUProvider } from '@/types/vtu.types';

const PROVIDER_LOGOS: Record<string, string> = {
  mtn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/MTN_logo.svg/512px-MTN_logo.svg.png',
  airtel:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Airtel_logo.svg/512px-Airtel_logo.svg.png',
  glo: 'https://upload.wikimedia.org/wikipedia/thumb/0/0f/Globacom_Limited.svg/512px-Globacom_Limited.svg.png',
  '9mobile':
    'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/9mobile_logo.jpg/512px-9mobile_logo.jpg',
};

interface AirtimeFormData {
  provider: string;
  phone: string;
  amount: string;
}

export default function AirtimePage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [providers, setProviders] = useState<VTUProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<AirtimeFormData>({
    provider: '',
    phone: '',
    amount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.serviceID === formData.provider),
    [providers, formData.provider]
  );

  const amountValue = Number(formData.amount || 0);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await vtuService.getAirtimeProviders();

        if (Array.isArray(response) && response.length > 0) {
          setProviders(response);
          setFormData((prev) => ({
            ...prev,
            provider: prev.provider || response[0].serviceID,
          }));
        } else {
          setProviders([]);
        }
      } catch {
        addToast({
          message: 'Failed to load airtime providers. Please try again.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [addToast]);

  const getProviderLogo = (provider: VTUProvider): string => {
    if (provider.image) return provider.image;

    const key = provider.serviceID.split('-')[0].toLowerCase();
    return PROVIDER_LOGOS[key] || '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const phone = formData.phone.replace(/\s/g, '');
    const amount = Number(formData.amount);

    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0[789]\d{9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (amount < 100) {
      newErrors.amount = 'Minimum amount is ₦100';
    } else if (amount > 1000000) {
      newErrors.amount = 'Maximum amount is ₦1,000,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    let phone = value.replace(/\D/g, '').slice(0, 11);

    if (phone.length > 7) {
      phone = `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
    } else if (phone.length > 3) {
      phone = `${phone.slice(0, 3)} ${phone.slice(3)}`;
    }

    setFormData((prev) => ({ ...prev, phone }));
    setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    const dataToStore = {
      ...formData,
      providerName: selectedProvider?.name || formData.provider,
    };

    sessionStorage.setItem('airtimeFormData', JSON.stringify(dataToStore));
    router.push('/dashboard/airtime/review');
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
                  Select Provider & Amount
                </p>
                <p className="text-xs text-gray-600">
                  Choose network, recipient, and recharge value.
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
                  const logoUrl = getProviderLogo(provider);
                  const active = formData.provider === provider.serviceID;

                  return (
                    <button
                      key={provider.serviceID}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          provider: provider.serviceID,
                        }));
                        setErrors((prev) => ({ ...prev, provider: '' }));
                      }}
                      className={`group rounded-2xl border p-4 text-center transition-all ${
                        active
                          ? 'border-[#d71927]  shadow-sm shadow-red-200'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={provider.name}
                            width={42}
                            height={42}
                            className="object-contain"
                          />
                        ) : (
                          <Phone className="text-[#d71927]" size={22} />
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
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.provider}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                Recipient Phone Number
              </label>

              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="tel"
                  placeholder="080 1234 5678"
                  value={formData.phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  className="h-13 rounded-2xl border-gray-200 bg-white pl-12 text-base focus:border-[#d71927]"
                />
              </div>

              {errors.phone && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                Amount
              </label>

              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(event) => {
                  setFormData((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                min="100"
                max="1000000"
                className="h-13 rounded-2xl border-gray-200 bg-white text-base focus:border-[#d71927]"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                {[100, 500, 1000, 2500, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        amount: amount.toString(),
                      }));
                      setErrors((prev) => ({ ...prev, amount: '' }));
                    }}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                      formData.amount === amount.toString()
                        ? 'bg-[#d71927] text-white shadow-sm shadow-red-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              {errors.amount && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.amount}
                </p>
              )}
            </div>

            <Button
              fullWidth
              onClick={handleContinue}
              className="h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420]"
            >
              <span>Continue to Payment</span>
              <ChevronRight className="ml-2" size={20} />
            </Button>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-bold text-gray-900">Recharge Summary</p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Provider</span>
                <span className="text-sm font-bold text-gray-900">
                  {selectedProvider?.name || 'Not selected'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="text-sm font-bold text-gray-900">
                  {formData.phone || 'Not entered'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-lg font-extrabold text-[#d71927]">
                  ₦{amountValue.toLocaleString()}
                </span>
              </div>
            </div>

     
          </aside>
        </div>
      </Card>

      <Toast />
    </div>
  );
}