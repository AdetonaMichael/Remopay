'use client';

/**
 * useCards Hook
 * Handles virtual card creation, listing, filtering, and state management
 */

import { useCallback, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cardService } from '@/services/card.service';
import {
  VirtualCard,
  CreateCardRequest,
  CreateCardFormData,
  CardFilters,
  CardListState,
  CardBrand,
  CardStatus,
  CardCurrency,
  CardType,
} from '@/types/card.types';

interface UseCardsOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: any) => void;
}

export const useCards = (options?: UseCardsOptions) => {
  const { user } = useAuthStore();
  const { addToast, setIsLoading } = useUIStore();

  // ═════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════

  const [cardListState, setCardListState] = useState<CardListState>({
    cards: [],
    pagination: {
      current_page: 1,
      total_pages: 0,
      total_records: 0,
      page_size: 10,
    },
    isLoading: false,
    error: null,
    filters: {},
    currentPage: 1,
  });

  const [createFormData, setCreateFormData] = useState<CreateCardFormData>({
    brand: CardBrand.VISA,
    autoApprove: true,
    amount: '0',
  });

  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // ═════════════════════════════════════════════════════════════════
  // FORM DATA MANAGEMENT
  // ═════════════════════════════════════════════════════════════════

  /**
   * Update create form field
   */
  const updateCreateFormField = useCallback(
    (field: keyof CreateCardFormData, value: any) => {
      setCreateFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field
      if (createFormErrors[field]) {
        setCreateFormErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    },
    [createFormErrors]
  );

  /**
   * Reset create form to default state
   */
  const resetCreateForm = useCallback(() => {
    setCreateFormData({
      brand: CardBrand.VISA,
      autoApprove: true,
      amount: '0',
    });
    setCreateFormErrors({});
  }, []);

  // ═════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═════════════════════════════════════════════════════════════════

  /**
   * Validate create card form
   */
  const validateCreateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate amount
    const amount = parseFloat(createFormData.amount || '0');
    if (isNaN(amount) || amount < 0) {
      errors.amount = 'Amount must be a non-negative number';
    }

    // Validate brand
    if (!createFormData.brand || !Object.values(CardBrand).includes(createFormData.brand)) {
      errors.brand = 'Please select a valid card brand';
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [createFormData]);

  // ═════════════════════════════════════════════════════════════════
  // CARD OPERATIONS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Create a new virtual card
   */
  const createCard = useCallback(async () => {
    try {
      // Validate form
      if (!validateCreateForm()) {
        addToast({ type: 'error', message: 'Please fix form errors' });
        return;
      }

      setIsCreatingCard(true);
      setIsLoading(true);

      // Build request payload
      const payload: CreateCardRequest = {
        currency: CardCurrency.USD,
        type: CardType.VIRTUAL,
        auto_approve: createFormData.autoApprove,
        brand: createFormData.brand,
        amount: Math.max(0, parseInt(createFormData.amount) || 0),
      };

      // Call API
      const response = await cardService.createCard(payload);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to create card');
      }

      // Success
      const successMessage = response.message || 'Card created successfully';
      addToast({ type: 'success', message: successMessage });
      options?.onSuccess?.(successMessage);

      // Reset form
      resetCreateForm();

      // Refresh cards list
      await fetchCards(1, cardListState.pagination.page_size, cardListState.filters);

      return response.data.card;
    } catch (error: any) {
      console.error('[useCards] Error creating card:', error);

      // Handle specific error types
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Card creation not available. Please complete your profile.';
        addToast({ type: 'error', message });
        options?.onError?.(error);
      } else if (error.response?.status === 422) {
        // Validation errors from backend
        const backendErrors = error.response?.data?.errors || {};
        setCreateFormErrors(
          Object.keys(backendErrors).reduce((acc: Record<string, string>, key: string) => {
            acc[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
            return acc;
          }, {})
        );
        addToast({ type: 'error', message: error.response?.data?.message || 'Validation failed' });
      } else if (error.response?.status === 401) {
        addToast({ type: 'error', message: 'Authentication failed. Please log in again.' });
      } else {
        const message = error.message || 'An error occurred while creating card';
        addToast({ type: 'error', message });
        options?.onError?.(error);
      }

      return null;
    } finally {
      setIsCreatingCard(false);
      setIsLoading(false);
    }
  }, [createFormData, validateCreateForm, addToast, setIsLoading, resetCreateForm, options, cardListState]);

  /**
   * Fetch cards list with filters and pagination
   */
  const fetchCards = useCallback(
    async (page: number = 1, pageSize: number = 10, filters: CardFilters = {}) => {
      try {
        setCardListState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        // Build query
        const query = {
          page: Math.max(1, page),
          page_size: Math.min(Math.max(1, pageSize), 100),
          ...(filters.brand && { brand: filters.brand }),
          ...(filters.status && { status: filters.status }),
          ...(filters.createdAt && { created_at: filters.createdAt }),
        };

        // Call API
        const response = await cardService.getAllCards(query);

        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to fetch cards');
        }

        // Update state
        setCardListState({
          cards: response.data.cards,
          pagination: response.data.meta,
          isLoading: false,
          error: null,
          filters,
          currentPage: page,
        });

        return response.data.cards;
      } catch (error: any) {
        console.error('[useCards] Error fetching cards:', error);

        let errorMessage = 'Failed to load cards';

        if (error.response?.status === 400) {
          errorMessage = 'Please complete your profile to view cards';
        } else if (error.response?.status === 422) {
          errorMessage = 'Invalid filter parameters';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed';
        }

        setCardListState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        options?.onError?.(error);
        return null;
      }
    },
    [options]
  );

  /**
   * Change pagination page
   */
  const goToPage = useCallback(
    (page: number) => {
      fetchCards(page, cardListState.pagination.page_size, cardListState.filters);
    },
    [fetchCards, cardListState.pagination.page_size, cardListState.filters]
  );

  /**
   * Change page size
   */
  const changePageSize = useCallback(
    (pageSize: number) => {
      fetchCards(1, pageSize, cardListState.filters);
    },
    [fetchCards, cardListState.filters]
  );

  /**
   * Apply filters to cards list
   */
  const applyFilters = useCallback(
    (newFilters: CardFilters) => {
      fetchCards(1, cardListState.pagination.page_size, newFilters);
    },
    [fetchCards, cardListState.pagination.page_size]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    fetchCards(1, cardListState.pagination.page_size, {});
  }, [fetchCards, cardListState.pagination.page_size]);

  /**
   * Load initial cards on mount (only once when user is available)
   */
  useEffect(() => {
    if (user && cardListState.cards.length === 0 && !cardListState.isLoading) {
      // Only fetch if we don't have cards and aren't already loading
      fetchCards(1, 10, {});
    }
  }, [user?.id]); // Only depend on user.id to avoid infinite loops

  // ═════════════════════════════════════════════════════════════════
  // RETURN PUBLIC API
  // ═════════════════════════════════════════════════════════════════

  return {
    // Card list state and operations
    cardListState,
    fetchCards,
    goToPage,
    changePageSize,
    applyFilters,
    clearFilters,

    // Create form state and operations
    createFormData,
    updateCreateFormField,
    resetCreateForm,
    createFormErrors,
    isCreatingCard,

    // Operations
    createCard,

    // Computed values
    hasCards: cardListState.cards.length > 0,
    isEmpty: cardListState.cards.length === 0 && !cardListState.isLoading,
  };
};
