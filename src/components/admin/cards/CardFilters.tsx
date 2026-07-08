'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { CardAdminFilters } from '@/types/card-admin.types';

interface CardFiltersProps {
  onFiltersChange: (filters: CardAdminFilters) => void;
  isLoading?: boolean;
}

export const CardFilters: React.FC<CardFiltersProps> = ({
  onFiltersChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = React.useState<CardAdminFilters>({});
  const [localSearch, setLocalSearch] = React.useState('');

  const handleStatusChange = (status: string) => {
    const newFilters = {
      ...filters,
      status: status === 'all' ? undefined : (status as any),
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDetailsChange = (hasDetails: string) => {
    const newFilters = {
      ...filters,
      has_details:
        hasDetails === 'all'
          ? undefined
          : hasDetails === 'yes'
            ? true
            : false,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    const newFilters = {
      ...filters,
      search: value || undefined,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setLocalSearch('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.status !== undefined ||
    filters.has_details !== undefined ||
    filters.user_id !== undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, user ID, or card ID..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Details Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details Status
            </label>
            <select
              value={
                filters.has_details === undefined
                  ? 'all'
                  : filters.has_details
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) => handleDetailsChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Cards</option>
              <option value="yes">With Details</option>
              <option value="no">Missing Details</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
