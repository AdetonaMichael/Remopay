'use client';

import React, { useState } from 'react';
import { CreateCardFormData, CardBrand } from '@/types/card.types';
import { AlertCircle, Plus, Loader } from 'lucide-react';

interface CreateCardFormProps {
  formData: CreateCardFormData;
  onFieldChange: (field: keyof CreateCardFormData, value: any) => void;
  onSubmit: () => Promise<void>;
  errors: Record<string, string>;
  isLoading: boolean;
  onSuccess?: () => void;
}

/**
 * Create virtual card form component
 * Handles card creation with validation and error display
 */
export const CreateCardForm: React.FC<CreateCardFormProps> = ({
  formData,
  onFieldChange,
  onSubmit,
  errors,
  isLoading,
  onSuccess,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError(null);
    // Validate that amount is exactly 5
    const amountValue = Number(formData.amount);
    if (Number.isNaN(amountValue) || amountValue !== 5) {
      setAmountError('Initial amount must be $5');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
      setIsExpanded(false);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpanded = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && Number(formData.amount) !== 5) {
      onFieldChange('amount', '5');
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header (Always Visible) */}
      <button
        onClick={toggleExpanded}
        disabled={isLoading || isSubmitting}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d71927]">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Create New Card</h3>
        </div>
        <div className="text-sm text-gray-500">{isExpanded ? '−' : '+'}</div>
      </button>

      {/* Form Content */}
      {isExpanded && (
        <>
          <div className="border-t border-gray-200"></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Card Brand Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Card Brand</label>
              <div className="space-y-2">
                {Object.values(CardBrand).map((brand) => (
                  <label key={brand} className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="brand"
                      value={brand}
                      checked={formData.brand === brand}
                      onChange={(e) => onFieldChange('brand', e.target.value as CardBrand)}
                      disabled={isLoading || isSubmitting}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{brand}</p>
                      <p className="text-xs text-gray-500">
                        {brand === 'VISA' ? 'Widely accepted worldwide' : 'Universal payment option'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.brand && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errors.brand}</span>
                </div>
              )}
            </div>

            {/* Amount Input (Optional) */}
            <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
                  Initial Amount (USD) <span className="text-gray-500 font-normal">Required — prefilled with $5</span>
                </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">$</span>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.amount}
                    onChange={(e) => onFieldChange('amount', e.target.value)}
                    disabled={true}
                    placeholder="5"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-8 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50"
                />
              </div>
                {(errors.amount || amountError) && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{amountError ?? errors.amount}</span>
                  </div>
                )}
              <p className="text-xs text-gray-500 mt-1">Leave empty for 0 balance. You can add funds later.</p>
            </div>

            {/* Auto Approve Toggle */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Auto Approve</p>
                  <p className="text-xs text-gray-600 mt-0.5">Automatically approve transactions</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoApprove}
                  onChange={(e) => onFieldChange('autoApprove', e.target.checked)}
                  disabled={isLoading || isSubmitting}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full rounded-lg bg-[#d71927] px-4 py-3 text-sm font-semibold text-white hover:#d71927 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Creating Card...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Card
                </>
              )}
            </button>

            {/* General Error Message */}
            {errors.general && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{errors.general}</p>
                </div>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};
