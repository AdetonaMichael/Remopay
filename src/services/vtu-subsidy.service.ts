/**
 * VTU Subsidy Admin API Service
 *
 * Provides methods to manage VTU service subsidies:
 * - List all services with their subsidy configurations
 * - Toggle subsidy ON/OFF per service
 * - Update subsidy type & value
 */

import { apiClient } from './api-client';
import type {
  ServiceSubsidyConfig,
  ToggleSubsidyResponse,
  UpdateSubsidyPayload,
} from '@/types/vtu.types';
import type { ApiResponse } from '@/types/api.types';

const BASE_URL = '/admin/vtu';

export const vtuSubsidyApi = {
  /**
   * Get all VTU services with subsidy configurations
   */
  listServices: async (): Promise<ServiceSubsidyConfig[]> => {
    const res = await apiClient.get<ServiceSubsidyConfig[]>(
      `${BASE_URL}/services`,
    );
    return res.data ?? [];
  },

  /**
   * Get a single VTU service details with subsidy config
   */
  getService: async (serviceId: string): Promise<ServiceSubsidyConfig> => {
    const res = await apiClient.get<ServiceSubsidyConfig>(
      `${BASE_URL}/services/${serviceId}`,
    );
    if (!res.data) {
      throw new Error('Service not found');
    }
    return res.data;
  },

  /**
   * Toggle subsidy ON/OFF for a service (immediate effect)
   */
  toggleSubsidy: async (serviceId: string): Promise<ToggleSubsidyResponse> => {
    const res = await apiClient.put<ToggleSubsidyResponse>(
      `${BASE_URL}/services/${serviceId}/subsidy/toggle`,
    );
    if (!res.data) {
      throw new Error('Failed to toggle subsidy');
    }
    return res.data;
  },

  /**
   * Update subsidy configuration (type, value, caps)
   */
  updateSubsidyConfig: async (
    serviceId: string,
    payload: UpdateSubsidyPayload,
  ): Promise<ServiceSubsidyConfig> => {
    const res = await apiClient.put<ServiceSubsidyConfig>(
      `${BASE_URL}/services/${serviceId}/subsidy`,
      payload,
    );
    if (!res.data) {
      throw new Error('Failed to update subsidy configuration');
    }
    return res.data;
  },
};
