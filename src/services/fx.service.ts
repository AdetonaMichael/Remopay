/**
 * FX Service
 * Handles all FX conversion API calls
 */

import { apiClient } from './api-client';
import type {
  GenerateFxQuoteRequest,
  GenerateFxQuoteResponse,
  ExecuteFxExchangeRequest,
  ExecuteFxExchangeResponse,
  GetFxHistoryResponse,
  FxQuote,
  FxTransaction,
} from '@/types/fx.types';

export const fxService = {
  /**
   * Generate an FX quote with current exchange rate
   */
  async generateQuote(request: GenerateFxQuoteRequest): Promise<GenerateFxQuoteResponse> {
    try {
      const response = await apiClient.post<FxQuote>('/payment/fx/quote', request);
      return response as GenerateFxQuoteResponse;
    } catch (error: any) {
      console.error('[FxService] Error generating quote:', error);
      return {
        success: false,
        message: error?.message || 'Failed to generate quote',
        errors: error?.errors,
      };
    }
  },

  /**
   * Execute a currency exchange using a quote reference
   */
  async executeExchange(request: ExecuteFxExchangeRequest): Promise<ExecuteFxExchangeResponse> {
    try {
      const response = await apiClient.post<FxTransaction>('/payment/fx/exchange', request);
      return response as ExecuteFxExchangeResponse;
    } catch (error: any) {
      console.error('[FxService] Error executing exchange:', error);
      return {
        success: false,
        message: error?.message || 'Failed to execute exchange',
        errors: error?.errors,
      };
    }
  },

  /**
   * Get FX transaction history
   */
  async getHistory(): Promise<GetFxHistoryResponse> {
    try {
      const response = await apiClient.get<FxTransaction[]>('/payment/fx/history');
      return response as GetFxHistoryResponse;
    } catch (error: any) {
      console.error('[FxService] Error fetching history:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch history',
      };
    }
  },
};
