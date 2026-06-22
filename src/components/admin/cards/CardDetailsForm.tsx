'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { SetCardDetailsRequest } from '@/types/card-admin.types';

interface CardDetailsFormProps {
  cardId: number;
  maskedPan: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SetCardDetailsRequest>) => Promise<void>;
  isLoading?: boolean;
}

export const CardDetailsForm: React.FC<CardDetailsFormProps> = ({
  cardId,
  maskedPan,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ card_number: '', expiry: '', cvv: '', notes: '' });
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.card_number && !/^\d{13,19}$/.test(formData.card_number)) {
      newErrors.card_number = 'Card number must be 13-19 digits';
    }

    if (formData.expiry && !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Expiry must be in MM/YY format';
    }

    if (formData.cvv && !/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    if (!formData.card_number && !formData.expiry && !formData.cvv) {
      newErrors.general = 'At least one field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSuccess(false);
      await onSubmit({
        card_id: cardId,
        card_number: formData.card_number || undefined,
        expiry: formData.expiry || undefined,
        cvv: formData.cvv || undefined,
        notes: formData.notes || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setFormData({ card_number: '', expiry: '', cvv: '', notes: '' });
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrors({
        submit: error?.message || 'Failed to save card details',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Card Details
              </h2>
              <p className="text-xs text-gray-500 mt-1">{maskedPan}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle className="h-4 w-4" />
              Card details saved successfully
            </div>
          )}

          {/* Error Message */}
          {errors.general || errors.submit ? (
            <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{errors.general || errors.submit}</p>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={formData.card_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    card_number: e.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder="e.g., 4288520000000003"
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.card_number
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
                maxLength={19}
              />
              {errors.card_number && (
                <p className="mt-1 text-xs text-red-600">{errors.card_number}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.card_number.length}/19 characters
              </p>
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={formData.expiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 2) {
                    val = val.slice(0, 2) + '/' + val.slice(2, 4);
                  }
                  setFormData({ ...formData, expiry: val });
                }}
                placeholder="MM/YY"
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiry ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
                maxLength={5}
              />
              {errors.expiry && (
                <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
              )}
            </div>

            {/* CVV */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                CVV
              </label>
              <input
                type="password"
                value={formData.cvv}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cvv: e.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder="3 or 4 digits"
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
                maxLength={4}
              />
              {errors.cvv && (
                <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="e.g., Populated for KYC verification"
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
