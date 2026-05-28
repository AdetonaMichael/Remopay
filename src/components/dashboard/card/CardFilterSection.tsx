'use client';

import React, { useState } from 'react';
import { CardFilters, CardBrand, CardStatus } from '@/types/card.types';
import { Filter, X } from 'lucide-react';

interface CardFilterSectionProps {
  onFiltersChange: (filters: CardFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
}

/**
 * Card filtering UI component
 * Allows filtering by brand, status, and date
 */
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
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Filter className="h-4 w-4" />
          Filter Cards
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {[brand, status, createdAt].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Brand</label>
            <div className="space-y-2">
              {Object.values(CardBrand).map((brandOption) => (
                <label key={brandOption} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    value={brandOption}
                    checked={brand === brandOption}
                    onChange={(e) => setBrand(e.target.value as CardBrand)}
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">{brandOption}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value=""
                  checked={brand === ''}
                  onChange={() => setBrand('')}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">All brands</span>
              </label>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Status</label>
            <div className="space-y-2">
              {Object.values(CardStatus).map((statusOption) => (
                <label key={statusOption} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={statusOption}
                    checked={status === statusOption}
                    onChange={(e) => setStatus(e.target.value as CardStatus)}
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">{statusOption}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value=""
                  checked={status === ''}
                  onChange={() => setStatus('')}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">All statuses</span>
              </label>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
            <input
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
