import { useState, useCallback, useEffect } from 'react';
import type { FilterField } from '@/components/shared/FilterPanel';

export interface UseFiltersOptions {
  fields: FilterField[];
  onFiltersChange?: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
}

interface UseFiltersReturn {
  // State
  isOpen: boolean;
  filters: Record<string, any>;
  isLoading: boolean;
  hasActiveFilters: boolean;

  // Actions
  openFilters: () => void;
  closeFilters: () => void;
  applyFilters: (values: Record<string, any>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;

  // Utilities
  getQueryParams: () => Record<string, any>;
  getActiveFilterCount: () => number;
}

/**
 * Custom hook for managing filter state and logic
 * Replaces scattered useState/handleFilter/clearFilter implementations
 *
 * @example
 * ```tsx
 * const { isOpen, openFilters, closeFilters, filters, applyFilters } = useFilters({
 *   fields: [
 *     { id: 'search', label: 'Search', type: 'text', placeholder: 'Search users...' },
 *     { id: 'status', label: 'Status', type: 'select', options: [...] }
 *   ],
 *   onFiltersChange: (filters) => fetchUsers(filters),
 * });
 * ```
 */
export function useFilters({
  fields,
  onFiltersChange,
  initialFilters = {},
}: UseFiltersOptions): UseFiltersReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.id] = initialFilters[field.id] ?? field.defaultValue ?? '';
    });
    return initial;
  });

  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== '' && val !== false
  );

  const getActiveFilterCount = useCallback(() => {
    return Object.values(filters).filter((val) => val !== '' && val !== false)
      .length;
  }, [filters]);

  const getQueryParams = useCallback(() => {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false) {
        params[key] = value;
      }
    });
    return params;
  }, [filters]);

  const openFilters = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeFilters = useCallback(() => {
    setIsOpen(false);
  }, []);

  const applyFilters = useCallback(
    (values: Record<string, any>) => {
      setFilters(values);
      setIsOpen(false);
      onFiltersChange?.(values);
    },
    [onFiltersChange]
  );

  const resetFilters = useCallback(() => {
    const resetValues: Record<string, any> = {};
    fields.forEach((field) => {
      resetValues[field.id] = field.defaultValue ?? '';
    });
    setFilters(resetValues);
    onFiltersChange?.(resetValues);
  }, [fields, onFiltersChange]);

  return {
    isOpen,
    filters,
    isLoading,
    hasActiveFilters,
    openFilters,
    closeFilters,
    applyFilters,
    resetFilters,
    setLoading: setIsLoading,
    getQueryParams,
    getActiveFilterCount,
  };
}

/**
 * Hook to sync filters to URL search params (optional)
 * Useful for bookmarkable, shareable filter states
 */
export function useUrlFilters(filterKeys: string[]) {
  const [filters, setFilters] = useState<Record<string, any>>(() => {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const result: Record<string, any> = {};
    filterKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        result[key] = value;
      }
    });
    return result;
  });

  const updateFilters = useCallback(
    (newFilters: Record<string, any>) => {
      setFilters(newFilters);

      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    },
    []
  );

  return [filters, updateFilters] as const;
}
