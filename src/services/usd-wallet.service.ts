/**
 * USD Wallet Service
 * Handles all USD wallet API calls
 * Base URL: /api/v1/usd/wallet
 */

import { apiClient } from './api-client';
import type {
  UsdWalletSummaryResponse,
  UsdWalletInfoResponse,
  UsdTransactionsResponse,
  UsdTransactionsQuery,
  UsdTransaction,
} from '@/types/usd-wallet.types';

/**
 * Shared mapping: transform a raw API transaction object into UsdTransaction.
 */
function mapTransaction(txn: any): UsdTransaction {
  return {
    id: txn.id,
    usd_wallet_id: txn.usd_wallet_id,
    user_id: txn.user_id,
    type: txn.type,
    amount: txn.amount,
    balance_before: txn.balance_before,
    balance_after: txn.balance_after,
    reference: txn.reference || '',
    description: txn.description,
    metadata: txn.metadata ?? null,
    idempotency_key_id: txn.idempotency_key_id ?? null,
    created_at: txn.created_at,
    updated_at: txn.updated_at,
  };
}

class UsdWalletService {
  /**
   * Get USD wallet summary including balance and recent transactions
   * GET /api/v1/usd/wallet/summary
   *
   * Response shape:
   * - balance: number (already in dollars, e.g. 0.71 — NOT cents)
   * - amount on transactions: decimal string (e.g. "0.71" — must parseFloat)
   * - metadata: nullable on conversion_in/conversion_out types
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
              ? response.data.recent_transactions.map(mapTransaction)
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

  /**
   * Get USD wallet info (wallet record with balance and timestamps)
   * GET /api/v1/usd/wallet
   */
  async getWalletInfo(): Promise<UsdWalletInfoResponse> {
    try {
      const response = await apiClient.get<any>('/usd/wallet');

      if (response.success && response.data) {
        return {
          success: true,
          message: response.message || 'USD wallet retrieved',
          data: {
            id: response.data.id,
            user_id: response.data.user_id,
            balance: response.data.balance ?? 0,
            last_synced_at: response.data.last_synced_at || null,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at,
          },
        };
      }

      return {
        success: response.success ?? false,
        message: response.message || 'Failed to fetch USD wallet info',
        errors: response.errors,
      };
    } catch (error: any) {
      console.error('[UsdWalletService] Error fetching wallet info:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch USD wallet info',
        errors: error?.errors,
      };
    }
  }

  /**
   * Get USD wallet transactions with balance
   * GET /api/v1/usd/transactions
   *
   * Query params:
   * - limit: number (1-100, default 20)
   * - type: UsdTransactionType (optional filter)
   */
  async getTransactions(query?: UsdTransactionsQuery): Promise<UsdTransactionsResponse> {
    try {
      const params = new URLSearchParams();
      if (query?.limit) params.set('limit', String(query.limit));
      if (query?.type) params.set('type', query.type);

      const qs = params.toString();
      const path = qs ? `/usd/transactions?${qs}` : '/usd/transactions';
      const response = await apiClient.get<any>(path);

      if (response.success && response.data) {
        return {
          success: true,
          message: response.message || 'USD wallet transactions retrieved',
          data: {
            balance: response.data.balance ?? 0,
            transactions: Array.isArray(response.data.transactions)
              ? response.data.transactions.map(mapTransaction)
              : [],
          },
        };
      }

      return {
        success: response.success ?? false,
        message: response.message || 'Failed to fetch USD wallet transactions',
        errors: response.errors,
      };
    } catch (error: any) {
      console.error('[UsdWalletService] Error fetching transactions:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch USD wallet transactions',
        errors: error?.errors,
      };
    }
  }
}

export const usdWalletService = new UsdWalletService();
