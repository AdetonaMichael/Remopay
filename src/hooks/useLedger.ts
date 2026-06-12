/**
 * Ledger Hook - useL edger
 * Date: June 12, 2026
 * 
 * Comprehensive React hook for managing ledger operations with:
 * - State management for all ledger data
 * - Loading and error states
 * - Caching mechanism
 * - Automatic token handling
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import { useUIStore } from '@/store/ui.store';
import { ledgerService } from '@/services/ledger.service';
import {
  // Types
  LedgerAccount,
  LedgerEntry,
  SettlementBatch,
  ReconciliationReport,
  TrialBalanceReport,
  AccountLedgerReport,
  LedgerDashboard,
  
  // Request types
  CreateAccountRequest,
  UpdateAccountStatusRequest,
  CreateLedgerEntryRequest,
  ReverseLedgerEntryRequest,
  VoidLedgerEntryRequest,
  GenerateReconciliationRequest,
  GenerateSettlementBatchRequest,
  UpdateBatchStatusRequest,
  GenerateTrialBalanceRequest,
  GenerateAccountLedgerRequest,
  ExportReportRequest,
  
  // Filter types
  AccountFilters,
  EntryFilters,
  BatchFilters,
  ReconciliationFilters,
} from '@/types/ledger.types';

interface UseLedgerState {
  // Data
  accounts: LedgerAccount[];
  entries: LedgerEntry[];
  batches: SettlementBatch[];
  reconciliationReports: ReconciliationReport[];
  currentAccount: LedgerAccount | null;
  currentEntry: LedgerEntry | null;
  currentBatch: SettlementBatch | null;
  currentReconciliationReport: ReconciliationReport | null;
  trialBalanceReport: TrialBalanceReport | null;
  accountLedgerReport: AccountLedgerReport | null;
  dashboard: LedgerDashboard | null;
  
  // Pagination
  accountsPagination: any;
  entriesPagination: any;
  batchesPagination: any;
  reconciliationPagination: any;
  
  // Loading states
  isLoadingAccounts: boolean;
  isLoadingEntries: boolean;
  isLoadingBatches: boolean;
  isLoadingReconciliation: boolean;
  isLoadingDashboard: boolean;
  isLoadingReports: boolean;
  isCreatingAccount: boolean;
  isCreatingEntry: boolean;
  isReversing: boolean;
  isVoiding: boolean;
  isGeneratingReport: boolean;
  
  // Error states
  error: string | null;
  accountError: string | null;
  entryError: string | null;
  batchError: string | null;
  reconciliationError: string | null;
}

const initialState: UseLedgerState = {
  accounts: [],
  entries: [],
  batches: [],
  reconciliationReports: [],
  currentAccount: null,
  currentEntry: null,
  currentBatch: null,
  currentReconciliationReport: null,
  trialBalanceReport: null,
  accountLedgerReport: null,
  dashboard: null,
  accountsPagination: null,
  entriesPagination: null,
  batchesPagination: null,
  reconciliationPagination: null,
  isLoadingAccounts: false,
  isLoadingEntries: false,
  isLoadingBatches: false,
  isLoadingReconciliation: false,
  isLoadingDashboard: false,
  isLoadingReports: false,
  isCreatingAccount: false,
  isCreatingEntry: false,
  isReversing: false,
  isVoiding: false,
  isGeneratingReport: false,
  error: null,
  accountError: null,
  entryError: null,
  batchError: null,
  reconciliationError: null,
};

export const useLedger = () => {
  const [state, setState] = useState<UseLedgerState>(initialState);
  const { addToast, setIsLoading } = useUIStore();
  const cacheRef = useRef<Map<string, any>>(new Map());

  /**
   * Helper function to handle errors
   */
  const handleError = useCallback((error: any, errorType?: keyof Omit<UseLedgerState, 'error'>) => {
    const message = error?.message || 'An error occurred';
    
    setState((prev) => ({
      ...prev,
      error: message,
      [errorType || 'error']: message,
    }));
    
    addToast({ type: 'error', message });
  }, [addToast]);

  /**
   * Helper function to show success message
   */
  const showSuccess = useCallback((message: string) => {
    addToast({ type: 'success', message });
  }, [addToast]);

  // ============================================================================
  // ACCOUNT OPERATIONS
  // ============================================================================

  /**
   * Fetch all accounts
   */
  const fetchAccounts = useCallback(async (filters?: AccountFilters) => {
    setState((prev) => ({ ...prev, isLoadingAccounts: true, accountError: null }));
    setIsLoading(true);

    try {
      const response = await ledgerService.getAccounts(filters);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        accounts: response.data!.accounts,
        accountsPagination: response.data!.pagination,
      }));

      cacheRef.current.set('accounts', response.data!.accounts);
    } catch (error: any) {
      handleError(error, 'accountError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingAccounts: false }));
      setIsLoading(false);
    }
  }, [handleError, setIsLoading]);

  /**
   * Fetch a specific account
   */
  const fetchAccount = useCallback(async (accountId: number) => {
    setState((prev) => ({ ...prev, isLoadingAccounts: true }));

    try {
      const response = await ledgerService.getAccount(accountId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        currentAccount: response.data!.account,
      }));
    } catch (error: any) {
      handleError(error, 'accountError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingAccounts: false }));
    }
  }, [handleError]);

  /**
   * Create a new account
   */
  const createAccount = useCallback(async (data: CreateAccountRequest) => {
    setState((prev) => ({ ...prev, isCreatingAccount: true }));
    setIsLoading(true);

    try {
      const response = await ledgerService.createAccount(data);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        accounts: [...prev.accounts, response.data!.account],
      }));

      showSuccess(`Account "${data.account_name}" created successfully`);
      cacheRef.current.delete('accounts');
      
      return response.data!.account;
    } catch (error: any) {
      handleError(error, 'accountError');
      return null;
    } finally {
      setState((prev) => ({ ...prev, isCreatingAccount: false }));
      setIsLoading(false);
    }
  }, [handleError, showSuccess, setIsLoading]);

  /**
   * Update account status
   */
  const updateAccountStatus = useCallback(
    async (accountId: number, data: UpdateAccountStatusRequest) => {
      setIsLoading(true);

      try {
        const response = await ledgerService.updateAccountStatus(accountId, data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          accounts: prev.accounts.map((acc) =>
            acc.id === accountId ? { ...acc, ...response.data!.account } : acc
          ),
        }));

        showSuccess(`Account status updated to ${data.status}`);
        return true;
      } catch (error: any) {
        handleError(error, 'accountError');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Sync account balance
   */
  const syncAccountBalance = useCallback(async (accountId: number) => {
    setIsLoading(true);

    try {
      const response = await ledgerService.syncAccountBalance(accountId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      showSuccess(`Account balance synced successfully`);
      return response.data!;
    } catch (error: any) {
      handleError(error, 'accountError');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess, setIsLoading]);

  // ============================================================================
  // LEDGER ENTRY OPERATIONS
  // ============================================================================

  /**
   * Fetch all entries
   */
  const fetchEntries = useCallback(async (filters?: EntryFilters) => {
    setState((prev) => ({ ...prev, isLoadingEntries: true, entryError: null }));
    setIsLoading(true);

    try {
      const response = await ledgerService.getEntries(filters);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        entries: response.data!.entries,
        entriesPagination: response.data!.pagination,
      }));

      cacheRef.current.set('entries', response.data!.entries);
    } catch (error: any) {
      handleError(error, 'entryError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingEntries: false }));
      setIsLoading(false);
    }
  }, [handleError, setIsLoading]);

  /**
   * Fetch a specific entry
   */
  const fetchEntry = useCallback(async (entryId: number) => {
    setState((prev) => ({ ...prev, isLoadingEntries: true }));

    try {
      const response = await ledgerService.getEntry(entryId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        currentEntry: response.data!.entry,
      }));
    } catch (error: any) {
      handleError(error, 'entryError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingEntries: false }));
    }
  }, [handleError]);

  /**
   * Create a manual entry
   */
  const createEntry = useCallback(async (data: CreateLedgerEntryRequest) => {
    setState((prev) => ({ ...prev, isCreatingEntry: true }));
    setIsLoading(true);

    try {
      const response = await ledgerService.createEntry(data);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        entries: [...prev.entries, response.data!.entry],
      }));

      showSuccess(`Entry created successfully`);
      cacheRef.current.delete('entries');
      
      return response.data!.entry;
    } catch (error: any) {
      handleError(error, 'entryError');
      return null;
    } finally {
      setState((prev) => ({ ...prev, isCreatingEntry: false }));
      setIsLoading(false);
    }
  }, [handleError, showSuccess, setIsLoading]);

  /**
   * Reverse an entry
   */
  const reverseEntry = useCallback(
    async (entryId: number, data: ReverseLedgerEntryRequest) => {
      setState((prev) => ({ ...prev, isReversing: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.reverseEntry(entryId, data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          entries: prev.entries.map((entry) =>
            entry.id === entryId ? { ...entry, status: 'reversed' } : entry
          ),
        }));

        showSuccess('Entry reversed successfully');
        cacheRef.current.delete('entries');
        return true;
      } catch (error: any) {
        handleError(error, 'entryError');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isReversing: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Void an entry
   */
  const voidEntry = useCallback(
    async (entryId: number, data: VoidLedgerEntryRequest) => {
      setState((prev) => ({ ...prev, isVoiding: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.voidEntry(entryId, data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          entries: prev.entries.map((entry) =>
            entry.id === entryId ? { ...entry, status: 'voided' } : entry
          ),
        }));

        showSuccess('Entry voided successfully');
        cacheRef.current.delete('entries');
        return true;
      } catch (error: any) {
        handleError(error, 'entryError');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isVoiding: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  // ============================================================================
  // RECONCILIATION OPERATIONS
  // ============================================================================

  /**
   * Generate a reconciliation report
   */
  const generateReconciliation = useCallback(
    async (data: GenerateReconciliationRequest) => {
      setState((prev) => ({ ...prev, isGeneratingReport: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.generateReconciliation(data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          reconciliationReports: [response.data!.report, ...prev.reconciliationReports],
        }));

        showSuccess('Reconciliation report generated successfully');
        cacheRef.current.delete('reconciliation');
        return response.data!.report;
      } catch (error: any) {
        handleError(error, 'reconciliationError');
        return null;
      } finally {
        setState((prev) => ({ ...prev, isGeneratingReport: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Fetch reconciliation reports
   */
  const fetchReconciliationReports = useCallback(
    async (filters?: ReconciliationFilters) => {
      setState((prev) => ({ ...prev, isLoadingReconciliation: true, reconciliationError: null }));
      setIsLoading(true);

      try {
        const response = await ledgerService.getReconciliationReports(filters);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          reconciliationReports: response.data!.reports,
          reconciliationPagination: response.data!.pagination,
        }));

        cacheRef.current.set('reconciliation', response.data!.reports);
      } catch (error: any) {
        handleError(error, 'reconciliationError');
      } finally {
        setState((prev) => ({ ...prev, isLoadingReconciliation: false }));
        setIsLoading(false);
      }
    },
    [handleError, setIsLoading]
  );

  /**
   * Fetch a specific reconciliation report
   */
  const fetchReconciliationReport = useCallback(async (reportId: number) => {
    setState((prev) => ({ ...prev, isLoadingReconciliation: true }));

    try {
      const response = await ledgerService.getReconciliationReport(reportId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        currentReconciliationReport: response.data!.report,
      }));
    } catch (error: any) {
      handleError(error, 'reconciliationError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingReconciliation: false }));
    }
  }, [handleError]);

  // ============================================================================
  // SETTLEMENT BATCH OPERATIONS
  // ============================================================================

  /**
   * Generate a settlement batch
   */
  const generateSettlementBatch = useCallback(
    async (data: GenerateSettlementBatchRequest) => {
      setState((prev) => ({ ...prev, isGeneratingReport: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.generateSettlementBatch(data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          batches: [response.data!.batch, ...prev.batches],
        }));

        showSuccess('Settlement batch generated successfully');
        cacheRef.current.delete('batches');
        return response.data!.batch;
      } catch (error: any) {
        handleError(error, 'batchError');
        return null;
      } finally {
        setState((prev) => ({ ...prev, isGeneratingReport: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Fetch settlement batches
   */
  const fetchSettlementBatches = useCallback(async (filters?: BatchFilters) => {
    setState((prev) => ({ ...prev, isLoadingBatches: true, batchError: null }));
    setIsLoading(true);

    try {
      const response = await ledgerService.getSettlementBatches(filters);
      
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
      handleError(error, 'batchError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingBatches: false }));
      setIsLoading(false);
    }
  }, [handleError, setIsLoading]);

  /**
   * Fetch a specific batch
   */
  const fetchSettlementBatch = useCallback(async (batchId: number) => {
    setState((prev) => ({ ...prev, isLoadingBatches: true }));

    try {
      const response = await ledgerService.getSettlementBatch(batchId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        currentBatch: response.data!.batch,
      }));
    } catch (error: any) {
      handleError(error, 'batchError');
    } finally {
      setState((prev) => ({ ...prev, isLoadingBatches: false }));
    }
  }, [handleError]);

  /**
   * Update batch status
   */
  const updateBatchStatus = useCallback(
    async (batchId: number, data: UpdateBatchStatusRequest) => {
      setIsLoading(true);

      try {
        const response = await ledgerService.updateBatchStatus(batchId, data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          batches: prev.batches.map((batch) =>
            batch.id === batchId ? { ...batch, ...response.data!.batch } : batch
          ),
        }));

        showSuccess(`Batch status updated to ${data.status}`);
        return true;
      } catch (error: any) {
        handleError(error, 'batchError');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  // ============================================================================
  // REPORT OPERATIONS
  // ============================================================================

  /**
   * Generate trial balance report
   */
  const generateTrialBalanceReport = useCallback(
    async (data: GenerateTrialBalanceRequest) => {
      setState((prev) => ({ ...prev, isLoadingReports: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.generateTrialBalanceReport(data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          trialBalanceReport: response.data!.report,
        }));

        showSuccess('Trial balance report generated successfully');
        return response.data!.report;
      } catch (error: any) {
        handleError(error);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isLoadingReports: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Generate account ledger report
   */
  const generateAccountLedgerReport = useCallback(
    async (data: GenerateAccountLedgerRequest) => {
      setState((prev) => ({ ...prev, isLoadingReports: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.generateAccountLedgerReport(data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setState((prev) => ({
          ...prev,
          accountLedgerReport: response.data!.report,
        }));

        showSuccess('Account ledger report generated successfully');
        return response.data!.report;
      } catch (error: any) {
        handleError(error);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isLoadingReports: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  /**
   * Export report
   */
  const exportReport = useCallback(
    async (data: ExportReportRequest) => {
      setState((prev) => ({ ...prev, isLoadingReports: true }));
      setIsLoading(true);

      try {
        const response = await ledgerService.exportReport(data);
        
        if (!response.success) {
          throw new Error(response.message);
        }

        showSuccess('Report exported successfully');
        return response.data!.export;
      } catch (error: any) {
        handleError(error);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isLoadingReports: false }));
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, setIsLoading]
  );

  // ============================================================================
  // DASHBOARD OPERATIONS
  // ============================================================================

  /**
   * Fetch dashboard summary
   */
  const fetchDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingDashboard: true }));
    setIsLoading(true);

    try {
      const response = await ledgerService.getDashboard();
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setState((prev) => ({
        ...prev,
        dashboard: response.data!.dashboard,
      }));

      cacheRef.current.set('dashboard', response.data!.dashboard);
    } catch (error: any) {
      handleError(error);
    } finally {
      setState((prev) => ({ ...prev, isLoadingDashboard: false }));
      setIsLoading(false);
    }
  }, [handleError, setIsLoading]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      accountError: null,
      entryError: null,
      batchError: null,
      reconciliationError: null,
    }));
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState(initialState);
    clearCache();
  }, [clearCache]);

  return {
    // State
    state,
    
    // Account operations
    fetchAccounts,
    fetchAccount,
    createAccount,
    updateAccountStatus,
    syncAccountBalance,
    
    // Entry operations
    fetchEntries,
    fetchEntry,
    createEntry,
    reverseEntry,
    voidEntry,
    
    // Reconciliation operations
    generateReconciliation,
    fetchReconciliationReports,
    fetchReconciliationReport,
    
    // Settlement batch operations
    generateSettlementBatch,
    fetchSettlementBatches,
    fetchSettlementBatch,
    updateBatchStatus,
    
    // Report operations
    generateTrialBalanceReport,
    generateAccountLedgerReport,
    exportReport,
    
    // Dashboard operations
    fetchDashboard,
    
    // Utilities
    clearError,
    clearCache,
    reset,
  };
};
