/**
 * Transaction Detail Types
 *
 * Based on backend API: GET /api/v1/transactions/{id}
 * Covers all transaction types: VTU, Airtime Conversion, Paystack, Wallet
 */

// ─── Basic ─────────────────────────────────────────────────────────────

export interface TransactionBasic {
  id: number;
  reference: string;
  transaction_type: string;
  status: string;
  service_logo: string | null;
  purchased_code: string | null;
}

// ─── Financial ─────────────────────────────────────────────────────────

export interface TransactionFinancial {
  amount: number;

  // VTU / Airtime Purchase
  unit_price?: number;
  quantity?: number;
  commission?: number;
  discount?: number;
  convenience_fee?: number;
  currency?: string;

  // Airtime Conversion
  gross_amount?: number;
  service_fee?: number;
  service_fee_pct?: number;
  net_amount?: number;
  cash_credited?: number;
  conversion_rate?: number;
  airtime_amount?: number;
  settlement_method?: string;

  // Paystack
  fees?: number;
  fees_split?: Record<string, number>;
}

// ─── Timeline ──────────────────────────────────────────────────────────

export interface TransactionTimeline {
  transaction_date: string;
  created_at: string;
  updated_at: string;

  approved_at?: string;
  rejected_at?: string;
  completed_at?: string;
  paid_at?: string;
  verified_at?: string;
}

// ─── Source ────────────────────────────────────────────────────────────

export interface AirtimeConversionSource {
  type: 'airtime_conversion';
  phone_number?: string;
  provider?: string;
  screenshot?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
}

export interface VtuSource {
  type: 'vtu';
  product_name?: string;
  channel?: string;
  platform?: string;
  method?: string;
  recipient?: string;
  unique_element?: string;
}

export interface PaystackSource {
  type: 'paystack';
  gateway_response?: string;
  domain?: string;
  receipt_number?: string | null;
  authorization?: { id: string } | null;
}

export type TransactionSource = AirtimeConversionSource | VtuSource | PaystackSource;

// ─── User ──────────────────────────────────────────────────────────────

export interface TransactionDetailUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_photo_url: string | null;
}

// ─── Raw Record ────────────────────────────────────────────────────────

export interface PolymorphicRecord {
  type: string;
  data: Record<string, unknown>;
}

// ─── Detail Response ───────────────────────────────────────────────────

export interface TransactionDetailData {
  basic: TransactionBasic;
  financial: TransactionFinancial;
  timeline: TransactionTimeline;
  source: TransactionSource | null;
  user?: TransactionDetailUser;
  details?: PolymorphicRecord;
  metadata?: Record<string, unknown>;
}

export interface TransactionDetailResponse {
  success: boolean;
  message: string;
  data: TransactionDetailData;
}
