'use client';

/**
 * useUsdWallet Hook
 * Manages USD wallet state, balance fetching, and transaction display
 *
 * IMPORTANT:
 * - The GET /api/v1/usd/wallet/summary endpoint returns balance as a float
 *   IN DOLLARS (e.g. 0.71 = $0.71), NOT in cents.
 * - Transaction amounts are decimal strings (e.g. "0.71") — always parseFloat().
 * - metadata can be null — use optional chaining: tx.metadata?.rate
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { usdWalletService } from '@/services/usd-wallet.service';
import { fxService } from '@/services/fx.service';
import type {
  UsdWalletState,
  ParsedUsdTransaction,
  WalletCurrency,
  ConversionState,
  UsdTransaction,
} from '@/types/usd-wallet.types';
import { parseUsdTransaction, formatUsdAmount } from '@/types/usd-wallet.types';
import type {
  GenerateFxQuoteRequest,
  ExecuteFxExchangeRequest,
  FxQuote,
} from '@/types/fx.types';

const DEFAULT_CONVERSION_STATE: ConversionState = {
  sourceCurrency: 'NGN',
  targetCurrency: 'USD',
  sourceAmount: '',
  targetAmount: null,
  exchangeRate: null,
  quoteReference: null,
  quoteExpiresAt: null,
  step: 'input',
};

export const useUsdWallet = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useUIStore();

  // ═════════════════════════════════════════════════════════════════
  // USD WALLET STATE
  // ═════════════════════════════════════════════════════════════════

  const [state, setState] = useState<UsdWalletState>({
    balance: 0,
    lastSyncedAt: null,
    recentTransactions: [],
    isLoading: false,
    error: null,
  });

  // ═════════════════════════════════════════════════════════════════
  // DERIVED / COMPUTED VALUES
  // ═════════════════════════════════════════════════════════════════

  /**
   * Balance is already in dollars from the API (e.g. 0.71 = $0.71).
   * No division by 100 needed (unlike /wallets/balances endpoint which uses cents).
   */
  const formattedUsdBalance = useMemo(
    () => formatUsdAmount(state.balance),
    [state.balance]
  );

  /**
   * USD balance in dollar units — identity of state.balance since it's already in dollars.
   */
  const usdBalanceInDollars = state.balance;

  /**
   * Parsed transactions with proper types, formatted strings, and derived isCredit.
   */
  const parsedTransactions: ParsedUsdTransaction[] = useMemo(
    () => state.recentTransactions.map(parseUsdTransaction),
    [state.recentTransactions]
  );

  // ═════════════════════════════════════════════════════════════════
  // CONVERSION STATE
  // ═════════════════════════════════════════════════════════════════

  const [conversion, setConversion] = useState<ConversionState>(DEFAULT_CONVERSION_STATE);

  // ═════════════════════════════════════════════════════════════════
  // QUOTE COUNTDOWN
  // ═════════════════════════════════════════════════════════════════

  const [quoteExpiresIn, setQuoteExpiresIn] = useState<number | null>(null);

  useEffect(() => {
    if (!conversion.quoteExpiresAt) {
      setQuoteExpiresIn(null);
      return;
    }

    const interval = setInterval(() => {
      const expiresAt = new Date(conversion.quoteExpiresAt!).getTime();
      const now = new Date().getTime();
      const secondsRemaining = Math.floor((expiresAt - now) / 1000);

      if (secondsRemaining <= 0) {
        setConversion((prev) => ({
          ...prev,
          quoteReference: null,
          quoteExpiresAt: null,
          exchangeRate: null,
          targetAmount: null,
          step: 'input',
        }));
        setQuoteExpiresIn(null);
        clearInterval(interval);
        addToast({
          type: 'warning',
          message: 'Quote expired. Please generate a new one.',
        });
      } else {
        setQuoteExpiresIn(secondsRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [conversion.quoteExpiresAt, addToast]);

  // ═════════════════════════════════════════════════════════════════
  // FETCH USD WALLET SUMMARY
  // ═════════════════════════════════════════════════════════════════

  const fetchUsdWallet = useCallback(async () => {
    if (!isAuthenticated) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await usdWalletService.getSummary();

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch USD wallet');
      }

      if (response.data) {
        setState({
          balance: response.data.balance,          // already in dollars, no ÷ 100
          lastSyncedAt: response.data.last_synced_at,
          recentTransactions: response.data.recent_transactions,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch USD wallet';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      console.error('[useUsdWallet] Error:', error);
    }
  }, [isAuthenticated]);

  // Fetch on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsdWallet();
    }
  }, [isAuthenticated, fetchUsdWallet]);

  // ═════════════════════════════════════════════════════════════════
  // CONVERSION OPERATIONS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Set the conversion direction
   */
  const setConversionDirection = useCallback(
    (source: WalletCurrency, target: WalletCurrency) => {
      setConversion({
        ...DEFAULT_CONVERSION_STATE,
        sourceCurrency: source,
        targetCurrency: target,
      });
    },
    []
  );

  /**
   * Update the source amount in the conversion form
   */
  const setConversionAmount = useCallback((amount: string) => {
    setConversion((prev) => ({
      ...prev,
      sourceAmount: amount,
      targetAmount: null,
      exchangeRate: null,
      quoteReference: null,
      step: 'input',
    }));
  }, []);

  /**
   * Generate an FX quote
   */
  const generateQuote = useCallback(async (): Promise<FxQuote | null> => {
    const amount = parseFloat(conversion.sourceAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast({ type: 'error', message: 'Please enter a valid amount' });
      return null;
    }

    // Convert major units to lowest denomination
    const lowestAmount = Math.round(amount * 100);

    try {
      const request: GenerateFxQuoteRequest = {
        source_currency: conversion.sourceCurrency,
        target_currency: conversion.targetCurrency,
        amount: lowestAmount,
      };

      const response = await fxService.generateQuote(request);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to generate quote');
      }

      const quote = response.data;

      setConversion((prev) => ({
        ...prev,
        targetAmount: quote.converted_amount,
        exchangeRate: quote.exchange_rate,
        quoteReference: quote.quote_reference,
        quoteExpiresAt: quote.expires_at,
        step: 'confirm',
      }));

      addToast({
        type: 'success',
        message: 'Quote generated successfully',
      });

      return quote;
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error?.message || 'Failed to generate quote',
      });
      return null;
    }
  }, [conversion.sourceAmount, conversion.sourceCurrency, conversion.targetCurrency, addToast]);

  /**
   * Execute the FX exchange using the stored quote reference
   */
  const executeExchange = useCallback(async (): Promise<boolean> => {
    if (!conversion.quoteReference) {
      addToast({ type: 'error', message: 'No active quote. Please generate a new one.' });
      return false;
    }

    setConversion((prev) => ({ ...prev, step: 'processing' }));

    try {
      const request: ExecuteFxExchangeRequest = {
        quote_reference: conversion.quoteReference,
      };

      const response = await fxService.executeExchange(request);

      if (!response.success) {
        const errorMsg = response.message || 'Conversion failed';

        if (errorMsg.toLowerCase().includes('expired')) {
          addToast({
            type: 'error',
            message: 'This quote has expired. Please generate a new one.',
          });
          setConversion(DEFAULT_CONVERSION_STATE);
        } else if (errorMsg.toLowerCase().includes('insufficient')) {
          addToast({
            type: 'error',
            message: errorMsg.includes('NGN')
              ? 'Insufficient NGN balance. Please fund your NGN wallet.'
              : 'Insufficient USD balance. Convert NGN to USD first.',
          });
        } else {
          addToast({ type: 'error', message: errorMsg });
        }

        setConversion((prev) => ({ ...prev, step: 'confirm' }));
        return false;
      }

      addToast({
        type: 'success',
        message: 'Conversion successful!',
      });

      // Reset conversion state
      setConversion(DEFAULT_CONVERSION_STATE);

      // Refresh USD wallet
      await fetchUsdWallet();

      return true;
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error?.message || 'Conversion failed. Please try again.',
      });
      setConversion((prev) => ({ ...prev, step: 'confirm' }));
      return false;
    }
  }, [conversion.quoteReference, addToast, fetchUsdWallet]);

  /**
   * Reset conversion to initial state
   */
  const resetConversion = useCallback(() => {
    setConversion(DEFAULT_CONVERSION_STATE);
    setQuoteExpiresIn(null);
  }, []);

  // ═════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════

  return {
    // Wallet state
    usdWalletState: state,
    balance: state.balance,
    formattedUsdBalance,
    usdBalanceInDollars,
    recentTransactions: state.recentTransactions,
    parsedTransactions,           // NEW: pre-parsed transactions with isCredit, formatting
    isLoading: state.isLoading,
    error: state.error,
    fetchUsdWallet,

    // Conversion state
    conversion,
    quoteExpiresIn,
    setConversionDirection,
    setConversionAmount,
    generateQuote,
    executeExchange,
    resetConversion,
  };
};
