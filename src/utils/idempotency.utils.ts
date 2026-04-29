import { v4 as uuidv4 } from 'uuid';

const IDEMPOTENCY_STORAGE_KEY = 'remopay_idempotency_keys';
const KEY_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface StoredIdempotencyKey {
  key: string;
  timestamp: number;
  expiresAt: number;
  operationId: string;
}

/**
 * Generate a unique idempotency key
 * Format: timestamp-uuid for debugging and uniqueness
 * @returns Unique idempotency key string
 */
export const generateIdempotencyKey = (): string => {
  return `${Date.now()}-${uuidv4()}`;
};

/**
 * Store idempotency key in session storage for retry scenarios
 * If request fails, reuse the same key for retries
 * @param key - The idempotency key to store
 * @param operationId - Unique identifier for the operation
 */
export const storeIdempotencyKey = (key: string, operationId: string): void => {
  try {
    if (typeof window === 'undefined') return;

    const stored: Record<string, StoredIdempotencyKey> = JSON.parse(
      sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || '{}'
    );

    // Clean up expired keys before storing
    cleanupExpiredKeys();

    stored[operationId] = {
      key,
      timestamp: Date.now(),
      expiresAt: Date.now() + KEY_EXPIRY_TIME,
      operationId,
    };

    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(stored));
    console.log('[Idempotency] ✓ Key stored for operation:', operationId, 'Key:', key.substring(0, 20) + '...');
  } catch (error) {
    console.warn('[Idempotency] ⚠️ Failed to store key:', error);
  }
};

/**
 * Retrieve stored idempotency key for an operation
 * Returns null if key expired or not found
 * @param operationId - Unique identifier for the operation
 * @returns Stored idempotency key or null if not found/expired
 */
export const getStoredIdempotencyKey = (operationId: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;

    const stored: Record<string, StoredIdempotencyKey> = JSON.parse(
      sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || '{}'
    );

    const entry = stored[operationId];

    if (!entry) {
      return null;
    }

    // Check if key has expired
    if (Date.now() > entry.expiresAt) {
      console.log('[Idempotency] Key expired for operation:', operationId);
      delete stored[operationId];
      sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(stored));
      return null;
    }

    console.log('[Idempotency] ✓ Key retrieved for operation:', operationId);
    return entry.key;
  } catch (error) {
    console.warn('[Idempotency] ⚠️ Failed to retrieve key:', error);
    return null;
  }
};

/**
 * Clear stored idempotency key after successful operation
 * @param operationId - Unique identifier for the operation
 */
export const clearIdempotencyKey = (operationId: string): void => {
  try {
    if (typeof window === 'undefined') return;

    const stored: Record<string, StoredIdempotencyKey> = JSON.parse(
      sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || '{}'
    );

    if (operationId in stored) {
      delete stored[operationId];
      sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(stored));
      console.log('[Idempotency] ✓ Key cleared for operation:', operationId);
    }
  } catch (error) {
    console.warn('[Idempotency] ⚠️ Failed to clear key:', error);
  }
};

/**
 * Clear all stored idempotency keys (on logout or app reset)
 */
export const clearAllIdempotencyKeys = (): void => {
  try {
    if (typeof window === 'undefined') return;

    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    console.log('[Idempotency] ✓ All keys cleared');
  } catch (error) {
    console.warn('[Idempotency] ⚠️ Failed to clear all keys:', error);
  }
};

/**
 * Clean up expired idempotency keys
 * Automatically removes keys that have expired (24 hours)
 */
export const cleanupExpiredKeys = (): void => {
  try {
    if (typeof window === 'undefined') return;

    const stored: Record<string, StoredIdempotencyKey> = JSON.parse(
      sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || '{}'
    );

    const now = Date.now();
    let expiredCount = 0;

    for (const operationId in stored) {
      if (now > stored[operationId].expiresAt) {
        delete stored[operationId];
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(stored));
      console.log('[Idempotency] Cleaned up', expiredCount, 'expired keys');
    }
  } catch (error) {
    console.warn('[Idempotency] ⚠️ Failed to cleanup expired keys:', error);
  }
};

/**
 * Get all stored idempotency keys (for debugging)
 * @returns Array of stored idempotency keys with metadata
 */
export const getAllStoredKeys = (): StoredIdempotencyKey[] => {
  try {
    if (typeof window === 'undefined') return [];

    const stored: Record<string, StoredIdempotencyKey> = JSON.parse(
      sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || '{}'
    );

    return Object.values(stored);
  } catch (error) {
    console.warn('[Idempotency] ⚠️ Failed to retrieve all keys:', error);
    return [];
  }
};

/**
 * Validate idempotency key format
 * Ensures key is in expected format and reasonable length
 * @param key - Key to validate
 * @returns true if key format is valid, false otherwise
 */
export const validateIdempotencyKeyFormat = (key: string): boolean => {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Should be timestamp-uuid format: digits-uuid
  const uuidRegex = /^\d+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key);
};
