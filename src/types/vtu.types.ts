// VTU Service Types
export interface VTUService {
  identifier: string;
  name: string;
}

export interface VTUProvider {
  serviceID: string;
  name: string;
  minimium_amount: string | number;
  maximum_amount: string | number;
  convinience_fee: string;
  product_type: string;
  image?: string;
  biller_code?: string;
  biller_id?: string;
  image_url?: string;
  ported?: boolean;
  inter_switch_code?: string;
  inter_switch_id?: string;
}

export interface VariationSubsidized {
  enabled: boolean;
  original_amount: number;
  subsidized_amount: number;
  savings: number;
}

export interface VariationSubsidy {
  enabled: boolean;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface VTUVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
  subsidized?: VariationSubsidized;
}

export interface VTUVariationResponse {
  ServiceName: string;
  serviceID: string;
  convinience_fee: string;
  variations: VTUVariation[];
  subsidy?: VariationSubsidy;
}

export interface VTUPaymentRequest {
  amount: string | number;
  billersCode?: string;
  country_code?: string;
  email?: string;
  operator_id?: string;
  phone: string;
  product_type_id?: string;
  request_id?: string;
  serviceID: string;
  variation_code?: string;
  user_id?: number;
  pin?: string;
}

export interface VTUPaymentResponse {
  response_description: string;
  request_id: string;
  transaction_id?: string;
  status: string;
  message?: string;
}

// ========================================
// VTU Pay (Wallet) API Types
// ========================================

/**
 * Subsidy metadata returned in the pay response when subsidy was applied
 */
export interface SubsidyMeta {
  subsidy_applied: boolean;
  subsidy_type: 'percentage' | 'fixed';
  subsidy_value: number;
  original_amount: number;
  subsidized_amount: number;
  savings: number;
}

/**
 * Response from POST /api/v1/wallet/pay-vtu endpoint
 */
export interface VtuPayResponse {
  success: boolean;
  reference: string;
  vtu_reference?: string;
  original_amount: number;
  customer_payable: number;
  balance: number;
  status: string;
  subsidy?: SubsidyMeta;
  offer?: Record<string, any>;
  request_id?: string;
  message?: string;
}

/**
 * Request payload for POST /api/v1/wallet/pay-vtu
 */
export interface VtuPayRequest {
  serviceID: string;
  phone: string;
  amount: string | number;
  variation_code: string;
  billersCode?: string;
  pin: string;
}

export interface AirtimeTransaction {
  id: string;
  phone: string;
  provider: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  request_id: string;
}

// ═══════════════════════════════════════════════════════════════════════
// VTU STATISTICS TYPES (NEW - May 2026 Backend Update)
// ═══════════════════════════════════════════════════════════════════════

export interface VtuStatsSummary {
  total_transactions: number;
  total_amount: number;
  total_commission: number;
  total_discount: number;
  total_convenience_fee: number;
  net_amount: number;
  success_rate?: number;
  successful_count?: number;
  failed_count?: number;
}

export interface VtuStatsByStatus {
  completed?: {
    count: number;
    total_amount: number;
    total_commission: number;
  };
  pending?: {
    count: number;
    total_amount: number;
    total_commission: number;
  };
  failed?: {
    count: number;
    total_amount: number;
    total_commission: number;
  };
  [key: string]: any;
}

export interface VtuProductTypeStats {
  type: string;
  count: number;
  total_amount: number;
  total_commission: number;
  success_count?: number;
}

export interface VtuStatusByProductType {
  [productType: string]: {
    completed?: { count: number; total_amount: number };
    pending?: { count: number; total_amount: number };
    failed?: { count: number; total_amount: number };
  };
}

export interface UserVtuStatistics {
  period: 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  summary: VtuStatsSummary;
  by_status: VtuStatsByStatus;
  by_product_type: VtuProductTypeStats[];
  status_by_product_type: VtuStatusByProductType;
}

export interface AdminVtuStatistics {
  summary: VtuStatsSummary;
  by_status: Array<{
    status: string;
    count: number;
    total_amount: number;
    total_commission: number;
  }>;
  by_product_type: VtuProductTypeStats[];
}

export interface AdminWalletStats {
  total_balance: number;
  transactions: Array<{
    type: string;
    status: string;
    count: number;
    amount: number;
  }>;
}

export interface AdminUserStats {
  total: number;
  new: number;
  verified: number;
}

export interface AdminPerformanceStats {
  success_rate: number;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
}

export interface AdminStatisticsData {
  period: 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  users: AdminUserStats;
  wallet: AdminWalletStats;
  vtu: {
    summary: VtuStatsSummary;
    by_status: Array<{
      status: string;
      count: number;
      total_amount: number;
      total_commission: number;
    }>;
    by_product_type: VtuProductTypeStats[];
  };
  performance: AdminPerformanceStats;
}

// ═══════════════════════════════════════════════════════════════════════
// USER WALLET STATISTICS
// ═══════════════════════════════════════════════════════════════════════

export interface UserWalletTransaction {
  type: string;
  status: string;
  count: number;
  amount: number;
}

export interface UserWalletStatistics {
  period: 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  current_balance: string;
  credits: {
    count: number;
    amount: number;
  };
  debits: {
    count: number;
    amount: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════
// USER PROFILE STATISTICS
// ═══════════════════════════════════════════════════════════════════════

export interface UserProfileInfo {
  name: string;
  email: string;
  phone: string;
  joined_date: string;
}

export interface UserStatistics {
  total_transactions: number;
  wallet_balance: string;
  total_spent: number;
  account_age_days: number;
  verification_status: boolean;
  user_info: UserProfileInfo;
}

// ═══════════════════════════════════════════════════════════════════════
// COMBINED USER STATISTICS (ALL)
// ═══════════════════════════════════════════════════════════════════════

export interface CombinedUserStatistics {
  wallet: UserWalletStatistics;
  vtu: UserVtuStatistics;
  user: UserStatistics;
}

// ═══════════════════════════════════════════════════════════════════════
// VTU SUBSIDY TYPES (Admin Subsidy Management)
// ═══════════════════════════════════════════════════════════════════════

export type SubsidyType = 'percentage' | 'fixed';

export interface ServiceSubsidyConfig {
  service_id: string;
  service_name: string;
  subsidy_enabled: boolean;
  subsidy_type: SubsidyType;
  subsidy_value: number;
  min_discount_cap: number | null;
  max_discount_cap: number | null;
}

export interface ToggleSubsidyResponse {
  service_id: string;
  service_name: string;
  subsidy_enabled: boolean;
}

export interface UpdateSubsidyPayload {
  subsidy_type: SubsidyType;
  subsidy_value: number;
  min_discount_cap?: number | null;
  max_discount_cap?: number | null;
}

export interface SubsidyPreview {
  originalAmount: number;
  discount: number;
  subsidizedAmount: number;
  savings: number;
}
