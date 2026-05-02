/**
 * Tier Upgrade Service
 * Handles tier upgrade requests and tier status retrieval
 * Backend API: https://api.remopay.com/api/v1/payment/customers
 */

import { apiClient } from './api-client';
import {
  Tier0UpgradeRequest,
  Tier1UpgradeRequest,
  Tier2UpgradeRequest,
  TierUpgradeResponse,
  TierStatus,
  ApiResponse,
} from '@/types/index';

class TierUpgradeService {
  /**
   * Enroll customer (Tier 0 - Basic Profile)
   * POST /v1/payment/customers/enroll
   */
  async enrollCustomer(
    data: Tier0UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return apiClient.post('/payment/customers/enroll', data);
  }

  /**
   * Upgrade user to Tier 1 (Bronze) - Personal & Address Info
   * PATCH /v1/payment/customers/tier-one
   */
  async upgradeTierOne(
    data: Tier1UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return apiClient.patch('/payment/customers/tier-one', data);
  }

  /**
   * Upgrade user to Tier 2 (Silver) - Identity Verification
   * PATCH /v1/payment/customers/tier-two
   */
  async upgradeTierTwo(
    data: Tier2UpgradeRequest
  ): Promise<ApiResponse<TierUpgradeResponse>> {
    return apiClient.patch('/payment/customers/tier-two', data);
  }

  /**
   * Verify BVN before Tier 1 upgrade (optional but recommended)
   * POST /v1/payment/identity/bvn-verify
   */
  async verifyBVN(bvn: string): Promise<ApiResponse<any>> {
    return apiClient.post('/payment/identity/bvn-verify', { bvn });
  }

  /**
   * Get current tier status and progress
   * GET /v1/customers/tier-status
   */
  async getTierStatus(): Promise<ApiResponse<TierStatus>> {
    return apiClient.get('/customers/tier-status');
  }

  /**
   * Get tier upgrade requirements
   * GET /v1/customers/tier-requirements/:tier
   */
  async getTierRequirements(tier: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/customers/tier-requirements/${tier}`);
  }
}

export const tierUpgradeService = new TierUpgradeService();
