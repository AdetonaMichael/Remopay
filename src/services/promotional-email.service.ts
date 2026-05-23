/**
 * Promotional Email Service
 * Handles all API calls for promotional email campaigns
 */

import { apiClient } from './api-client';
import {
  EmailCampaignTemplate,
  PromotionalEmailCampaign,
  CreateCampaignRequest,
  CampaignListResponse,
  CampaignAnalytics,
  TemplateResponse,
  SendCampaignResponse,
  PreviewResponse,
} from '@/types/promotional-email.types';

const BASE_URL = '/admin/promotional-emails';

export const promotionalEmailService = {
  /**
   * Get all email templates
   */
  async getTemplates(): Promise<TemplateResponse> {
    try {
      const response = await apiClient.get<TemplateResponse>(`${BASE_URL}/templates`);
      return response.data!;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Get specific template details
   */
  async getTemplate(templateId: number): Promise<EmailCampaignTemplate> {
    try {
      const response = await apiClient.get<{ data: EmailCampaignTemplate }>(
        `${BASE_URL}/templates/${templateId}`
      );
      return response.data!.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  /**
   * Create new promotional campaign
   */
  async createCampaign(data: CreateCampaignRequest): Promise<PromotionalEmailCampaign> {
    try {
      const response = await apiClient.post<any>(
        `${BASE_URL}/campaigns`,
        data
      );
      return response.data!.data.campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  /**
   * Get all campaigns with pagination and filtering
   */
  async getCampaigns(
    page: number = 1,
    perPage: number = 15,
    status?: string
  ): Promise<CampaignListResponse> {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(status && { status }),
      };

      const response = await apiClient.get<CampaignListResponse>(`${BASE_URL}/campaigns`, {
        params,
      });
      return response.data!;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  /**
   * Get specific campaign details
   */
  async getCampaign(campaignId: number): Promise<PromotionalEmailCampaign> {
    try {
      const response = await apiClient.get<{ data: PromotionalEmailCampaign }>(
        `${BASE_URL}/campaigns/${campaignId}`
      );
      return response.data!.data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  /**
   * Update draft campaign
   */
  async updateCampaign(
    campaignId: number,
    data: Partial<CreateCampaignRequest>
  ): Promise<PromotionalEmailCampaign> {
    try {
      const response = await apiClient.put<{ data: PromotionalEmailCampaign }>(
        `${BASE_URL}/campaigns/${campaignId}`,
        data
      );
      return response.data!.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  /**
   * Delete draft campaign
   */
  async deleteCampaign(campaignId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `${BASE_URL}/campaigns/${campaignId}`
      );
      return response.data!;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  /**
   * Send campaign immediately
   */
  async sendCampaign(campaignId: number): Promise<SendCampaignResponse> {
    try {
      const response = await apiClient.post<SendCampaignResponse>(
        `${BASE_URL}/campaigns/${campaignId}/send`
      );
      return response.data!;
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  },

  /**
   * Schedule campaign for later
   */
  async scheduleCampaign(
    campaignId: number,
    scheduledAt: string
  ): Promise<SendCampaignResponse> {
    try {
      const response = await apiClient.post<SendCampaignResponse>(
        `${BASE_URL}/campaigns/${campaignId}/schedule`,
        { scheduled_at: scheduledAt }
      );
      return response.data!;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      throw error;
    }
  },

  /**
   * Preview email before sending
   */
  async previewEmail(templateId: number, templateData: Record<string, any>): Promise<string> {
    try {
      const response = await apiClient.post<PreviewResponse>(`${BASE_URL}/preview`, {
        template_id: templateId,
        template_data: templateData,
      });
      return response.data!.html;
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  },

  /**
   * Get campaign analytics and delivery logs
   */
  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics> {
    try {
      const response = await apiClient.get<CampaignAnalytics>(
        `${BASE_URL}/campaigns/${campaignId}/analytics`
      );
      return response.data!;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  },

  /**
   * Calculate target user count for criteria
   * (Can be called periodically to show user count preview)
   */
  async calculateTargetUsers(criteria: Record<string, any>): Promise<{ count: number; previewUsers: any[] }> {
    try {
      const response = await apiClient.post<any>(
        `${BASE_URL}/calculate-targets`,
        criteria
      );
      // Extract from nested response structure
      const result = response.data?.data || response.data;
      return {
        count: result.total_targets || 0,
        previewUsers: result.preview_users || [],
      };
    } catch (error) {
      console.error('Error calculating target users:', error);
      // Return 0 if endpoint doesn't exist yet
      return { count: 0, previewUsers: [] };
    }
  },
};

export default promotionalEmailService;
