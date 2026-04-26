'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { safeGetItem } from '@/utils/safe-storage.utils';

/**
 * AuthInitializer Component
 * 
 * This component runs on app mount to:
 * 1. Check if there's a stored token in localStorage
 * 2. Restore auth state from Zustand persistence middleware
 * 3. Clear auth on hydration mismatch
 * 
 * Token validation happens via API interceptors on first authenticated request.
 * Uses proper hydration guards and safe storage access for mobile compatibility.
 * 
 * Security: Token is stored in localStorage (accessible via browser dev tools)
 * For highly sensitive applications, consider HTTP-only cookies via server.
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setIsLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only initializes on client after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initializeAuth = async () => {
      try {
        console.log('[AuthInitializer] Starting auth initialization...');
        setIsLoading(true);
        
        console.log('[AuthInitializer] Checking for token in storage...');
        let token: string | null = null;
        
        try {
          token = typeof window !== 'undefined' ? safeGetItem('token') : null;
          console.log('[AuthInitializer] Token found:', !!token);
        } catch (storageError: any) {
          console.error('[AuthInitializer] Storage error while getting token:', storageError);
          token = null;
        }

        if (token) {
          console.log('[AuthInitializer] Found token in localStorage, session restored via Zustand persistence');
          // Token exists - Zustand persistence middleware will restore user state automatically
          // Token validation will occur on first API call via auth interceptor (401 handling)
        } else {
          console.log('[AuthInitializer] No token in localStorage');
          // No token - user is not authenticated
        }
      } catch (error: any) {
        console.error('[AuthInitializer] Auth initialization error:', error);
      } finally {
        console.log('[AuthInitializer] Auth initialization complete');
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isMounted, setIsLoading]);

  // Prevent rendering until hydration is complete and auth is initialized
  if (!isMounted || !isInitialized) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
};
