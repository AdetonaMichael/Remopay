/**
 * Ledger Dashboard Overview Component
 * Date: June 12, 2026
 * 
 * Main dashboard component showing:
 * - Key account balances
 * - System metrics
 * - Quick actions
 */

'use client';

import React from 'react';
import { LedgerDashboard } from '@/types/ledger.types';
import { Card } from '@/components/shared/Card';
import { useUIStore } from '@/store/ui.store';

interface LedgerDashboardOverviewProps {
  dashboard: LedgerDashboard | null;
  isLoading: boolean;
}

export const LedgerDashboardOverview: React.FC<LedgerDashboardOverviewProps> = ({
  dashboard,
  isLoading,
}) => {
  if (isLoading || !dashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-24 bg-gray-200 animate-pulse"><div /></Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Balance',
      value: `₦${dashboard.total_balance.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      color: 'text-blue-600',
    },
    {
      label: 'Active Accounts',
      value: dashboard.total_active_accounts.toString(),
      color: 'text-green-600',
    },
    {
      label: "Today's Entries",
      value: dashboard.todays_entries_count.toString(),
      color: 'text-purple-600',
    },
    {
      label: 'Pending Batches',
      value: dashboard.pending_batches.toString(),
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Account Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dashboard.accounts_summary.clearing && (
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-600 text-sm">
                {dashboard.accounts_summary.clearing.account_name}
              </p>
              <p className="text-xl font-semibold text-blue-600 mt-1">
                ₦{dashboard.accounts_summary.clearing.balance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          )}

          {dashboard.accounts_summary.commission && (
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-600 text-sm">
                {dashboard.accounts_summary.commission.account_name}
              </p>
              <p className="text-xl font-semibold text-green-600 mt-1">
                ₦{dashboard.accounts_summary.commission.balance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          )}

          {dashboard.accounts_summary.provider_payable && (
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-gray-600 text-sm">
                {dashboard.accounts_summary.provider_payable.account_name}
              </p>
              <p className="text-xl font-semibold text-orange-600 mt-1">
                ₦{dashboard.accounts_summary.provider_payable.balance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          )}

          {dashboard.accounts_summary.charges_reserve && (
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-gray-600 text-sm">
                {dashboard.accounts_summary.charges_reserve.account_name}
              </p>
              <p className="text-xl font-semibold text-purple-600 mt-1">
                ₦{dashboard.accounts_summary.charges_reserve.balance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* System Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Last Generated</span>
            <span className="text-gray-900 font-medium">
              {new Date(dashboard.generated_at).toLocaleString('en-NG')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">System Status</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Operational
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
