/**
 * Tier Upgrade Hook
 * Manages tier upgrade state and operations
 */

import { useCallback, useState } from 'react';
import { tierUpgradeService } from '@/services/tier-upgrade.service';
import {
  TierStatus,
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
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============= FETCH TIER STATUS =============

  const fetchTierStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tierUpgradeService.getTierStatus();
      if (response.data) {
        setTierStatus(response.data);
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tier status';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  // ============= UPGRADE TO TIER 0 =============

  const upgradeTierZero = useCallback(
    async (data: Tier0UpgradeData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.enrollCustomer(data);
        options?.onSuccess?.(0);
        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to enroll customer';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // ============= UPGRADE TO TIER 1 =============

  const upgradeTierOne = useCallback(
    async (data: Tier1UpgradeData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.upgradeTierOne(data);
        options?.onSuccess?.(1);
        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to upgrade to Tier 1';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // ============= UPGRADE TO TIER 2 =============

  const upgradeTierTwo = useCallback(
    async (data: Tier2UpgradeData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tierUpgradeService.upgradeTierTwo(data);
        options?.onSuccess?.(2);
        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to upgrade to Tier 2';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
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

    // Actions
    fetchTierStatus,
    upgradeTierZero,
    upgradeTierOne,
    upgradeTierTwo,
    clearError,
  };
};
