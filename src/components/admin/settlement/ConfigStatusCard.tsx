'use client';

import { CheckCircle2, XCircle, Clock, Users, Building2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { formatDateTime } from '@/utils/format.utils';

interface ConfigStatusCardProps {
  isValid: boolean;
  nextRunAt: string | null;
  lastRunAt: string | null;
  enabled: boolean;
  hasCommissionAccount: boolean;
  hasVtuAccount: boolean;
  recipientsCount: number;
  schedule: string;
}

export const ConfigStatusCard = ({
  isValid,
  nextRunAt,
  lastRunAt,
  enabled,
  hasCommissionAccount,
  hasVtuAccount,
  recipientsCount,
  schedule,
}: ConfigStatusCardProps) => {
  const statusItems = [
    {
      label: 'Configuration Status',
      value: isValid ? 'Valid' : 'Has Errors',
      icon: isValid ? CheckCircle2 : XCircle,
      color: isValid ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
    },
    {
      label: 'Auto-Settlement',
      value: enabled ? 'Enabled' : 'Disabled',
      icon: Clock,
      color: enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50',
    },
    {
      label: 'Commission Account',
      value: hasCommissionAccount ? 'Configured' : 'Not Set',
      icon: Building2,
      color: hasCommissionAccount ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
    },
    {
      label: 'VTU Account',
      value: hasVtuAccount ? 'Configured' : 'Not Set',
      icon: Building2,
      color: hasVtuAccount ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
    },
    {
      label: 'Report Recipients',
      value: `${recipientsCount} recipient${recipientsCount !== 1 ? 's' : ''}`,
      icon: Users,
      color: recipientsCount > 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50',
    },
  ];

  return (
    <Card className="rounded-2xl border border-[#e5e7eb] p-6">
      <div className="flex items-center gap-2 mb-5">
        {isValid ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}
        <h3 className="text-lg font-bold text-[#111827]">Configuration Status</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#6b7280]">{item.label}</p>
                <p className="text-sm font-bold text-[#111827] truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="text-xs font-medium text-[#6b7280]">Schedule (Cron)</p>
          <p className="text-sm font-bold text-[#111827] mt-1 font-mono">{schedule}</p>
        </div>
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="text-xs font-medium text-[#6b7280]">Next Run</p>
          <p className="text-sm font-bold text-[#111827] mt-1">
            {nextRunAt ? formatDateTime(nextRunAt) : 'N/A'}
          </p>
        </div>
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="text-xs font-medium text-[#6b7280]">Last Run</p>
          <p className="text-sm font-bold text-[#111827] mt-1">
            {lastRunAt ? formatDateTime(lastRunAt) : 'N/A'}
          </p>
        </div>
      </div>
    </Card>
  );
};
