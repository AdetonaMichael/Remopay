'use client';

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader,
  RefreshCw,
} from 'lucide-react';
import { CardTransactionData, TransactionsPaginationData } from './card-detail.types';
import { formatDate } from './card-detail.utils';
import { CardCopyButton } from './CardCopyButton';

interface CardTransactionsTableProps {
  transactions: CardTransactionData[];
  pagination: TransactionsPaginationData;
  isLoading: boolean;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onGenerateStatement: () => void;
}

export const CardTransactionsTable: React.FC<CardTransactionsTableProps> = ({
  transactions,
  pagination,
  isLoading,
  copiedField,
  onCopy,
  onRefresh,
  onPageChange,
  onGenerateStatement,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-black text-gray-900">
          Transactions
          {pagination.total_records > 0 && (
            <span className="font-normal text-gray-500 text-sm ml-1.5">({pagination.total_records})</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onGenerateStatement}
            disabled={transactions.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#d71927] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Generate card statement
          </button>
        </div>
      </div>

      {isLoading && transactions.length === 0 ? (
        <div className="p-10 text-center">
          <Loader className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-10 text-center">
          <Clock className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-900">No transactions yet</p>
          <p className="text-xs text-gray-500 mt-1">Transactions will appear here once the card is used.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Ref ID</th>
                  <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Description</th>
                  <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Entry</th>
                  <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left font-bold text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-600">{txn.id}</span>
                        <CardCopyButton value={txn.id} label={`ref-${txn.id}`} copiedField={copiedField} onCopy={onCopy} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-bold ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {txn.type === 'DEBIT' ? '-' : '+'}${txn.amount.toFixed(2)}
                      </span>
                      {txn.fee > 0 && (
                        <span className="block text-[10px] text-gray-400 mt-0.5">Fee: ${txn.fee.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-[260px]">
                      <span className="text-gray-800 truncate block">{txn.description}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          txn.type === 'DEBIT' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {txn.type === 'DEBIT' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                        {txn.type === 'DEBIT' ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          txn.status === 'SUCCESSFUL'
                            ? 'bg-emerald-50 text-emerald-700'
                            : txn.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(txn.created_at, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {pagination.current_page} of {pagination.total_pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1 || isLoading}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.total_pages || isLoading}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};