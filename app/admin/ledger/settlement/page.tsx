'use client';

import React, { useEffect, useState } from 'react';
import { useLedger } from '@/hooks/useLedger';
import { SettlementBatchesList } from '@/components/admin/ledger';
import { BatchFilters } from '@/types/ledger.types';

export default function SettlementBatchesPage() {
  const { fetchSettlementBatches, state } = useLedger();
  const [filters, setFilters] = useState<BatchFilters>({
    per_page: 50,
    page: 1,
  });

  useEffect(() => {
    fetchSettlementBatches(filters);
  }, [filters, fetchSettlementBatches]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settlement Batches</h1>
        <p className="text-gray-600 mt-2">
          View and manage daily settlement batches for financial settlement
        </p>
      </div>

      <SettlementBatchesList
        batches={state.batches}
        isLoading={state.isLoadingBatches}
        pagination={state.batchesPagination}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
