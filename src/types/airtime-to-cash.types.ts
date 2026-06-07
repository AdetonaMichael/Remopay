/**
 * Airtime-to-Cash Conversion Types
 * Type definitions for the airtime conversion to cash feature
 */

// Provider Configuration
export interface AirtimeCashProvider {
  code: string;
  name: string;
  logo_url: string;
  conversion_rate: number; // e.g., 0.80 = 80% conversion
  service_fee_percentage: number; // e.g., 0.05 = 5% fee
  is_active: boolean;
  receiving_number: string; // Phone number user sends airtime to
  min_amount: number; // Minimum airtime amount in NGN
  max_amount: number; // Maximum airtime amount in NGN
}

// User Form Data
export interface AirtimeToCashFormData {
  phone_number: string; // User's phone number (08012345678)
  provider: string; // Provider code (mtn, airtel, glo, 9mobile)
  airtime_amount: string; // Amount as string for form binding
  settlement_method: 'wallet'; // Currently only wallet
  notes?: string; // Optional notes
}

// API Request
export interface InitiateConversionRequest {
  phone_number: string;
  provider: string;
  airtime_amount: number;
  settlement_method: 'wallet';
  notes?: string;
}

// Airtime-to-Cash Transaction Status
export type AirtimeCashTransactionStatus =
  | 'pending'
  | 'transfer_submitted'
  | 'verification_in_progress'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';

// Single Transaction Response
export interface AirtimeToCashTransaction {
  id: number;
  user_id: number;
  phone_number: string;
  provider: string;
  airtime_amount: number;
  gross_amount: number;
  service_fee: number;
  service_fee_percentage: number;
  net_amount: number;
  cash_credited: number;
  conversion_rate: number;
  settlement_method: 'wallet';
  status: AirtimeCashTransactionStatus;
  reference: string; // Unique reference code
  screenshot_url?: string;
  screenshot_uploaded_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  rejected_by?: number;
  rejected_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Initiation Response with Instructions
export interface ConversionInstructions {
  reference: string;
  provider: string;
  provider_logo: string;
  receiving_number: string;
  airtime_amount: number;
  sender_number: string;
  settlement_method: 'wallet';
  expiration_time: string; // ISO 8601 datetime
  terms: string;
}

export interface InitiateConversionResponse {
  transaction: AirtimeToCashTransaction;
  instructions: ConversionInstructions;
}

// Submit Proof Request
export interface SubmitProofRequest {
  screenshot_url: string; // Public URL of uploaded screenshot
}

// Transaction History Response
export interface TransactionHistoryResponse {
  data: AirtimeToCashTransaction[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

// Summary Statistics
export interface TransactionSummary {
  total_requests: number;
  completed: number;
  rejected: number;
  pending: number;
  total_converted: number;
  total_fees_paid: number;
}

export interface HistoryWithSummary {
  data: TransactionHistoryResponse;
  summary: TransactionSummary;
}

// Statistics Response
export interface AirtimeToCashStats {
  total_requests: number;
  completed: number;
  pending: number;
  rejected: number;
  total_converted: number;
  total_fees_paid: number;
}

// Admin Dashboard Response
export interface AdminDashboardData {
  overview: {
    total_requests: number;
    pending_approval: number;
    approved_today: number;
    completed_today: number;
  };
  volume: {
    today_total_converted: number;
    this_month_total_converted: number;
    today_airtime_received: number;
    this_month_airtime_received: number;
  };
  revenue: {
    today_fees_earned: number;
    this_month_fees_earned: number;
    total_fees_earned: number;
  };
  status: {
    completed: number;
    rejected: number;
    pending: number;
  };
  by_provider: Record<string, ProviderStats>;
}

export interface ProviderStats {
  total_requests: number;
  completed: number;
  rejected: number;
  total_airtime_received: number;
  total_cash_converted: number;
  total_fees: number;
}

// Admin Transaction View (with user data)
export interface AdminTransactionView extends AirtimeToCashTransaction {
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  approvedBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  auditLogs?: AuditLog[];
}

// Audit Log for transaction changes
export interface AuditLog {
  id: number;
  airtime_conversion_transaction_id: number;
  action: string;
  performed_by_user_id?: number;
  performed_by_admin_id?: number;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
}

// Admin Approve Request
export interface AdminApproveRequest {
  notes?: string;
}

// Admin Reject Request
export interface AdminRejectRequest {
  rejection_reason: string;
  notes?: string;
}

// Admin Pending Conversions Response
export interface AdminPendingResponse {
  data: AdminTransactionView[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Conversion Calculations (for UI display)
export interface ConversionCalculation {
  airtimeAmount: number;
  serviceFee: number;
  netAmount: number;
  conversionRate: number;
  cashCredited: number;
}

// ============= NEW ADMIN ENDPOINTS TYPES =============

// Admin Provider Management
export interface AdminProviderResponse extends AirtimeCashProvider {
  total_conversions?: number;
  completed_today?: number;
  total_amount_converted?: number;
  avg_conversion_rate?: number;
}

export interface UpdateProviderRequest {
  conversion_rate?: number;
  service_fee_percentage?: number;
  is_active?: boolean;
  receiving_number?: string;
  min_amount?: number;
  max_amount?: number;
}

// Audit Logs Response (uses existing AuditLog interface)
export interface AuditLogsResponse {
  data: AuditLog[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Export Transactions
export interface ExportTransactionsRequest {
  status?: string;
  provider?: string;
  start_date?: string;
  end_date?: string;
  format?: 'csv' | 'xlsx'; // Default: csv
}

export interface ExportTransactionsResponse {
  download_url: string;
  file_name: string;
  format: string;
  total_records: number;
  generated_at: string;
}
