/**
 * useAirtimeToCash Hook
 * Manages the airtime-to-cash conversion flow
 */

import { useCallback, useState } from 'react';
import { airtimeToCashService } from '@/services/airtime-to-cash.service';
import {
  AirtimeCashProvider,
  AirtimeToCashFormData,
  AirtimeToCashTransaction,
  AirtimeToCashStats,
} from '@/types/airtime-to-cash.types';

interface UseAirtimeToCashReturn {
  // Providers
  providers: AirtimeCashProvider[];
  providersLoading: boolean;
  providersError: string | null;
  fetchProviders: () => Promise<void>;

  // Conversion
  transaction: AirtimeToCashTransaction | null;
  isInitiating: boolean;
  isSubmittingProof: boolean;
  conversionError: string | null;
  initiateConversion: (formData: AirtimeToCashFormData) => Promise<void>;
  submitProof: (transactionId: number, screenshotUrl: string) => Promise<void>;

  // History
  history: AirtimeToCashTransaction[];
  historyLoading: boolean;
  historyError: string | null;
  fetchHistory: (params?: any) => Promise<void>;

  // Stats
  stats: AirtimeToCashStats | null;
  statsLoading: boolean;
  fetchStats: () => Promise<void>;

  // Utilities
  clearError: () => void;
  resetTransaction: () => void;
}

export function useAirtimeToCash(): UseAirtimeToCashReturn {
  // Providers state
  const [providers, setProviders] = useState<AirtimeCashProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  // Conversion state
  const [transaction, setTransaction] = useState<AirtimeToCashTransaction | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<AirtimeToCashTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<AirtimeToCashStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    try {
      setProvidersLoading(true);
      setProvidersError(null);
      const data = await airtimeToCashService.getProviders();
      setProviders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load providers';
      setProvidersError(message);
      setProviders([]); // Ensure providers is always an array
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  // Initiate conversion
  const initiateConversion = useCallback(async (formData: AirtimeToCashFormData) => {
    try {
      setIsInitiating(true);
      setConversionError(null);

      const airtimeAmount = Number(formData.airtime_amount);

      if (!airtimeAmount || airtimeAmount <= 0) {
        throw new Error('Invalid amount');
      }

      const response = await airtimeToCashService.initiateConversion({
        phone_number: formData.phone_number.replace(/\s/g, ''),
        provider: formData.provider,
        airtime_amount: airtimeAmount,
        settlement_method: 'wallet',
        notes: formData.notes,
      });

      setTransaction(response.transaction);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[Object.keys(error.response.data.errors)[0]]?.[0] ||
        error.message ||
        'Failed to initiate conversion';
      setConversionError(message);
    } finally {
      setIsInitiating(false);
    }
  }, []);

  // Submit proof
  const submitProof = useCallback(async (transactionId: number, screenshotUrl: string) => {
    try {
      setIsSubmittingProof(true);
      setConversionError(null);

      const updatedTransaction = await airtimeToCashService.submitProof(transactionId, {
        screenshot_url: screenshotUrl,
      });

      setTransaction(updatedTransaction);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to submit proof';
      setConversionError(message);
    } finally {
      setIsSubmittingProof(false);
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async (params?: any) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = await airtimeToCashService.getHistory(params);
      setHistory(response.data.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load history';
      setHistoryError(message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await airtimeToCashService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setConversionError(null);
    setProvidersError(null);
    setHistoryError(null);
  }, []);

  // Reset transaction
  const resetTransaction = useCallback(() => {
    setTransaction(null);
    setConversionError(null);
  }, []);

  return {
    // Providers
    providers,
    providersLoading,
    providersError,
    fetchProviders,

    // Conversion
    transaction,
    isInitiating,
    isSubmittingProof,
    conversionError,
    initiateConversion,
    submitProof,

    // History
    history,
    historyLoading,
    historyError,
    fetchHistory,

    // Stats
    stats,
    statsLoading,
    fetchStats,

    // Utilities
    clearError,
    resetTransaction,
  };
}
