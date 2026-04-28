'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * EmailVerificationEnforcer Component
 * 
 * Prevents users from accessing protected routes until they verify their email.
 * Works in conjunction with useAuth login redirect.
 * 
 * - If user is authenticated but email not verified, silently redirect to /auth/verify-email
 * - If on a protected route without email verification, immediately redirect
 * - Uses router.replace() to prevent back button navigation
 */
export function EmailVerificationEnforcer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Routes that don't require email verification
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth',
    '/',
    '/about',
    '/faq',
    '/privacy',
    '/terms',
    '/support',
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isPublicRoute = publicRoutes.some((route) => {
    const normalizedPathname = pathname || '';
    return normalizedPathname.startsWith(route);
  });

  const isEmailVerified = user?.isEmailVerified === true;

  // Main enforcement logic
  useEffect(() => {
    if (!isClient) return;
    if (!pathname) return;

    // Only enforce on protected routes
    if (isPublicRoute) {
      hasRedirectedRef.current = false; // Reset when on public route
      return;
    }

    // User is not authenticated - no enforcement needed
    if (!isAuthenticated || !user) return;

    // User has verified email - allow access, reset redirect flag
    if (isEmailVerified) {
      hasRedirectedRef.current = false;
      return;
    }

    // User is on protected route without email verification - redirect
    // Use ref to ensure we only redirect once per unverified state
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      console.warn(
        '[EmailVerificationEnforcer] Blocking unverified user from accessing:',
        pathname,
        '- Redirecting to verify-email'
      );
      const email = user?.email || '';
      router.replace(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }
  }, [isClient, pathname, isPublicRoute, isAuthenticated, isEmailVerified, user, router]);

  // Render children normally - enforcement happens via redirect above
  return <>{children}</>;
}
