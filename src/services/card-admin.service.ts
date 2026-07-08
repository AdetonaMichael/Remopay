/**
 * Card Admin Service
 * Handles all admin card operations through the API
 * Base URL: /api/v1/admin/cards
 */

import { apiClient } from './api-client';
import {
  CardAdminView,
  CardAuditLog,
  SetCardDetailsRequest,
  SetCardDetailsResponse,
  GetAllCardsAdminResponse,
  GetCardAuditLogsResponse,
  AdminCardActionResponse,
  CardAdminFilters,
  AdminCardStatus,
} from '@/types/card-admin.types';

class CardAdminService {
  /**
   * Fetch all cards with filtering and pagination
   * GET /admin/cards
   */
  async getCards(
    filters?: CardAdminFilters,
    page: number = 1,
    perPage: number = 15
  ): Promise<GetAllCardsAdminResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(Math.min(perPage, 100)));

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.user_id) {
        params.append('user_id', String(filters.user_id));
      }
      if (filters?.has_details !== undefined) {
        params.append('has_details', String(filters.has_details));
      }

      const response = await apiClient.get<GetAllCardsAdminResponse>(
        `/admin/cards?${params.toString()}`
      );

      const actualResponse = (response as any).original || response;
      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error fetching cards:', error);
      throw error;
    }
  }

  /**
   * Get card audit logs
   * GET /admin/cards/{cardId}/audit-logs
   */
  async getCardAuditLogs(
    cardId: number | string
  ): Promise<GetCardAuditLogsResponse> {
    try {
      const response = await apiClient.get<GetCardAuditLogsResponse>(
        `/admin/cards/${cardId}/audit-logs`
      );

      const actualResponse = (response as any).original || response;
      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Set or update card details
   * POST /admin/cards/{cardId}/set-details
   */
  async setCardDetails(
    cardId: number | string,
    payload: SetCardDetailsRequest
  ): Promise<SetCardDetailsResponse> {
    try {
      if (!cardId) {
        throw new Error('Card ID is required');
      }

      // Validate formats
      if (payload.card_number && !/^\d{13,19}$/.test(payload.card_number)) {
        throw new Error('Card number must be 13-19 digits');
      }
      if (payload.expiry && !/^\d{2}\/\d{2}$/.test(payload.expiry)) {
        throw new Error('Expiry must be in MM/YY format');
      }
      if (payload.cvv && !/^\d{3,4}$/.test(payload.cvv)) {
        throw new Error('CVV must be 3-4 digits');
      }

      const response = await apiClient.post<SetCardDetailsResponse>(
        `/admin/cards/${cardId}/set-details`,
        {
          card_number: payload.card_number,
          expiry: payload.expiry,
          cvv: payload.cvv,
          notes: payload.notes || '',
        }
      );

      const actualResponse = (response as any).original || response;
      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error setting card details:', error);
      throw error;
    }
  }

  /**
   * Freeze a card
   * PATCH /admin/cards/{cardId}/freeze
   * No request body required
   */
  async freezeCard(cardId: number | string): Promise<AdminCardActionResponse> {
    try {
      if (!cardId) throw new Error('Card ID is required');

      const response = await apiClient.patch<AdminCardActionResponse>(
        `/admin/cards/${cardId}/freeze`
      );

      const actualResponse = (response as any).original || response;
      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error freezing card:', error);
      throw error;
    }
  }

  /**
   * Unfreeze a card
   * PATCH /admin/cards/{cardId}/unfreeze
   * No request body required
   */
  async unfreezeCard(cardId: number | string): Promise<AdminCardActionResponse> {
    try {
      if (!cardId) throw new Error('Card ID is required');

      const response = await apiClient.patch<AdminCardActionResponse>(
        `/admin/cards/${cardId}/unfreeze`
      );

      const actualResponse = (response as any).original || response;
      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error unfreezing card:', error);
      throw error;
    }
  }

  /**
   * Terminate a card (irreversible)
   * PUT /admin/cards/{cardId}/terminate
   * No request body required
   */
  async terminateCard(cardId: number | string): Promise<AdminCardActionResponse> {
    try {
      if (!cardId) throw new Error('Card ID is required');

      const response = await apiClient.put<AdminCardActionResponse>(
        `/admin/cards/${cardId}/terminate`
      );

      const actualResponse = (response as any).original || response;
      return actualResponse;
    } catch (error: any) {
      console.error('[CardAdminService] Error terminating card:', error);
      throw error;
    }
  }
}

export const cardAdminService = new CardAdminService();
