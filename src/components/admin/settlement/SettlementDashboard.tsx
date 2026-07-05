'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Layers, TrendingUp, AlertTriangle, RefreshCw, Plus, Play, RotateCcw } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { StatCard } from './StatCard';
import { ConfigStatusCard } from './ConfigStatusCard';
import { ActionButton } from './ActionButton';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { SettlementDashboardData } from '@/types/settlement.types';
import { formatCurrency, formatDate } from '@/utils/format.utils';

interface SettlementDashboardProps {
  data: SettlementDashboardData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onGenerateBatch: () => Promise<void>;
  onExecuteSettlement: () => Promise<void>;
  onRetryFailed: () => Promise<void>;
  isExecuting: boolean;
  isRetrying: boolean;
}

export const SettlementDashboard = ({
  data,
  isLoading,
  error,
  onRetry,
  onGenerateBatch,
  onExecuteSettlement,
  onRetryFailed,
  isExecuting,
  isRetrying,
}: SettlementDashboardProps) => {
  const router = useRouter();

  const config = data?.config;
  const latestBatch = data?.latest_batch;
  const batchStats = data?.batches;
  const txStats = data?.transactions;
  const monthly = data?.monthly_totals;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center rounded-2xl border border-[#e5e7eb] p-12 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="text-lg font-bold text-[#111827] mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-[#6b7280] mb-6">{error}</p>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Settlement Management</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Configure, monitor, and manage the automated settlement system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config?.is_valid ? 'success' : 'danger'}>
            {config?.is_valid ? 'Config Valid' : 'Config Errors'}
          </Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Configuration"
          value={config?.is_valid ? 'Valid' : 'Invalid'}
          icon={Settings}
          iconColor={config?.is_valid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
        />
        <StatCard
          label="Total Batches"
          value={batchStats?.total ?? 0}
          icon={Layers}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Monthly Settled"
          value={formatCurrency(monthly?.total_settled ?? 0)}
          icon={TrendingUp}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Pending / Failed"
          value={`${batchStats?.pending ?? 0} / ${batchStats?.failed ?? 0}`}
          icon={AlertTriangle}
          iconColor={
            (batchStats?.failed ?? 0) > 0 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
          }
        />
      </div>

      {/* Config Status */}
      {config && (
        <ConfigStatusCard
          isValid={config.is_valid}
          nextRunAt={config.next_run_at}
          lastRunAt={config.last_run_at}
          enabled={config.enabled}
          hasCommissionAccount={config.has_commission_account}
          hasVtuAccount={config.has_vtu_account}
          recipientsCount={config.recipients_count}
          schedule={config.schedule}
        />
      )}

      {/* Latest Batch */}
      {latestBatch && (
        <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <div className="border-b border-[#e5e7eb] bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827]">Latest Batch</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/settlements/batches/${latestBatch.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div>
                <p className="text-lg font-bold text-[#111827]">{latestBatch.batch_reference}</p>
                <div className="flex items-center gap-3 mt-1">
                  <SettlementStatusBadge status={latestBatch.status} />
                  <span className="text-sm text-[#6b7280]">
                    {formatDate(latestBatch.settlement_date)}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f8fafc] p-4">
                <p className="text-xs font-medium text-[#6b7280]">VTU Purchases</p>
                <p className="text-lg font-bold text-[#111827] mt-1">
                  {formatCurrency(parseFloat(latestBatch.total_vtu_purchases))}
                </p>
              </div>
              <div className="rounded-xl bg-[#f8fafc] p-4">
                <p className="text-xs font-medium text-[#6b7280]">Remopay Commission</p>
                <p className="text-lg font-bold text-[#111827] mt-1">
                  {formatCurrency(parseFloat(latestBatch.total_remopay_commission))}
                </p>
              </div>
              <div className="rounded-xl bg-[#f8fafc] p-4">
                <p className="text-xs font-medium text-[#6b7280]">Items</p>
                <p className="text-lg font-bold text-[#111827] mt-1">{latestBatch.items_count}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Transactions Summary */}
      {txStats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-700">Total Transactions</p>
            <p className="text-xl font-bold text-blue-900 mt-1">{txStats.total}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-medium text-green-700">Successful</p>
            <p className="text-xl font-bold text-green-900 mt-1">{txStats.successful}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-medium text-red-700">Failed</p>
            <p className="text-xl font-bold text-red-900 mt-1">{txStats.failed}</p>
          </div>
          <div className="rounded-xl bg-yellow-50 p-4">
            <p className="text-xs font-medium text-yellow-700">Pending</p>
            <p className="text-xl font-bold text-yellow-900 mt-1">{txStats.pending}</p>
          </div>
        </div>
      )}

      {/* Monthly Totals */}
      {monthly && (
        <Card className="rounded-2xl border border-[#e5e7eb] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Monthly Totals</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Commission</p>
              <p className="text-xl font-bold text-[#111827] mt-1">{formatCurrency(monthly.commission)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b7280]">VTU Principal</p>
              <p className="text-xl font-bold text-[#111827] mt-1">{formatCurrency(monthly.vtu_principal)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Total Settled</p>
              <p className="text-xl font-bold text-[#111827] mt-1">{formatCurrency(monthly.total_settled)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="rounded-2xl border border-[#e5e7eb] p-6">
        <h3 className="text-lg font-bold text-[#111827] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            label="Generate Batch"
            icon={Plus}
            onClick={onGenerateBatch}
          />
          <ActionButton
            label="Execute Settlement"
            icon={Play}
            variant="secondary"
            onClick={onExecuteSettlement}
            isLoading={isExecuting}
            confirmMessage="This will process the settlement cycle. Continue?"
            confirmTitle="Execute Settlement"
          />
          <ActionButton
            label="Retry Failed"
            icon={RotateCcw}
            variant="secondary"
            onClick={onRetryFailed}
            isLoading={isRetrying}
            confirmMessage="This will retry all failed settlement transactions. Continue?"
            confirmTitle="Retry Failed"
          />
          <Button
            variant="outline"
            onClick={() => router.push('/admin/settlements/config')}
          >
            <Settings className="h-4 w-4" />
            Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
};
