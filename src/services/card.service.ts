/**
 * Card Service
 * Handles all virtual card operations through the Maplerad API
 * Endpoints: POST /payment/issuing, GET /payment/issuing
 */

import { apiClient } from './api-client';
import {
  VirtualCard,
  CreateCardRequest,
  CreateCardResponse,
  GetAllCardsResponse,
  CardListQuery,
  CardCurrency,
  CardType,
  CardBrand,
} from '@/types/card.types';
import { ApiResponse } from '@/types/api.types';

class CardService {
  /**
   * Create a new virtual card
   *
   * @param payload - Card creation request data
   * @returns Promise with created card data
   *
   * @example
   * const card = await cardService.createCard({
   *   currency: 'USD',
   *   type: 'VIRTUAL',
   *   auto_approve: true,
   *   brand: 'VISA',
   * });
   */
  async createCard(payload: CreateCardRequest): Promise<CreateCardResponse> {
    try {
      // Validate payload before sending
      this.validateCreateCardPayload(payload);

      const response = await apiClient.post<any>(
        '/payment/issuing',
        {
          currency: payload.currency,
          type: payload.type,
          auto_approve: payload.auto_approve,
          brand: payload.brand || CardBrand.VISA, // Default to VISA if not provided
          amount: payload.amount || 0, // Default to 0 if not provided
        }
      );

      // Handle response wrapper - extract from 'original' if present
      const actualResponse = response as CreateCardResponse;
      
      return actualResponse;
    } catch (error: any) {
      console.error('[CardService] Error creating card:', error);
      throw error;
    }
  }

  /**
   * Fetch all virtual cards for authenticated user
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Promise with cards list and pagination metadata
   *
   * @example
   * const response = await cardService.getAllCards({
   *   page: 1,
   *   page_size: 10,
   *   brand: 'VISA',
   *   status: 'ACTIVE'
   * });
   */
  async getAllCards(query?: CardListQuery): Promise<GetAllCardsResponse> {
    try {
      // Validate query parameters if provided
      if (query) {
        this.validateCardListQuery(query);
      }

      // Build query string
      const params = this.buildQueryString(query);

      console.debug('[CardService] Fetching cards with params:', params);

      const response = await apiClient.get<any>(
        '/payment/issuing',
        {
          params,
        }
      );

      // Handle response wrapper - extract from 'original' if present
      let actualResponse = response as GetAllCardsResponse;
      
      // Normalize response to ensure proper structure
      actualResponse = this.normalizeResponse(actualResponse);
      
      // Enhanced logging for debugging
      console.debug('[CardService] getAllCards response:', {
        success: actualResponse?.success,
        message: actualResponse?.message,
        cardsCount: actualResponse?.data?.cards?.length,
        pagination: actualResponse?.data?.meta,
        hasCardsData: !!actualResponse?.data?.cards,
        hasMetaData: !!actualResponse?.data?.meta,
      });
      
      return actualResponse;
    } catch (error: any) {
      console.error('[CardService] Error fetching cards:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        requestConfig: {
          url: error?.config?.url,
          method: error?.config?.method,
          params: error?.config?.params,
        },
      });
      throw error;
    }
  }

  /**
   * Fetch cards with pagination
   * Convenience method for common pagination use case
   *
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page (1-100)
   * @returns Promise with cards list and pagination metadata
   */
  async getCardsPaginated(page: number = 1, pageSize: number = 10): Promise<GetAllCardsResponse> {
    return this.getAllCards({
      page: Math.max(1, page), // Ensure page is at least 1
      page_size: Math.min(Math.max(1, pageSize), 100), // Ensure pageSize is 1-100
    });
  }

  /**
   * Fetch cards filtered by brand
   * Convenience method for brand filtering
   *
   * @param brand - Card brand to filter by
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise with filtered cards list
   */
  async getCardsByBrand(
    brand: CardBrand,
    page: number = 1,
    pageSize: number = 10
  ): Promise<GetAllCardsResponse> {
    return this.getAllCards({
      page,
      page_size: pageSize,
      brand,
    });
  }

  /**
   * Fetch cards filtered by status
   * Convenience method for status filtering
   *
   * @param status - Card status to filter by ('ACTIVE' or 'DISABLED')
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise with filtered cards list
   */
  async getCardsByStatus(
    status: 'ACTIVE' | 'DISABLED',
    page: number = 1,
    pageSize: number = 10
  ): Promise<GetAllCardsResponse> {
    return this.getAllCards({
      page,
      page_size: pageSize,
      status: status as any,
    });
  }

  /**
   * Validate create card request payload
   * Ensures all required fields are present and valid
   */
  private validateCreateCardPayload(payload: CreateCardRequest): void {
    // Validate currency
    if (!payload.currency || payload.currency !== CardCurrency.USD) {
      throw new Error('Currency must be exactly "USD"');
    }

    // Validate type
    if (!payload.type || payload.type !== CardType.VIRTUAL) {
      throw new Error('Card type must be exactly "VIRTUAL"');
    }

    // Validate auto_approve
    if (typeof payload.auto_approve !== 'boolean') {
      throw new Error('Auto approve must be a boolean value (true/false)');
    }

    // Validate brand if provided
    if (payload.brand && !Object.values(CardBrand).includes(payload.brand)) {
      throw new Error('Brand must be either VISA or MASTERCARD');
    }

    // Validate amount if provided
    if (payload.amount !== undefined && (typeof payload.amount !== 'number' || payload.amount < 0)) {
      throw new Error('Amount must be a non-negative number');
    }
  }

  /**
   * Validate card list query parameters
   */
  private validateCardListQuery(query: CardListQuery): void {
    // Validate page
    if (query.page !== undefined && (typeof query.page !== 'number' || query.page < 1)) {
      throw new Error('Page must be at least 1');
    }

    // Validate page_size
    if (
      query.page_size !== undefined &&
      (typeof query.page_size !== 'number' || query.page_size < 1 || query.page_size > 100)
    ) {
      throw new Error('Page size must be between 1 and 100');
    }

    // Validate brand
    if (query.brand && !Object.values(CardBrand).includes(query.brand)) {
      throw new Error('Brand must be either VISA or MASTERCARD');
    }

    // Validate status
    if (query.status && !['ACTIVE', 'DISABLED'].includes(query.status as any)) {
      throw new Error('Status must be either ACTIVE or DISABLED');
    }

    // Validate created_at format (YYYY-MM-DD)
    if (query.created_at && !/^\d{4}-\d{2}-\d{2}$/.test(query.created_at)) {
      throw new Error('Created at must be in format YYYY-MM-DD (e.g., 2024-05-27)');
    }
  }

  /**
   * Build query string from CardListQuery object
   * Filters out undefined values
   */
  private buildQueryString(query?: CardListQuery): Record<string, any> {
    if (!query) return {};

    return {
      ...(query.page && { page: query.page }),
      ...(query.page_size && { page_size: query.page_size }),
      ...(query.brand && { brand: query.brand }),
      ...(query.status && { status: query.status }),
      ...(query.created_at && { created_at: query.created_at }),
    };
  }

  /**
   * Ensure response has proper structure with default values
   * Handles cases where API might return partial or malformed responses
   */
  private normalizeResponse(response: any): GetAllCardsResponse {
    if (!response) {
      return {
        success: false,
        message: 'Empty response from server',
        data: {
          cards: [],
          meta: {
            current_page: 1,
            total_pages: 0,
            total_records: 0,
            page_size: 10,
          },
        },
      };
    }

    // Ensure data structure exists
    if (!response.data) {
      response.data = {
        cards: [],
        meta: {
          current_page: 1,
          total_pages: 0,
          total_records: 0,
          page_size: 10,
        },
      };
    }

    // Ensure cards array exists
    if (!response.data.cards) {
      response.data.cards = [];
    }

    // Ensure meta exists
    if (!response.data.meta) {
      response.data.meta = {
        current_page: 1,
        total_pages: 0,
        total_records: 0,
        page_size: 10,
      };
    }

    return response;
  }
}

export const cardService = new CardService();
