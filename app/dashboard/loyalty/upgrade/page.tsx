'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Deprecated: Tier upgrade has been moved to /dashboard/settings
 * This page redirects to the new location
 */
export default function TierUpgradeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings');
  }, [router]);

  return null;
}
