import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique idempotency key
 * Format: timestamp-uuid for debugging and uniqueness
 */
export const generateIdempotencyKey = (): string => {
  return `${Date.now()}-${uuidv4()}`;
};

/**
 * Store idempotency key in session storage for retry scenarios
 * If request fails, reuse the same key for retries
 */
export const storeIdempotencyKey = (key: string, operationId: string): void => {
  try {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(sessionStorage.getItem('idempotency_keys') || '{}');
      stored[operationId] = {
        key,
        timestamp: Date.now(),
      };
      sessionStorage.setItem('idempotency_keys', JSON.stringify(stored));
      console.log('[Idempotency] Key stored for operation:', operationId);
    }
  } catch (error) {
    console.warn('[Idempotency] Failed to store key:', error);
  }
};

/**
 * Retrieve stored idempotency key for an operation
 * Use this for retry logic - ensures same key is sent
 */
export const getStoredIdempotencyKey = (operationId: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(sessionStorage.getItem('idempotency_keys') || '{}');
      return stored[operationId]?.key || null;
    }
    return null;
  } catch (error) {
    console.warn('[Idempotency] Failed to retrieve key:', error);
    return null;
  }
};

/**
 * Clear stored idempotency key after successful operation
 */
export const clearIdempotencyKey = (operationId: string): void => {
  try {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(sessionStorage.getItem('idempotency_keys') || '{}');
      delete stored[operationId];
      sessionStorage.setItem('idempotency_keys', JSON.stringify(stored));
      console.log('[Idempotency] Key cleared for operation:', operationId);
    }
  } catch (error) {
    console.warn('[Idempotency] Failed to clear key:', error);
  }
};

/**
 * Clear all idempotency keys (on logout)
 */
export const clearAllIdempotencyKeys = (): void => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('idempotency_keys');
    }
    console.log('[Idempotency] All keys cleared');
  } catch (error) {
    console.warn('[Idempotency] Failed to clear all keys:', error);
  }
};
