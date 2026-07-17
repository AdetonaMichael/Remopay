'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FeeConfigEditForm } from '@/components/admin/card-fees/FeeConfigEditForm';
import { cardFeeService } from '@/services/card-fee.service';
import type { FeeConfig, UpdateFeeConfigRequest } from '@/types/card-fee.types';
import { FEE_TYPE_META } from '@/types/card-fee.types';

export default function FeeTypeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feeType = params.feeType as string;

  const [fee, setFee] = useState<FeeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchFee = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cardFeeService.getFee(feeType);
      if (response?.data?.fee) {
        setFee(response.data.fee);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load fee configuration');
    } finally {
      setLoading(false);
    }
  }, [feeType]);

  useEffect(() => {
    fetchFee();
  }, [fetchFee]);

  const handleSave = async (data: UpdateFeeConfigRequest) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await cardFeeService.updateFee(feeType, data);
      if (response?.data?.fee) {
        setFee(response.data.fee);
        setSuccess('Fee configuration updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update fee configuration');
    } finally {
      setSaving(false);
    }
  };

  const meta = FEE_TYPE_META[feeType as keyof typeof FEE_TYPE_META];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/cards/fees')}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {meta?.label || fee?.display_name || feeType}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {meta?.description || 'Configure fee settings'}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <FeeConfigEditForm
        fee={fee}
        isLoading={loading}
        isSaving={saving}
        error={error}
        success={success}
        onBack={() => router.push('/admin/cards/fees')}
        onSave={handleSave}
      />
    </div>
  );
}
