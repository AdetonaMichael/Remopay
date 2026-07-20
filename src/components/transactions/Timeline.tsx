'use client';

import { Clock, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDateTime } from '@/utils/format.utils';
import type { TransactionTimeline as TimelineType } from '@/types/transaction-detail.types';

interface TimelineProps {
  timeline: TimelineType;
}

interface TimelineEvent {
  label: string;
  timestamp: string | undefined;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export function Timeline({ timeline }: TimelineProps) {
  const events: TimelineEvent[] = [
    {
      label: 'Transaction Initiated',
      timestamp: timeline.created_at,
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Transaction Date',
      timestamp: timeline.transaction_date,
      icon: Clock,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Approved',
      timestamp: timeline.approved_at,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Completed',
      timestamp: timeline.completed_at,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Paid',
      timestamp: timeline.paid_at,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Verified',
      timestamp: timeline.verified_at,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Rejected',
      timestamp: timeline.rejected_at,
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: 'Last Updated',
      timestamp: timeline.updated_at,
      icon: RotateCcw,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
  ];

  const hasEvents = events.some((e) => e.timestamp);

  if (!hasEvents) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-bold text-gray-900">Timeline</h3>
      </div>
      <div className="px-6 py-5">
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200" />

          {events
            .filter((e) => e.timestamp)
            .map((event, idx) => {
              const Icon = event.icon;
              return (
                <div key={event.label} className="relative flex items-start gap-4 pb-5 last:pb-0">
                  {/* Icon */}
                  <div
                    className={clsx(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      event.iconBg,
                    )}
                  >
                    <Icon className={clsx('h-4 w-4', event.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 pt-1.5">
                    <p className="text-sm font-semibold text-gray-900">
                      {event.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDateTime(event.timestamp!)}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
