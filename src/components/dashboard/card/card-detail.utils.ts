import React from 'react';
import { Check, Snowflake, Ban, Clock } from 'lucide-react';

export interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  ACTIVE: { label: 'Active', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', Icon: Check },
  FROZEN: { label: 'Frozen', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', Icon: Snowflake },
  DISABLED: { label: 'Disabled', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', Icon: Ban },
  TERMINATED: { label: 'Terminated', badgeBg: 'bg-red-50', badgeText: 'text-red-700', Icon: Ban },
};

export function getStatusConfig(status: string): StatusConfig {
  return (
    STATUS_CONFIG[status] || {
      label: status,
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-700',
      Icon: Clock,
    }
  );
}

export function formatDate(value: string, withTime = false): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
