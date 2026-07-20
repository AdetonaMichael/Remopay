'use client';

import { clsx } from 'clsx';

// ─── Status Configuration ──────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Pending' },
  processing: { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500',   label: 'Processing' },
  success:    { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'Success' },
  completed:  { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'Completed' },
  failed:     { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500',    label: 'Failed' },
  reversed:   { bg: 'bg-gray-100',   text: 'text-gray-800',   dot: 'bg-gray-500',   label: 'Reversed' },
  refunded:   { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Refunded' },
  approved:   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'Approved' },
  rejected:   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500',    label: 'Rejected' },
  delivered:  { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500',   label: 'Delivered' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || '';
  const config = STATUS_STYLES[normalized] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-400',
    label: status || 'Unknown',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        config.bg,
        config.text,
        sizeClasses[size],
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
