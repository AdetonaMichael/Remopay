/**
 * Virtual Card Types
 * Complete type definitions for Maplerad virtual card operations
 * Based on the backend API specification
 */

// ═══════════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  FROZEN = 'FROZEN',
  TERMINATED = 'TERMINATED',
}

export enum CardType {
  VIRTUAL = 'VIRTUAL',
}

export enum CardCurrency {
  USD = 'USD',
}

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum TransactionStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  DECLINED = 'DECLINED',
}

export const CARD_CREATION_FEE = 3.00;
export const MIN_FUND_WITHDRAW_AMOUNT_CENTS = 100; // $1.00 in cents
export const DEFAULT_PAGE_SIZE = 10;

// ═══════════════════════════════════════════════════════════════════════
// ADDRESS TYPE
// ═══════════════════════════════════════════════════════════════════════

export interface CardAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CARD DATA TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Full card details returned from GET /issuing/{id}
 */
export interface CardDetail {
  id: string;
  name: string;
  card_number: string;
  masked_pan: string;
  expiry: string;
  cvv: string;
  status: CardStatus;
  type: CardType;
  issuer: CardBrand;
  currency: CardCurrency;
  balance: number;
  balance_updated_at: string;
  auto_approve: boolean;
  address: CardAddress;
  is_contactless: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Virtual Card Response from API (list view)
 */
export interface VirtualCard {
  id: string;
  card_number: string;
  masked_pan?: string;
  cvv: string;
  expiry: string;
  cardholder_name: string;
  name?: string;
  status: CardStatus;
  brand: CardBrand;
  issuer?: CardBrand;
  currency: CardCurrency;
  balance?: number;
  type?: CardType;
  auto_approve?: boolean;
  is_contactless?: boolean;
  created_at: string;
}

/**
 * Card List Response with Pagination
 */
export interface CardListResponse {
  cards: VirtualCard[];
  meta: CardPaginationMeta;
}

/**
 * Pagination Metadata
 * Backend returns { page, page_size, total }
 */
export interface CardPaginationMeta {
  current_page: number;
  total_pages: number;
  total_records: number;
  page_size: number;
  page?: number;      // Raw from API
  total?: number;     // Raw from API
}

// ═══════════════════════════════════════════════════════════════════════
// REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create Card Request Payload
 */
export interface CreateCardRequest {
  currency: CardCurrency;
  type: CardType;
  auto_approve: boolean;
  brand?: CardBrand;
  amount?: number;
}

/**
 * Create Card Response
 */
export interface CreateCardResponse {
  success: boolean;
  message: string;
  data: {
    card: VirtualCard;
    local_card_id?: number;
    transaction_reference?: string;
    fee_deducted?: number;
  };
}

/**
 * Get Single Card Response
 */
export interface GetCardResponse {
  success: boolean;
  message: string;
  data: {
    card: CardDetail;
  };
}

/**
 * Get All Cards Response
 */
export interface GetAllCardsResponse {
  success: boolean;
  message: string;
  data: CardListResponse;
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSACTION TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CardTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  created_at: string;
  authorization_amount: number;
}

export interface CardTransactionListResponse {
  transactions: CardTransaction[];
  meta: CardPaginationMeta;
}

export interface GetCardTransactionsResponse {
  success: boolean;
  message: string;
  data: CardTransactionListResponse;
}

export interface CardTransactionsQuery {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

// ═══════════════════════════════════════════════════════════════════════
// FUND / WITHDRAW TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface FundCardRequest {
  amount: number; // Amount in cents (minimum 100 = $1.00)
}

export interface FundCardResponse {
  success: boolean;
  message: string;
  data: {
    funding: {
      id: string;
    };
  };
}

export interface WithdrawCardRequest {
  amount: number; // Amount in cents (minimum 100 = $1.00)
}

export interface WithdrawCardResponse {
  success: boolean;
  message: string;
  data: {
    withdrawal: {
      id: string;
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════
// DECLINE CHARGES TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CardDeclineCharge {
  created_at: string;
  card_id: string;
  reason: string;
  card_transaction_id: string;
  fee: number; // In cents
  channel: 'WALLET' | 'CARD';
}

export interface DeclineChargesQuery {
  channel?: 'WALLET' | 'CARD';
  transaction_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

export interface GetDeclineChargesResponse {
  success: boolean;
  message: string;
  data: {
    charges: CardDeclineCharge[];
    meta: CardPaginationMeta;
  };
}

// ═══════════════════════════════════════════════════════════════════════
// FILTER & PAGINATION TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CardListQuery {
  page?: number;
  page_size?: number;
  brand?: CardBrand;
  status?: CardStatus;
  created_at?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// ERROR RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CardValidationError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ═══════════════════════════════════════════════════════════════════════
// UI STATE TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CardFilters {
  brand?: CardBrand;
  status?: CardStatus;
  createdAt?: string;
}

export interface CreateCardFormData {
  brand: CardBrand;
  autoApprove: boolean;
  amount: string;
}

export interface CardListState {
  cards: VirtualCard[];
  pagination: CardPaginationMeta;
  isLoading: boolean;
  error: string | null;
  filters: CardFilters;
  currentPage: number;
}

/**
 * Fund/Withdraw Modal State
 */
export interface CardActionModalState {
  isOpen: boolean;
  action: 'fund' | 'withdraw' | null;
  cardId: string | null;
  cardMaskedPan: string | null;
}
