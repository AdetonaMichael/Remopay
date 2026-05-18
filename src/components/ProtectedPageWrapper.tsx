'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  requireEmail?: boolean;
  requirePhone?: boolean;
}

/**
 * ProtectedPageWrapper Component
 * 
 * Wraps page content to ensure proper verification before rendering.
 * Provides:
 * - Verification status checks (email, phone)
 * - Smooth loading state during redirects
 * - Prevents flash of unverified content
 * - Proper redirect with `next` parameter for return-to-page functionality
 * 
 * Usage:
 * ```tsx
 * <ProtectedPageWrapper requireEmail requirePhone>
 *   <YourPageContent />
 * </ProtectedPageWrapper>
 * ```
 * 
 * Props:
 * - requireEmail: If true, redirects to verify-email if not verified
 * - requirePhone: If true, redirects to verify-phone if not verified (default: true)
 */
export function ProtectedPageWrapper({
  children,
  requireEmail = true,
  requirePhone = true,
}: ProtectedPageWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isEmailVerified, isPhoneVerified } = useAuthStore();
  
  const [isClient, setIsClient] = useState(false);
  const [hasCheckedVerification, setHasCheckedVerification] = useState(false);

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check verification and redirect if needed
  useEffect(() => {
    if (!isClient) return;

    // Wait for auth state to load
    if (!isAuthenticated || !user) return;

    // Check email verification if required
    if (requireEmail && !isEmailVerified) {
      console.warn(
        '[ProtectedPageWrapper] Unverified email detected on',
        pathname,
        '- Redirecting to verify-email'
      );
      router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}&next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check phone verification if required
    if (requirePhone && !isPhoneVerified) {
      console.warn(
        '[ProtectedPageWrapper] Unverified phone detected on',
        pathname,
        '- Redirecting to verify-phone'
      );
      router.replace(`/auth/verify-phone?phone=${encodeURIComponent(user.phone_number)}&next=${encodeURIComponent(pathname)}`);
      return;
    }

    // All verifications passed
    setHasCheckedVerification(true);
  }, [isClient, isAuthenticated, user, isEmailVerified, isPhoneVerified, requireEmail, requirePhone, pathname, router]);

  // Show loading state while checking or redirecting
  if (!isClient || !hasCheckedVerification) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Verifying your account</h3>
          <p className="text-sm text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // Verification passed - render children
  return <>{children}</>;
}
