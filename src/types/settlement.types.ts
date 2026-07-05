/**
 * Admin Settlement Management - Complete TypeScript Types
 * Date: July 4, 2026
 *
 * This file defines all TypeScript interfaces for the Admin Settlement Management system
 * including configuration, batches, transactions, and dashboard data.
 */

import type { ApiResponse, PaginationMeta } from './api.types';

// ============================================================================
// ENUMS & LITERAL TYPES
// ============================================================================

export type SettlementBatchStatus = 'pending' | 'processing' | 'settled' | 'failed' | 'partially_settled';
export type SettlementBatchType = 'commission' | 'vtu_principal' | 'provider_settlement';
export type SettlementTransactionStatus = 'pending' | 'processing' | 'success' | 'failed';
export type BatchItemType = 'vtu' | 'funding' | 'reversal';
export type SettlementConfigTab = 'schedule' | 'commission' | 'vtu' | 'recipients' | 'advanced';

// ============================================================================
// ACCOUNT TYPES
// ============================================================================

export interface SettlemenConfigAccount {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  min_transfer_amount: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface SettlementConfigRetry {
  max_attempts: number;
  delay_minutes: number;
}

export interface SettlementConfigNotifications {
  on_success: boolean;
  on_failure: boolean;
  channels: string[];
}

export interface SettlementConfig {
  id: number;
  name: string;
  schedule: string;
  enabled: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  reporting_period_days: number;
  commission_account: SettlemenConfigAccount | null;
  vtu_settlement_account: SettlemenConfigAccount | null;
  report_recipient_emails: string[];
  process_commissions: boolean;
  process_vtu_settlement: boolean;
  retry: SettlementConfigRetry;
  notifications: SettlementConfigNotifications;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateConfigRequest {
  schedule?: string;
  enabled?: boolean;
  reporting_period_days?: number;
  commission_account_number?: string;
  commission_account_name?: string;
  commission_bank_code?: string;
  commission_bank_name?: string;
  vtu_settlement_account_number?: string;
  vtu_settlement_account_name?: string;
  vtu_settlement_bank_code?: string;
  vtu_settlement_bank_name?: string;
  min_commission_transfer_amount?: number;
  min_vtu_transfer_amount?: number;
  report_recipient_emails?: string[];
  process_commissions?: boolean;
  process_vtu_settlement?: boolean;
  retry_max_attempts?: number;
  retry_delay_minutes?: number;
  notify_on_success?: boolean;
  notify_on_failure?: boolean;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ConfigAccountTestResult {
  status: 'ok' | 'fail';
  message: string;
}

export interface ConfigTestResult {
  success: boolean;
  results: {
    commission_account: ConfigAccountTestResult;
    vtu_settlement_account: ConfigAccountTestResult;
  };
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface SettlementDashboardMonthlyTotals {
  commission: number;
  vtu_principal: number;
  total_settled: number;
}

export interface SettlementDashboardConfigStatus {
  exists: boolean;
  enabled: boolean;
  schedule: string;
  next_run_at: string | null;
  last_run_at: string | null;
  is_valid: boolean;
  has_commission_account: boolean;
  has_vtu_account: boolean;
  recipients_count: number;
}

export interface SettlementDashboardBatchSummary {
  total: number;
  pending: number;
  settled: number;
  failed: number;
}

export interface SettlementDashboardTransactionSummary {
  total: number;
  successful: number;
  failed: number;
  pending: number;
}

export interface LatestBatch {
  id: number;
  batch_reference: string;
  settlement_date: string;
  status: SettlementBatchStatus;
  items_count: number;
  total_vtu_purchases: string;
  total_remopay_commission: string;
  created_at: string;
}

export interface SettlementDashboardData {
  config: SettlementDashboardConfigStatus;
  latest_batch: LatestBatch | null;
  batches: SettlementDashboardBatchSummary;
  transactions: SettlementDashboardTransactionSummary;
  monthly_totals: SettlementDashboardMonthlyTotals;
}

// ============================================================================
// SETTLEMENT BATCH TYPES
// ============================================================================

export interface SettlementBatchRecord {
  id: number;
  batch_reference: string;
  settlement_date: string;
  batch_period_start: string;
  batch_period_end: string;
  total_clearing_inflow: string;
  total_customer_funding: string;
  total_vtu_purchases: string;
  total_remopay_commission: string;
  total_provider_payable: string;
  total_reversals_refunds: string;
  net_clearing_balance: string;
  opening_clearing_balance: string;
  closing_clearing_balance: string;
  status: SettlementBatchStatus;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface BatchSummary {
  total_clearing_inflow: number;
  total_customer_funding: number;
  total_vtu_purchases: number;
  total_remopay_commission: number;
  total_provider_payable: number;
  total_reversals_refunds: number;
  net_clearing_balance: number;
  opening_clearing_balance: number;
  closing_clearing_balance: number;
}

export interface BatchCreator {
  id: number;
  first_name: string;
  last_name: string;
}

export interface BatchItem {
  id: number;
  transaction_reference: string;
  transaction_type: string;
  amount: string;
  commission_amount: string;
  provider_payable_amount: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  status: string;
}

export interface BatchPayout {
  id: number;
  provider: string;
  amount: string;
  status: string;
  reference: string;
  created_at: string;
}

export interface BatchSettlementTransaction {
  id: number;
  settlement_reference: string;
  settlement_type: SettlementBatchType;
  gross_amount: string;
  net_amount: string;
  status: SettlementTransactionStatus;
  external_reference: string | null;
  beneficiary_account_number: string;
  beneficiary_account_name: string;
  initiated_at: string;
  completed_at: string | null;
}

export interface SettlementBatchDetail {
  batch: SettlementBatchRecord & {
    items: BatchItem[];
    settlement_transactions: BatchSettlementTransaction[];
    payouts: BatchPayout[];
    creator: BatchCreator;
  };
  summary: BatchSummary;
  items_count: number;
  items_by_type: {
    funding: number;
    vtu: number;
    reversals: number;
  };
}

export interface GenerateBatchRequest {
  settlement_date: string;
  period_days: number;
}

export interface ApproveBatchRequest {
  notes: string;
}

export interface SettleBatchRequest {
  dry_run: boolean;
}

export interface SettlementExecuteResult {
  commission: {
    id: number;
    settlement_reference: string;
    settlement_type: string;
    gross_amount: string;
    net_amount: string;
    status: SettlementTransactionStatus;
    external_reference: string;
    beneficiary_account_number: string;
  };
  vtu_principal: {
    id: number;
    settlement_reference: string;
    settlement_type: string;
    gross_amount: string;
    net_amount: string;
    status: SettlementTransactionStatus;
    external_reference: string;
    beneficiary_account_number: string;
  };
  errors: string[];
}

// ============================================================================
// SETTLEMENT TRANSACTION TYPES
// ============================================================================

export interface SettlementTransactionBatch {
  id: number;
  batch_reference: string;
  settlement_date: string;
}

export interface SettlementTransaction {
  id: number;
  settlement_reference: string;
  settlement_type: SettlementBatchType;
  gross_amount: string;
  net_amount: string;
  status: SettlementTransactionStatus;
  external_reference: string | null;
  beneficiary_account_number: string;
  beneficiary_account_name: string;
  settlement_batch: SettlementTransactionBatch;
  initiated_at: string;
  completed_at: string | null;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export interface ExecuteSettlementRequest {
  dry_run: boolean;
  config_id?: number;
}

export interface ExecuteSettlementResult {
  exit_code: number;
  output: string;
  dry_run: boolean;
}

export interface RetryFailedResult {
  retried_count: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface BatchListFilters {
  status?: SettlementBatchStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface BatchItemFilters {
  type?: BatchItemType;
  page?: number;
  per_page?: number;
}

export interface SettlementTxFilters {
  status?: SettlementTransactionStatus;
  type?: SettlementBatchType;
  batch_id?: number;
  page?: number;
  per_page?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SettlementDashboardResponse extends ApiResponse<SettlementDashboardData> {}

export interface SettlementConfigResponse extends ApiResponse<SettlementConfig> {}

export interface ConfigValidationResponse extends ApiResponse<ConfigValidationResult> {}

export interface ConfigTestResponse extends ApiResponse<ConfigTestResult> {}

export interface SettlementBatchesListResponse extends ApiResponse<{
  batches: SettlementBatchRecord[];
  pagination: PaginationMeta;
}> {}

export interface SettlementBatchDetailResponse extends ApiResponse<SettlementBatchDetail> {}

export interface GenerateBatchResponse extends ApiResponse<{
  batch: SettlementBatchRecord;
  summary: BatchSummary;
}> {}

export interface ApproveBatchResponse extends ApiResponse<{
  batch: SettlementBatchRecord;
}> {}

export interface SettleBatchResponse extends ApiResponse<{
  transactions: SettlementExecuteResult;
  errors: string[];
}> {}

export interface BatchItemsResponse extends ApiResponse<{
  items: BatchItem[];
  pagination: PaginationMeta;
  totals: {
    amount: number;
    commission: number;
    fees: number;
  };
}> {}

export interface SettlementTransactionsListResponse extends ApiResponse<{
  transactions: SettlementTransaction[];
  pagination: PaginationMeta;
}> {}

export interface SettlementTransactionResponse extends ApiResponse<SettlementTransaction> {}

export interface ExecuteSettlementResponse extends ApiResponse<ExecuteSettlementResult> {}

export interface RetryFailedResponse extends ApiResponse<RetryFailedResult> {}
