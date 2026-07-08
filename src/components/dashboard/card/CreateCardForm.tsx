'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CreateCardFormData, CardBrand } from '@/types/card.types';
import { Plus, Loader, AlertCircle, CreditCard, Info } from 'lucide-react';

interface CreateCardFormProps {
  formData: CreateCardFormData;
  onFieldChange: (field: keyof CreateCardFormData, value: any) => void;
  onSubmit: () => Promise<void>;
  errors: Record<string, string>;
  isLoading: boolean;
  onSuccess?: () => void;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (next && (!formData.amount || formData.amount === '0')) {
      onFieldChange('amount', '5');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        disabled={isLoading || isSubmitting}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 disabled:opacity-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#d71927] to-[#ff4444] shadow-lg shadow-red-200">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-900">Create New Card</h3>
            <p className="text-sm text-gray-500 mt-0.5">Get a virtual USD card instantly ($3 fee applies)</p>
          </div>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform duration-300 ${
          isExpanded ? 'border-[#d71927] bg-[#d71927] rotate-45' : 'border-gray-300'
        }`}>
          <Plus className={`h-4 w-4 transition-colors ${isExpanded ? 'text-white' : 'text-gray-500'}`} />
        </div>
      </button>

      {/* Form Content */}
      {isExpanded && (
        <>
          <div className="border-t border-gray-100" />
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Card Brand Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Card Brand</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(CardBrand).map((brand) => (
                  <label
                    key={brand}
                    className={`
                      relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${formData.brand === brand
                        ? brand === 'VISA'
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-orange-500 bg-orange-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="brand"
                      value={brand}
                      checked={formData.brand === brand}
                      onChange={(e) => onFieldChange('brand', e.target.value as CardBrand)}
                      disabled={isLoading || isSubmitting}
                      className="sr-only"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 p-1.5">
                      <Image
                        src={brand === 'VISA' ? '/visa.webp' : '/mastercard.svg'}
                        alt={brand}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{brand}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {brand === 'VISA' ? 'Global acceptance' : 'Widely accepted'}
                      </p>
                    </div>
                    {formData.brand === brand && (
                      <div className={`absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center ${
                        brand === 'VISA' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}>
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.brand && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{errors.brand}</span>
                </div>
              )}
            </div>

            {/* Initial Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-bold text-gray-900 mb-2">
                Initial Amount <span className="font-normal text-gray-500">(USD, optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">$</span>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => onFieldChange('amount', e.target.value)}
                  disabled={isLoading || isSubmitting}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-10 pr-4 text-base font-semibold text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:opacity-60 transition-colors"
                />
              </div>
              {errors.amount && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{errors.amount}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Info className="h-3.5 w-3.5" />
                You can add funds anytime after creation. Minimum $1 for funding.
              </div>
            </div>

            {/* Auto Approve Toggle */}
            <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-gray-900">Auto Approve</p>
                  <p className="text-xs text-gray-600 mt-0.5">Automatically approve all card transactions</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.autoApprove}
                    onChange={(e) => onFieldChange('autoApprove', e.target.checked)}
                    disabled={isLoading || isSubmitting}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#d71927] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </div>
              </label>
            </div>

            {/* Fee Notice */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Card Creation Fee</p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    A one-time $3.00 fee will be deducted from your wallet balance upon card creation.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#d71927] to-[#ff4444] px-6 py-3.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Creating Card...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Create Virtual Card
                </>
              )}
            </button>

            {/* Error Display */}
            {errors.general && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-900">{errors.general}</p>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};
