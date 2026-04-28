'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * AuthProtectedRoute Component
 * 
 * Protects auth pages from authenticated users
 * Redirects authenticated users to dashboard
 * Redirects unauthenticated users trying to verify email to login
 */
export function AuthProtectedRoute({ 
  children, 
  requireUnauthenticated = true,
  redirectTo = '/dashboard'
}: { 
  children: React.ReactNode;
  requireUnauthenticated?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (isLoading) return;

    // If page requires unauthenticated user (auth pages) and user is authenticated
    if (requireUnauthenticated && isAuthenticated && user) {
      router.replace(redirectTo);
      return;
    }

    // Special case: /auth/verify-email should redirect if email is already verified
    if (pathname?.includes('/auth/verify-email') && isAuthenticated && user?.isEmailVerified) {
      router.replace(redirectTo);
      return;
    }
  }, [isAuthenticated, user, isLoading, pathname, router, requireUnauthenticated, redirectTo]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
