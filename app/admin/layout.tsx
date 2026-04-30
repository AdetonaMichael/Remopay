'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Topbar } from '@/components/shared/Topbar';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Smartphone,
  Gift,
  Share2,
  Bell,
  BarChart3,
  FileText,
  TrendingUp,
  Award,
  AlertCircle,
  LogOut,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { label: 'Services', href: '/admin/services', icon: Smartphone },
  { label: 'Offer Codes', href: '/admin/offer-codes', icon: Gift },
  { label: 'Rewards', href: '/admin/rewards', icon: Gift },
  { label: 'Campaigns', href: '/admin/rewards/campaigns', icon: TrendingUp },
  { label: 'Loyalty Tiers', href: '/admin/loyalty', icon: Award },
  { label: 'Loyalty Users', href: '/admin/loyalty/users', icon: Users },
  { label: 'Referrals', href: '/admin/referrals', icon: Share2 },
  { label: 'Abuse Flags', href: '/admin/rewards/abuse-flags', icon: AlertCircle },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, activeRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.warn('[AdminLayout] User email not verified, redirecting to verification page');
      router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    const isAdmin = user.roles?.some((r) => r === 'admin');
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    // If user has multiple roles but activeRole is not admin, redirect to appropriate dashboard
    if (activeRole && activeRole !== 'admin') {
      const path = activeRole === 'agent' ? '/agent' : '/dashboard';
      router.push(path);
      return;
    }

    setLoading(false);
  }, [user, activeRole, router]);

  if (loading) {
    return <PageSkeleton />;
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {!mobile && (
        <div className="border-b border-white/10 px-5 py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Remopay Admin" width={42} height={42} />
            {(sidebarOpen || mobile) && (
              <div>
                <p className="text-xl font-black tracking-tight text-white">
                  Remopay
                </p>
                <p className="text-xs font-semibold text-white/45">
                  Admin
                </p>
              </div>
            )}
          </Link>
        </div>
      )}

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setMobileMenuOpen(false)}
              className={clsx(
                'group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all',
                active
                  ? 'bg-[#d71927] text-white shadow-lg shadow-[#d71927]/25'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon
                size={20}
                className={clsx(
                  active ? 'text-white' : 'text-white/50 group-hover:text-white'
                )}
              />
              {(sidebarOpen || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {(sidebarOpen || mobile) && (
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-semibold text-white/45">Signed in as</p>
            <p className="mt-1 truncate text-sm font-black text-white">
              {user?.first_name || 'Admin User'}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#100303] text-white">
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden shrink-0 flex-col border-r border-white/10 bg-[#140404] transition-all duration-300 md:flex',
          sidebarOpen ? 'w-72' : 'w-24'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#fafafa]">
        {/* Top Bar */}
        <Topbar onMenuToggle={() => setMobileMenuOpen((open) => !open)} mobileMenuOpen={mobileMenuOpen} />

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={clsx(
            'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/10 bg-[#140404] text-white transition-transform duration-300 md:hidden',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="border-b border-white/10 px-5 py-5 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <Image src="/icon.png" alt="Remopay Admin" width={42} height={42} />
              <div>
                <p className="text-xl font-black tracking-tight text-white">Remopay</p>
                <p className="text-xs font-semibold text-white/45">Admin</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white flex-shrink-0"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
          <SidebarContent mobile />
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] px-4 py-6 text-[#111] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
