'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { useAirtimeToCash } from '@/hooks/useAirtimeToCash';
import { AdminProviderResponse, UpdateProviderRequest } from '@/types/airtime-to-cash.types';

export default function EditProviderPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const { adminProviders, fetchAdminProviders, updateProvider, isUpdatingProvider } =
    useAirtimeToCash();

  const providerCode = params.code as string;
  const provider = adminProviders.find((p) => p.code === providerCode);

  // Form state
  const [conversionRate, setConversionRate] = useState<string>('');
  const [serviceFeePercentage, setServiceFeePercentage] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [receivingNumber, setReceivingNumber] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load providers if not already loaded
  useEffect(() => {
    if (adminProviders.length === 0) {
      fetchAdminProviders();
    }
  }, []);

  // Populate form when provider loads
  useEffect(() => {
    if (provider) {
      setConversionRate(String(provider.conversion_rate || ''));
      setServiceFeePercentage(String(provider.service_fee_percentage || '0'));
      setMinAmount(String(provider.min_amount || ''));
      setMaxAmount(String(provider.max_amount || ''));
      setReceivingNumber(String(provider.receiving_number || ''));
      setLogoUrl(provider.logo_url || '');
      setIsActive(provider.is_active ?? true);
    }
  }, [provider]);

  if (adminProviders.length === 0) {
    return (
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="flex items-center justify-center gap-3 py-20"
      >
        <Loader2 className="animate-spin text-[#d71927]" size={24} />
        <p className="text-gray-600">Loading provider...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-900 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>
        <Card className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg font-bold text-gray-900">Provider not found</p>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!conversionRate || parseFloat(conversionRate) <= 0) {
      addToast({
        message: 'Conversion rate must be greater than 0',
        type: 'error',
      });
      return;
    }

    if (minAmount && maxAmount && parseFloat(minAmount) > parseFloat(maxAmount)) {
      addToast({
        message: 'Min amount must be less than max amount',
        type: 'error',
      });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      const data: UpdateProviderRequest = {
        conversion_rate: parseFloat(conversionRate),
        service_fee_percentage: parseFloat(serviceFeePercentage) || 0,
        is_active: isActive,
      };

      if (minAmount) data.min_amount = parseFloat(minAmount);
      if (maxAmount) data.max_amount = parseFloat(maxAmount);
      if (receivingNumber) data.receiving_number = receivingNumber;
      if (logoUrl) data.logo_url = logoUrl;

      await updateProvider(providerCode, data);

      addToast({
        message: 'Provider updated successfully',
        type: 'success',
      });

      setShowConfirm(false);
      setTimeout(() => router.push('/admin/airtime-to-cash/providers'), 1500);
    } catch (error: any) {
      addToast({
        message: error?.response?.data?.message || 'Failed to update provider',
        type: 'error',
      });
    }
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-900 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Edit Provider
            </h1>
            <p className="mt-2 text-gray-600">
              {provider.name} ({provider.code.toUpperCase()})
            </p>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
          <Settings className="text-blue-600" size={24} />
        </div>
      </div>

      {/* Main Form */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo URL */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Provider Logo URL
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Direct URL to the provider's logo image
            </p>

            {/* Logo Preview */}
            {logoUrl && (
              <div className="mb-4 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Logo Preview</p>
                <img
                  src={logoUrl}
                  alt="Provider logo"
                  className="max-h-20 rounded-lg object-contain"
                  onError={() => {
                    addToast({
                      message: 'Failed to load logo image',
                      type: 'error',
                    });
                  }}
                />
              </div>
            )}

            {/* URL Input */}
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none mb-2"
            />
            
            {logoUrl && (
              <a
                href={logoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#d71927] hover:text-red-800 flex items-center gap-1"
              >
                <ExternalLink size={12} />
                Open in new tab
              </a>
            )}
          </Card>

          {/* Conversion Rate */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Conversion Rate
              <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-3">
              How much cash is credited per naira of airtime
            </p>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={conversionRate}
              onChange={(e) => setConversionRate(e.target.value)}
              placeholder="0.85"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none"
            />
          </Card>

          {/* Service Fee */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Service Fee Percentage
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Percentage fee charged on conversions (0-100%)
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={serviceFeePercentage}
              onChange={(e) => setServiceFeePercentage(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none"
            />
          </Card>

          {/* Min/Max Amounts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border border-gray-200 bg-white p-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Minimum Amount (₦)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="100"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none"
              />
            </Card>

            <Card className="rounded-2xl border border-gray-200 bg-white p-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Maximum Amount (₦)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="1000000"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none"
              />
            </Card>
          </div>

          {/* Receiving Number */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Receiving Number
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Phone number where airtime is received
            </p>
            <input
              type="text"
              value={receivingNumber}
              onChange={(e) => setReceivingNumber(e.target.value)}
              placeholder="+234XXXXXXXXXX"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#d71927] focus:outline-none"
            />
          </Card>

          {/* Status Toggle */}
          <Card className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Provider Status</p>
                <p className="text-xs text-gray-600 mt-1">
                  Enable or disable this provider for new conversions
                </p>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  isActive ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Info Summary */}
          <Card className="rounded-2xl border border-gray-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="text-blue-600" size={20} />
              <p className="font-bold text-blue-900">Provider Summary</p>
            </div>

            <div className="space-y-3 border-b border-blue-200 pb-4">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Provider</span>
                <span className="font-bold text-blue-900">{provider.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Code</span>
                <span className="font-bold text-blue-900">{provider.code.toUpperCase()}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-blue-700">
                Total Conversions: <span className="font-bold text-blue-900">{provider.total_conversions || 0}</span>
              </p>
              <p className="text-blue-700">
                Status: <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 sticky top-6">
            <Button
              onClick={handleSave}
              disabled={isUpdatingProvider}
              className="w-full rounded-xl bg-[#d71927] px-4 py-3 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isUpdatingProvider ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              onClick={() => router.back()}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-100">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900">
                  Confirm Changes
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  You're about to update settings for <strong>{provider.name}</strong>. This will affect new conversions.
                </p>

                <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                  <p className="text-gray-600">
                    Conversion Rate: <span className="font-bold text-gray-900">{conversionRate}</span>
                  </p>
                  <p className="text-gray-600">
                    Service Fee: <span className="font-bold text-gray-900">{serviceFeePercentage}%</span>
                  </p>
                  <p className="text-gray-600">
                    Status: <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  {logoUrl && (
                    <p className="text-gray-600 break-all">
                      Logo URL: <span className="font-bold text-gray-900 text-xs">{logoUrl}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSave}
                disabled={isUpdatingProvider}
                className="rounded-xl bg-[#d71927] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isUpdatingProvider ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Confirm & Save
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Toast />
    </div>
  );
}
