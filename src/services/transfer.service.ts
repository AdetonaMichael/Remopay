/**
 * Transfer Service
 * Handles all transfer-related API calls: Remopay transfers, bank transfers, and recipient management
 */

import { apiClient } from './api-client';
import {
  Bank,
  BankListResponse,
  BankTransferRequest,
  BankTransferResponse,
  RemopayTransferRequest,
  RemopayTransferResponse,
  VerifyRecipientRequest,
  VerifyRecipientResponse,
  RecipientsListResponse,
  AccountResolutionResponse,
  Recipient,
  RecipientUser,
} from '@/types/transfer.types';

class TransferService {
  /**
   * Fetch list of supported banks
   * Public endpoint, no auth required
   */
  async getBanks(): Promise<Bank[] | null> {
    try {
      const response = await apiClient.get<BankListResponse>('/payment/banks');
      return response?.data?.data || null;
    } catch (error) {
      console.error('Error fetching banks:', error);
      return null;
    }
  }

  /**
   * Verify recipient exists (Remopay user)
   */
  async verifyRecipient(payload: VerifyRecipientRequest): Promise<RecipientUser | null> {
    try {
      const response = await apiClient.post<VerifyRecipientResponse>(
        '/wallet/transfer/verify/user',
        payload
      );
      return response?.data?.data || null;
    } catch (error) {
      console.error('Error verifying recipient:', error);
      throw error; // Re-throw to let component handle it
    }
  }

  /**
   * Get recent Remopay transfer recipients (quick selection)
   * limit: max 5 for quick list, can be higher for full list
   */
  async getRecentRemopayRecipients(limit: number = 5): Promise<Recipient[] | null> {
    try {
      const response = await apiClient.get<RecipientsListResponse>(
        '/wallet/transfer/recipients/remopay',
        {
          params: {
            limit,
            sort: 'recent',
          },
        }
      );
      return response?.data?.recipients || null;
    } catch (error) {
      console.error('Error fetching recent recipients:', error);
      return null;
    }
  }

  /**
   * Get all transfer recipients with pagination
   * bank_type: 'remopay', 'external_bank', or 'all'
   * sort: 'recent', 'alphabetical', or 'frequency'
   */
  async getAllRecipients(
    bankType: string = 'all',
    sort: string = 'recent',
    page: number = 1,
    limit: number = 20
  ): Promise<RecipientsListResponse | null> {
    try {
      const response = await apiClient.get<RecipientsListResponse>(
        '/wallet/transfer/recipients',
        {
          params: {
            bank_type: bankType,
            sort,
            page,
            limit,
          },
        }
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching recipients:', error);
      return null;
    }
  }

  /**
   * Initiate Remopay-to-Remopay transfer
   * IMPORTANT: Phone number must be normalized to 10 digits before calling
   */
  async initiateRemopayTransfer(
    payload: RemopayTransferRequest
  ): Promise<RemopayTransferResponse | null> {
    try {
      const response = await apiClient.post<RemopayTransferResponse>(
        '/wallet/transfer/identifier',
        payload
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error initiating Remopay transfer:', error);
      throw error; // Re-throw for component error handling
    }
  }

  /**
   * Resolve bank account details
   * Used to verify account number and fetch account holder name
   */
  async resolveBankAccount(bankCode: string, accountNumber: string): Promise<AccountResolutionResponse | null> {
    try {
      const response = await apiClient.post<AccountResolutionResponse>(
        '/payment/resolve-account',
        {
          bank_code: bankCode,
          account_number: accountNumber,
        }
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error resolving bank account:', error);
      throw error; // Re-throw for component error handling
    }
  }

  /**
   * Initiate bank transfer
   * Account must be verified before calling this
   */
  async initiateBankTransfer(payload: BankTransferRequest): Promise<BankTransferResponse | null> {
    try {
      const response = await apiClient.post<BankTransferResponse>(
        '/payment/initiate-transfer',
        payload
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error initiating bank transfer:', error);
      throw error; // Re-throw for component error handling
    }
  }
}

export const transferService = new TransferService();
