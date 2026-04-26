import { apiClient } from './api-client';
import {
  Provider,
  Plan,
  BillAccount,
  VerifyBillAccountRequest,
  ApiResponse,
} from '@/types/api.types';

class ProviderService {
  async listProviders(type?: string, country?: string): Promise<ApiResponse<{ providers: Provider[] }>> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (country) params.append('country', country);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/providers${query}`);
  }

  async getProviderPlans(provider: string, type?: string): Promise<ApiResponse<{ provider: string; plans: Plan[] }>> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/providers/${provider}/plans${query}`);
  }

  async verifyBillAccount(provider: string, data: VerifyBillAccountRequest): Promise<ApiResponse<{ account: BillAccount }>> {
    return apiClient.post(`/providers/${provider}/verify-account`, data);
  }
}

export const providerService = new ProviderService();
