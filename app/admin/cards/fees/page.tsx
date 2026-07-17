'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ReceiptText, RefreshCw } from 'lucide-react';
import { FeeConfigTable } from '@/components/admin/card-fees/FeeConfigTable';
import { cardFeeService } from '@/services/card-fee.service';
import type { FeeConfig, FeeType } from '@/types/card-fee.types';
import { FEE_TYPE_META } from '@/types/card-fee.types';

export default function CardFeesPage() {
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cardFeeService.listFees();
      if (response?.data?.fees) {
        setFees(response.data.fees);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load fee configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleToggle = async (feeType: FeeType) => {
    setTogglingId(feeType);
    try {
      await cardFeeService.toggleFee(feeType);
      await fetchFees();
    } catch (err: any) {
      console.error('Toggle failed:', err);
    } finally {
      setTogglingId(null);
    }
  };

  // Stats
  const activeCount = fees.filter((f) => f.is_active).length;
  const totalCount = fees.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Card Fee Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure fees for virtual card operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cards/fees/transactions"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <ReceiptText size={16} />
            Fee History
          </Link>
          <button
            onClick={fetchFees}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">Total Fees</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">Active</p>
          <p className="mt-1 text-2xl font-black text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">Disabled</p>
          <p className="mt-1 text-2xl font-black text-gray-400">{totalCount - activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">Currency</p>
          <p className="mt-1 text-2xl font-black text-gray-900">USD</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={fetchFees}
            className="mt-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Fee Config Table */}
      <FeeConfigTable
        fees={fees}
        isLoading={loading}
        onToggle={handleToggle}
        togglingId={togglingId}
      />
    </div>
  );
}
