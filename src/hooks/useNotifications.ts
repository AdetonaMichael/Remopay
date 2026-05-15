/**
 * useNotifications Hook
 * Manages notification state and operations
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '@/services/notification.service';
import { PaginationMeta } from '@/types/api.types';
import {
  Notification,
  NotificationFilter,
  NotificationPreference,
  UpdateNotificationPreferencesRequest,
  NotificationStatsResponse,
} from '@/types/notification.types';

interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  stats: any;
  preferences: NotificationPreference | null;
  preferencesLoading: boolean;

  // Notification operations
  fetchNotifications: (filters?: NotificationFilter) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteMultiple: (ids: number[]) => Promise<void>;
  deleteAll: () => Promise<void>;

  // Stats & Preferences
  fetchStats: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: UpdateNotificationPreferencesRequest) => Promise<void>;

  // Push tokens
  registerPushToken: (token: string, deviceInfo?: any) => Promise<void>;
  unregisterPushToken: (token: string) => Promise<void>;

  // Helpers
  getUnreadCount: () => number;
  hasUnread: () => boolean;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  /**
   * Fetch notifications with optional filters
   */
  const fetchNotifications = useCallback(async (filters?: NotificationFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await notificationService.getNotifications(filters);
      if (response.success) {
        setNotifications(response.data);
        if (response.pagination) {
          setPagination(response.pagination as PaginationMeta);
        }
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark single notification as read
   */
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Delete single notification
   */
  const deleteNotification = useCallback(async (id: number) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Delete multiple notifications
   */
  const deleteMultiple = useCallback(async (ids: number[]) => {
    try {
      const response = await notificationService.deleteMultiple(ids);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Delete all notifications
   */
  const deleteAll = useCallback(async () => {
    try {
      const response = await notificationService.deleteAll();
      if (response.success) {
        setNotifications([]);
        setPagination(null);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Fetch notification statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await notificationService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Fetch notification preferences
   */
  const fetchPreferences = useCallback(async () => {
    setPreferencesLoading(true);
    try {
      const response = await notificationService.getPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(
    async (prefs: UpdateNotificationPreferencesRequest) => {
      try {
        const response = await notificationService.updatePreferences(prefs);
        if (response.success) {
          setPreferences(response.data);
        }
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message;
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Register push notification token
   */
  const registerPushToken = useCallback(async (token: string, deviceInfo?: any) => {
    try {
      await notificationService.registerPushToken(token, deviceInfo);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Unregister push notification token
   */
  const unregisterPushToken = useCallback(async (token: string) => {
    try {
      await notificationService.unregisterPushToken(token);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      setError(message);
    }
  }, []);

  /**
   * Get unread notification count
   */
  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.read_at).length;
  }, [notifications]);

  /**
   * Check if there are unread notifications
   */
  const hasUnread = useCallback(() => {
    return getUnreadCount() > 0;
  }, [getUnreadCount]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notifications,
    loading,
    error,
    pagination,
    stats,
    preferences,
    preferencesLoading,

    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    deleteAll,

    fetchStats,
    fetchPreferences,
    updatePreferences,

    registerPushToken,
    unregisterPushToken,

    getUnreadCount,
    hasUnread,
    clearError,
  };
};
