'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * PhoneVerificationEnforcer Component
 * 
 * REDIRECT-BASED ENFORCEMENT: Explicitly redirects unverified users away from protected routes.
 * 
 * This is more aggressive than modal-based blocking and ensures users CANNOT access
 * protected content without phone verification.
 */
export function PhoneVerificationEnforcer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  // Public routes that don't require phone verification
  const PUBLIC_ROUTES = [
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
    if (!pathname) return;

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    // Check if user is authenticated
    const isLoggedIn = isAuthenticated && user;

    // Check if phone is verified
    const isPhoneVerified = user?.isPhoneVerified === true;

    console.log('[PhoneVerificationEnforcer] Route Check:', {
      pathname,
      isPublicRoute,
      isLoggedIn,
      isPhoneVerified,
      phoneVerifiedAt: user?.phone_verified_at,
      shouldRedirect: isLoggedIn && !isPublicRoute && !isPhoneVerified,
    });

    // If user is logged in, on protected route, but phone not verified → REDIRECT
    if (isLoggedIn && !isPublicRoute && !isPhoneVerified) {
      console.warn('[PhoneVerificationEnforcer] ❌ REDIRECTING - Phone verification required!', {
        from: pathname,
        reason: 'Phone not verified',
        userPhone: user?.phone_number,
      });

      // Redirect to phone verification page
      router.replace(`/auth/verify-phone?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // All other cases: allow normal access
    console.log('[PhoneVerificationEnforcer] ✅ Access allowed');

  }, [pathname, isAuthenticated, user, router]);

  // Render children (will be replaced by redirect if needed)
  return <>{children}</>;
}
