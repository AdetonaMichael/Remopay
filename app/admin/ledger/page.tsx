'use client';

import React, { useEffect } from 'react';
import { useLedger } from '@/hooks/useLedger';
import { LedgerDashboardOverview } from '@/components/admin/ledger';

export default function LedgerPage() {
  const { fetchDashboard, state } = useLedger();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ledger System</h1>
        <p className="text-gray-600 mt-2">
          Double-entry bookkeeping accounting system for complete financial tracking
        </p>
      </div>

      <LedgerDashboardOverview
        dashboard={state.dashboard}
        isLoading={state.isLoadingDashboard}
      />
    </div>
  );
}
