/**
 * Tier Upgrade Service
 * Handles tier upgrade requests using individual tier endpoints
 * Backend API: https://api.remopay.com/api/v1/payment/customers
 * 
 * Updated: May 10, 2026
 * - Tier 0: PATCH /tier-zero (Basic enrollment)
 * - Tier 1: PATCH /tier-one (Bronze with personal details)
 * - Tier 2: PATCH /tier-two (Silver with identity documents)
 */

import { apiClient } from './api-client';
import {
  Tier0UpgradeRequest,
  Tier1UpgradeRequest,
  Tier2UpgradeRequest,
  TierUpgradeResponse,
  TierStatusInfo,
  BvnVerificationRequest,
  BvnVerificationResponse,
  ApiResponse,
} from '@/types/index';

class TierUpgradeService {
  /**
   * Upgrade to Tier 0 - Basic Enrollment
   * PATCH /v1/payment/customers/tier-zero
   * 
   * Initial customer profile creation with basic information.
   * No prerequisites - this is the first step.
   * 
   * Returns: maplerad_id for use in subsequent tiers
   */
  async upgradeToTierZero(
    data: Tier0UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return apiClient.patch('/payment/customers/tier-zero', data);
  }

  /**
   * Upgrade to Tier 1 - Bronze Tier
   * PATCH /v1/payment/customers/tier-one
   * 
   * Personal details + BVN verification
   * Prerequisites: Must complete Tier 0 first
   * 
   * Data format:
   * - dob: DD-MM-YYYY format
   * - phone: { phone_country_code: "+234", phone_number: "8123456789" }
   * - address: { street, city, state, country, postal_code, ...}
   * - identification_number: BVN (exactly 11 digits)
   */
  async upgradeToTierOne(
    data: Tier1UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return apiClient.patch('/payment/customers/tier-one', data);
  }

  /**
   * Upgrade to Tier 2 - Silver Tier
   * PATCH /v1/payment/customers/tier-two
   * 
   * Identity document verification
   * Prerequisites: Must complete Tier 1 first
   * 
   * Data format:
   * - identity: { type, image (base64), number, country }
   * - Supported types: 'nin', 'passport', 'drivers_license', 'voters_card'
   */
  async upgradeToTierTwo(
    data: Tier2UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return apiClient.patch('/payment/customers/tier-two', data);
  }

  /**
   * Verify BVN (Optional but recommended)
   * POST /v1/payment/identity/bvn-verify
   * 
   * Validate BVN before attempting Tier 1 upgrade
   * No authentication required (public endpoint)
   * 
   * @param bvn 11-digit BVN number
   * @returns BVN details if valid
   */
  async verifyBVN(bvn: string): Promise<ApiResponse<BvnVerificationResponse>> {
    return apiClient.post('/payment/identity/bvn-verify', { bvn } as BvnVerificationRequest);
  }

  /**
   * Upload profile image for Tier 1 upgrade
   * POST /api/v1/profile/upload-image
   *
   * Expects multipart/form-data with an image file.
   * Returns a secure Cloudinary image URL to include in the tier upgrade request.
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<{ image_url: string; public_id: string; width: number; height: number; size: number; uploaded_at: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post('/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get current tier status
   * GET /v1/customers/tier-status
   * 
   * Returns current tier, status, and requirements for next tier
   */
  async getTierStatus(): Promise<ApiResponse<TierStatusInfo>> {
    return apiClient.get('/customers/tier-status');
  }

  /**
   * Legacy: Enroll customer (Deprecated)
   * ❌ DO NOT USE - Use upgradeToTierZero instead
   * 
   * @deprecated Use upgradeToTierZero instead
   */
  async enrollCustomer(
    data: Tier0UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    console.warn('enrollCustomer is deprecated. Use upgradeToTierZero instead.');
    return this.upgradeToTierZero(data);
  }

  /**
   * Legacy: Upgrade user to Tier 1
   * @deprecated Use upgradeToTierOne instead
   */
  async upgradeTierOne(
    data: Tier1UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return this.upgradeToTierOne(data);
  }

  /**
   * Legacy: Upgrade user to Tier 2
   * @deprecated Use upgradeToTierTwo instead
   */
  async upgradeTierTwo(
    data: Tier2UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return this.upgradeToTierTwo(data);
  }
}

export const tierUpgradeService = new TierUpgradeService();
