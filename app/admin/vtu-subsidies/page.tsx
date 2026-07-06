'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Percent, ExternalLink } from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import { VtuSubsidyTable } from '@/components/admin/vtu/VtuSubsidyTable';

export default function VtuSubsidiesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin = useMemo(
    () => Boolean(user?.roles?.some((role) => role === 'admin')),
    [user],
  );

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 lg:px-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="mx-auto  space-y-6">

        {/* ── Info Card ── */}
        <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <ExternalLink className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">
                About Subsidy Management
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-700">
                When a subsidy is enabled, the discount is applied to the
                original price of VTU plans. Users will see the subsidized
                price on their end (e.g., "₦980.00 === was ₦1,000.00").
                Configure caps to limit the minimum and maximum discount
                amount per transaction.
              </p>
            </div>
          </div>
        </section>

        {/* ── Table ── */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <VtuSubsidyTable />
        </section>
      </div>
    </div>
  );
}
