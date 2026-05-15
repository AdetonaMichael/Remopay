/**
 * Tier Upgrade Hook
 * Manages tier upgrade state and operations
 * 
 * Updated: May 10, 2026
 * - Uses individual tier endpoints
 * - Tier 0: PATCH /tier-zero
 * - Tier 1: PATCH /tier-one
 * - Tier 2: PATCH /tier-two
 */

import { useCallback, useState } from 'react';
import { tierUpgradeService } from '@/services/tier-upgrade.service';
import {
  TierStatusInfo,
  Tier0UpgradeData,
  Tier1UpgradeData,
  Tier2UpgradeData,
  TierLevel,
} from '@/types/tier-upgrade.types';

interface UseTierUpgradeOptions {
  onSuccess?: (tier: TierLevel) => void;
  onError?: (error: any) => void;
}

export const useTierUpgrade = (options?: UseTierUpgradeOptions) => {
  const [tierStatus, setTierStatus] = useState<TierStatusInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapleradId, setMapleradId] = useState<string | null>(null);

  // ============= FETCH TIER STATUS =============

  const fetchTierStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tierUpgradeService.getTierStatus();
      if (response.data) {
        setTierStatus(response.data);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch tier status';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  // ============= UPGRADE TO TIER 0 - BASIC ENROLLMENT =============
  /**
   * Tier 0: PATCH /api/v1/payment/customers/tier-zero
   * Creates initial customer profile
   * Returns maplerad_id for use in subsequent tiers
   */
  const upgradeToTierZero = useCallback(
    async (data: Tier0UpgradeData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.upgradeToTierZero(data);
        
        // Extract and store maplerad_id for later use
        const mapleradId = response.data?.data?.maplerad_customer?.maplerad_id;
        if (mapleradId) {
          setMapleradId(mapleradId);
        }
        
        options?.onSuccess?.('TIER_ZERO');
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to enroll customer';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // ============= UPGRADE TO TIER 1 - BRONZE TIER =============
  /**
   * Tier 1: PATCH /api/v1/payment/customers/tier-one
   * Requirements:
   * - Must complete Tier 0 first
   * - BVN must be exactly 11 digits
   * - Phone must include country code
   * - DOB format: DD-MM-YYYY
   * - All address fields required
   */
  const upgradeToTierOne = useCallback(
    async (data: Tier1UpgradeData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.upgradeToTierOne(data);
        
        // Check if virtual account was created
        const virtualAccountCreated = response.data?.data?.maplerad_customer?.virtual_account_created;
        
        options?.onSuccess?.('TIER_ONE');
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to upgrade to Tier 1';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // ============= UPGRADE TO TIER 2 - SILVER TIER =============
  /**
   * Tier 2: PATCH /api/v1/payment/customers/tier-two
   * Requirements:
   * - Must complete Tier 1 first
   * - Identity type: 'nin', 'passport', 'drivers_license', 'voters_card'
   * - Image must be base64 encoded
   * - Country must be 2-letter code (e.g., 'NG')
   * - Verification status: 'pending' (24-48 hours)
   */
  const upgradeToTierTwo = useCallback(
    async (data: Tier2UpgradeData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.upgradeToTierTwo(data);
        
        // Check verification status (usually 'pending' initially)
        const verificationStatus = response.data?.data?.maplerad_customer?.identity_verification_status;
        
        options?.onSuccess?.('TIER_TWO');
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to upgrade to Tier 2';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // ============= VERIFY BVN =============
  /**
   * Optional but recommended before Tier 1 upgrade
   * POST /api/v1/payment/identity/bvn-verify
   * Public endpoint (no auth required)
   */
  const verifyBVN = useCallback(
    async (bvn: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.verifyBVN(bvn);
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'BVN verification failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============= RESET ERROR =============

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    tierStatus,
    loading,
    error,
    mapleradId,

    // Actions
    fetchTierStatus,
    upgradeToTierZero,
    upgradeToTierOne,
    upgradeToTierTwo,
    verifyBVN,
    clearError,
  };
};
