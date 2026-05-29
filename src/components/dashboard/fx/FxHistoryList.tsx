'use client';

import { useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { useFx } from '@/hooks/useFx';
import type { FxTransaction, CurrencyAmount } from '@/types/fx.types';

export function FxHistoryList() {
  const { history, historyLoading, historyError, fetchHistory } = useFx();

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Format currency display
  const formatCurrency = (currencyAmount: CurrencyAmount): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(currencyAmount.human_readable_amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      FAILED: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  if (historyLoading && history.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:p-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader size={24} className="animate-spin text-[#d71927]" />
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:p-8">
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{historyError}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:p-8 text-center">
        <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
        <p className="text-gray-600">Start exchanging currencies to see your transaction history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Transaction History</h2>

      <div className="space-y-3">
        {history.map((transaction) => (
          <div
            key={transaction.transaction_reference}
            className="rounded-2xl border border-gray-200 bg-white p-4 lg:p-6 transition hover:border-gray-300 hover:shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {formatCurrency(transaction.source)} {transaction.source.currency}
                  <span className="text-gray-400 mx-2">→</span>
                  {formatCurrency(transaction.target)} {transaction.target.currency}
                </h4>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(transaction.created_at)}
                </p>
              </div>
              {getStatusBadge('COMPLETED')}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Exchange Rate</p>
                <p className="font-semibold text-[#d71927] flex items-center gap-1">
                  <TrendingUp size={16} />
                  {transaction.rate ? transaction.rate.toFixed(6) : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Source Amount</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(transaction.source)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Target Amount</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(transaction.target)}
                </p>
              </div>
            </div>

            {/* Transaction Date */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Last Updated</p>
              <p className="font-mono text-xs text-gray-700">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {historyLoading && (
        <div className="flex justify-center py-4">
          <Loader size={24} className="animate-spin text-[#d71927]" />
        </div>
      )}
    </div>
  );
}
