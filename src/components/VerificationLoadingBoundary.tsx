'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface VerificationLoadingBoundaryProps {
  children: React.ReactNode;
}

/**
 * VerificationLoadingBoundary Component
 * 
 * Shows a smooth loading state while auth store initializes and verification
 * is being checked by the global enforcers (EmailVerificationEnforcer, PhoneVerificationEnforcer).
 * 
 * This component DOES NOT perform redirects - it only shows loading UI.
 * Redirects are handled by the global enforcers in Providers.
 * 
 * This prevents content flash and provides better UX during verification checks.
 * 
 * Usage:
 * ```tsx
 * <VerificationLoadingBoundary>
 *   <YourPageContent />
 * </VerificationLoadingBoundary>
 * ```
 */
export function VerificationLoadingBoundary({ children }: VerificationLoadingBoundaryProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while auth is initializing
  if (!isClient || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loading</h3>
          <p className="text-sm text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // Auth ready - render children (enforcers will handle redirects if needed)
  return <>{children}</>;
}
