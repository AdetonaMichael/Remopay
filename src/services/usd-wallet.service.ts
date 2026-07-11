/**
 * USD Wallet Service
 * Handles all USD wallet API calls
 * Base URL: /api/v1/usd/wallet
 */

import { apiClient } from './api-client';
import type { UsdWalletSummaryResponse } from '@/types/usd-wallet.types';

class UsdWalletService {
  /**
   * Get USD wallet summary including balance and recent transactions
   * GET /api/v1/usd/wallet/summary
   */
  async getSummary(): Promise<UsdWalletSummaryResponse> {
    try {
      const response = await apiClient.get<any>('/usd/wallet/summary');

      if (response.success && response.data) {
        return {
          success: true,
          message: response.message || 'USD wallet summary fetched',
          data: {
            balance: response.data.balance ?? 0,
            last_synced_at: response.data.last_synced_at || null,
            recent_transactions: Array.isArray(response.data.recent_transactions)
              ? response.data.recent_transactions.map((txn: any) => ({
                  id: txn.id,
                  type: txn.type,
                  amount: txn.amount,
                  balance_before: txn.balance_before,
                  balance_after: txn.balance_after,
                  description: txn.description,
                  created_at: txn.created_at,
                }))
              : [],
          },
        };
      }

      return {
        success: response.success ?? false,
        message: response.message || 'Failed to fetch USD wallet summary',
        errors: response.errors,
      };
    } catch (error: any) {
      console.error('[UsdWalletService] Error fetching summary:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch USD wallet summary',
        errors: error?.errors,
      };
    }
  }
}

export const usdWalletService = new UsdWalletService();
