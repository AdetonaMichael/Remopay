import { cleanupExpiredKeys, clearAllIdempotencyKeys, getAllStoredKeys } from '@/utils/idempotency.utils';

/**
 * Initialize idempotency maintenance tasks
 * Should be called once on app startup
 */
export const initializeIdempotencyMaintenance = (): void => {
  if (typeof window === 'undefined') return;


  // Clean up expired keys immediately on startup
  cleanupExpiredKeys();

  // Set up periodic cleanup task (every 5 minutes)
  const cleanupInterval = setInterval(() => {
    cleanupExpiredKeys();
  }, 5 * 60 * 1000); // 5 minutes

  // Set up cleanup on before unload (e.g., tab close)
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
    // Optionally clear all keys on logout, but keep them for session persistence
    // clearAllIdempotencyKeys();
  });

};

/**
 * Cleanup idempotency system (e.g., on logout)
 */
export const cleanupIdempotencyOnLogout = (): void => {
  clearAllIdempotencyKeys();
};

/**
 * Get current idempotency system statistics
 * Useful for debugging and monitoring
 */
export const getIdempotencyStats = (): {
  totalKeys: number;
  oldestKey: number | null;
  newestKey: number | null;
  expiringCount: number;
} => {
  const keys = getAllStoredKeys();
  const now = Date.now();

  return {
    totalKeys: keys.length,
    oldestKey: keys.length > 0 ? Math.min(...keys.map((k) => k.timestamp)) : null,
    newestKey: keys.length > 0 ? Math.max(...keys.map((k) => k.timestamp)) : null,
    expiringCount: keys.filter((k) => now + 60 * 60 * 1000 > k.expiresAt).length, // Expiring within 1 hour
  };
};

/**
 * Reset idempotency system completely
 * Warning: This should only be used for debugging or in testing
 */
export const resetIdempotencySystem = (): void => {
  console.warn('[IdempotencyMaintenance] ⚠️ Resetting idempotency system - this should only be used in testing!');
  clearAllIdempotencyKeys();
};

/**
 * Log idempotency system status
 * Useful for debugging
 */
// export const logIdempotencyStatus = (): void => {
//   const stats = getIdempotencyStats();
//   const keys = getAllStoredKeys();

//   console.group('[IdempotencyMaintenance] System Status');
//   console.log('Stats:', stats);
//   console.log('Stored Keys:', keys.map((k) => ({
//     operationId: k.operationId,
//     keyPreview: k.key.substring(0, 20) + '...',
//     age: Math.round((Date.now() - k.timestamp) / 1000) + 's',
//     expiresIn: Math.round((k.expiresAt - Date.now()) / 1000) + 's',
//   })));
//   console.groupEnd();
// };
