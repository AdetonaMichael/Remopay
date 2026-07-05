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

      <div className="mx-auto max-w-7xl space-y-6">
        {/* ── Header ── */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                <Percent className="h-3.5 w-3.5 text-gray-700" />
                VTU Subsidy Management
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                VTU Services Subsidy
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Manage subsidized pricing for VTU services. Toggle subsidies
                on/off, configure percentage or fixed discounts, and set
                minimum and maximum discount caps per service.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                Service Count
              </p>
              <p className="mt-1 text-lg font-extrabold text-black">
                Real-time Configuration
              </p>
            </div>
          </div>
        </section>

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
                price on their end (e.g., "₦980.00 — was ₦1,000.00").
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
