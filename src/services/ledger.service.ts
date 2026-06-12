/**
 * Ledger System - API Service
 * Date: June 12, 2026
 * 
 * Comprehensive API service for all ledger operations including:
 * - Account management (list, get, create, update status, sync balance)
 * - Ledger entries (list, get, create, reverse, void)
 * - Reconciliation (generate, view reports)
 * - Settlement batches (generate, view, update status)
 * - Reports (trial balance, account ledger, export)
 * - Dashboard (summary overview)
 */

import { apiClient } from './api-client';
import {
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
  
  // Response types
  GetAccountsResponse,
  GetAccountResponse,
  CreateAccountResponse,
  UpdateAccountStatusResponse,
  SyncAccountBalanceResponse,
  GetEntriesResponse,
  GetEntryResponse,
  CreateEntryResponse,
  ReverseLedgerEntryResponse,
  GetBatchesResponse,
  GetBatchResponse,
  GenerateReconciliationResponse,
  GetReconciliationReportsResponse,
  GetReconciliationReportResponse,
  TrialBalanceReportResponse,
  AccountLedgerReportResponse,
  ExportReportResponse,
  DashboardResponse,
  
  // Filter types
  AccountFilters,
  EntryFilters,
  BatchFilters,
  ReconciliationFilters,
} from '@/types/ledger.types';
import { ApiResponse } from '@/types/api.types';

const BASE_PATH = '/admin/ledger';

class LedgerService {
  // ============================================================================
  // ACCOUNT OPERATIONS
  // ============================================================================

  /**
   * Get all ledger accounts with optional filters
   * GET /admin/ledger/accounts
   */
  async getAccounts(filters?: AccountFilters): Promise<GetAccountsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/accounts?${queryString}` : `${BASE_PATH}/accounts`;

    return apiClient.get(url);
  }

  /**
   * Get a specific account with details
   * GET /admin/ledger/accounts/{account_id}
   */
  async getAccount(accountId: number): Promise<GetAccountResponse> {
    return apiClient.get(`${BASE_PATH}/accounts/${accountId}`);
  }

  /**
   * Create a new ledger account
   * POST /admin/ledger/accounts
   */
  async createAccount(data: CreateAccountRequest): Promise<CreateAccountResponse> {
    return apiClient.post(`${BASE_PATH}/accounts`, data);
  }

  /**
   * Update account status (active, inactive, archived)
   * PATCH /admin/ledger/accounts/{account_id}/status
   */
  async updateAccountStatus(
    accountId: number,
    data: UpdateAccountStatusRequest
  ): Promise<UpdateAccountStatusResponse> {
    return apiClient.patch(`${BASE_PATH}/accounts/${accountId}/status`, data);
  }

  /**
   * Sync account balance (recalculate from entries)
   * POST /admin/ledger/accounts/{account_id}/sync-balance
   */
  async syncAccountBalance(accountId: number): Promise<ApiResponse<SyncAccountBalanceResponse>> {
    return apiClient.post(`${BASE_PATH}/accounts/${accountId}/sync-balance`, {});
  }

  // ============================================================================
  // LEDGER ENTRY OPERATIONS
  // ============================================================================

  /**
   * Get all ledger entries with optional filters
   * GET /admin/ledger/entries
   */
  async getEntries(filters?: EntryFilters): Promise<GetEntriesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.account_id) params.append('account_id', String(filters.account_id));
    if (filters?.entry_type) params.append('entry_type', filters.entry_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.user_id) params.append('user_id', String(filters.user_id));
    if (filters?.transaction_reference) params.append('transaction_reference', filters.transaction_reference);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/entries?${queryString}` : `${BASE_PATH}/entries`;

    return apiClient.get(url);
  }

  /**
   * Get a specific entry with audit trail
   * GET /admin/ledger/entries/{entry_id}
   */
  async getEntry(entryId: number): Promise<GetEntryResponse> {
    return apiClient.get(`${BASE_PATH}/entries/${entryId}`);
  }

  /**
   * Create a manual ledger entry
   * POST /admin/ledger/entries
   */
  async createEntry(data: CreateLedgerEntryRequest): Promise<CreateEntryResponse> {
    return apiClient.post(`${BASE_PATH}/entries`, data);
  }

  /**
   * Reverse a ledger entry (creates offsetting entry)
   * POST /admin/ledger/entries/{entry_id}/reverse
   */
  async reverseEntry(
    entryId: number,
    data: ReverseLedgerEntryRequest
  ): Promise<ApiResponse<ReverseLedgerEntryResponse>> {
    return apiClient.post(`${BASE_PATH}/entries/${entryId}/reverse`, data);
  }

  /**
   * Void a ledger entry (mark as voided)
   * POST /admin/ledger/entries/{entry_id}/void
   */
  async voidEntry(
    entryId: number,
    data: VoidLedgerEntryRequest
  ): Promise<ApiResponse<{ entry: any }>> {
    return apiClient.post(`${BASE_PATH}/entries/${entryId}/void`, data);
  }

  // ============================================================================
  // RECONCILIATION OPERATIONS
  // ============================================================================

  /**
   * Generate a daily reconciliation report
   * POST /admin/ledger/reconciliation/generate
   */
  async generateReconciliation(
    data: GenerateReconciliationRequest
  ): Promise<GenerateReconciliationResponse> {
    return apiClient.post(`${BASE_PATH}/reconciliation/generate`, data);
  }

  /**
   * Get reconciliation reports history
   * GET /admin/ledger/reconciliation/reports
   */
  async getReconciliationReports(
    filters?: ReconciliationFilters
  ): Promise<GetReconciliationReportsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/reconciliation/reports?${queryString}` : `${BASE_PATH}/reconciliation/reports`;

    return apiClient.get(url);
  }

  /**
   * Get a specific reconciliation report with details
   * GET /admin/ledger/reconciliation/reports/{report_id}
   */
  async getReconciliationReport(reportId: number): Promise<GetReconciliationReportResponse> {
    return apiClient.get(`${BASE_PATH}/reconciliation/reports/${reportId}`);
  }

  // ============================================================================
  // SETTLEMENT BATCH OPERATIONS
  // ============================================================================

  /**
   * Generate a daily settlement batch
   * POST /admin/ledger/batches/generate
   */
  async generateSettlementBatch(
    data: GenerateSettlementBatchRequest
  ): Promise<ApiResponse<{ batch: any }>> {
    return apiClient.post(`${BASE_PATH}/batches/generate`, data);
  }

  /**
   * Get settlement batches with optional filters
   * GET /admin/ledger/batches
   */
  async getSettlementBatches(filters?: BatchFilters): Promise<GetBatchesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}/batches?${queryString}` : `${BASE_PATH}/batches`;

    return apiClient.get(url);
  }

  /**
   * Get a specific settlement batch with details
   * GET /admin/ledger/batches/{batch_id}
   */
  async getSettlementBatch(batchId: number): Promise<GetBatchResponse> {
    return apiClient.get(`${BASE_PATH}/batches/${batchId}`);
  }

  /**
   * Update settlement batch status
   * PATCH /admin/ledger/batches/{batch_id}/status
   */
  async updateBatchStatus(
    batchId: number,
    data: UpdateBatchStatusRequest
  ): Promise<ApiResponse<{ batch: any }>> {
    return apiClient.patch(`${BASE_PATH}/batches/${batchId}/status`, data);
  }

  // ============================================================================
  // REPORT OPERATIONS
  // ============================================================================

  /**
   * Generate trial balance report
   * POST /admin/ledger/reports/trial-balance
   */
  async generateTrialBalanceReport(
    data: GenerateTrialBalanceRequest
  ): Promise<TrialBalanceReportResponse> {
    return apiClient.post(`${BASE_PATH}/reports/trial-balance`, data);
  }

  /**
   * Generate account ledger report
   * POST /admin/ledger/reports/account-ledger
   */
  async generateAccountLedgerReport(
    data: GenerateAccountLedgerRequest
  ): Promise<AccountLedgerReportResponse> {
    return apiClient.post(`${BASE_PATH}/reports/account-ledger`, data);
  }

  /**
   * Export report to CSV or PDF
   * POST /admin/ledger/reports/export
   */
  async exportReport(data: ExportReportRequest): Promise<ApiResponse<{ export: ExportReportResponse }>> {
    return apiClient.post(`${BASE_PATH}/reports/export`, data);
  }

  // ============================================================================
  // DASHBOARD OPERATIONS
  // ============================================================================

  /**
   * Get dashboard summary with key metrics
   * GET /admin/ledger/dashboard
   */
  async getDashboard(): Promise<DashboardResponse> {
    return apiClient.get(`${BASE_PATH}/dashboard`);
  }
}

// Export singleton instance
export const ledgerService = new LedgerService();
export default ledgerService;
