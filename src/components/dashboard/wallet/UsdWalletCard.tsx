'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  ArrowRightLeft,
  CreditCard,
} from 'lucide-react';
import type { UsdWalletState } from '@/types/usd-wallet.types';

interface UsdWalletCardProps {
  state: UsdWalletState;
  formattedBalance: string;
  onRefresh: () => void;
  onConvertNgnToUsd: () => void;
  onConvertUsdToNgn: () => void;
  onFundCard: () => void;
}

const TXN_LABELS: Record<string, string> = {
  credit: 'Credit',
  debit: 'Debit',
  conversion_in: 'Conversion In',
  conversion_out: 'Conversion Out',
  card_funding: 'Card Funding',
  refund: 'Refund',
};

function label(type: string) { return TXN_LABELS[type] || type; }
function isCredit(type: string) { return ['credit', 'conversion_in', 'refund'].includes(type); }

export const UsdWalletCard: React.FC<UsdWalletCardProps> = ({
  state, formattedBalance, onRefresh, onConvertNgnToUsd, onConvertUsdToNgn, onFundCard,
}) => {
  if (state.isLoading && state.balance === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-gray-200" />
              <div className="h-8 w-36 rounded bg-gray-200" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-gray-200" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-14 rounded-2xl bg-gray-100" />
            <div className="h-14 rounded-2xl bg-gray-100" />
            <div className="h-14 rounded-2xl bg-gray-100" />
          </div>
          <div className="h-24 rounded-2xl bg-gray-100" />
        </div>
      </Card>
    );
  }

  const recent = state.recentTransactions.slice(0, 5);

  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Error */}
      {state.error && (
        <div className="flex items-center gap-2 bg-red-50 border-b border-red-200 px-6 py-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <span className="flex-1 text-sm font-medium text-red-700 truncate">{state.error}</span>
          <button onClick={onRefresh} className="flex-shrink-0 rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Balance section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d71927]">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">USD Balance</p>
              <p className="text-3xl font-black text-gray-900">{formattedBalance}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {state.lastSyncedAt ? `Synced ${new Date(state.lastSyncedAt).toLocaleString()}` : 'Not yet synced'}
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={state.isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${state.isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <button onClick={onConvertNgnToUsd}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-3 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <ArrowRightLeft className="h-5 w-5 text-[#d71927]" />
            <span className="text-[11px] font-bold text-gray-700">NGN → USD</span>
          </button>
          <button onClick={onConvertUsdToNgn}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-3 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <ArrowRightLeft className="h-5 w-5 text-[#d71927]" />
            <span className="text-[11px] font-bold text-gray-700">USD → NGN</span>
          </button>
          <button onClick={onFundCard}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-3 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <CreditCard className="h-5 w-5 text-[#d71927]" />
            <span className="text-[11px] font-bold text-gray-700">Fund Card</span>
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="border-t border-gray-100 p-6 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Recent USD Activity</h3>
          {recent.length > 0 && <span className="text-xs text-gray-400">Latest {recent.length}</span>}
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-gray-200">
              <DollarSign className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-900">No USD transactions yet</p>
            <p className="text-xs text-gray-500">Convert NGN to USD to get started</p>
            <button onClick={onConvertNgnToUsd}
              className="mt-1 rounded-xl bg-[#d71927] px-4 py-2 text-xs font-bold text-white hover:bg-[#b81420] transition-colors">
              Convert NGN → USD
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(txn => {
              const credit = isCredit(txn.type);
              const amt = `$${(txn.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
              return (
                <div key={txn.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${credit ? 'bg-green-100' : 'bg-red-100'}`}>
                      {credit ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{label(txn.type)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-extrabold flex-shrink-0 ml-3 ${credit ? 'text-green-600' : 'text-red-500'}`}>
                    {credit ? '+' : '-'}{amt}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
