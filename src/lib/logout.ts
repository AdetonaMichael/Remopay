import { clearAllIdempotencyKeys } from '@/utils/idempotency.utils';
import { apiClient } from '@/services/api-client';

/**
 * Handle user logout with cleanup
 * Clears all session data and idempotency keys
 */
export const handleLogout = async (): Promise<void> => {
  try {
    console.log('[Logout] Initiating logout...');

    // Clear all stored idempotency keys on logout
    clearAllIdempotencyKeys();

    // Clear auth tokens via api client
    apiClient.logout();

    // Clear all session storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('[Logout] Failed to clear sessionStorage:', error);
    }

    // Clear local storage auth tokens
    const tokensToRemove = ['token', 'user', 'auth'];
    tokensToRemove.forEach((token) => {
      try {
        localStorage.removeItem(token);
      } catch (error) {
        console.warn(`[Logout] Failed to remove ${token}:`, error);
      }
    });

    console.log('[Logout] All session data cleared');

    // Redirect to login
    window.location.href = '/auth/login';
  } catch (error) {
    console.error('[Logout] Logout failed:', error);
    // Force logout even if there's an error
    window.location.href = '/auth/login';
  }
};
