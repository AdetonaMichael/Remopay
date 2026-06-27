'use client';

import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/utils/format.utils';

interface VTUByProduct {
  type: string;
  total_amount: number;
  count: number;
}

interface VTUByStatus {
  status: string;
  count: number;
  total_amount: number;
  total_commission: number;
}

interface WalletTransaction {
  type: string;
  status: string;
  amount: number;
  count: number;
}

interface AdminDashboardChartsProps {
  vtuByProduct: VTUByProduct[];
  vtuByStatus: VTUByStatus[];
  walletTransactions: WalletTransaction[];
}

export function AdminDashboardCharts({ vtuByProduct, vtuByStatus, walletTransactions }: AdminDashboardChartsProps) {
  const maxProduct = vtuByProduct.length > 0 ? Math.max(...vtuByProduct.map(p => p.total_amount)) : 1;
  const statusTotal = vtuByStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product Type Bar Chart */}
      <Card className="p-6 rounded-2xl border border-[#e5e7eb]">
        <h3 className="text-lg font-semibold mb-6">VTU Revenue by Product Type</h3>
        {vtuByProduct.length > 0 ? (
          <div className="space-y-5">
            {vtuByProduct.map((product) => {
              const percentage = (product.total_amount / maxProduct) * 100;
              return (
                <div key={product.type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-[#111827]">{product.type}</span>
                    <span className="text-sm font-bold text-[#4a5ff7]">{formatCurrency(product.total_amount)}</span>
                  </div>
                  <div className="w-full h-3 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4a5ff7] to-[#2563eb] transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="text-xs text-[#6b7280] mt-1">{product.count.toLocaleString()} transactions</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-[#6b7280]">No data available</div>
        )}
      </Card>

      {/* Status Distribution Donut Chart */}
      <Card className="p-6 rounded-2xl border border-[#e5e7eb]">
        <h3 className="text-lg font-semibold mb-6">VTU Status Distribution</h3>
        {vtuByStatus.length > 0 ? (
          <div className="space-y-4">
            {vtuByStatus.map((status) => {
              const percentage = (status.count / statusTotal) * 100;
              const colors: Record<string, { bg: string; text: string; bar: string }> = {
                completed: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
                pending: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
                failed: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' },
              };
              const color = colors[status.status] || { bg: 'bg-gray-50', text: 'text-gray-700', bar: 'bg-gray-500' };

              return (
                <div key={status.status} className={`p-4 rounded-xl ${color.bg}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold capitalize ${color.text}`}>{status.status}</span>
                    <span className={`text-sm font-bold ${color.text}`}>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${color.bar} transition-all`} style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div><span className="text-gray-600">Count:</span> <span className={`font-bold ${color.text}`}>{status.count}</span></div>
                    <div><span className="text-gray-600">Amount:</span> <span className={`font-bold ${color.text}`}>{formatCurrency(status.total_amount)}</span></div>
                    <div><span className="text-gray-600">Commission:</span> <span className={`font-bold ${color.text}`}>{formatCurrency(status.total_commission)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-[#6b7280]">No data available</div>
        )}
      </Card>

      {/* Wallet Transactions */}
      <Card className="p-6 rounded-2xl border border-[#e5e7eb] lg:col-span-2">
        <h3 className="text-lg font-semibold mb-6">Wallet Transaction Breakdown</h3>
        {walletTransactions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {walletTransactions.map((wallet) => (
              <div key={`${wallet.type}-${wallet.status}`} className="p-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafc]">
                <p className="text-sm font-semibold text-[#111827]">{wallet.type}</p>
                <p className="text-xs text-[#6b7280] mt-1 capitalize">{wallet.status}</p>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs text-[#6b7280]">Volume</p>
                    <p className="text-lg font-bold text-[#4a5ff7]">{formatCurrency(wallet.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280]">Transactions</p>
                    <p className="text-base font-bold text-[#111827]">{wallet.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-[#6b7280]">No data available</div>
        )}
      </Card>
    </div>
  );
}
