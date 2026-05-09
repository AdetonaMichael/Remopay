import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api.types';

export interface BasicInfo {
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string | null;
  email: string;
}

export interface IdentityInfo {
  nin: string | null;
  identified: boolean;
  phone: string;
}

export interface DedicatedAccount {
  account_name: string;
  account_number: string;
  bank_name: string;
}

export interface BankAccount {
  id: string;
  account_number: string;
  bank_name: string;
  account_name: string;
}

export interface Customer {
  basicInfo: BasicInfo;
  identityInfo: IdentityInfo;
  bankInfo: BankAccount[];
  dedicatedAccount: DedicatedAccount;
}

export interface GetCustomerResponse {
  customer: Customer;
}

class CustomerService {
  /**
   * Get customer details including dedicated account information
   * @param emailOrCode User's email address or customer code
   */
  async getCustomer(emailOrCode: string): Promise<ApiResponse<GetCustomerResponse>> {
    try {
      console.log('[CustomerService] Fetching customer info for:', emailOrCode);

      const response = await apiClient.get(`/payment/customer?emailOrCode=${encodeURIComponent(emailOrCode)}`);

      console.log('[CustomerService] Customer info retrieved successfully:', response);
      return response;
    } catch (error: any) {
      console.error('[CustomerService] Failed to fetch customer info:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user's account information
   * Uses the user's email to fetch their dedicated account details
   */
  async getCurrentUserAccount(email: string): Promise<ApiResponse<GetCustomerResponse>> {
    return this.getCustomer(email);
  }
}

export const customerService = new CustomerService();
