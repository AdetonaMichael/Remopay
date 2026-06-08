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
  TransactionSummary,
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
   * Upload screenshot for proof of transfer
   * POST /v1/airtime/{id}/upload-screenshot
   * Expects multipart/form-data with a screenshot file.
   * Returns a secure Cloudinary URL to include in the submit-proof request.
   */
  async uploadScreenshot(
    transactionId: number,
    file: File
  ): Promise<{ screenshot_url: string; public_id: string; size: number; width: number; height: number; uploaded_at: string }> {
    try {
      const formData = new FormData();
      formData.append('screenshot', file);

      const response = await apiClient.post<any>(
        `/airtime/${transactionId}/upload-screenshot`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Extract screenshot data from response
      const data = response.data?.data || response.data;
      
      if (data && typeof data === 'object' && 'screenshot_url' in data) {
        return {
          screenshot_url: data.screenshot_url,
          public_id: data.public_id,
          size: data.size,
          width: data.width,
          height: data.height,
          uploaded_at: data.uploaded_at,
        };
      }
      
      console.warn('Invalid upload screenshot response structure:', response.data);
      throw new Error('Failed to extract screenshot URL from response');
    } catch (error) {
      console.error('Failed to upload screenshot:', error);
      throw error;
    }
  }

  /**
   * Initiate a new airtime conversion request
   */
  async initiateConversion(
    request: InitiateConversionRequest
  ): Promise<InitiateConversionResponse> {
    try {
      const response = await apiClient.post<any>(
        '/airtime/initiate',
        request
      );
      
      console.log('Initiate conversion response:', response.data);
      
      // API response structure: { success, message, transaction, instructions }
      // The apiClient wraps it, so response.data is the actual data
      const data = response.data?.data || response.data;
      
      if (data && typeof data === 'object' && 'transaction' in data && 'instructions' in data) {
        return data as InitiateConversionResponse;
      }
      
      console.warn('Invalid initiate conversion response structure:', response.data);
      throw new Error('Invalid response structure from API');
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
      const response = await apiClient.post<any>(
        `/airtime/${transactionId}/submit-proof`,
        request
      );
      
      // Try nested data first, then direct data
      const data = response.data?.data || response.data;
      
      if (data && typeof data === 'object') {
        return data as AirtimeToCashTransaction;
      }
      
      console.warn('Invalid submit proof response structure:', response.data);
      throw new Error('Invalid response structure from API');
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
      console.log('[AirtimeToCashService] getHistory raw response:', response.data);
      
      const data = response.data?.data || response.data;
      console.log('[AirtimeToCashService] extracted data:', data);
      
      // Handle two possible response structures:
      // 1. Direct array: data = [transactions...]
      // 2. Paginated object: data = { data: [transactions...], current_page, ... }
      
      let transactions: any[] = [];
      let paginatedData: TransactionHistoryResponse | null = null;
      
      if (Array.isArray(data)) {
        // API returned direct array of transactions
        console.log('[AirtimeToCashService] Response is direct array');
        transactions = data;
        paginatedData = {
          data: transactions,
          current_page: 1,
          per_page: transactions.length,
          total: transactions.length,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null,
        };
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // API returned paginated object with data array inside
        console.log('[AirtimeToCashService] Response is paginated object');
        transactions = data.data;
        paginatedData = data as TransactionHistoryResponse;
      }
      
      if (transactions.length > 0 || paginatedData) {
        const summary: TransactionSummary = {
          total_requests: paginatedData?.total || transactions.length,
          completed: transactions.filter((t: any) => t.status === 'completed').length,
          rejected: transactions.filter((t: any) => t.status === 'rejected').length,
          pending: transactions.filter((t: any) => t.status === 'pending').length,
          total_converted: transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.cash_credited) || 0), 0),
          total_fees_paid: transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.service_fee) || 0), 0),
        };
        
        const result: HistoryWithSummary = {
          data: paginatedData || {
            data: [],
            current_page: 1,
            per_page: 0,
            total: 0,
            last_page: 1,
            next_page_url: null,
            prev_page_url: null,
          },
          summary,
        };
        
        console.log('[AirtimeToCashService] Returning HistoryWithSummary with', transactions.length, 'transactions');
        return result;
      }
      
      console.warn('Invalid history response structure - no transactions found:', response.data);
      return {
        data: {
          data: [],
          current_page: 1,
          per_page: 0,
          total: 0,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null,
        },
        summary: {
          total_requests: 0,
          completed: 0,
          rejected: 0,
          pending: 0,
          total_converted: 0,
          total_fees_paid: 0,
        },
      };
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
      const response = await apiClient.get<any>(
        `/airtime/${transactionId}`
      );
      
      // Try nested data first, then direct data
      const data = response.data?.data || response.data;
      
      if (data && typeof data === 'object') {
        return data as AirtimeToCashTransaction;
      }
      
      console.warn('Invalid transaction response structure:', response.data);
      throw new Error('Invalid response structure from API');
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
      
      // Try nested data first, then direct data
      const stats = response.data?.data || response.data;
      
      if (stats && typeof stats === 'object' && 'total_requests' in stats) {
        return stats as AirtimeToCashStats;
      }
      
      console.warn('Invalid stats response structure:', response.data);
      return {} as AirtimeToCashStats;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      return {} as AirtimeToCashStats;
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
      
      // apiClient strips wrapper, response.data IS the dashboard object directly
      const data = response.data;
      
      if (data && typeof data === 'object' && ('overview' in data || 'by_provider' in data)) {
        return data as AdminDashboardData;
      }
      
      console.warn('[AirtimeToCashService] Invalid dashboard response structure:', data);
      return DEFAULT_DASHBOARD;
    } catch (error) {
      console.error('[AirtimeToCashService] Failed to fetch admin dashboard:', error);
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
      
      // apiClient strips wrapper, response.data IS the paginated response directly
      const paginatedData = response.data;
      
      if (paginatedData && typeof paginatedData === 'object' && ('data' in paginatedData || 'current_page' in paginatedData)) {
        return paginatedData as AdminPendingResponse;
      }
      
      console.warn('[AirtimeToCashService] Invalid pending response structure:', paginatedData);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1 } as AdminPendingResponse;
    } catch (error) {
      console.error('[AirtimeToCashService] Failed to fetch pending conversions:', error);
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
      
      console.log('[AirtimeToCashService] getAdminAll response.data:', response.data);
      
      // apiClient already strips the wrapper, response.data IS the paginated response
      const data = response.data;
      console.log('[AirtimeToCashService] getAdminAll checking pagination properties:', { hasData: 'data' in data, hasCurrentPage: 'current_page' in data, dataLength: data?.data?.length });
      
      if (data && typeof data === 'object' && ('data' in data || 'current_page' in data)) {
        console.log('[AirtimeToCashService] ✓ getAdminAll returning valid response with', data.data?.length || 0, 'transactions');
        return data as TransactionHistoryResponse;
      }
      
      console.warn('[AirtimeToCashService] Invalid admin transactions response structure:', data);
      return { data: [], current_page: 1, per_page: 50, total: 0, last_page: 1, next_page_url: null, prev_page_url: null } as TransactionHistoryResponse;
    } catch (error) {
      console.error('[AirtimeToCashService] Failed to fetch admin transactions:', error);
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
      
      // apiClient already strips the wrapper, response.data IS the transaction
      const data = response.data;
      console.log('[AirtimeToCashService] getAdminTransaction response.data:', data);
      
      if (data && typeof data === 'object' && 'id' in data) {
        console.log('[AirtimeToCashService] ✓ Returning valid transaction:', data.id);
        return data as AdminTransactionView;
      }
      
      console.warn('[AirtimeToCashService] Invalid transaction response structure:', data);
      return {} as AdminTransactionView;
    } catch (error) {
      console.error('[AirtimeToCashService] Failed to fetch admin transaction:', error);
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
      
      // Handle multiple response structures
      let data = response.data?.data;
      
      // If response.data itself is an array, use it directly
      if (!Array.isArray(data) && Array.isArray(response.data)) {
        data = response.data;
      }
      
      if (Array.isArray(data)) {
        console.log('[AirtimeToCashService] Fetched admin providers:', data.length);
        return data;
      }
      
      console.warn('[AirtimeToCashService] Invalid providers response structure:', response.data);
      return [];
    } catch (error) {
      console.error('[AirtimeToCashService] Failed to fetch admin providers:', error);
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
   * Upload provider logo (admin)
   * POST /v1/airtime/admin/providers/{code}/upload-logo
   * Expects multipart/form-data with a logo file.
   * Returns Cloudinary URL for the logo.
   */
  async uploadProviderLogo(
    providerCode: string,
    file: File
  ): Promise<{ logo_url: string; public_id: string; size: number; width: number; height: number; uploaded_at: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await apiClient.post<any>(
        `/airtime/admin/providers/${providerCode}/upload-logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Extract logo data from response
      const data = response.data?.data || response.data;
      
      if (data && typeof data === 'object' && 'logo_url' in data) {
        console.log('[AirtimeToCashService] Provider logo uploaded:', data.logo_url);
        return {
          logo_url: data.logo_url,
          public_id: data.public_id,
          size: data.size,
          width: data.width,
          height: data.height,
          uploaded_at: data.uploaded_at,
        };
      }
      
      console.warn('[AirtimeToCashService] Invalid upload logo response structure:', response.data);
      throw new Error('Failed to extract logo URL from response');
    } catch (error) {
      console.error('[AirtimeToCashService] Failed to upload provider logo:', error);
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
