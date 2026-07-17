'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Loader, DollarSign, AlertCircle, Info } from 'lucide-react';
import { cardService } from '@/services/card.service';

interface CardActionModalProps {
  isOpen: boolean;
  action: 'fund' | 'withdraw' | null;
  cardMaskedPan: string | null;
  onClose: () => void;
  onSubmit: (amountInCents: number) => Promise<boolean>;
  isLoading?: boolean;
}

interface FeeScheduleInfo {
  fee_type: string;
  display_name: string;
  our_fee: { fixed_amount: number; percentage_rate: number; threshold: number | null };
  provider_fee: { calculation_type: string; fixed_amount: number | null; percentage_rate: number | null; threshold: number | null };
}

export const CardActionModal: React.FC<CardActionModalProps> = ({
  isOpen,
  action,
  cardMaskedPan,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feeSchedule, setFeeSchedule] = useState<FeeScheduleInfo | null>(null);

  useEffect(() => {
    if (isOpen && action === 'fund') {
      const fetchFundingFee = async () => {
        try {
          const response = await cardService.getFeeSchedule();
          if (response?.data?.fee_schedule) {
            const fee = response.data.fee_schedule.find(
              (f: any) => f.fee_type === 'funding'
            );
            if (fee) {
              setFeeSchedule({
                fee_type: fee.fee_type,
                display_name: fee.display_name,
                our_fee: fee.our_fee,
                provider_fee: fee.provider_fee,
              });
            }
          }
        } catch {
          // Silently fail
        }
      };
      fetchFundingFee();
    }
  }, [isOpen, action]);

  const parsedAmount = parseFloat(amount) || 0;

  const feeCalculation = useMemo(() => {
    if (!feeSchedule || !parsedAmount || parsedAmount < 1) return null;

    // Calculate provider fee
    const providerFeeConfig = feeSchedule.provider_fee;
    const threshold = providerFeeConfig.threshold;
    let providerFee = 0;
    let providerDesc = '';

    if (providerFeeConfig.calculation_type === 'fixed' && providerFeeConfig.fixed_amount) {
      providerFee = providerFeeConfig.fixed_amount;
      providerDesc = `Flat $${providerFee.toFixed(2)}`;
    } else if (threshold && parsedAmount >= threshold) {
      // Above threshold: 2% for Maplerad
      providerFee = parsedAmount * 0.02;
      providerDesc = `2% of $${parsedAmount.toFixed(2)} (≥ $${threshold.toFixed(2)})`;
    } else if (threshold && parsedAmount < threshold) {
      // Below threshold: $1 fixed
      providerFee = 1;
      providerDesc = `$${providerFee.toFixed(2)} (< $${threshold.toFixed(2)})`;
    }

    // Calculate our fee
    const ourFeeConfig = feeSchedule.our_fee;
    let ourFee = 0;
    let ourDesc = '';

    if (ourFeeConfig.fixed_amount > 0) {
      ourFee = ourFeeConfig.fixed_amount;
      ourDesc = `Fixed $${ourFee.toFixed(4)}`;
    } else if (ourFeeConfig.percentage_rate > 0) {
      ourFee = parsedAmount * (ourFeeConfig.percentage_rate / 100);
      ourDesc = `${ourFeeConfig.percentage_rate}% of $${parsedAmount.toFixed(2)}`;
    }

    const totalFee = providerFee + ourFee;
    const totalDeduction = parsedAmount + totalFee;

    return { providerFee, ourFee, totalFee, totalDeduction, providerDesc, ourDesc };
  }, [feeSchedule, parsedAmount]);

  if (!isOpen || !action) return null;

  const isFunding = action === 'fund';
  const maskedDisplay = cardMaskedPan
    ? `**** ${cardMaskedPan.slice(-4)}`
    : 'Card';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (parsedAmount < 1) {
      setError('Minimum amount is $1.00');
      return;
    }

    const amountInCents = Math.round(parsedAmount * 100);

    setSubmitting(true);
    const success = await onSubmit(amountInCents);
    setSubmitting(false);

    if (success) {
      setAmount('');
      onClose();
    }
  };

  const handleClose = () => {
    if (!submitting && !isLoading) {
      setAmount('');
      setError(null);
      onClose();
    }
  };

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#f9fafb] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                {isFunding ? (
                  <ArrowDownLeft className="h-5 w-5 text-gray-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isFunding ? 'Fund Card' : 'Withdraw from Card'}
                </h3>
                <p className="text-sm text-gray-500">{maskedDisplay}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preset Amounts */}
          {isFunding && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Quick Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(String(preset));
                      setError(null);
                    }}
                    disabled={submitting || isLoading}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      amount === String(preset)
                        ? 'bg-[#d71927] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Amount */}
          <div>
            <label htmlFor="modal-amount" className="block text-sm font-bold text-gray-900 mb-2">
              Custom Amount (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="modal-amount"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                disabled={submitting || isLoading}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-lg font-bold text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:opacity-60 transition-colors"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Fee Display for Funding */}
          {isFunding && feeCalculation && parsedAmount >= 1 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-amber-900">Fee Breakdown</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-amber-800">
                    <span>Funding amount:</span>
                    <span className="text-right font-bold text-gray-900">${parsedAmount.toFixed(2)}</span>
                    <span>Provider fee ({feeCalculation.providerDesc}):</span>
                    <span className="text-right font-bold text-gray-700">${feeCalculation.providerFee.toFixed(2)}</span>
                    <span>Our fee:</span>
                    <span className="text-right font-bold text-[#d71927]">${feeCalculation.ourFee.toFixed(4)}</span>
                    <span className="border-t border-amber-300 pt-1">Total to deduct:</span>
                    <span className="text-right font-bold text-gray-900 border-t border-amber-300 pt-1">
                      ${feeCalculation.totalDeduction.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting || isLoading}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isLoading || !amount}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 bg-[#d71927] hover:bg-[#b0141f] hover:shadow-lg hover:shadow-red-200"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isFunding ? (
                <>
                  <ArrowDownLeft className="h-4 w-4" />
                  Fund Card
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4" />
                  Withdraw
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
