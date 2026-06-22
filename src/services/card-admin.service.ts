/**
 * Card Admin Service
 * Handles all admin card operations through the API
 */

import { apiClient } from './api-client';
import {
  CardAdminView,
  CardAuditLog,
  SetCardDetailsRequest,
  SetCardDetailsResponse,
  GetAllCardsAdminResponse,
  GetCardAuditLogsResponse,
  CardAdminFilters,
} from '@/types/card-admin.types';

class CardAdminService {
  /**
   * Fetch all cards with filtering and pagination
   *
   * @param filters - Filter options (status, user_id, has_details, search)
   * @param page - Page number (1-indexed)
   * @param perPage - Items per page
   * @returns Promise with cards list and pagination
   */
  async getCards(
    filters?: CardAdminFilters,
    page: number = 1,
    perPage: number = 15
  ): Promise<GetAllCardsAdminResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(Math.min(perPage, 100))); // Max 100 per page

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.user_id) {
        params.append('user_id', String(filters.user_id));
      }
      if (filters?.has_details !== undefined) {
        params.append('has_details', String(filters.has_details));
      }

      console.debug('[CardAdminService] Fetching cards with params:', {
        page,
        perPage,
        filters,
      });

      const response = await apiClient.get<GetAllCardsAdminResponse>(
        `/admin/cards?${params.toString()}`
      );

      // Handle response wrapper if present
      const actualResponse = (response as any).original || response;

      console.debug('[CardAdminService] Cards fetched successfully:', {
        cardCount: actualResponse?.data?.cards?.length,
        pagination: actualResponse?.data?.pagination,
      });

      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error fetching cards:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  /**
   * Get card details and audit logs
   *
   * @param cardId - Card ID or Maplerad reference
   * @returns Promise with card details and audit logs
   */
  async getCardAuditLogs(
    cardId: number | string
  ): Promise<GetCardAuditLogsResponse> {
    try {
      console.debug('[CardAdminService] Fetching audit logs for card:', cardId);

      const response = await apiClient.get<GetCardAuditLogsResponse>(
        `/admin/cards/${cardId}/audit-logs`
      );

      // Handle response wrapper if present
      const actualResponse = (response as any).original || response;

      console.debug('[CardAdminService] Audit logs fetched:', {
        cardId,
        logCount: actualResponse?.data?.audit_logs?.length,
      });

      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error fetching audit logs:', {
        message: error?.message,
        status: error?.response?.status,
        cardId,
      });
      throw error;
    }
  }

  /**
   * Set or update card details
   *
   * @param cardId - Card ID
   * @param payload - Card details to set
   * @returns Promise with updated card info
   */
  async setCardDetails(
    cardId: number | string,
    payload: Partial<SetCardDetailsRequest>
  ): Promise<SetCardDetailsResponse> {
    try {
      // Validate payload
      if (!cardId) {
        throw new Error('Card ID is required');
      }

      if (!payload.card_number && !payload.expiry && !payload.cvv) {
        throw new Error('At least one card detail field is required');
      }

      // Validate format
      if (payload.card_number) {
        if (!/^\d{13,19}$/.test(payload.card_number)) {
          throw new Error('Card number must be 13-19 digits');
        }
      }

      if (payload.expiry) {
        if (!/^\d{2}\/\d{2}$/.test(payload.expiry)) {
          throw new Error('Expiry must be in MM/YY format');
        }
      }

      if (payload.cvv) {
        if (!/^\d{3,4}$/.test(payload.cvv)) {
          throw new Error('CVV must be 3-4 digits');
        }
      }

      console.debug('[CardAdminService] Setting card details:', {
        cardId,
        fieldsProvided: Object.keys(payload).filter((k) => k !== 'notes'),
      });

      const response = await apiClient.post<SetCardDetailsResponse>(
        `/admin/cards/${cardId}/set-details`,
        {
          card_id: cardId,
          card_number: payload.card_number,
          expiry: payload.expiry,
          cvv: payload.cvv,
          notes: payload.notes || '',
        }
      );

      // Handle response wrapper if present
      const actualResponse = (response as any).original || response;

      console.debug('[CardAdminService] Card details set successfully:', {
        cardId,
        success: actualResponse?.success,
      });

      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error setting card details:', {
        message: error?.message,
        status: error?.response?.status,
        errors: error?.response?.data?.errors,
        cardId,
      });
      throw error;
    }
  }
}

export const cardAdminService = new CardAdminService();
