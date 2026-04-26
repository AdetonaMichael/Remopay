'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/shared/Spinner';
import { debugError } from '@/utils/debug.utils';

interface AuthProtectedProps {
  children: React.ReactNode;
  /**
   * If true, allows only authenticated users (e.g., /dashboard)
   * If false, allows only unauthenticated users (e.g., /auth/login)
   */
  requireAuth?: boolean;
}

/**
 * AuthProtected Component
 * 
 * Protects routes based on authentication status:
 * - requireAuth=true: Only authenticated users can access (redirects to login)
 * - requireAuth=false: Only unauthenticated users can access (redirects to dashboard)
 */
export const AuthProtected: React.FC<AuthProtectedProps> = ({
  children,
  requireAuth = true,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      // Wait for auth to be initialized (user is set or null)
      if (user === undefined) return;

      if (requireAuth) {
        // Page requires authentication
        if (!isAuthenticated) {
          console.log('[AuthProtected] User not authenticated, redirecting to login');
          router.replace('/auth/login');
        }
      } else {
        // Page requires NO authentication (auth pages)
        if (isAuthenticated) {
          console.log('[AuthProtected] User is authenticated, redirecting from auth page to dashboard');
          router.replace('/dashboard');
        }
      }
    } catch (error: any) {
      debugError('[AuthProtected] Error during auth check:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, requireAuth, isMounted]);

  // If authentication requirement not met, show loading
  if (!isMounted || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
};
