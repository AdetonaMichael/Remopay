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
      const response = await apiClient.post<any>('/payment/fx/quote', request);
      
      if (response.success && response.data) {
        // Transform API response to match FxQuote interface
        const transformedData: FxQuote = {
          quote_reference: response.data.reference,
          source_currency: response.data.source.currency,
          target_currency: response.data.target.currency,
          source_amount: response.data.source.amount,
          converted_amount: response.data.target.amount,
          exchange_rate: response.data.rate,
          expires_at: response.data.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          created_at: response.data.created_at || new Date().toISOString(),
        };
        
        return {
          success: response.success,
          message: response.message,
          data: transformedData,
        };
      }
      
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
      const response = await apiClient.post<any>('/payment/fx/exchange', request);
      
      if (response.success && response.data) {
        // Transform API response to match FxTransaction interface
        const transformedData: FxTransaction = {
          transaction_reference: response.data.reference || response.data.transaction_reference,
          source: response.data.source,
          target: response.data.target,
          rate: response.data.rate,
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString(),
        };
        
        return {
          success: response.success,
          message: response.message,
          data: transformedData,
        };
      }
      
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
      const response = await apiClient.get<any[]>('/payment/fx/history');
      
      if (response.success && Array.isArray(response.data)) {
        // Transform API response to match FxTransaction interface
        const transformedData: FxTransaction[] = response.data.map(item => ({
          transaction_reference: item.reference || item.transaction_reference,
          source: item.source,
          target: item.target,
          rate: item.rate,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));
        
        return {
          success: response.success,
          message: response.message,
          data: transformedData,
        };
      }
      
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
