import { apiClient } from './api-client';

export const pinService = {
  /**
   * Set or update user's transaction PIN
   * @param newPin - 4-digit PIN
   * @param newPinConfirmation - Confirmation of new PIN
   * @param password - User's account password
   * @param currentPin - Current PIN (required only for updates)
   */
  async setPin(
    newPin: string,
    newPinConfirmation: string,
    password: string,
    currentPin?: string
  ): Promise<any> {
    try {
      console.log('[PINService] Setting PIN...');

      const payload: any = {
        new_pin: newPin,
        new_pin_confirmation: newPinConfirmation,
        password,
      };

      // Add current_pin only if provided (update scenario)
      if (currentPin) {
        payload.current_pin = currentPin;
      }

      const response = await apiClient.post('/wallet/pin/set', payload);

      console.log('[PINService] PIN set successfully:', response);
      return response;
    } catch (error) {
      console.error('[PINService] Error setting PIN:', error);
      throw error;
    }
  },

  /**
   * Verify user's transaction PIN
   * @param pin - 4-digit PIN to verify
   */
  async verifyPin(pin: string): Promise<any> {
    try {
      console.log('[PINService] Verifying PIN...');

      const response = await apiClient.post('/wallet/pin/verify', {
        pin,
      });

      console.log('[PINService] PIN verified:', response);
      return response;
    } catch (error) {
      console.error('[PINService] Error verifying PIN:', error);
      throw error;
    }
  },

  /**
   * Reset PIN attempts (admin only)
   * @param userId - User ID whose PIN attempts to reset
   */
  async resetPinAttempts(userId: number): Promise<any> {
    try {
      console.log('[PINService] Resetting PIN attempts for user:', userId);

      const response = await apiClient.post('/wallet/pin/reset-attempts', {
        user_id: userId,
      });

      console.log('[PINService] PIN attempts reset:', response);
      return response;
    } catch (error) {
      console.error('[PINService] Error resetting PIN attempts:', error);
      throw error;
    }
  },
};
