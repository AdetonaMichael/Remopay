'use client';

import React, { useState } from 'react';
import { useLedger } from '@/hooks/useLedger';
import { LedgerReportsGenerator } from '@/components/admin/ledger';

export default function ReportsPage() {
  const { state } = useLedger();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ledger Reports</h1>
        <p className="text-gray-600 mt-2">
          Generate financial reports including trial balance and account ledgers
        </p>
      </div>

      <LedgerReportsGenerator isLoading={state.isLoadingReports} />
    </div>
  );
}
