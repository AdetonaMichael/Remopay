'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SettlementDashboard } from '@/components/admin/settlement/SettlementDashboard';
import { useSettlement } from '@/hooks/useSettlement';

export default function SettlementDashboardPage() {
  const router = useRouter();
  const {
    state,
    fetchDashboard,
    executeSettlement,
    retryFailed,
  } = useSettlement();

  const [isExecuting, setIsExecuting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleGenerateBatch = useCallback(async () => {
    router.push('/admin/settlements/batches');
  }, [router]);

  const handleExecuteSettlement = useCallback(async () => {
    setIsExecuting(true);
    try {
      await executeSettlement({ dry_run: false });
    } finally {
      setIsExecuting(false);
    }
  }, [executeSettlement]);

  const handleRetryFailed = useCallback(async () => {
    setIsRetrying(true);
    try {
      await retryFailed();
    } finally {
      setIsRetrying(false);
    }
  }, [retryFailed]);

  return (
    <SettlementDashboard
      data={state.dashboard}
      isLoading={state.isLoadingDashboard}
      error={state.dashboardError}
      onRetry={fetchDashboard}
      onGenerateBatch={handleGenerateBatch}
      onExecuteSettlement={handleExecuteSettlement}
      onRetryFailed={handleRetryFailed}
      isExecuting={isExecuting}
      isRetrying={isRetrying}
    />
  );
}
