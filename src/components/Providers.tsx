'use client';

import React, { useEffect } from 'react';
import { Toast } from '@/components/shared/Toast';
import { AuthInitializer } from '@/components/AuthInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EmailVerificationEnforcer } from '@/components/EmailVerificationEnforcer';
import { Error403Modal } from '@/components/Error403Modal';
import { initializeDebugLogging } from '@/utils/debug.utils';
import { initializeErrorTracking } from '@/utils/error-tracking.utils';
import { initializeIdempotencyMaintenance } from '@/utils/idempotency-maintenance.utils';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Initialize comprehensive error tracking
    initializeErrorTracking();
    console.log('[Providers] Error tracking initialized');
    
    // Initialize debug logging for mobile error tracking
    initializeDebugLogging();
    console.log('[Providers] Debug logging initialized');

    // Initialize idempotency maintenance (cleanup expired keys, periodic tasks)
    initializeIdempotencyMaintenance();
    console.log('[Providers] Idempotency maintenance initialized');
  }, []);

  return (
    <ErrorBoundary>
      <AuthInitializer>
        <EmailVerificationEnforcer>
          <>
            {children}
            <Toast />
            <Error403Modal />
          </>
        </EmailVerificationEnforcer>
      </AuthInitializer>
    </ErrorBoundary>
  );
};
