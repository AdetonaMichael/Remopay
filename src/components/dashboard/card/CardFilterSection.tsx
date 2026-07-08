'use client';

import React, { useState } from 'react';
import { CardFilters, CardBrand, CardStatus } from '@/types/card.types';
import { Filter, X, SlidersHorizontal } from 'lucide-react';

interface CardFilterSectionProps {
  onFiltersChange: (filters: CardFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const CardFilterSection: React.FC<CardFilterSectionProps> = ({
  onFiltersChange,
  onClear,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [brand, setBrand] = useState<CardBrand | ''>('');
  const [status, setStatus] = useState<CardStatus | ''>('');
  const [createdAt, setCreatedAt] = useState('');

  const hasActiveFilters = !!(brand || status || createdAt);

  const handleApplyFilters = () => {
    const filters: CardFilters = {
      ...(brand && { brand: brand as CardBrand }),
      ...(status && { status: status as CardStatus }),
      ...(createdAt && { createdAt }),
    };
    onFiltersChange(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setBrand('');
    setStatus('');
    setCreatedAt('');
    onClear();
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d71927] text-[10px] font-bold text-white">
              {[brand, status, createdAt].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5 shadow-lg">
          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Card Brand
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(CardBrand).map((brandOption) => (
                <button
                  key={brandOption}
                  onClick={() => setBrand(brand === brandOption ? '' : brandOption)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    brand === brandOption
                      ? brandOption === 'VISA'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {brandOption}
                </button>
              ))}
              {brand && (
                <button
                  onClick={() => setBrand('')}
                  className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Card Status
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(CardStatus).map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => setStatus(status === statusOption ? '' : statusOption)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    status === statusOption
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statusOption}
                </button>
              ))}
              {status && (
                <button
                  onClick={() => setStatus('')}
                  className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Created Date
            </label>
            <input
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-[#d71927] px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
