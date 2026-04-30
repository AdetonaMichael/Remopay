import { apiClient } from './api-client';

export interface Report {
  id: number;
  name: string;
  type: string;
  frequency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduled_time?: string;
  last_generated_at?: string;
  next_scheduled_at?: string;
  is_active: boolean;
  metrics?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ReportType {
  value: string;
  label: string;
  description: string;
  default_frequency: string;
}

export interface ReportConfig {
  name: string;
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  scheduled_time?: string;
  config?: Record<string, any>;
  is_active: boolean;
}

export interface ReportStatistics {
  total_reports: number;
  active_reports: number;
  scheduled_reports: number;
  by_type: Record<string, number>;
  by_frequency: Record<string, number>;
}

export interface ExportResponse {
  id: number;
  format: string;
  file_path: string;
  file_size: number;
  download_url: string;
  expires_at: string;
}

class ReportService {
  private baseUrl = '/api/v1/admin/reports';

  async getReports(params: Record<string, any> = {}) {
    try {
      const response = await apiClient.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReportTypes() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/types`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReport(id: number) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createReport(data: ReportConfig) {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateReport(id: number, data: Partial<ReportConfig>) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteReport(id: number) {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateReport(id: number, date?: string) {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.post(`${this.baseUrl}/${id}/generate`, {}, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportReport(id: number, format: 'json' | 'csv' | 'pdf') {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/export`, { format });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStatistics() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDueReports() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/due`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleActiveStatus(ids: number[], isActive: boolean) {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/toggle-active`, {
        ids,
        is_active: isActive,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    const message = error?.response?.data?.message || 'An error occurred';
    return new Error(message);
  }
}

export const reportService = new ReportService();
