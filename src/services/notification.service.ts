/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { apiClient } from './api-client';
import {
  NotificationFilter,
  NotificationListResponse,
  NotificationResponse,
  PreferenceResponse,
  NotificationStatsResponse,
  NotificationActionResponse,
  UpdateNotificationPreferencesRequest,
  PushTokenRequest,
  NotificationPreference,
} from '@/types/notification.types';

const BASE_URL = '/notifications';

class NotificationService {
  /**
   * Get all notifications with optional filters
   */
  async getNotifications(filters?: NotificationFilter): Promise<NotificationListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.per_page) params.append('per_page', String(filters.per_page));
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.unread_only !== undefined) {
        params.append('unread_only', filters.unread_only ? '1' : '0');
      }
    }

    const query = params.toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;

    return apiClient.get(url) as unknown as Promise<NotificationListResponse>;
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(id: number): Promise<NotificationResponse> {
    return apiClient.get(`${BASE_URL}/${id}`) as unknown as Promise<NotificationResponse>;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<NotificationResponse> {
    return apiClient.put(`${BASE_URL}/${id}/read`, {}) as unknown as Promise<NotificationResponse>;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    return apiClient.put(`${BASE_URL}/mark-all-read`, {}) as unknown as Promise<NotificationActionResponse>;
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(id: number): Promise<NotificationActionResponse> {
    return apiClient.delete(`${BASE_URL}/${id}`) as unknown as Promise<NotificationActionResponse>;
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(ids: number[]): Promise<NotificationActionResponse> {
    return apiClient.post(`${BASE_URL}/delete-multiple`, { ids }) as unknown as Promise<NotificationActionResponse>;
  }

  /**
   * Delete all notifications
   */
  async deleteAll(): Promise<NotificationActionResponse> {
    return apiClient.delete(`${BASE_URL}/delete-all`) as unknown as Promise<NotificationActionResponse>;
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStatsResponse> {
    return apiClient.get(`${BASE_URL}/stats`) as unknown as Promise<NotificationStatsResponse>;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<PreferenceResponse> {
    return apiClient.get(`${BASE_URL}/preferences`) as unknown as Promise<PreferenceResponse>;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<PreferenceResponse> {
    return apiClient.put(`${BASE_URL}/preferences`, preferences) as unknown as Promise<PreferenceResponse>;
  }

  /**
   * Register push notification token
   */
  async registerPushToken(token: string, deviceInfo?: any): Promise<NotificationActionResponse> {
    const payload: PushTokenRequest = {
      expo_push_token: token,
      device_info: deviceInfo,
    };
    return apiClient.post(`${BASE_URL}/register-token`, payload) as unknown as Promise<NotificationActionResponse>;
  }

  /**
   * Unregister push notification token
   */
  async unregisterPushToken(token: string): Promise<NotificationActionResponse> {
    return apiClient.post(`${BASE_URL}/unregister-token`, {
      expo_push_token: token,
    }) as unknown as Promise<NotificationActionResponse>;
  }
}

export const notificationService = new NotificationService();
