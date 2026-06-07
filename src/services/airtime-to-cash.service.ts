/**
 * Airtime-to-Cash Conversion Service
 * Handles all API calls for airtime conversion to cash feature
 */

import { apiClient } from './api-client';
import {
  AirtimeCashProvider,
  InitiateConversionRequest,
  InitiateConversionResponse,
  AirtimeToCashTransaction,
  SubmitProofRequest,
  HistoryWithSummary,
  AirtimeToCashStats,
  AdminDashboardData,
  AdminTransactionView,
  AdminPendingResponse,
  AdminApproveRequest,
  AdminRejectRequest,
  TransactionHistoryResponse,
  AdminProviderResponse,
  UpdateProviderRequest,
  AuditLog,
  AuditLogsResponse,
  ExportTransactionsRequest,
  ExportTransactionsResponse,
} from '@/types/airtime-to-cash.types';

class AirtimeToCashService {
  /**
   * Get list of available providers for conversion
   */
  async getProviders(): Promise<AirtimeCashProvider[]> {
    try {
      const response = await apiClient.get<any>('/airtime/providers');
      
      console.log('Providers API Response:', response.data);
      
      // API response structure: { success, message, data: { providers: [...] } }
      let providers: AirtimeCashProvider[] | undefined;
      
      // Try different possible response structures
      if (response.data?.data?.providers) {
        // Structure: response.data.data.providers = [...]
        providers = response.data.data.providers;
      } else if (response.data?.providers) {
        // Structure: response.data.providers = [...]
        providers = response.data.providers;
      } else if (Array.isArray(response.data?.data)) {
        // Structure: response.data.data = [...]
        providers = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Structure: response.data = [...]
        providers = response.data;
      }
      
      // Ensure we always return an array
      if (Array.isArray(providers)) {
        console.log(`Successfully fetched ${providers.length} providers`);
        return providers;
      }
      
      console.warn('Invalid providers response structure - expected array, got:', typeof providers, providers);
      return [];
    } catch (error) {
      console.error('Failed to fetch airtime providers:', error);
      return [];
    }
  }

  /**
   * Initiate a new airtime conversion request
   */
  async initiateConversion(
    request: InitiateConversionRequest
  ): Promise<InitiateConversionResponse> {
    try {
      const response = await apiClient.post<{ data: InitiateConversionResponse }>(
        '/airtime/initiate',
        request
      );
      return response.data?.data as InitiateConversionResponse;
    } catch (error) {
      console.error('Failed to initiate conversion:', error);
      throw error;
    }
  }

  /**
   * Submit proof of airtime transfer (screenshot URL)
   */
  async submitProof(
    transactionId: number,
    request: SubmitProofRequest
  ): Promise<AirtimeToCashTransaction> {
    try {
      const response = await apiClient.post<{ data: AirtimeToCashTransaction }>(
        `/airtime/${transactionId}/submit-proof`,
        request
      );
      return response.data?.data as AirtimeToCashTransaction;
    } catch (error) {
      console.error('Failed to submit proof:', error);
      throw error;
    }
  }

  /**
   * Get user's conversion transaction history
   */
  async getHistory(params?: {
    status?: string;
    provider?: string;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<HistoryWithSummary> {
    try {
      const response = await apiClient.get<any>('/airtime/history', { params });
      const historyData = response.data?.data;
      
      // Ensure data is valid
      if (historyData && typeof historyData === 'object') {
        return historyData as HistoryWithSummary;
      }
      
      console.warn('Invalid history response structure:', response.data);
      return { transactions: [], summary: {} } as HistoryWithSummary;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  }

  /**
   * Get single transaction details
   */
  async getTransaction(transactionId: number): Promise<AirtimeToCashTransaction> {
    try {
      const response = await apiClient.get<{ data: AirtimeToCashTransaction }>(
        `/airtime/${transactionId}`
      );
      return response.data?.data as AirtimeToCashTransaction;
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<AirtimeToCashStats> {
    try {
      const response = await apiClient.get<any>('/airtime/stats');
      const stats = response.data?.data;
      
      if (stats && typeof stats === 'object') {
        return stats as AirtimeToCashStats;
      }
      
      console.warn('Invalid stats response structure:', response.data);
      return {} as AirtimeToCashStats;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    }
  }

  // ============ ADMIN ENDPOINTS ============

  /**
   * Get admin dashboard metrics
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const DEFAULT_DASHBOARD: AdminDashboardData = {
      overview: {
        total_requests: 0,
        pending_approval: 0,
        approved_today: 0,
        completed_today: 0,
      },
      volume: {
        today_total_converted: 0,
        this_month_total_converted: 0,
        today_airtime_received: 0,
        this_month_airtime_received: 0,
      },
      revenue: {
        today_fees_earned: 0,
        this_month_fees_earned: 0,
        total_fees_earned: 0,
      },
      status: {
        completed: 0,
        rejected: 0,
        pending: 0,
      },
      by_provider: {},
    };

    try {
      const response = await apiClient.get<any>('/airtime/admin/dashboard');
      const data = response.data?.data;
      
      if (data && typeof data === 'object' && 'overview' in data) {
        return data as AdminDashboardData;
      }
      
      console.warn('Invalid dashboard response structure:', response.data);
      return DEFAULT_DASHBOARD;
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
      return DEFAULT_DASHBOARD;
    }
  }

  /**
   * Get pending conversions awaiting approval
   */
  async getAdminPending(params?: {
    per_page?: number;
    page?: number;
  }): Promise<AdminPendingResponse> {
    try {
      const response = await apiClient.get<any>(
        '/airtime/admin/pending',
        {
          params,
        }
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object' && 'data' in data) {
        return data as AdminPendingResponse;
      }
      
      console.warn('Invalid pending response structure:', response.data);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1 } as AdminPendingResponse;
    } catch (error) {
      console.error('Failed to fetch pending conversions:', error);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1 } as AdminPendingResponse;
    }
  }

  /**
   * Get all conversions with filters (admin)
   */
  async getAdminAll(params?: {
    status?: string;
    provider?: string;
    user_id?: number;
    reference?: string;
    phone_number?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<TransactionHistoryResponse> {
    try {
      const response = await apiClient.get<any>(
        '/airtime/admin',
        {
          params,
        }
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object' && 'data' in data) {
        return data as TransactionHistoryResponse;
      }
      
      console.warn('Invalid admin transactions response structure:', response.data);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1, next_page_url: null, prev_page_url: null } as TransactionHistoryResponse;
    } catch (error) {
      console.error('Failed to fetch admin transactions:', error);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1, next_page_url: null, prev_page_url: null } as TransactionHistoryResponse;
    }
  }

  /**
   * Get single transaction details (admin view with full data)
   */
  async getAdminTransaction(transactionId: number): Promise<AdminTransactionView> {
    try {
      const response = await apiClient.get<any>(
        `/airtime/admin/${transactionId}`
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object') {
        return data as AdminTransactionView;
      }
      
      console.warn('Invalid transaction response structure:', response.data);
      return {} as AdminTransactionView;
    } catch (error) {
      console.error('Failed to fetch admin transaction:', error);
      return {} as AdminTransactionView;
    }
  }

  /**
   * Approve a conversion (admin)
   */
  async approveConversion(
    transactionId: number,
    request?: AdminApproveRequest
  ): Promise<AirtimeToCashTransaction> {
    try {
      const response = await apiClient.post<any>(
        `/airtime/admin/${transactionId}/approve`,
        request || {}
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object') {
        return data as AirtimeToCashTransaction;
      }
      
      console.warn('Invalid approve response structure:', response.data);
      return {} as AirtimeToCashTransaction;
    } catch (error) {
      console.error('Failed to approve conversion:', error);
      throw error;
    }
  }

  /**
   * Reject a conversion (admin)
   */
  async rejectConversion(
    transactionId: number,
    request: AdminRejectRequest
  ): Promise<AirtimeToCashTransaction> {
    try {
      const response = await apiClient.post<any>(
        `/airtime/admin/${transactionId}/reject`,
        request
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object') {
        return data as AirtimeToCashTransaction;
      }
      
      console.warn('Invalid reject response structure:', response.data);
      return {} as AirtimeToCashTransaction;
    } catch (error) {
      console.error('Failed to reject conversion:', error);
      throw error;
    }
  }

  // ============ NEW ADMIN ENDPOINTS ============

  /**
   * Get all providers (admin view with statistics)
   */
  async getAdminProviders(): Promise<AdminProviderResponse[]> {
    try {
      const response = await apiClient.get<any>(
        '/airtime/admin/providers'
      );
      const data = response.data?.data;
      
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('Invalid providers response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Failed to fetch admin providers:', error);
      return [];
    }
  }

  /**
   * Update provider settings (admin)
   */
  async updateProvider(
    providerCode: string,
    request: UpdateProviderRequest
  ): Promise<AdminProviderResponse> {
    try {
      const response = await apiClient.put<any>(
        `/airtime/admin/providers/${providerCode}`,
        request
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object') {
        return data as AdminProviderResponse;
      }
      
      console.warn('Invalid update provider response structure:', response.data);
      return {} as AdminProviderResponse;
    } catch (error) {
      console.error('Failed to update provider:', error);
      throw error;
    }
  }

  /**
   * Get all audit logs
   */
  async getAuditLogs(params?: {
    transaction_id?: number;
    action?: string;
    performed_by?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<AuditLogsResponse> {
    try {
      const response = await apiClient.get<any>(
        '/airtime/admin/audit-logs',
        {
          params,
        }
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object') {
        return data as AuditLogsResponse;
      }
      
      console.warn('Invalid audit logs response structure:', response.data);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1 } as AuditLogsResponse;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1 } as AuditLogsResponse;
    }
  }

  /**
   * Get audit logs for a specific transaction
   */
  async getTransactionAuditLogs(transactionId: number): Promise<AuditLog[]> {
    try {
      const response = await apiClient.get<any>(
        `/airtime/admin/audit-logs/${transactionId}`
      );
      const data = response.data?.data;
      
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('Invalid transaction audit logs response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Failed to fetch transaction audit logs:', error);
      return [];
    }
  }

  /**
   * Export transactions (admin)
   */
  async exportTransactions(
    request: ExportTransactionsRequest
  ): Promise<ExportTransactionsResponse> {
    try {
      const response = await apiClient.post<any>(
        '/airtime/admin/export/transactions',
        request
      );
      const data = response.data?.data;
      
      if (data && typeof data === 'object') {
        return data as ExportTransactionsResponse;
      }
      
      console.warn('Invalid export response structure:', response.data);
      return {} as ExportTransactionsResponse;
    } catch (error) {
      console.error('Failed to export transactions:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate conversion amounts
   */
  calculateConversion(
    airtimeAmount: number,
    serviceFeePercentage: number,
    conversionRate: number
  ): {
    serviceFee: number;
    netAmount: number;
    cashCredited: number;
  } {
    const serviceFee = airtimeAmount * serviceFeePercentage;
    const netAmount = airtimeAmount - serviceFee;
    const cashCredited = netAmount * conversionRate;

    return {
      serviceFee: Math.round(serviceFee),
      netAmount: Math.round(netAmount),
      cashCredited: Math.round(cashCredited),
    };
  }
}

export const airtimeToCashService = new AirtimeToCashService();
