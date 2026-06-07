/**
 * USD Account Service
 * Handles all API calls for USD virtual account creation and management
 */

import { apiClient } from './api-client';
import {
  CreateUSDAccountRequest,
  CreateUSDAccountResponse,
  USDAccountStatusResponse,
} from '@/types/usd-account.types';

class USDAccountService {
  /**
   * Create a USD virtual account for the authenticated user
   * @param request - USD account creation request with customer ID and metadata
   * @returns Promise with account creation response
   */
  async createUSDAccount(
    request: CreateUSDAccountRequest
  ): Promise<CreateUSDAccountResponse> {
    try {
      const response = await apiClient.post<CreateUSDAccountResponse>(
        '/payment/collections/virtual-account/usd',
        request
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create USD account');
      }

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create USD account. Please try again.';

      throw new Error(message);
    }
  }

  /**
   * Check the status of a USD account creation request
   * @param reference - Reference ID from account creation response
   * @returns Promise with account status response
   */
  async getUSDAccountStatus(reference: string): Promise<USDAccountStatusResponse> {
    try {
      const response = await apiClient.get<USDAccountStatusResponse>(
        `/payment/collections/virtual-account/status/${reference}`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch account status');
      }

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch account status. Please try again.';

      throw new Error(message);
    }
  }

  /**
   * Convert file to base64 string
   * @param file - File to convert
   * @returns Promise with base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  /**
   * Compress image before converting to base64
   * Reduces file size to prevent payload issues
   */
  async compressAndEncodeImage(file: File, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions to prevent large payloads
          const maxWidth = 1024;
          const maxHeight = 768;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  }
}

export const usdAccountService = new USDAccountService();
