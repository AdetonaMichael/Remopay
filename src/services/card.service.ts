/**
 * Card Service
 * Handles all virtual card operations through the Maplerad API
 * Base URL: /api/v1/payment/issuing
 */

import { apiClient } from './api-client';
import {
  VirtualCard,
  CardDetail,
  CreateCardRequest,
  CreateCardResponse,
  GetAllCardsResponse,
  GetCardResponse,
  CardListQuery,
  CardTransaction,
  GetCardTransactionsResponse,
  CardTransactionsQuery,
  FundCardRequest,
  FundCardResponse,
  WithdrawCardRequest,
  WithdrawCardResponse,
  GetDeclineChargesResponse,
  DeclineChargesQuery,
  CardCurrency,
  CardType,
  CardBrand,
  CardPaginationMeta,
  CardListResponse,
} from '@/types/card.types';
import { ApiResponse } from '@/types/api.types';

class CardService {
  /**
   * Get the fee schedule for card operations
   * GET /issuing/fees/schedule
   */
  async getFeeSchedule(): Promise<{
    success: boolean;
    data: {
      fee_schedule: Array<{
        fee_type: string;
        display_name: string;
        description: string;
        currency: string;
        fee_calculation_type: string;
        our_fee: { fixed_amount: number; percentage_rate: number; threshold: number | null };
        provider_fee: { calculation_type: string; fixed_amount: number | null; percentage_rate: number | null; threshold: number | null };
      }>;
      currency: string;
      note: string;
    };
  }> {
    try {
      const response = await apiClient.get('/payment/issuing/fees/schedule');
      return (response as any).original || response;
    } catch (error: any) {
      console.error('[CardService] Error fetching fee schedule:', error);
      throw error;
    }
  }

  /**
   * Create a new virtual card
   * Fee: $3.00 deducted from wallet
   */
  async createCard(payload: CreateCardRequest): Promise<CreateCardResponse> {
    try {
      this.validateCreateCardPayload(payload);

      const response = await apiClient.post<any>(
        '/payment/issuing',
        {
          currency: payload.currency,
          type: payload.type,
          auto_approve: payload.auto_approve,
          brand: payload.brand || CardBrand.VISA,
          amount: payload.amount || 0,
        }
      );

      const actualResponse = (response as any).original || response;
      return actualResponse as CreateCardResponse;
    } catch (error: any) {
      console.error('[CardService] Error creating card:', error);
      throw error;
    }
  }

  /**
   * Fetch all virtual cards for authenticated user
   */
  async getAllCards(query?: CardListQuery): Promise<GetAllCardsResponse> {
    try {
      if (query) {
        this.validateCardListQuery(query);
      }

      const params = this.buildQueryString(query);

      const response = await apiClient.get<any>('/payment/issuing', { params });

      let actualResponse = (response as any).original || response;
      actualResponse = this.normalizeListResponse(actualResponse);

      return actualResponse;
    } catch (error: any) {
      console.error('[CardService] Error fetching cards:', error);
      throw error;
    }
  }

  /**
   * Get single card details
   * GET /payment/issuing/{id}
   */
  async getCard(cardId: string): Promise<GetCardResponse> {
    try {
      if (!cardId) {
        throw new Error('Card ID is required');
      }

      const response = await apiClient.get<any>(`/payment/issuing/${cardId}`);
      const actualResponse = (response as any).original || response;

      return actualResponse as GetCardResponse;
    } catch (error: any) {
      console.error('[CardService] Error fetching card:', error);
      throw error;
    }
  }

  /**
   * Get card transactions
   * GET /payment/issuing/{id}/transactions
   */
  async getCardTransactions(
    cardId: string,
    query?: CardTransactionsQuery
  ): Promise<GetCardTransactionsResponse> {
    try {
      if (!cardId) {
        throw new Error('Card ID is required');
      }

      const params: Record<string, any> = {};
      if (query) {
        if (query.start_date) params.start_date = query.start_date;
        if (query.end_date) params.end_date = query.end_date;
        if (query.page) params.page = query.page;
        if (query.page_size) params.page_size = query.page_size;
      }

      const response = await apiClient.get<any>(
        `/payment/issuing/${cardId}/transactions`,
        { params }
      );

      const actualResponse = (response as any).original || response;
      return actualResponse as GetCardTransactionsResponse;
    } catch (error: any) {
      console.error('[CardService] Error fetching card transactions:', error);
      throw error;
    }
  }

  /**
   * Fund (credit) a card
   * POST /payment/issuing/{id}/fund
   * Amount must be in cents (minimum 100 = $1.00)
   */
  async fundCard(cardId: string, amountInCents: number): Promise<FundCardResponse> {
    try {
      if (!cardId) throw new Error('Card ID is required');
      if (!amountInCents || amountInCents < 100) {
        throw new Error('Minimum amount is 100 cents ($1.00)');
      }
      if (!Number.isInteger(amountInCents)) {
        throw new Error('Amount must be an integer (cents)');
      }

      const payload: FundCardRequest = { amount: amountInCents };

      const response = await apiClient.post<any>(
        `/payment/issuing/${cardId}/fund`,
        payload
      );

      const actualResponse = (response as any).original || response;
      return actualResponse as FundCardResponse;
    } catch (error: any) {
      console.error('[CardService] Error funding card:', error);
      throw error;
    }
  }

  /**
   * Withdraw (debit) from a card
   * POST /payment/issuing/{id}/withdraw
   * Amount must be in cents (minimum 100 = $1.00)
   */
  async withdrawFromCard(cardId: string, amountInCents: number): Promise<WithdrawCardResponse> {
    try {
      if (!cardId) throw new Error('Card ID is required');
      if (!amountInCents || amountInCents < 100) {
        throw new Error('Minimum amount is 100 cents ($1.00)');
      }
      if (!Number.isInteger(amountInCents)) {
        throw new Error('Amount must be an integer (cents)');
      }

      const payload: WithdrawCardRequest = { amount: amountInCents };

      const response = await apiClient.post<any>(
        `/payment/issuing/${cardId}/withdraw`,
        payload
      );

      const actualResponse = (response as any).original || response;
      return actualResponse as WithdrawCardResponse;
    } catch (error: any) {
      console.error('[CardService] Error withdrawing from card:', error);
      throw error;
    }
  }

  /**
   * Get decline charges
   * GET /payment/issuing/charges
   */
  async getDeclineCharges(query?: DeclineChargesQuery): Promise<GetDeclineChargesResponse> {
    try {
      const params: Record<string, any> = {};
      if (query) {
        if (query.channel) params.channel = query.channel;
        if (query.transaction_id) params.transaction_id = query.transaction_id;
        if (query.start_date) params.start_date = query.start_date;
        if (query.end_date) params.end_date = query.end_date;
        if (query.page) params.page = query.page;
        if (query.page_size) params.page_size = query.page_size;
        if (query.search) params.search = query.search;
      }

      const response = await apiClient.get<any>('/payment/issuing/charges', { params });
      const actualResponse = (response as any).original || response;
      return actualResponse as GetDeclineChargesResponse;
    } catch (error: any) {
      console.error('[CardService] Error fetching decline charges:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Fetch cards with pagination
   */
  async getCardsPaginated(page: number = 1, pageSize: number = 10): Promise<GetAllCardsResponse> {
    return this.getAllCards({
      page: Math.max(1, page),
      page_size: Math.min(Math.max(1, pageSize), 100),
    });
  }

  /**
   * Fetch cards filtered by brand
   */
  async getCardsByBrand(
    brand: CardBrand,
    page: number = 1,
    pageSize: number = 10
  ): Promise<GetAllCardsResponse> {
    return this.getAllCards({ page, page_size: pageSize, brand });
  }

  /**
   * Fetch cards filtered by status
   */
  async getCardsByStatus(
    status: 'ACTIVE' | 'DISABLED',
    page: number = 1,
    pageSize: number = 10
  ): Promise<GetAllCardsResponse> {
    return this.getAllCards({ page, page_size: pageSize, status: status as any });
  }

  // ═══════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════

  private validateCreateCardPayload(payload: CreateCardRequest): void {
    if (!payload.currency || payload.currency !== CardCurrency.USD) {
      throw new Error('Currency must be exactly "USD"');
    }
    if (!payload.type || payload.type !== CardType.VIRTUAL) {
      throw new Error('Card type must be exactly "VIRTUAL"');
    }
    if (typeof payload.auto_approve !== 'boolean') {
      throw new Error('Auto approve must be a boolean value (true/false)');
    }
    if (payload.brand && !Object.values(CardBrand).includes(payload.brand)) {
      throw new Error('Brand must be either VISA or MASTERCARD');
    }
    if (payload.amount !== undefined && (typeof payload.amount !== 'number' || payload.amount < 0)) {
      throw new Error('Amount must be a non-negative number');
    }
  }

  private validateCardListQuery(query: CardListQuery): void {
    if (query.page !== undefined && (typeof query.page !== 'number' || query.page < 1)) {
      throw new Error('Page must be at least 1');
    }
    if (
      query.page_size !== undefined &&
      (typeof query.page_size !== 'number' || query.page_size < 1 || query.page_size > 100)
    ) {
      throw new Error('Page size must be between 1 and 100');
    }
    if (query.brand && !Object.values(CardBrand).includes(query.brand)) {
      throw new Error('Brand must be either VISA or MASTERCARD');
    }
    if (query.status && !['ACTIVE', 'DISABLED'].includes(query.status as any)) {
      throw new Error('Status must be either ACTIVE or DISABLED');
    }
    if (query.created_at && !/^\d{4}-\d{2}-\d{2}$/.test(query.created_at)) {
      throw new Error('Created at must be in format YYYY-MM-DD');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════

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

  private transformCard(card: any): VirtualCard {
    return {
      id: card.id,
      card_number: card.masked_pan || card.card_number || '',
      masked_pan: card.masked_pan,
      cvv: card.cvv || '***',
      expiry: card.expiry || 'N/A',
      cardholder_name: card.name || card.cardholder_name || '',
      name: card.name,
      status: card.status || 'ACTIVE',
      brand: card.issuer || card.brand || CardBrand.VISA,
      issuer: card.issuer,
      currency: card.currency || CardCurrency.USD,
      balance: card.balance,
      type: card.type,
      auto_approve: card.auto_approve,
      is_contactless: card.is_contactless,
      created_at: card.created_at,
    };
  }

  private normalizeListResponse(response: any): GetAllCardsResponse {
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

    if (!response.data.cards) {
      response.data.cards = [];
    }

    if (Array.isArray(response.data.cards)) {
      response.data.cards = response.data.cards.map((card: any) => this.transformCard(card));
    }

    if (!response.data.meta) {
      response.data.meta = {
        current_page: 1,
        total_pages: 0,
        total_records: 0,
        page_size: 10,
      };
    }

    // Normalize meta from API format ({page, page_size, total}) to frontend format
    const meta = response.data.meta as CardPaginationMeta;
    if (meta.page !== undefined || meta.total !== undefined) {
      response.data.meta = {
        current_page: meta.page || meta.current_page || 1,
        total_pages: meta.total ? Math.ceil(meta.total / (meta.page_size || 10)) : meta.total_pages || 0,
        total_records: meta.total || meta.total_records || 0,
        page_size: meta.page_size || 10,
      };
    }

    return response;
  }
}

export const cardService = new CardService();
