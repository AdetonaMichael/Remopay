/**
 * useAnalytics Hook
 * Easy-to-use hook for tracking analytics throughout the application
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import * as Analytics from '@/utils/analytics.utils';

export const useAnalytics = () => {
  const pathname = usePathname();
  const timeoutRef: React.MutableRefObject<NodeJS.Timeout | null> = { current: null };

  useEffect(() => {
    // Track page view on route change
    const pageTitle = document.title || 'Page';
    
    Analytics.trackPageView({
      path: pathname,
      title: pageTitle,
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        Analytics.trackTimeOnPage({
          path: pathname,
          seconds: timeSpent,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pathname]);

  return {
    trackEvent: Analytics.trackEvent,
    trackTransaction: Analytics.trackTransaction,
    trackAuthenticationEvent: Analytics.trackAuthenticationEvent,
    trackUserIdentification: Analytics.trackUserIdentification,
    trackUserLogout: Analytics.trackUserLogout,
    trackFormEvent: Analytics.trackFormEvent,
    trackEngagement: Analytics.trackEngagement,
    trackError: Analytics.trackError,
    trackSearch: Analytics.trackSearch,
    trackBreadcrumb: Analytics.trackBreadcrumb,
  };
};

export default useAnalytics;
