'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/shared/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  className,
}: StatCardProps) => {
  return (
    <Card
      className={clsx(
        'rounded-2xl border border-[#e5e7eb] p-6 transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-[#111827] mt-2 truncate">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span
                className={clsx(
                  'text-xs font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            iconColor || 'bg-[#f0f2ff] text-[#8a96ff]'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};
