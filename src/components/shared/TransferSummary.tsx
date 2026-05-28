/**
 * TransferSummary Component
 * Displays transfer details for review before confirmation
 */

'use client';

import { RecipientUser, Recipient, TransferType } from '@/types/transfer.types';
import { formatAmount } from '@/utils/transfer.utils';
import { User, Building2 } from 'lucide-react';

interface TransferSummaryProps {
  type: TransferType;
  recipient: RecipientUser | Recipient | null;
  amount?: number | null;
  description?: string;
  walletBalance: number;
  bankName?: string;
  accountNumber?: string;
}

export const TransferSummary = ({
  type,
  recipient,
  amount = 0,
  description,
  walletBalance,
  bankName,
  accountNumber,
}: TransferSummaryProps) => {
  const validAmount = amount || 0;
  const balanceAfter = (walletBalance || 0) - validAmount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900">Transfer Summary</h3>

      {/* Recipient Info */}
      <div className="rounded-2xl bg-gray-50 px-4 py-3">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {type === TransferType.REMOPAY ? (
              <>
                {recipient && 'avatar' in recipient && recipient.avatar ? (
                  <img
                    src={recipient.avatar}
                    alt={recipient.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#d71927]/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-[#d71927]" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Recipient</p>
                  <p className="font-semibold text-gray-900 mt-1">{recipient?.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {'phone_number' in recipient!
                      ? recipient?.phone_number
                      : recipient?.email}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#d71927]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Recipient Bank</p>
                  <p className="font-semibold text-gray-900 mt-1">{bankName}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Account: {accountNumber || 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Account Name</p>
              <p className="font-medium text-gray-900">
                {type === TransferType.REMOPAY
                  ? recipient?.name
                  : (accountNumber ? 'Verified Account' : 'Not Verified')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Details */}
      <div className="rounded-2xl bg-gray-50 px-4 py-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Transfer Amount</p>
            <p className="text-2xl font-extrabold text-[#d71927]">{formatAmount(validAmount)}</p>
          </div>

          {description && (
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Description</p>
              <p className="font-medium text-gray-900 text-right max-w-xs">{description}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Current Balance</p>
              <p className="text-gray-900 text-sm font-semibold">{formatAmount(walletBalance)}</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Deduct Amount</p>
              <p className="text-gray-900 text-sm font-semibold">- {formatAmount(validAmount)}</p>
            </div>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Balance After</p>
              <p className="font-bold text-[#d71927] text-lg">{formatAmount(balanceAfter)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if balance is low after transfer */}
      {balanceAfter < 1000 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-900 text-sm font-medium">
            ⚠️ Your wallet balance will be low after this transfer. Consider funding your wallet.
          </p>
        </div>
      )}
    </div>
  );
};
