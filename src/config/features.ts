/**
 * Feature Flags Configuration
 * 
 * This file controls feature toggles that can be enabled/disabled at the code level.
 * Change the boolean values to enable or disable features.
 */

export const FEATURES = {
  /**
   * PHONE_VERIFICATION_ENABLED
   * 
   * When true: Users must verify their phone before accessing protected routes
   * When false: Phone verification is bypassed, users can access protected routes without phone verification
   * 
   * Change to 'true' to enable phone verification
   * Change to 'false' to disable phone verification
   */
  PHONE_VERIFICATION_ENABLED: false, // Set to true to enable phone verification, false to disable
};
