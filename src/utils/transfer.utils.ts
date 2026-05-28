/**
 * Transfer Utilities
 * Phone normalization, validation, and formatting helpers
 */

import {
  PhoneNormalizationResult,
  TransferValidationResult,
  IdentifierType,
  PINLockStatus,
} from '@/types/transfer.types';

/**
 * Normalize Nigerian phone number to 10 digits (XXXXXXXXXX format)
 * Handles all these formats:
 * - +2347077504334 (international with +)
 * - 2347077504334 (country code, no +)
 * - 07077504334 (national format with leading 0)
 * - 7077504334 (raw 10 digits)
 * Returns: 10 digits without leading 0 (e.g., 7077504334)
 */
export function normalizePhoneNumber(phone: string): PhoneNormalizationResult {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  let tenDigits: string;

  // Normalize to 10 digits
  if (digitsOnly.length === 13 && digitsOnly.startsWith('234')) {
    // International format with country code: 234XXXXXXXXXX → XXXXXXXXXX
    tenDigits = digitsOnly.slice(3);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    // National format: 0XXXXXXXXXX → XXXXXXXXXX
    tenDigits = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10) {
    // 10 digits: if starts with 0, remove it; otherwise use as-is
    tenDigits = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
  } else if (digitsOnly.length > 10) {
    // Longer than 10: take last 10 digits
    tenDigits = digitsOnly.slice(-10);
  } else {
    // Invalid length
    return {
      isValid: false,
      error: 'Invalid phone number format. Please enter a valid Nigerian number (e.g., +2347077504334, 07077504334, or 7077504334)',
    };
  }

  return {
    isValid: true,
    normalized: tenDigits,
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate PIN format (must be exactly 4 digits)
 */
export function validatePIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Validate amount for Remopay transfer
 * Min: 50 NGN, Max: 100,000 NGN
 */
export function validateRemopayAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount < 50) {
    return { valid: false, error: 'Minimum transfer amount is ₦50' };
  }
  if (amount > 100000) {
    return { valid: false, error: 'Maximum transfer amount is ₦100,000' };
  }
  return { valid: true };
}

/**
 * Validate amount for bank transfer
 * Min: 100 NGN, Max: 500,000 NGN
 */
export function validateBankTransferAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount < 100) {
    return { valid: false, error: 'Minimum transfer amount is ₦100' };
  }
  if (amount > 500000) {
    return { valid: false, error: 'Maximum transfer amount is ₦500,000' };
  }
  return { valid: true };
}

/**
 * Validate account number (must be exactly 10 digits, Nigerian NUBAN format)
 */
export function validateAccountNumber(accountNumber: string): { valid: boolean; error?: string } {
  const digitsOnly = accountNumber.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    return { valid: false, error: 'Account number must be exactly 10 digits' };
  }
  return { valid: true };
}

/**
 * Mask account number for display (show only first and last 2 digits)
 * 9023011622 → 902XXXXXXX2
 */
export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length < 4) return accountNumber;
  const first = digits.slice(0, 3);
  const last = digits.slice(-1);
  const masked = 'X'.repeat(digits.length - 4);
  return `${first}${masked}${last}`;
}

/**
 * Validate identifier (phone or email)
 */
export function validateIdentifier(
  identifier: string,
  type: IdentifierType
): { valid: boolean; error?: string } {
  if (!identifier || identifier.trim() === '') {
    return { valid: false, error: 'Identifier is required' };
  }

  if (type === IdentifierType.PHONE) {
    const result = normalizePhoneNumber(identifier);
    return { valid: result.isValid, error: result.error };
  } else if (type === IdentifierType.EMAIL) {
    if (!validateEmail(identifier)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Invalid identifier type' };
}

/**
 * Format amount with currency symbol and thousand separator
 */
export function formatAmount(amount: number | undefined | null, currency: string = '₦'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency}0.00`;
  }
  return `${currency}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format phone number for display
 * Converts 10-digit format (7077504334) to national format (07077504334) for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized.isValid || !normalized.normalized) return phone;
  // Add leading 0 for display purposes only
  return '0' + normalized.normalized;
}

/**
 * Check if PIN is locked and calculate remaining time
 */
export function calculatePINLockStatus(
  isLocked: boolean,
  remainingSeconds?: number
): PINLockStatus {
  return {
    is_locked: isLocked,
    remaining_seconds: remainingSeconds || 0,
    failed_attempts: 0, // Will be set by component
  };
}

/**
 * Format remaining PIN lock time for display
 * 1800 seconds → "30 minutes, 0 seconds"
 */
export function formatPINLockTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }
  if (secs === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${secs} second${secs !== 1 ? 's' : ''}`;
}

/**
 * Validate complete Remopay transfer form data
 */
export function validateRemopayTransferForm(
  identifier: string,
  identifierType: IdentifierType,
  amount: number,
  pin: string,
  walletBalance: number
): TransferValidationResult {
  const errors: Record<string, string> = {};

  // Validate identifier
  const identifierValidation = validateIdentifier(identifier, identifierType);
  if (!identifierValidation.valid) {
    errors.identifier = identifierValidation.error || 'Invalid identifier';
  }

  // Validate amount
  const amountValidation = validateRemopayAmount(amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error || 'Invalid amount';
  }

  // Check balance
  if (amount > walletBalance) {
    errors.balance = `Insufficient balance. Available: ₦${walletBalance?.toLocaleString() || '0'}`;
  }

  // Validate PIN only if provided (PIN validation happens on review page)
  if (pin && !validatePIN(pin)) {
    errors.pin = 'PIN must be exactly 4 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate complete bank transfer form data
 */
export function validateBankTransferForm(
  bankCode: string | null,
  accountNumber: string,
  accountName: string,
  amount: number,
  pin: string,
  walletBalance: number,
  accountVerified: boolean
): TransferValidationResult {
  const errors: Record<string, string> = {};

  // Validate bank selection
  if (!bankCode) {
    errors.bank = 'Please select a bank';
  }

  // Validate account number
  const accountValidation = validateAccountNumber(accountNumber);
  if (!accountValidation.valid) {
    errors.accountNumber = accountValidation.error || 'Invalid account number';
  }

  // Validate account verified
  if (!accountVerified && accountNumber) {
    errors.accountVerified = 'Please verify your account number first';
  }

  // Validate account name
  if (!accountName || accountName.trim() === '') {
    errors.accountName = 'Account name is required';
  }

  // Validate amount
  const amountValidation = validateBankTransferAmount(amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error || 'Invalid amount';
  }

  // Check balance
  if (amount > walletBalance) {
    errors.balance = `Insufficient balance. Available: ₦${walletBalance?.toLocaleString() || '0'}`;
  }

  // Validate PIN only if provided (PIN validation happens on review page)
  if (pin && !validatePIN(pin)) {
    errors.pin = 'PIN must be exactly 4 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Extract error message from API error response
 */
export function extractErrorMessage(error: any): string {
  if (!error) return 'An error occurred. Please try again.';

  // Handle API response with message
  if (error.message) return error.message;

  // Handle string error
  if (typeof error === 'string') return error;

  // Handle nested data structure
  if (error.data?.message) return error.data.message;

  // Default message
  return 'An error occurred. Please try again.';
}

/**
 * Extract field-specific errors from validation response
 */
export function extractFieldErrors(error: any): Record<string, string> {
  if (!error) return {};

  // Check for validation errors object
  if (error.errors && typeof error.errors === 'object') {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(error.errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages[0] as string;
      }
    }
    return fieldErrors;
  }

  return {};
}
