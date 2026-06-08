'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { useAirtimeToCash } from '@/hooks/useAirtimeToCash';
import { AdminProviderResponse } from '@/types/airtime-to-cash.types';

export default function AdminProvidersPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { adminProviders, adminProvidersLoading, fetchAdminProviders } = useAirtimeToCash();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('[AdminProvidersPage] Fetching providers...');
    fetchAdminProviders();
  }, [fetchAdminProviders]);

  useEffect(() => {
    console.log('[AdminProvidersPage] adminProviders updated:', adminProviders, 'loading:', adminProvidersLoading);
  }, [adminProviders, adminProvidersLoading]);

  const filteredProviders = adminProviders.filter((provider) =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Provider Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage conversion providers, rates, and fees
            </p>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
          <Settings className="text-blue-600" size={24} />
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search providers by name or code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm focus:border-[#d71927] focus:outline-none"
      />

      {/* Providers Grid */}
      {adminProvidersLoading ? (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="animate-spin text-[#d71927]" size={24} />
          <p className="text-gray-600">Loading providers...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <Card className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg font-bold text-gray-900">No providers found</p>
          <p className="mt-2 text-gray-600">
            {searchTerm ? 'Try adjusting your search' : 'No providers available'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <Card
              key={provider.code}
              className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/admin/airtime-to-cash/providers/${provider.code}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{provider.name}</p>
                  <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">{provider.code}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  provider.is_active
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}>
                  {provider.is_active ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-gray-600" size={20} />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                  <p className="font-bold text-gray-900">{parseFloat(String(provider.conversion_rate) || '0').toFixed(4)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">Service Fee</p>
                  <p className="font-bold text-gray-900">{parseFloat(String(provider.service_fee_percentage) || '0').toFixed(4)}%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">Min Amount</p>
                  <p className="font-bold text-gray-900">₦{parseFloat(String(provider.min_amount) || '0').toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">Max Amount</p>
                  <p className="font-bold text-gray-900">₦{parseFloat(String(provider.max_amount) || '0').toLocaleString()}</p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-600">Total Conversions</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{provider.total_conversions || 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-600">Completed Today</p>
                  <p className="mt-1 text-lg font-bold text-green-600">{provider.completed_today || 0}</p>
                </div>
              </div>

              {/* Amount Stats */}
              {provider.total_amount_converted && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={16} />
                    <p className="text-xs text-blue-700">
                      Total Converted: <span className="font-bold">₦{parseFloat(String(provider.total_amount_converted) || '0').toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button className="mt-4 w-full rounded-xl bg-[#d71927] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800">
                Edit Settings
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Toast />
    </div>
  );
}
