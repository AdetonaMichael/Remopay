/**
 * Card Fee Service
 * Handles all card fee management operations
 * Base URL: /api/v1/admin/cards/fees
 */

import { apiClient } from './api-client';
import type {
  FeeConfigListResponse,
  FeeConfigSingleResponse,
  FeePreviewResponse,
  FeeTransactionsResponse,
  UpdateFeeConfigRequest,
} from '@/types/card-fee.types';

class CardFeeService {
  /**
   * List all fee configurations
   * GET /admin/cards/fees
   */
  async listFees(
    filters?: { fee_type?: string; is_active?: boolean },
    page: number = 1,
    perPage: number = 50
  ): Promise<FeeConfigListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(Math.min(perPage, 100)));

      if (filters?.fee_type) params.append('fee_type', filters.fee_type);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

      const response = await apiClient.get<FeeConfigListResponse>(
        `/admin/cards/fees?${params.toString()}`
      );

      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardFeeService] Error listing fees:', error);
      throw error;
    }
  }

  /**
   * Get single fee configuration
   * GET /admin/cards/fees/{feeType}
   */
  async getFee(feeType: string): Promise<FeeConfigSingleResponse> {
    try {
      const response = await apiClient.get<FeeConfigSingleResponse>(
        `/admin/cards/fees/${feeType}`
      );

      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardFeeService] Error fetching fee:', error);
      throw error;
    }
  }

  /**
   * Update fee configuration
   * PUT /admin/cards/fees/{feeType}
   */
  async updateFee(
    feeType: string,
    payload: UpdateFeeConfigRequest
  ): Promise<FeeConfigSingleResponse> {
    try {
      const response = await apiClient.put<FeeConfigSingleResponse>(
        `/admin/cards/fees/${feeType}`,
        payload
      );

      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardFeeService] Error updating fee:', error);
      throw error;
    }
  }

  /**
   * Toggle fee active status
   * POST /admin/cards/fees/{feeType}/toggle
   */
  async toggleFee(feeType: string): Promise<FeeConfigSingleResponse> {
    try {
      const response = await apiClient.post<FeeConfigSingleResponse>(
        `/admin/cards/fees/${feeType}/toggle`
      );

      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardFeeService] Error toggling fee:', error);
      throw error;
    }
  }

  /**
   * Preview fee calculation
   * GET /admin/cards/fees/preview?fee_type={feeType}&amount={amount}
   */
  async previewFee(feeType: string, amount?: number): Promise<FeePreviewResponse> {
    try {
      const params = new URLSearchParams();
      params.append('fee_type', feeType);
      if (amount !== undefined) params.append('amount', String(amount));

      const response = await apiClient.get<FeePreviewResponse>(
        `/admin/cards/fees/preview?${params.toString()}`
      );

      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardFeeService] Error previewing fee:', error);
      throw error;
    }
  }

  /**
   * Get fee transaction history
   * GET /admin/cards/fees/transactions
   */
  async getTransactions(
    filters?: {
      fee_type?: string;
      operation_type?: string;
      date_from?: string;
      date_to?: string;
    },
    page: number = 1,
    perPage: number = 20
  ): Promise<FeeTransactionsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(Math.min(perPage, 100)));

      if (filters?.fee_type) params.append('fee_type', filters.fee_type);
      if (filters?.operation_type) params.append('operation_type', filters.operation_type);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await apiClient.get<FeeTransactionsResponse>(
        `/admin/cards/fees/transactions?${params.toString()}`
      );

      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardFeeService] Error fetching fee transactions:', error);
      throw error;
    }
  }
}

export const cardFeeService = new CardFeeService();
