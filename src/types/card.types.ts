/**
 * Virtual Card Types
 * Complete type definitions for Maplerad virtual card operations
 */

// ═══════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════

export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum CardType {
  VIRTUAL = 'VIRTUAL',
}

export enum CardCurrency {
  USD = 'USD',
}

// ═══════════════════════════════════════════════════════════════════════
// CARD DATA TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Virtual Card Response from API
 * - Card numbers are always masked (e.g., 4532XXXXXXXX1234)
 * - CVV is always returned as "***" for security
 */
export interface VirtualCard {
  id: string;
  card_number: string;
  cvv: string;
  expiry: string;
  cardholder_name: string;
  status: CardStatus;
  brand: CardBrand;
  currency: CardCurrency;
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
 */
export interface CardPaginationMeta {
  current_page: number;
  total_pages: number;
  total_records: number;
  page_size: number;
}

// ═══════════════════════════════════════════════════════════════════════
// REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create Card Request Payload
 * All fields must match exact values as per backend validation
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
// FILTER & PAGINATION TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Card List Query Parameters
 */
export interface CardListQuery {
  page?: number;
  page_size?: number;
  brand?: CardBrand;
  status?: CardStatus;
  created_at?: string; // YYYY-MM-DD format
}

// ═══════════════════════════════════════════════════════════════════════
// ERROR RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Validation Error Response
 */
export interface CardValidationError {
  success: false;
  message: string;
  errors?: {
    currency?: string[];
    type?: string[];
    auto_approve?: string[];
    brand?: string[];
    amount?: string[];
    page?: string[];
    page_size?: string[];
    created_at?: string[];
  };
}

/**
 * Profile Incomplete Error Response
 */
export interface CardProfileError {
  success: false;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════
// UI STATE TYPES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Card List Filter State
 */
export interface CardFilters {
  brand?: CardBrand;
  status?: CardStatus;
  createdAt?: string;
}

/**
 * Card Creation Form State
 */
export interface CreateCardFormData {
  brand: CardBrand;
  autoApprove: boolean;
  amount: string; // String for form handling, converted to number on submit
}

/**
 * Card List UI State
 */
export interface CardListState {
  cards: VirtualCard[];
  pagination: CardPaginationMeta;
  isLoading: boolean;
  error: string | null;
  filters: CardFilters;
  currentPage: number;
}
