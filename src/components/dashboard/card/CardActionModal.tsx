'use client';

import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Loader, DollarSign, AlertCircle } from 'lucide-react';

interface CardActionModalProps {
  isOpen: boolean;
  action: 'fund' | 'withdraw' | null;
  cardMaskedPan: string | null;
  onClose: () => void;
  onSubmit: (amountInCents: number) => Promise<boolean>;
  isLoading?: boolean;
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

    // Convert dollars to cents
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
            <p className="text-xs text-gray-500 mt-2">
              Amount will be converted to cents internally (e.g., $10.00 = 1000 cents). Minimum $1.00.
            </p>
          </div>

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
