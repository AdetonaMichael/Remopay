/**
 * useFx Hook
 * Manages FX conversion operations and state
 */

import { useState, useEffect, useCallback } from 'react';
import { fxService } from '@/services/fx.service';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import type {
  Currency,
  FxQuote,
  FxTransaction,
  GenerateFxQuoteRequest,
  ExecuteFxExchangeRequest,
} from '@/types/fx.types';

export const useFx = () => {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  // Quote state
  const [quote, setQuote] = useState<FxQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteExpiresIn, setQuoteExpiresIn] = useState<number | null>(null);

  // Exchange state
  const [transaction, setTransaction] = useState<FxTransaction | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<FxTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Quote expiration countdown
  useEffect(() => {
    if (!quote?.expires_at) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(quote.expires_at).getTime();
      const now = new Date().getTime();
      const secondsRemaining = Math.floor((expiresAt - now) / 1000);

      if (secondsRemaining <= 0) {
        setQuote(null);
        setQuoteExpiresIn(null);
        clearInterval(interval);
      } else {
        setQuoteExpiresIn(secondsRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote?.expires_at]);

  /**
   * Generate FX quote
   */
  const generateQuote = useCallback(
    async (
      sourceCurrency: Currency,
      targetCurrency: Currency,
      amount: number
    ): Promise<FxQuote | null> => {
      if (!isAuthenticated) {
        setQuoteError('Please log in to generate quotes');
        return null;
      }

      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const request: GenerateFxQuoteRequest = {
          source_currency: sourceCurrency,
          target_currency: targetCurrency,
          amount,
        };

        const data = await fxService.generateQuote(request);

        if (!data.success) {
          const errorMessage =
            data?.errors?.[Object.keys(data.errors || {})[0]]?.[0] || data?.message || 'Failed to generate quote';
          throw new Error(errorMessage);
        }

        if (data.data) {
          setQuote(data.data);
          addToast({
            type: 'success',
            message: 'Quote generated successfully',
          });
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to generate quote');
        }
      } catch (error: any) {
        const message = error?.message || 'Failed to generate quote';
        setQuoteError(message);
        addToast({
          type: 'error',
          message,
        });
        return null;
      } finally {
        setQuoteLoading(false);
      }
    },
    [isAuthenticated, addToast]
  );

  /**
   * Execute FX exchange
   */
  const executeExchange = useCallback(
    async (quoteReference: string): Promise<FxTransaction | null> => {
      if (!isAuthenticated) {
        setExchangeError('Please log in to execute exchanges');
        return null;
      }

      setExchangeLoading(true);
      setExchangeError(null);

      try {
        const request: ExecuteFxExchangeRequest = {
          quote_reference: quoteReference,
        };

        const data = await fxService.executeExchange(request);

        if (!data.success) {
          const errorMessage =
            data?.errors?.[Object.keys(data.errors || {})[0]]?.[0] || data?.message || 'Failed to execute exchange';
          throw new Error(errorMessage);
        }

        if (data.data) {
          setTransaction(data.data);
          setQuote(null); // Clear quote after successful exchange
          addToast({
            type: 'success',
            message: `Exchange completed! Transaction: ${data.data.transaction_reference}`,
          });
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to execute exchange');
        }
      } catch (error: any) {
        const message = error?.message || 'Failed to execute exchange';
        setExchangeError(message);
        addToast({
          type: 'error',
          message,
        });
        return null;
      } finally {
        setExchangeLoading(false);
      }
    },
    [isAuthenticated, addToast]
  );

  /**
   * Fetch FX history
   */
  const fetchHistory = useCallback(async (): Promise<FxTransaction[]> => {
    if (!isAuthenticated) {
      setHistoryError('Please log in to view history');
      return [];
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const data = await fxService.getHistory();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch history');
      }

      if (Array.isArray(data.data)) {
        console.log('[useFx] History data:', data.data);
        setHistory(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch history');
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch history';
      setHistoryError(message);
      console.error('[useFx] History error:', error);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Clear current quote
   */
  const clearQuote = useCallback(() => {
    setQuote(null);
    setQuoteExpiresIn(null);
    setQuoteError(null);
  }, []);

  /**
   * Clear transaction
   */
  const clearTransaction = useCallback(() => {
    setTransaction(null);
    setExchangeError(null);
  }, []);

  return {
    // Quote operations
    quote,
    quoteLoading,
    quoteError,
    quoteExpiresIn,
    generateQuote,
    clearQuote,

    // Exchange operations
    transaction,
    exchangeLoading,
    exchangeError,
    executeExchange,
    clearTransaction,

    // History operations
    history,
    historyLoading,
    historyError,
    fetchHistory,
  };
};
