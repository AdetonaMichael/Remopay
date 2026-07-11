/**
 * USD Wallet Types
 * Types for USD wallet operations including balance, transactions, and formatting
 */

// ═══════════════════════════════════════════════════════════════════════
// CURRENCY & DENOMINATION HELPERS
// ═══════════════════════════════════════════════════════════════════════

export type WalletCurrency = 'NGN' | 'USD';

/**
 * Convert a major unit amount to the lowest denomination (kobo/cents)
 * NGN: ₦100.00 → 10000 kobo
 * USD: $100.00 → 10000 cents
 */
export const toLowestDenomination = (amount: number, currency: WalletCurrency): number => {
  return Math.round(amount * 100);
};

/**
 * Format a lowest-denomination amount for display
 * NGN: 10000 kobo → "₦100.00"
 * USD: 10000 cents → "$100.00"
 */
export const fromLowestDenomination = (amount: number, currency: WalletCurrency): string => {
  const formatted = (amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'NGN' ? `₦${formatted}` : `$${formatted}`;
};

/**
 * Format a number as currency with symbol
 */
export const formatCurrency = (amount: number, currency: WalletCurrency): string => {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'NGN' ? `₦${formatted}` : `$${formatted}`;
};

// ═══════════════════════════════════════════════════════════════════════
// USD WALLET STATE
// ═══════════════════════════════════════════════════════════════════════

export type UsdTransactionType =
  | 'credit'
  | 'debit'
  | 'conversion_in'
  | 'conversion_out'
  | 'card_funding'
  | 'refund';

export interface UsdTransaction {
  id: number;
  type: UsdTransactionType;
  amount: number; // in cents
  balance_before: number; // in cents
  balance_after: number; // in cents
  description: string;
  created_at: string;
}

export interface UsdWalletSummary {
  balance: number; // in cents
  last_synced_at: string | null;
  recent_transactions: UsdTransaction[];
}

export interface UsdWalletState {
  balance: number; // in cents
  lastSyncedAt: string | null;
  recentTransactions: UsdTransaction[];
  isLoading: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface UsdWalletSummaryResponse {
  success: boolean;
  message: string;
  data?: UsdWalletSummary;
  errors?: Record<string, string[]>;
}

// ═══════════════════════════════════════════════════════════════════════
// CONVERSION MODAL STATE
// ═══════════════════════════════════════════════════════════════════════

export interface ConversionState {
  sourceCurrency: WalletCurrency;
  targetCurrency: WalletCurrency;
  sourceAmount: string; // user input in major units
  targetAmount: number | null; // computed in cents
  exchangeRate: number | null;
  quoteReference: string | null;
  quoteExpiresAt: string | null;
  step: 'input' | 'confirm' | 'processing' | 'done';
}

export const initialConversionState: ConversionState = {
  sourceCurrency: 'NGN',
  targetCurrency: 'USD',
  sourceAmount: '',
  targetAmount: null,
  exchangeRate: null,
  quoteReference: null,
  quoteExpiresAt: null,
  step: 'input',
};

// ═══════════════════════════════════════════════════════════════════════
// TRANSACTION DISPLAY HELPERS
// ═══════════════════════════════════════════════════════════════════════

export const getTransactionLabel = (type: UsdTransactionType): string => {
  const labels: Record<UsdTransactionType, string> = {
    credit: 'Credit',
    debit: 'Debit',
    conversion_in: 'Conversion In',
    conversion_out: 'Conversion Out',
    card_funding: 'Card Funding',
    refund: 'Refund',
  };
  return labels[type] || type;
};

export const getTransactionIcon = (type: UsdTransactionType): 'credit' | 'debit' => {
  switch (type) {
    case 'credit':
    case 'conversion_in':
    case 'refund':
      return 'credit';
    case 'debit':
    case 'conversion_out':
    case 'card_funding':
      return 'debit';
  }
};
