import { apiClient } from './api-client';
import {
  AdminDashboard,
  AdminUser,
  Agent,
  UpdateUserStatusRequest,
  RefundTransactionRequest,
  GenerateReportRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api.types';

class AdminService {
  async getDashboard(): Promise<ApiResponse<{ data: any }>> {
    return apiClient.get('/admin/dashboard/comprehensive');
  }

  // USER MANAGEMENT
  async getUsers(page = 1, per_page = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<AdminUser>>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/admin/users?${params.toString()}`);
  }

  async getUser(userId: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.get(`/admin/users/${userId}`);
  }

  async createUser(data: any): Promise<any> {
    return apiClient.post('/admin/users', data);
  }

  async updateUser(userId: string, data: any): Promise<any> {
    return apiClient.put(`/admin/users/${userId}`, data);
  }

  async deleteUser(userId: string): Promise<any> {
    return apiClient.delete(`/admin/users/${userId}`);
  }

  async suspendUser(userId: string): Promise<any> {
    return apiClient.put(`/admin/users/${userId}/suspend`, {});
  }

  async activateUser(userId: string): Promise<any> {
    return apiClient.put(`/admin/users/${userId}/activate`, {});
  }

  async verifyUser(userId: string): Promise<any> {
    return apiClient.put(`/admin/users/${userId}/verify`, {});
  }

  async assignRolesToUser(userId: string, roleIds: number[]): Promise<any> {
    return apiClient.put(`/admin/users/${userId}/roles`, { role_ids: roleIds });
  }

  async assignPermissionsToUser(userId: string, permissionIds: number[]): Promise<any> {
    return apiClient.put(`/admin/users/${userId}/permissions`, { permission_ids: permissionIds });
  }

  async getUserTransactions(userId: string, page = 1, per_page = 50): Promise<any> {
    return apiClient.get(`/admin/users/${userId}/transactions?page=${page}&per_page=${per_page}`);
  }

  async getUserWallet(userId: string): Promise<any> {
    return apiClient.get(`/admin/users/${userId}/wallet`);
  }

  async getUserReferrals(userId: string, page = 1, per_page = 50): Promise<any> {
    return apiClient.get(`/admin/users/${userId}/referrals?page=${page}&per_page=${per_page}`);
  }

  async exportUsers(format = 'csv'): Promise<any> {
    return apiClient.get(`/admin/users/export?format=${format}`);
  }

  async bulkUserAction(userIds: number[], action: string): Promise<any> {
    return apiClient.post('/admin/users/bulk-action', { user_ids: userIds, action });
  }

  async updateUserStatus(
    userId: string,
    data: UpdateUserStatusRequest
  ): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.put(`/admin/users/${userId}/status`, data);
  }

  async sendEmailToUser(
    userId: string | number,
    payload: {
      title: string;
      body: string;
      send_email?: boolean;
      email_template?: string;
    }
  ): Promise<any> {
    return apiClient.post(`/admin/users/${userId}/email`, payload);
  }

  async sendNotificationWithData(
    userId: string | number,
    payload: {
      title: string;
      body: string;
      type: string;
      priority?: 'high' | 'normal' | 'low';
      send_push?: boolean;
      send_email?: boolean;
      email_template?: string;
      extra_data?: Record<string, any>;
    }
  ): Promise<any> {
    return apiClient.post(`/admin/users/${userId}/notification`, payload);
  }

  async changeUserRole(userId: string | number, role: string): Promise<any> {
    return apiClient.post(`/admin/users/${userId}/role`, { role });
  }

  // TRANSACTIONS ENDPOINTS
  async getAllTransactions(page = 1, per_page = 50, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/transactions/all?${params.toString()}`);
  }

  async getTransactionDetails(transactionId: string): Promise<any> {
    return apiClient.get(`/transactions/${transactionId}`);
  }

  async verifyAirtimeConversion(conversionId: number, approved: boolean, notes?: string): Promise<any> {
    return apiClient.post('/transactions/airtime-conversion/verify', {
      conversion_id: conversionId,
      approved,
      notes,
    });
  }

  async getTransactions(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/admin/transactions?${params.toString()}`);
  }

  async refundTransaction(
    transactionId: string,
    data: RefundTransactionRequest
  ): Promise<any> {
    return apiClient.post(`/admin/transactions/${transactionId}/refund`, data);
  }

  // ROLES & PERMISSIONS
  async getRoles(): Promise<any> {
    return apiClient.get('/role/roles');
  }

  async getPermissions(): Promise<any> {
    return apiClient.get('/role/permissions');
  }

  async createRole(name: string): Promise<any> {
    return apiClient.post('/role/roles', { name });
  }

  async createPermission(name: string): Promise<any> {
    return apiClient.post('/role/permissions', { name });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<any> {
    return apiClient.post('/role/assign/role', { user_id: userId, role_id: roleId });
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<any> {
    return apiClient.post('/role/role/permission', { role_id: roleId, permission_id: permissionId });
  }

  async revokePermissionFromRole(roleId: number, permissionId: number): Promise<any> {
    return apiClient.post('/role/role/permission/revoke', { role_id: roleId, permission_id: permissionId });
  }

  async updateRole(roleId: number, name: string): Promise<any> {
    return apiClient.put(`/role/roles/${roleId}`, { name });
  }

  async deleteRole(roleId: number): Promise<any> {
    return apiClient.delete(`/role/roles/${roleId}`);
  }

  async deletePermission(permissionId: number): Promise<any> {
    return apiClient.delete(`/role/permissions/${permissionId}`);
  }

  // OFFER CODES
  async getOfferCodes(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/admin/offer-codes?${params.toString()}`);
  }

  async getOfferCode(offerId: number): Promise<any> {
    return apiClient.get(`/admin/offer-codes/${offerId}`);
  }

  async createOfferCode(data: any): Promise<any> {
    return apiClient.post('/admin/offer-codes', data);
  }

  async updateOfferCode(offerId: number, data: any): Promise<any> {
    return apiClient.put(`/admin/offer-codes/${offerId}`, data);
  }

  async deleteOfferCode(offerId: number): Promise<any> {
    return apiClient.delete(`/admin/offer-codes/${offerId}`);
  }

  // WALLET
  async getWalletStatistics(): Promise<any> {
    return apiClient.get('/stats/wallet');
  }

  async getWalletBalance(): Promise<any> {
    return apiClient.get('/wallet/balance');
  }

  async getWalletTransactions(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/wallet/transactions?${params.toString()}`);
  }

  // VTU
  async getVTUTransactionStats(): Promise<any> {
    return apiClient.get('/stats/vtu');
  }

  async getVTUTransactions(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/vtu/transactions?${params.toString()}`);
  }

  async getVTUBalance(): Promise<any> {
    return apiClient.get('/vtu/balance');
  }

  // VTU RECIPIENTS
  async getVTURecipients(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/vtu/recipients?${params.toString()}`);
  }

  async getVTURecipient(recipientId: number): Promise<any> {
    return apiClient.get(`/vtu/recipients/${recipientId}`);
  }

  async getRecentlyUsedRecipients(limit = 10): Promise<any> {
    return apiClient.get(`/vtu/recipients/quick-access/recently-used?limit=${limit}`);
  }

  async getFrequentlyUsedRecipients(limit = 10): Promise<any> {
    return apiClient.get(`/vtu/recipients/quick-access/frequently-used?limit=${limit}`);
  }

  async searchVTURecipients(query: string, transactionType?: string, serviceIdentifier?: string): Promise<any> {
    return apiClient.post('/vtu/recipients/search/suggest', {
      query,
      transaction_type: transactionType,
      service_identifier: serviceIdentifier,
    });
  }

  async updateVTURecipient(recipientId: number, data: any): Promise<any> {
    return apiClient.put(`/vtu/recipients/${recipientId}`, data);
  }

  async deleteVTURecipient(recipientId: number): Promise<any> {
    return apiClient.delete(`/vtu/recipients/${recipientId}`);
  }

  async recordRecipientUsage(recipientId: number, transactionId: number): Promise<any> {
    return apiClient.post(`/vtu/recipients/${recipientId}/record-usage`, { transaction_id: transactionId });
  }

  // REFERRALS
  async getReferrals(): Promise<any> {
    return apiClient.get('/referrals');
  }

  async getReferralPrograms(): Promise<any> {
    return apiClient.get('/referrals/programs');
  }

  async getReferralStats(): Promise<any> {
    return apiClient.get('/referrals/stats');
  }

  async getUserWithReferrals(userId: number): Promise<any> {
    return apiClient.get(`/referrals/single/${userId}`);
  }

  // NOTIFICATIONS
  async getNotificationStats(): Promise<any> {
    return apiClient.get('/notifications/stats');
  }

  async sendNotificationToUser(userId: number, title: string, body: string, type: string, priority: string = 'normal', metadata?: any): Promise<any> {
    return apiClient.post('/admin/notifications/send-to-user', {
      user_id: userId,
      title,
      message: body,
      type,
      priority,
      metadata,
    });
  }

  async sendNotificationToUsers(userIds: number[], title: string, body: string, type: string, priority: string = 'normal'): Promise<any> {
    return apiClient.post('/admin/notifications/send-to-users', {
      user_ids: userIds,
      title,
      message: body,
      type,
      priority,
    });
  }

  async sendBroadcastCampaign(userIds: number[], title: string, body: string, options?: any): Promise<any> {
    return apiClient.post('/admin/test/send-campaign', {
      user_ids: userIds,
      title,
      message: body,
      options,
    });
  }

  // STATISTICS & ANALYTICS
  async getWalletStats(): Promise<any> {
    return apiClient.get('/stats/wallet');
  }

  async getVTUStats(): Promise<any> {
    return apiClient.get('/stats/vtu');
  }

  async getUserStats(): Promise<any> {
    return apiClient.get('/stats/user');
  }

  async getAllStats(): Promise<any> {
    return apiClient.get('/stats/all');
  }

  async getAdminStats(): Promise<any> {
    return apiClient.get('/stats/admin');
  }

  async generateReport(data: GenerateReportRequest): Promise<any> {
    return apiClient.post('/admin/reports/generate', data);
  }

  async getAgents(page = 1, per_page = 20): Promise<ApiResponse<PaginatedResponse<Agent>>> {
    return apiClient.get(`/admin/agents?page=${page}&per_page=${per_page}`);
  }

  async getAnalytics(metric: string, period: string): Promise<any> {
    return apiClient.get(`/admin/analytics?metric=${metric}&period=${period}`);
  }
}

class AgentService {
  async getDashboard(): Promise<any> {
    return apiClient.get('/agents/dashboard');
  }

  async getCustomers(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/agents/customers?${params.toString()}`);
  }

  async addCustomer(data: any): Promise<any> {
    return apiClient.post('/agents/customers', data);
  }

  async getCommissions(page = 1, per_page = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(per_page));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }

    return apiClient.get(`/agents/commissions?${params.toString()}`);
  }

  async getPerformance(period = 'month'): Promise<any> {
    return apiClient.get(`/agents/performance?period=${period}`);
  }
}

class ReferralService {
  async getInfo(): Promise<any> {
    return apiClient.get('/referral/info');
  }

  async getCommissions(page = 1, per_page = 20): Promise<any> {
    return apiClient.get(`/referral/commissions?page=${page}&per_page=${per_page}`);
  }
}

export const adminService = new AdminService();
export const agentService = new AgentService();
export const referralService = new ReferralService();
