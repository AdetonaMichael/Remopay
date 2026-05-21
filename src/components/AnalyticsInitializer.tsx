'use client';

/**
 * Analytics Initializer Component
 * Initializes Google Analytics and tracks user sessions
 * Should be placed in root Providers or layout
 */

import { useEffect } from 'react';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuthStore } from '@/store/auth.store';

export const AnalyticsInitializer = () => {
  const { user, activeRole } = useAuthStore();

  useEffect(() => {
    // Initialize GA on mount
    if (typeof window !== 'undefined') {
      // Track initial page view
      const pageTitle = document.title || 'Remopay';
      (window as any).gtag?.('event', 'page_view', {
        'page_title': pageTitle,
        'page_path': window.location.pathname,
        'page_location': window.location.href,
      });

      // Enable GA debug mode in development
      if (process.env.NEXT_PUBLIC_VERBOSE_API_LOGGING === 'true') {
        (window as any).gtag?.('config', 'G-L0LS146KZG', {
          'debug_mode': true,
        });
      }
    }
  }, []);

  // Track user identification when authenticated
  useEffect(() => {
    if (user && user.id) {
      (window as any).gtag?.('config', 'G-L0LS146KZG', {
        'user_id': user.id,
      });

      // Set user properties for segmentation
      (window as any).gtag?.('set', {
        'user_properties': {
          'email': user.email,
          'role': activeRole,
          'email_verified': user.isEmailVerified,
          'phone_verified': user.isPhoneVerified,
          'created_at': user.created_at,
        }
      });

      if (process.env.NEXT_PUBLIC_VERBOSE_API_LOGGING === 'true') {
        console.debug('[Analytics] User identified:', { 
          userId: user.id, 
          email: user.email,
          role: activeRole,
        });
      }
    }
  }, [user, activeRole]);

  // Cleanup GA on logout
  useEffect(() => {
    return () => {
      if (!user) {
        (window as any).gtag?.('set', {
          'user_id': null,
        });
      }
    };
  }, [user]);

  return null;
};

export default AnalyticsInitializer;
