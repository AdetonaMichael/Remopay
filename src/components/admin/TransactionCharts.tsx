'use client';

import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/utils/format.utils';

interface StatusDistribution {
  name: string;
  value: number;
  fill: string;
}

interface TypeDistribution {
  name: string;
  amount: number;
  count: number;
}

interface TransactionChartsProps {
  statusDistribution: StatusDistribution[];
  typeDistribution: TypeDistribution[];
}

export function TransactionCharts({ statusDistribution, typeDistribution }: TransactionChartsProps) {
  const totalStatus = statusDistribution.reduce((sum, s) => sum + s.value, 0);
  const maxType = typeDistribution.length > 0 ? Math.max(...typeDistribution.map(t => t.amount)) : 1;

  const statusColors: Record<string, { bg: string; text: string; fill: string }> = {
    Completed: { bg: 'bg-green-50', text: 'text-green-700', fill: '#10b981' },
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', fill: '#f59e0b' },
    Failed: { bg: 'bg-red-50', text: 'text-red-700', fill: '#ef4444' },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status Distribution Gauge Cards */}
      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Transaction Status Distribution</h3>
        {statusDistribution.length > 0 ? (
          <div className="space-y-4">
            {statusDistribution.map((status) => {
              const percentage = (status.value / totalStatus) * 100;
              const color = statusColors[status.name] || { bg: 'bg-gray-50', text: 'text-gray-700', fill: '#6b7280' };

              return (
                <div key={status.name} className={`p-4 rounded-xl ${color.bg}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${color.text}`}>{status.name}</span>
                    <span className={`text-lg font-bold ${color.text}`}>{status.value}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${percentage}%`, backgroundColor: color.fill }}
                    />
                  </div>
                  <p className={`text-xs mt-2 ${color.text}`}>{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-slate-500">
            No transaction data available
          </div>
        )}
      </Card>

      {/* Transaction Type Bar Chart */}
      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Volume by Transaction Type</h3>
        {typeDistribution.length > 0 ? (
          <div className="space-y-5">
            {typeDistribution.map((type) => {
              const percentage = (type.amount / maxType) * 100;
              return (
                <div key={type.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-900">{type.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#4a5ff7]">{formatCurrency(type.amount)}</p>
                      <p className="text-xs text-slate-500">{type.count} txns</p>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4a5ff7] to-[#2563eb] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-slate-500">
            No transaction data available
          </div>
        )}
      </Card>
    </div>
  );
}
