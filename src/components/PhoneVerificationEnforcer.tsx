'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * PhoneVerificationEnforcer Component
 * 
 * Prevents users from accessing protected routes until they verify their phone.
 * Works in conjunction with phone verification flow.
 * 
 * - If user is authenticated but phone not verified, silently redirect to /auth/verify-phone
 * - If on a protected route without phone verification, immediately redirect
 * - Uses router.replace() to prevent back button navigation
 * - Uses ref to prevent multiple redirects
 */
export function PhoneVerificationEnforcer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isPhoneVerified } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Routes that don't require phone verification
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth/verify-phone',
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

    // User has verified phone - allow access, reset redirect flag
    if (isPhoneVerified) {
      hasRedirectedRef.current = false;
      return;
    }

    // User is on protected route without phone verification - redirect
    // Use ref to ensure we only redirect once per unverified state
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      console.warn(
        '[PhoneVerificationEnforcer] Blocking unverified user from accessing:',
        pathname,
        '- Redirecting to verify-phone'
      );
      router.replace(`/auth/verify-phone?next=${encodeURIComponent(pathname)}`);
    }
  }, [isClient, pathname, isPublicRoute, isAuthenticated, isPhoneVerified, user, router]);

  // Render children normally - enforcement happens via redirect above
  return <>{children}</>;
}
