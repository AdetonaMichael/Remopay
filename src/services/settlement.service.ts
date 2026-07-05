/**
 * Admin Settlement Management - API Service
 * Date: July 4, 2026
 *
 * Comprehensive API service for all settlement operations including:
 * - Dashboard overview
 * - Configuration management (get, update, validate, test)
 * - Settlement batches (list, detail, generate, approve, settle)
 * - Settlement transactions (list, detail)
 * - Manual actions (execute, retry failed)
 */

import { apiClient } from './api-client';
import type {
  // Response types
  SettlementDashboardResponse,
  SettlementConfigResponse,
  ConfigValidationResponse,
  ConfigTestResponse,
  SettlementBatchesListResponse,
  SettlementBatchDetailResponse,
  GenerateBatchResponse,
  ApproveBatchResponse,
  SettleBatchResponse,
  BatchItemsResponse,
  SettlementTransactionsListResponse,
  SettlementTransactionResponse,
  ExecuteSettlementResponse,
  RetryFailedResponse,

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

const BASE_PATH = '/admin/settlement';

class SettlementService {
  // ============================================================================
  // DASHBOARD
  // ============================================================================

  /**
   * Get settlement dashboard overview with stats and latest batch
   * GET /admin/settlement/dashboard
   */
  async getDashboard(): Promise<SettlementDashboardResponse> {
    return apiClient.get(`${BASE_PATH}/dashboard`);
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get current settlement configuration
   * GET /admin/settlement/config
   */
  async getConfig(): Promise<SettlementConfigResponse> {
    return apiClient.get(`${BASE_PATH}/config`);
  }

  /**
   * Update settlement configuration
   * PUT /admin/settlement/config
   */
  async updateConfig(data: UpdateConfigRequest): Promise<SettlementConfigResponse> {
    return apiClient.put(`${BASE_PATH}/config`, data);
  }

  /**
   * Validate the current configuration
   * POST /admin/settlement/config/validate
   */
  async validateConfig(): Promise<ConfigValidationResponse> {
    return apiClient.post(`${BASE_PATH}/config/validate`);
  }

  /**
   * Test connectivity to configured Kuda accounts
   * POST /admin/settlement/config/test
   */
  async testConfig(): Promise<ConfigTestResponse> {
    return apiClient.post(`${BASE_PATH}/config/test`);
  }

  // ============================================================================
  // SETTLEMENT BATCHES
  // ============================================================================

  /**
   * List settlement batches with pagination and filters
   * GET /admin/settlement/batches
   */
  async getBatches(filters?: BatchListFilters): Promise<SettlementBatchesListResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/batches?${queryString}` : `${BASE_PATH}/batches`;

    return apiClient.get(url);
  }

  /**
   * Get batch details with items and settlement transactions
   * GET /admin/settlement/batches/{id}
   */
  async getBatch(id: number): Promise<SettlementBatchDetailResponse> {
    return apiClient.get(`${BASE_PATH}/batches/${id}`);
  }

  /**
   * Generate a new settlement batch
   * POST /admin/settlement/batches/generate
   */
  async generateBatch(data: GenerateBatchRequest): Promise<GenerateBatchResponse> {
    return apiClient.post(`${BASE_PATH}/batches/generate`, data);
  }

  /**
   * Approve a settlement batch
   * POST /admin/settlement/batches/{id}/approve
   */
  async approveBatch(id: number, data: ApproveBatchRequest): Promise<ApproveBatchResponse> {
    return apiClient.post(`${BASE_PATH}/batches/${id}/approve`, data);
  }

  /**
   * Execute settlement for a specific batch
   * POST /admin/settlement/batches/{id}/settle
   */
  async settleBatch(id: number, data: SettleBatchRequest): Promise<SettleBatchResponse> {
    return apiClient.post(`${BASE_PATH}/batches/${id}/settle`, data);
  }

  /**
   * List items in a batch with pagination
   * GET /admin/settlement/batches/{batchId}/items
   */
  async getBatchItems(batchId: number, filters?: BatchItemFilters): Promise<BatchItemsResponse> {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString
      ? `${BASE_PATH}/batches/${batchId}/items?${queryString}`
      : `${BASE_PATH}/batches/${batchId}/items`;

    return apiClient.get(url);
  }

  // ============================================================================
  // SETTLEMENT TRANSACTIONS
  // ============================================================================

  /**
   * List settlement transactions with pagination and filters
   * GET /admin/settlement/transactions
   */
  async getTransactions(filters?: SettlementTxFilters): Promise<SettlementTransactionsListResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.batch_id) params.append('batch_id', String(filters.batch_id));
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/transactions?${queryString}` : `${BASE_PATH}/transactions`;

    return apiClient.get(url);
  }

  /**
   * Get single transaction with full details
   * GET /admin/settlement/transactions/{id}
   */
  async getTransaction(id: number): Promise<SettlementTransactionResponse> {
    return apiClient.get(`${BASE_PATH}/transactions/${id}`);
  }

  // ============================================================================
  // MANUAL ACTIONS
  // ============================================================================

  /**
   * Manually trigger the settlement process
   * POST /admin/settlement/execute
   */
  async executeSettlement(data: ExecuteSettlementRequest): Promise<ExecuteSettlementResponse> {
    return apiClient.post(`${BASE_PATH}/execute`, data);
  }

  /**
   * Retry all failed settlement transactions
   * POST /admin/settlement/retry-failed
   */
  async retryFailed(): Promise<RetryFailedResponse> {
    return apiClient.post(`${BASE_PATH}/retry-failed`);
  }
}

// Export singleton instance
export const settlementService = new SettlementService();
export default settlementService;
