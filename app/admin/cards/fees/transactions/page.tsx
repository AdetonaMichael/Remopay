'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { FeeTransactionsTable } from '@/components/admin/card-fees/FeeTransactionsTable';
import { cardFeeService } from '@/services/card-fee.service';
import type { FeeTransactionsResponse } from '@/types/card-fee.types';

export default function FeeTransactionsPage() {
  const [data, setData] = useState<FeeTransactionsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    fee_type?: string;
    operation_type?: string;
    date_from?: string;
    date_to?: string;
  }>({});

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cardFeeService.getTransactions(filters, page);
      if (response?.data) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load fee transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/cards/fees"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Fee Transaction History</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track all fee collections across card operations
            </p>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <FeeTransactionsTable
        data={data}
        isLoading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
      />
    </div>
  );
}
