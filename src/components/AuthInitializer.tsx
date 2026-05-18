'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { safeGetItem } from '@/utils/safe-storage.utils';
import { authService } from '@/services/auth.service';

/**
 * AuthInitializer Component
 * 
 * This component runs on app mount to:
 * 1. Check if there's a stored token in localStorage
 * 2. Restore auth state from Zustand persistence middleware
 * 3. Refresh user data from API to ensure fresh verification flags
 * 4. Clear auth on hydration mismatch
 * 
 * Token validation happens via API interceptors on first authenticated request.
 * Uses proper hydration guards and safe storage access for mobile compatibility.
 * 
 * Security: Token is stored in localStorage (accessible via browser dev tools)
 * For highly sensitive applications, consider HTTP-only cookies via server.
 * 
 * NOTE: Removed full-page loading render block. Children render during initialization
 * while loading state is tracked. Button loading states and skeleton loaders will display.
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setIsLoading, user, setUser } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only initializes on client after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        let token: string | null = null;
        
        try {
          token = typeof window !== 'undefined' ? safeGetItem('token') : null;
        } catch (storageError: any) {
          console.error('[AuthInitializer] Storage error while getting token:', storageError);
          token = null;
        }

        if (token && user) {
          // Token exists and user is loaded from persistence
          // Refresh user data from API to get fresh verification flags
          try {
            console.log('[AuthInitializer] Refreshing user data to get fresh verification flags');
            const response = await authService.getProfile();
            
            if (response.success && response.data) {
              console.log('[AuthInitializer] User data refreshed:', {
                email: response.data.email,
                isEmailVerified: response.data.isEmailVerified,
                isPhoneVerified: response.data.isPhoneVerified,
              });
              // Update store with fresh user data
              setUser(response.data);
            } else {
              console.warn('[AuthInitializer] Failed to refresh user data:', response.message);
            }
          } catch (error: any) {
            console.error('[AuthInitializer] Error refreshing user data:', error);
            // Don't fail initialization if refresh fails - user can continue
          }
        } else if (!token) {
          // No token - user is not authenticated
          console.log('[AuthInitializer] No token found, user is not authenticated');
        }
      } catch (error: any) {
        console.error('[AuthInitializer] Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isMounted, setIsLoading, user, setUser]);

  // Render children immediately - no blocking render during initialization
  // Button loading states and skeleton loaders will show instead
  return <>{children}</>;
};
