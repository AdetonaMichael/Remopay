/**
 * Settlement Management Hook - useSettlement
 * Date: July 4, 2026
 *
 * Comprehensive React hook for managing settlement operations with:
 * - State management for all settlement data
 * - Loading and error states
 * - Toast notifications for success/error feedback
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import { useUIStore } from '@/store/ui.store';
import { settlementService } from '@/services/settlement.service';
import type {
  // Data types
  SettlementDashboardData,
  SettlementConfig,
  SettlementBatchRecord,
  SettlementBatchDetail,
  BatchItem,
  SettlementTransaction,
  ExecuteSettlementResult,
  ConfigValidationResult,
  ConfigTestResult,
  BatchSummary,

  // Request types
  UpdateConfigRequest,
  GenerateBatchRequest,
  ApproveBatchRequest,
  SettleBatchRequest,
  ExecuteSettlementRequest,

  // Filter types
  BatchListFilters,
  BatchItemFilters,
  SettlementTxFilters,
} from '@/types/settlement.types';

interface UseSettlementState {
  // Data
  dashboard: SettlementDashboardData | null;
  config: SettlementConfig | null;
  configValidation: ConfigValidationResult | null;
  configTestResult: ConfigTestResult | null;
  batches: SettlementBatchRecord[];
  currentBatch: SettlementBatchDetail | null;
  batchItems: BatchItem[];
  batchItemsTotals: { amount: number; commission: number; fees: number } | null;
  transactions: SettlementTransaction[];
  currentTransaction: SettlementTransaction | null;
  executeResult: ExecuteSettlementResult | null;
  retryResult: { retried_count: number } | null;

  // Pagination
  batchesPagination: any;
  batchItemsPagination: any;
  transactionsPagination: any;

  // Loading states
  isLoadingDashboard: boolean;
  isLoadingConfig: boolean;
  isLoadingBatches: boolean;
  isLoadingBatch: boolean;
  isLoadingBatchItems: boolean;
  isLoadingTransactions: boolean;
  isLoadingTransaction: boolean;
  isUpdatingConfig: boolean;
  isValidatingConfig: boolean;
  isTestingConfig: boolean;
  isGeneratingBatch: boolean;
  isApprovingBatch: boolean;
  isSettlingBatch: boolean;
  isExecutingSettlement: boolean;
  isRetryingFailed: boolean;

  // Error states
  error: string | null;
  dashboardError: string | null;
  configError: string | null;
  batchesError: string | null;
  transactionsError: string | null;
}

const initialState: UseSettlementState = {
  dashboard: null,
  config: null,
  configValidation: null,
  configTestResult: null,
  batches: [],
  currentBatch: null,
  batchItems: [],
  batchItemsTotals: null,
  transactions: [],
  currentTransaction: null,
  executeResult: null,
  retryResult: null,
  batchesPagination: null,
  batchItemsPagination: null,
  transactionsPagination: null,
  isLoadingDashboard: false,
  isLoadingConfig: false,
  isLoadingBatches: false,
  isLoadingBatch: false,
  isLoadingBatchItems: false,
  isLoadingTransactions: false,
  isLoadingTransaction: false,
  isUpdatingConfig: false,
  isValidatingConfig: false,
  isTestingConfig: false,
  isGeneratingBatch: false,
  isApprovingBatch: false,
  isSettlingBatch: false,
  isExecutingSettlement: false,
  isRetryingFailed: false,
  error: null,
  dashboardError: null,
  configError: null,
  batchesError: null,
  transactionsError: null,
};

export const useSettlement = () => {
  const [state, setState] = useState<UseSettlementState>(initialState);
  const { addToast, setIsLoading } = useUIStore();
  const cacheRef = useRef<Map<string, any>>(new Map());

  /**
   * Helper function to handle errors
   */
  const handleError = useCallback(
    (error: any, errorType?: keyof Pick<UseSettlementState, 'error' | 'dashboardError' | 'configError' | 'batchesError' | 'transactionsError'>) => {
      const message = error?.message || 'An error occurred';

      setState((prev) => ({
        ...prev,
        error: message,
        [errorType || 'error']: message,
      }));

      addToast({ type: 'error', message });
    },
    [addToast]
  );

  /**
   * Helper function to show success message
   */
  const showSuccess = useCallback(
    (message: string) => {
      addToast({ type: 'success', message });
    },
    [addToast]
  );

  // ============================================================================
  // DASHBOARD OPERATIONS
  // ============================================================================

  /**
   * Fetch settlement dashboard data
   */
  const fetchDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingDashboard: true, dashboardError: null }));
    setIsLoading(true);

    try {
      const response = await settlementService.getDashboard();

      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        dashboard: response.data!,
      }));

      cacheRef.current.set('dashboard', response.data);
    } catch (error: any) {
      handleError(error, 'dashboardError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingDashboard: false }));
      setIsLoading(false);
    }
  }, [handleError, setIsLoading]);

  // ============================================================================
  // CONFIGURATION OPERATIONS
  // ============================================================================

  /**
   * Fetch settlement configuration
   */
  const fetchConfig = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingConfig: true, configError: null }));
    setIsLoading(true);

    try {
      const response = await settlementService.getConfig();

      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        config: response.data!,
      }));

      cacheRef.current.set('config', response.data);
    } catch (error: any) {
      handleError(error, 'configError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingConfig: false }));
      setIsLoading(false);
    }
  }, [handleError, setIsLoading]);

  /**
   * Update settlement configuration
   */
  const updateConfig = useCallback(
    async (data: UpdateConfigRequest): Promise<boolean> => {
      setState((prev) => ({ ...prev, isUpdatingConfig: true }));
      setIsLoading(true);

      try {
        const response = await settlementService.updateConfig(data);

        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          config: response.data!,
        }));

        showSuccess('Settlement configuration updated successfully');
        cacheRef.current.delete('config');
        return true;
      } catch (error: any) {
        handleError(error, 'configError');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isUpdatingConfig: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Validate the current configuration
   */
  const validateConfig = useCallback(async (): Promise<ConfigValidationResult | null> => {
    setState((prev) => ({ ...prev, isValidatingConfig: true }));
    setIsLoading(true);

    try {
      const response = await settlementService.validateConfig();

      if (!response.success) {
        setState((prev) => ({
          ...prev,
          configValidation: response.data!,
        }));
        return response.data!;
      }

      setState((prev) => ({
        ...prev,
        configValidation: response.data!,
      }));

      if (response.data?.valid) {
        showSuccess('Configuration is valid');
      }

      return response.data!;
    } catch (error: any) {
      handleError(error, 'configError');
      return null;
    } finally {
      setState((prev) => ({ ...prev, isValidatingConfig: false }));
      setIsLoading(false);
    }
  }, [handleError, showSuccess, setIsLoading]);

  /**
   * Test connectivity to configured accounts
   */
  const testConfig = useCallback(async (): Promise<ConfigTestResult | null> => {
    setState((prev) => ({ ...prev, isTestingConfig: true }));
    setIsLoading(true);

    try {
      const response = await settlementService.testConfig();

      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        configTestResult: response.data!,
      }));

      if (response.data?.success) {
        showSuccess('All account tests passed');
      }

      return response.data!;
    } catch (error: any) {
      handleError(error, 'configError');
      return null;
    } finally {
      setState((prev) => ({ ...prev, isTestingConfig: false }));
      setIsLoading(false);
    }
  }, [handleError, showSuccess, setIsLoading]);

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Fetch settlement batches with filters
   */
  const fetchBatches = useCallback(
    async (filters?: BatchListFilters) => {
      setState((prev) => ({ ...prev, isLoadingBatches: true, batchesError: null }));
      setIsLoading(true);

      try {
        const response = await settlementService.getBatches(filters);

        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          batches: response.data!.batches,
          batchesPagination: response.data!.pagination,
        }));

        cacheRef.current.set('batches', response.data!.batches);
      } catch (error: any) {
        handleError(error, 'batchesError');
      } finally {
        setState((prev) => ({ ...prev, isLoadingBatches: false }));
        setIsLoading(false);
      }
    },
    [handleError, setIsLoading]
  );

  /**
   * Fetch a specific batch with details
   */
  const fetchBatch = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoadingBatch: true }));

    try {
      const response = await settlementService.getBatch(id);

      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        currentBatch: response.data!,
      }));
    } catch (error: any) {
      handleError(error, 'batchesError');
      return null;
    } finally {
      setState((prev) => ({ ...prev, isLoadingBatch: false }));
    }
  }, [handleError]);

  /**
   * Generate a new settlement batch
   */
  const generateBatch = useCallback(
    async (data: GenerateBatchRequest): Promise<boolean> => {
      setState((prev) => ({ ...prev, isGeneratingBatch: true }));
      setIsLoading(true);

      try {
        const response = await settlementService.generateBatch(data);

        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          batches: [response.data!.batch, ...prev.batches],
        }));

        showSuccess(`Batch generated successfully: ${response.data!.batch.batch_reference}`);
        cacheRef.current.delete('batches');
        return true;
      } catch (error: any) {
        handleError(error, 'batchesError');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isGeneratingBatch: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Approve a settlement batch
   */
  const approveBatch = useCallback(
    async (id: number, data: ApproveBatchRequest): Promise<boolean> => {
      setState((prev) => ({ ...prev, isApprovingBatch: true }));
      setIsLoading(true);

      try {
        const response = await settlementService.approveBatch(id, data);

        if (!response.success) {
          throw new Error(response.message);
        }

        // Refresh batch detail if viewing it
        setState((prev) => ({
          ...prev,
          batches: prev.batches.map((b) =>
            b.id === id ? { ...b, ...response.data!.batch } : b
          ),
        }));

        showSuccess('Batch approved successfully');
        return true;
      } catch (error: any) {
        handleError(error, 'batchesError');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isApprovingBatch: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Execute settlement for a specific batch
   */
  const settleBatch = useCallback(
    async (id: number, data: SettleBatchRequest): Promise<boolean> => {
      setState((prev) => ({ ...prev, isSettlingBatch: true }));
      setIsLoading(true);

      try {
        const response = await settlementService.settleBatch(id, data);

        if (!response.success) {
          throw new Error(response.message);
        }

        // Refresh batch detail if viewing it
        setState((prev) => ({
          ...prev,
          batches: prev.batches.map((b) =>
            b.id === id ? { ...b, status: 'settled' } : b
          ),
        }));

        showSuccess('Settlement completed successfully');
        return true;
      } catch (error: any) {
        handleError(error, 'batchesError');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isSettlingBatch: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Fetch items in a batch
   */
  const fetchBatchItems = useCallback(
    async (batchId: number, filters?: BatchItemFilters) => {
      setState((prev) => ({ ...prev, isLoadingBatchItems: true }));

      try {
        const response = await settlementService.getBatchItems(batchId, filters);

        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          batchItems: response.data!.items,
          batchItemsPagination: response.data!.pagination,
          batchItemsTotals: response.data!.totals,
        }));
      } catch (error: any) {
        handleError(error, 'batchesError');
      } finally {
        setState((prev) => ({ ...prev, isLoadingBatchItems: false }));
      }
    },
    [handleError]
  );

  // ============================================================================
  // TRANSACTION OPERATIONS
  // ============================================================================

  /**
   * Fetch settlement transactions with filters
   */
  const fetchTransactions = useCallback(
    async (filters?: SettlementTxFilters) => {
      setState((prev) => ({ ...prev, isLoadingTransactions: true, transactionsError: null }));
      setIsLoading(true);

      try {
        const response = await settlementService.getTransactions(filters);

        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          transactions: response.data!.transactions,
          transactionsPagination: response.data!.pagination,
        }));

        cacheRef.current.set('transactions', response.data!.transactions);
      } catch (error: any) {
        handleError(error, 'transactionsError');
      } finally {
        setState((prev) => ({ ...prev, isLoadingTransactions: false }));
        setIsLoading(false);
      }
    },
    [handleError, setIsLoading]
  );

  /**
   * Fetch a specific settlement transaction
   */
  const fetchTransaction = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoadingTransaction: true }));

    try {
      const response = await settlementService.getTransaction(id);

      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        currentTransaction: response.data!,
      }));
    } catch (error: any) {
      handleError(error, 'transactionsError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingTransaction: false }));
    }
  }, [handleError]);

  // ============================================================================
  // MANUAL ACTIONS
  // ============================================================================

  /**
   * Manually trigger the settlement process
   */
  const executeSettlement = useCallback(
    async (data: ExecuteSettlementRequest): Promise<ExecuteSettlementResult | null> => {
      setState((prev) => ({ ...prev, isExecutingSettlement: true }));
      setIsLoading(true);

      try {
        const response = await settlementService.executeSettlement(data);

        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          executeResult: response.data!,
        }));

        showSuccess('Settlement execution completed');
        return response.data!;
      } catch (error: any) {
        handleError(error);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isExecutingSettlement: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Retry all failed settlement transactions
   */
  const retryFailed = useCallback(async () => {
    setState((prev) => ({ ...prev, isRetryingFailed: true }));
    setIsLoading(true);

    try {
      const response = await settlementService.retryFailed();

      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        retryResult: response.data!,
      }));

      showSuccess(`Retried ${response.data!.retried_count} failed settlement(s)`);
      return response.data!;
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setState((prev) => ({ ...prev, isRetryingFailed: false }));
      setIsLoading(false);
    }
  }, [handleError, showSuccess, setIsLoading]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      dashboardError: null,
      configError: null,
      batchesError: null,
      transactionsError: null,
    }));
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Reset state to initial
   */
  const reset = useCallback(() => {
    setState(initialState);
    clearCache();
  }, [clearCache]);

  return {
    // State
    state,

    // Dashboard operations
    fetchDashboard,

    // Config operations
    fetchConfig,
    updateConfig,
    validateConfig,
    testConfig,

    // Batch operations
    fetchBatches,
    fetchBatch,
    generateBatch,
    approveBatch,
    settleBatch,
    fetchBatchItems,

    // Transaction operations
    fetchTransactions,
    fetchTransaction,

    // Manual actions
    executeSettlement,
    retryFailed,

    // Utilities
    clearError,
    clearCache,
    reset,
  };
};
