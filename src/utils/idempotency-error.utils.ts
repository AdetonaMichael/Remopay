import { AxiosError } from 'axios';

export enum IdempotencyErrorType {
  MISSING_KEY = 'MISSING_IDEMPOTENCY_KEY',
  INVALID_FORMAT = 'INVALID_IDEMPOTENCY_KEY_FORMAT',
  DUPLICATE_KEY = 'DUPLICATE_IDEMPOTENCY_KEY',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST_DETECTED',
  KEY_REUSED_WITH_DIFFERENT_PAYLOAD = 'KEY_REUSED_WITH_DIFFERENT_PAYLOAD',
  LOCK_ACQUISITION_FAILED = 'UNABLE_TO_ACQUIRE_LOCK',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export interface IdempotencyError {
  type: IdempotencyErrorType;
  message: string;
  isIdempotencyError: boolean;
  isRetryable: boolean;
  originalError?: AxiosError;
  statusCode?: number;
}

/**
 * Check if error is idempotency-related
 */
export const isIdempotencyError = (error: any): boolean => {
  return error?.isIdempotencyError === true || 
         error?.code?.includes('IDEMPOTENCY') ||
         error?.code?.includes('DUPLICATE');
};

/**
 * Determine if error is retryable
 */
export const isRetryable = (errorType: IdempotencyErrorType, statusCode?: number): boolean => {
  // These errors should NOT be retried (indicate client/logic error)
  const nonRetryableErrors = [
    IdempotencyErrorType.MISSING_KEY,
    IdempotencyErrorType.INVALID_FORMAT,
    IdempotencyErrorType.KEY_REUSED_WITH_DIFFERENT_PAYLOAD,
    IdempotencyErrorType.DUPLICATE_KEY,
  ];

  if (nonRetryableErrors.includes(errorType)) {
    return false;
  }

  // Network and server errors are retryable
  if (errorType === IdempotencyErrorType.NETWORK_ERROR) {
    return true;
  }

  // Server errors (5xx) are typically retryable
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return true;
  }

  // 408 Request Timeout is retryable
  if (statusCode === 408) {
    return true;
  }

  // 429 Too Many Requests is retryable
  if (statusCode === 429) {
    return true;
  }

  return false;
};

/**
 * Parse idempotency error from API response
 */
export const parseIdempotencyError = (error: AxiosError<any>): IdempotencyError => {
  const response = error.response?.data as any;
  const statusCode = error.response?.status;
  const message = response?.message || error.message || 'An error occurred';
  const code = response?.code || response?.error_code;

  let errorType = IdempotencyErrorType.UNKNOWN;

  if (code === IdempotencyErrorType.MISSING_KEY) {
    errorType = IdempotencyErrorType.MISSING_KEY;
  } else if (code === IdempotencyErrorType.INVALID_FORMAT) {
    errorType = IdempotencyErrorType.INVALID_FORMAT;
  } else if (code === IdempotencyErrorType.DUPLICATE_KEY || code === 'DUPLICATE_IDEMPOTENCY_KEY') {
    errorType = IdempotencyErrorType.DUPLICATE_KEY;
  } else if (code === IdempotencyErrorType.KEY_REUSED_WITH_DIFFERENT_PAYLOAD) {
    errorType = IdempotencyErrorType.KEY_REUSED_WITH_DIFFERENT_PAYLOAD;
  } else if (code === IdempotencyErrorType.LOCK_ACQUISITION_FAILED) {
    errorType = IdempotencyErrorType.LOCK_ACQUISITION_FAILED;
  } else if (statusCode === 409 || statusCode === 422) {
    errorType = IdempotencyErrorType.DUPLICATE_REQUEST;
  } else if (!error.response) {
    errorType = IdempotencyErrorType.NETWORK_ERROR;
  } else if (statusCode && statusCode >= 500) {
    errorType = IdempotencyErrorType.SERVER_ERROR;
  }

  const isRetryableError = isRetryable(errorType, statusCode);

  return {
    type: errorType,
    message,
    isIdempotencyError: isIdempotencyError(error),
    isRetryable: isRetryableError,
    originalError: error,
    statusCode,
  };
};

/**
 * Get user-friendly error message for idempotency errors
 */
export const getIdempotencyErrorMessage = (errorType: IdempotencyErrorType): string => {
  const messages: Record<IdempotencyErrorType, string> = {
    [IdempotencyErrorType.MISSING_KEY]: 'Payment operation requires validation. Please try again.',
    [IdempotencyErrorType.INVALID_FORMAT]: 'Invalid request format. Please try again.',
    [IdempotencyErrorType.DUPLICATE_KEY]: 'This payment has already been processed. Please check your transaction history.',
    [IdempotencyErrorType.DUPLICATE_REQUEST]: 'Duplicate request detected. This payment may already have been processed.',
    [IdempotencyErrorType.KEY_REUSED_WITH_DIFFERENT_PAYLOAD]: 'Payment details do not match previous request. Please start a new transaction.',
    [IdempotencyErrorType.LOCK_ACQUISITION_FAILED]: 'Wallet is currently processing another transaction. Please wait and try again.',
    [IdempotencyErrorType.NETWORK_ERROR]: 'Network error. Your request is queued for retry with the same details.',
    [IdempotencyErrorType.SERVER_ERROR]: 'Server error. Your request will be retried automatically.',
    [IdempotencyErrorType.UNKNOWN]: 'An error occurred. Please try again.',
  };

  return messages[errorType] || messages[IdempotencyErrorType.UNKNOWN];
};

/**
 * Check if error indicates transaction was already processed
 * This is useful for detecting idempotency hits
 */
export const isAlreadyProcessed = (errorType: IdempotencyErrorType): boolean => {
  return (
    errorType === IdempotencyErrorType.DUPLICATE_KEY ||
    errorType === IdempotencyErrorType.DUPLICATE_REQUEST
  );
};

/**
 * Format idempotency error for logging
 */
export const formatIdempotencyErrorForLog = (error: IdempotencyError): Record<string, any> => {
  return {
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    isRetryable: error.isRetryable,
    timestamp: new Date().toISOString(),
    originalError: error.originalError?.message,
  };
};

/**
 * Determine action to take based on idempotency error
 */
export const getErrorAction = (error: IdempotencyError): 'retry' | 'show_error' | 'check_transaction' => {
  if (isAlreadyProcessed(error.type)) {
    return 'check_transaction';
  }

  if (error.isRetryable) {
    return 'retry';
  }

  return 'show_error';
};
