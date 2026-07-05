'use client';

import { clsx } from 'clsx';
import type { SettlementBatchStatus, SettlementTransactionStatus } from '@/types/settlement.types';

type StatusValue = SettlementBatchStatus | SettlementTransactionStatus | string;

interface SettlementStatusBadgeProps {
  status: StatusValue;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  // Batch statuses
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', classes: 'bg-blue-100 text-blue-800' },
  settled: { label: 'Settled', classes: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', classes: 'bg-red-100 text-red-800' },
  partially_settled: { label: 'Partially Settled', classes: 'bg-orange-100 text-orange-800' },
  // Transaction statuses
  success: { label: 'Success', classes: 'bg-green-100 text-green-800' },
  // Additional
  approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-800' },
  generated: { label: 'Generated', classes: 'bg-indigo-100 text-indigo-800' },
  included: { label: 'Included', classes: 'bg-gray-100 text-gray-800' },
  excluded: { label: 'Excluded', classes: 'bg-gray-100 text-gray-800' },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-medium',
};

export const SettlementStatusBadge = ({
  status,
  size = 'md',
  className,
}: SettlementStatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full',
        config.classes,
        sizeClasses[size],
        className
      )}
    >
      <span
        className={clsx(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'settled' || status === 'success' ? 'bg-green-500' : '',
          status === 'pending' ? 'bg-yellow-500' : '',
          status === 'processing' ? 'bg-blue-500' : '',
          status === 'failed' ? 'bg-red-500' : '',
          status === 'partially_settled' ? 'bg-orange-500' : '',
        )}
      />
      {config.label}
    </span>
  );
};
