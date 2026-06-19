'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Activity,
  Network,
  Zap,
  Clock,
  RefreshCw,
  Eye,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { AdminTable } from '@/components/admin/AdminTable';
import { useAuthStore } from '@/store/auth.store';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';
import { formatCurrency, formatDate } from '@/utils/format.utils';
import { adminService } from '@/services/admin.service';
import { paymentService } from '@/services/payment.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  overview: {
    users: {
      total: number;
      verified: number;
      verification_rate: number;
      active_last_30_days: number;
      new_today: number;
      new_this_month: number;
    };
    transactions: {
      total_volume: number;
      volume_today: number;
      volume_this_month: number;
      month_growth_rate: string;
      total_count: number;
      completed_count: number;
      pending_count: number;
      failed_count: number;
    };
    vtu: {
      completed_transactions: number;
      volume: number;
      commission_earned: number;
      failed_count: number;
      success_rate: number;
    };
    wallet: {
      total_transactions: number;
      volume: number;
      active_wallets: number;
    };
    revenue: {
      total_commission: number;
      commission_today: number;
    };
    referrals: {
      total_referrals: number;
      active_referrers: number;
    };
    timestamp: string;
  };
  services: {
    vtu_by_network: Array<{
      network: string;
      transaction_count: number;
      volume: number;
      commission: number;
    }>;
    service_distribution: Array<{
      type: string;
      count: number;
      volume: number;
      percentage: number;
    }>;
    timestamp: string;
  };
  performance: {
    daily_trend_30_days: Array<{
      date: string;
      transaction_count: number;
      volume: number;
    }>;
    hourly_trend_today: Array<{
      hour: number;
      transaction_count: number;
      volume: number;
    }>;
    success_rate_by_type: Array<{
      type: string;
      total: number;
      successful: number;
      success_rate: number;
    }>;
    timestamp: string;
  };
  top_performers: {
    top_networks: Array<{
      network: string;
      transaction_count: number;
      volume: number;
    }>;
    top_users_by_volume: Array<{
      user_id: number;
      name: string;
      email: string;
      transaction_count: number;
      total_volume: number;
    }>;
    top_referrers: Array<{
      user_id: number;
      name: string;
      referral_count: number;
    }>;
    timestamp: string;
  };
  health: {
    transaction_health: {
      failed_last_24h: number;
      pending_stuck: number;
      status: string;
    };
    user_health: {
      unverified_users: number;
      email_unverified: number;
    };
    notification_health: {
      unread_count: number;
    };
    offers: {
      active_codes: number;
    };
    alerts: Array<{
      level: 'info' | 'warning' | 'error';
      message: string;
    }>;
    timestamp: string;
  };
  timestamp: string;
}

interface Transaction {
  id: string | number;
  user_id: number;
  transaction_type: string;
  amount: number;
  status: string;
  transaction_date: string;
  reference: string;
  metadata?: Record<string, any>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely format a value as compact currency
 * Returns '₦0' if value is NaN, null, or undefined
 */
function formatCompactCurrency(value: number | null | undefined): string {
  // Handle null/undefined/NaN
  if (value === null || value === undefined || isNaN(value)) {
    return '₦0';
  }
  
  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(0)}K`;
  }
  return `₦${value.toLocaleString()}`;
}

/**
 * Format balance as full currency value (no compact notation)
 */
function formatFullCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₦0.00';
  }
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format USD currency value
 */
function formatUSDCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: any; text: string }> = {
    completed: { variant: 'success', text: 'Completed' },
    pending: { variant: 'warning', text: 'Pending' },
    failed: { variant: 'error', text: 'Failed' },
  };

  const config = statusConfig[status?.toLowerCase()] || { variant: 'default', text: status };
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Provider balances state
  const [providerBalances, setProviderBalances] = useState<{
    paystack: number | null;
    vtpass: number | null;
    maplerad: number | null;
    telnyx: number | null;
  }>({ paystack: null, vtpass: null, maplerad: null, telnyx: null });
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const isAdmin = useMemo(
    () => Boolean(user?.roles?.some((role) => role === 'admin')),
    [user]
  );

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        // Use adminService to fetch dashboard data
        const response = await adminService.getDashboard();

        // Console log the API response
        console.log('[AdminDashboard] API Response:', response);
        console.log('[AdminDashboard] Response Data:', response.data);

        if (response.success && response.data) {
          
          // Transform API response to match DashboardData structure
          const apiData = response.data as any;
          const transformedData: DashboardData = {
            overview: {
              users: {
                total: apiData.users?.total || 0,
                verified: apiData.users?.verified || 0,
                verification_rate: apiData.users?.verified && apiData.users?.total 
                  ? (apiData.users.verified / apiData.users.total) * 100 
                  : 0,
                active_last_30_days: 0,
                new_today: 0,
                new_this_month: apiData.users?.new || 0,
              },
              transactions: {
                total_volume: 0,
                volume_today: 0,
                volume_this_month: 0,
                month_growth_rate: '0%',
                total_count: 0,
                completed_count: 0,
                pending_count: 0,
                failed_count: 0,
              },
              vtu: {
                completed_transactions: apiData.vtu?.total_transactions || 0,
                volume: 0,
                commission_earned: apiData.vtu?.total_revenue || 0,
                failed_count: 0,
                success_rate: apiData.vtu?.success_rate || 0,
              },
              wallet: {
                total_transactions: 0,
                volume: apiData.wallet?.total_balance || 0,
                active_wallets: 0,
              },
              revenue: {
                total_commission: apiData.vtu?.total_revenue || 0,
                commission_today: 0,
              },
              referrals: {
                total_referrals: 0,
                active_referrers: 0,
              },
              timestamp: new Date().toISOString(),
            },
            services: {
              vtu_by_network: [],
              service_distribution: [],
              timestamp: new Date().toISOString(),
            },
            performance: {
              daily_trend_30_days: [],
              hourly_trend_today: [],
              success_rate_by_type: apiData.performance?.success_rate 
                ? [{ type: 'overall', total: apiData.performance.total_transactions || 0, successful: apiData.performance.successful_transactions || 0, success_rate: apiData.performance.success_rate || 0 }]
                : [],
              timestamp: new Date().toISOString(),
            },
            top_performers: {
              top_networks: [],
              top_users_by_volume: [],
              top_referrers: [],
              timestamp: new Date().toISOString(),
            },
            health: {
              transaction_health: {
                failed_last_24h: 0,
                pending_stuck: 0,
                status: 'ok',
              },
              user_health: {
                unverified_users: (apiData.users?.total || 0) - (apiData.users?.verified || 0),
                email_unverified: 0,
              },
              notification_health: {
                unread_count: 0,
              },
              offers: {
                active_codes: 0,
              },
              alerts: [],
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          };
          
          setData(transformedData);
        } else {
          throw new Error(response.message || 'Invalid dashboard response');
        }
      } catch (err: any) {
        console.error('[AdminDashboard] Error fetching dashboard:', {
          message: err?.message,
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          url: err?.config?.url,
        });
        const errorMessage = err?.response?.data?.message 
          || err?.message 
          || 'Failed to load dashboard data. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch provider balances
  useEffect(() => {
    const fetchProviderBalances = async () => {
      try {
        setBalancesLoading(true);
        const balances: { paystack: number | null; vtpass: number | null; maplerad: number | null; telnyx: number | null } = { paystack: null, vtpass: null, maplerad: null, telnyx: null };

        // Fetch Paystack balance
        try {
          const paystackResponse = await paymentService.getPaystackBalance();
          console.log('[AdminDashboard] Paystack Raw Response:', JSON.stringify(paystackResponse, null, 2));
          
          let balanceValue = null;
          
          // Try multiple paths to find the balance
          // Path 1: response.data[0].balance (most likely)
          if (paystackResponse?.data && Array.isArray(paystackResponse.data) && paystackResponse.data.length > 0) {
            balanceValue = paystackResponse.data[0].balance;
            console.log('[AdminDashboard] Found balance via path 1 (response.data[0].balance):', balanceValue);
          }
          // Path 2: response.data.data[0].balance (nested)
          else if (paystackResponse?.data?.data && Array.isArray(paystackResponse.data.data) && paystackResponse.data.data.length > 0) {
            balanceValue = paystackResponse.data.data[0].balance;
            console.log('[AdminDashboard] Found balance via path 2 (response.data.data[0].balance):', balanceValue);
          }
          // Path 3: response.balance (if balance is at root)
          else if (typeof (paystackResponse as any)?.balance === 'number') {
            balanceValue = (paystackResponse as any).balance;
            console.log('[AdminDashboard] Found balance via path 3 (response.balance):', balanceValue);
          }
          // Path 4: Check if data itself is the balance value
          else if (typeof (paystackResponse as any)?.data === 'number') {
            balanceValue = (paystackResponse as any).data;
            console.log('[AdminDashboard] Found balance via path 4 (response.data is number):', balanceValue);
          }
          
          console.log('[AdminDashboard] Final balanceValue before conversion:', balanceValue, 'Type:', typeof balanceValue);
          
          if (balanceValue !== null && balanceValue !== undefined) {
            // Handle both number and string
            let balanceNum = balanceValue;
            if (typeof balanceNum === 'string') {
              balanceNum = parseFloat(balanceNum);
            }
            
            console.log('[AdminDashboard] Balance as number:', balanceNum);
            console.log('[AdminDashboard] Is valid number:', !isNaN(balanceNum));
            
            if (!isNaN(balanceNum)) {
              // Convert from kobo to naira (even if 0)
              balances.paystack = balanceNum / 100;
              console.log('[AdminDashboard] ✓ Paystack Balance Set (Naira):', balances.paystack);
            } else {
              console.warn('[AdminDashboard] Balance is not a valid number:', balanceNum);
            }
          } else {
            console.warn('[AdminDashboard] Could not find balance in any expected location');
            console.log('[AdminDashboard] Response keys:', Object.keys(paystackResponse || {}));
          }
        } catch (err: any) {
          console.error('[AdminDashboard] Exception fetching Paystack balance:', err);
          console.error('[AdminDashboard] Error Stack:', err?.stack);
          console.error('[AdminDashboard] Full Error Object:', JSON.stringify(err, null, 2));
        }

        // Fetch VTPass balance
        try {
          const vtpassResponse = await paymentService.getVTPassBalance();
          // VTPass returns { code: 1, contents: { balance: "74.60" } }
          if (vtpassResponse.code === 1 && vtpassResponse.contents?.balance) {
            balances.vtpass = parseFloat(vtpassResponse.contents.balance);
          }
        } catch (err: any) {
          console.warn('[AdminDashboard] Failed to fetch VTPass balance:', err?.message);
        }

        // Fetch Maplerad balance
        try {
          const mapleradResponse = await paymentService.getMapleradBalance();
          console.log('[AdminDashboard] Maplerad Response:', mapleradResponse);
          if (mapleradResponse.success && mapleradResponse.data?.balance) {
            let balanceValue = mapleradResponse.data.balance;
            if (typeof balanceValue === 'string') {
              balanceValue = parseFloat(balanceValue);
            }
            if (!isNaN(balanceValue)) {
              balances.maplerad = balanceValue;
              console.log('[AdminDashboard] ✓ Maplerad Balance Set:', balances.maplerad);
            }
          }
        } catch (err: any) {
          console.error('[AdminDashboard] Failed to fetch Maplerad balance:', err?.message);
        }

        // Fetch Telnyx balance (available_credit in USD)
        try {
          const telnyxResponse = await paymentService.getTelnyxBalance();
          console.log('[AdminDashboard] Telnyx Response:', telnyxResponse);
          
          if (telnyxResponse.success && telnyxResponse.data) {
            // Use available_credit as it's the most relevant for transaction purposes
            const creditValue = telnyxResponse.data.available_credit;
            console.log('[AdminDashboard] Telnyx available_credit:', creditValue);
            
            if (creditValue !== undefined && creditValue !== null) {
              let balanceValue = creditValue;
              if (typeof balanceValue === 'string') {
                balanceValue = parseFloat(balanceValue);
              }
              if (!isNaN(balanceValue)) {
                balances.telnyx = balanceValue;
                console.log('[AdminDashboard] ✓ Telnyx Balance Set (USD):', balances.telnyx);
              }
            }
          }
        } catch (err: any) {
          console.error('[AdminDashboard] Failed to fetch Telnyx balance:', err?.message);
        }

        setProviderBalances(balances);
      } catch (err: any) {
        console.error('[AdminDashboard] Error fetching provider balances:', err);
      } finally {
        setBalancesLoading(false);
      }
    };

    fetchProviderBalances();
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setError(null);
    
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminService.getDashboard();
        
        // Console log the API response
        console.log('[AdminDashboard] API Response (Retry):', response);
        console.log('[AdminDashboard] Response Data (Retry):', response.data);

        if (response.success && response.data) {
          setData(response.data as unknown as DashboardData);
        } else {
          throw new Error(response.message || 'Invalid dashboard response');
        }
      } catch (err: any) {
        console.error('[AdminDashboard] Retry failed:', {
          message: err?.message,
          status: err?.response?.status,
        });
        const errorMessage = err?.response?.data?.message 
          || err?.message 
          || 'Failed to load dashboard data. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };
    
    fetchDashboard();
  };

  if (!isAdmin) return null;

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707]">
        <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-6 sm:p-8 text-center shadow-[0_10px_35px_rgba(0,0,0,0.04)] mx-4">
          <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-xs sm:text-sm text-[#6b7280] mb-6">
            {error || 'Failed to load dashboard data. Please check your connection and try again.'}
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4a5ff7] px-5 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#3a4fe7] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // Safe access with defaults
  const overview = data.overview || {};
  const users = overview.users || { total: 0, verified: 0, verification_rate: 0 };
  const transactionStats = overview.transactions || { volume_this_month: 0, month_growth_rate: '0%' };
  const revenue = overview.revenue || { commission_today: 0, total_commission: 0 };
  const vtuStats = overview.vtu || { success_rate: 0, completed_transactions: 0 };
  
  const services = data.services || { service_distribution: [], vtu_by_network: [] };
  const performance = data.performance || { success_rate_by_type: [] };
  const topPerformers = data.top_performers || { top_networks: [], top_users_by_volume: [], top_referrers: [] };
  const health = data.health || { 
    transaction_health: { failed_last_24h: 0, pending_stuck: 0, status: 'ok' },
    user_health: { unverified_users: 0, email_unverified: 0 },
    offers: { active_codes: 0 },
    alerts: []
  };

  // Ensure all numeric values are valid numbers
  const safeUsers = {
    total: Number.isFinite(users.total) ? users.total : 0,
    verified: Number.isFinite(users.verified) ? users.verified : 0,
    verification_rate: Number.isFinite(users.verification_rate) ? users.verification_rate : 0,
  };

  const safeTransactions = {
    volume_this_month: Number.isFinite(transactionStats.volume_this_month) ? transactionStats.volume_this_month : 0,
    month_growth_rate: transactionStats.month_growth_rate || '0%',
  };

  const safeRevenue = {
    commission_today: Number.isFinite(revenue.commission_today) ? revenue.commission_today : 0,
    total_commission: Number.isFinite(revenue.total_commission) ? revenue.total_commission : 0,
  };

  const safeVtuStats = {
    success_rate: Number.isFinite(vtuStats.success_rate) ? vtuStats.success_rate : 0,
    completed_transactions: Number.isFinite(vtuStats.completed_transactions) ? vtuStats.completed_transactions : 0,
  };

  const kpiCards = [
    {
      label: 'Total Users',
      value: safeUsers.total.toLocaleString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      subtext: `${safeUsers.verified} verified (${safeUsers.verification_rate.toFixed(1)}%)`,
    },
    {
      label: 'Monthly Volume',
      value: formatCompactCurrency(safeTransactions.volume_this_month),
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600',
      subtext: `Growth: ${safeTransactions.month_growth_rate}`,
    },
    {
      label: 'Daily Revenue',
      value: formatCurrency(safeRevenue.commission_today),
      icon: Wallet,
      color: 'bg-purple-50 text-purple-600',
      subtext: `Total: ${formatCompactCurrency(safeRevenue.total_commission)}`,
    },
    {
      label: 'VTU Success Rate',
      value: `${safeVtuStats.success_rate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      subtext: `${safeVtuStats.completed_transactions.toLocaleString()} completed`,
    },
    {
      label: 'Paystack Balance',
      value: formatFullCurrency(providerBalances.paystack),
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
      subtext: balancesLoading ? 'Loading...' : 'Merchant Balance',
    },
    {
      label: 'VTPass Balance',
      value: formatFullCurrency(providerBalances.vtpass),
      icon: Network,
      color: 'bg-orange-50 text-orange-600',
      subtext: balancesLoading ? 'Loading...' : 'Provider Balance',
    },
    {
      label: 'Maplerad Balance',
      value: formatFullCurrency(providerBalances.maplerad),
      icon: Zap,
      color: 'bg-pink-50 text-pink-600',
      subtext: balancesLoading ? 'Loading...' : 'Provider Balance',
    },
    {
      label: 'Telnyx Balance',
      value: formatUSDCurrency(providerBalances.telnyx),
      icon: Activity,
      color: 'bg-cyan-50 text-cyan-600',
      subtext: balancesLoading ? 'Loading...' : 'SMS Provider (USD)',
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-[#fafafa] text-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="space-y-5 sm:space-y-6 md:space-y-8 p-3 sm:p-5 md:p-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <section>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111827]">
            Dashboard
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#6b7280]">
            Real-time system metrics and performance analytics
          </p>
        </section>

        {/* ── KPI Cards (Horizontally Scrollable with Navigation) ────────── */}
        <section>
          <div className="relative">
            {/* Left Navigation Button */}
            <button
              onClick={() => {
                const container = document.getElementById('kpi-cards-container');
                if (container) {
                  container.scrollBy({ left: -400, behavior: 'smooth' });
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white border border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow hover:bg-[#f9fafb]"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Navigation Button */}
            <button
              onClick={() => {
                const container = document.getElementById('kpi-cards-container');
                if (container) {
                  container.scrollBy({ left: 400, behavior: 'smooth' });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white border border-[#e5e7eb] shadow-md hover:shadow-lg transition-shadow hover:bg-[#f9fafb]"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Cards Container */}
            <div
              id="kpi-cards-container"
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scrollbar-hide lg:pr-10 lg:pl-10"
            >
              {kpiCards.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Card
                    key={kpi.label}
                    className="min-w-[230px] sm:min-w-[270px] md:min-w-[300px] snap-start rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:border-[#d1d5db] flex-shrink-0"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#6b7280]">
                          {kpi.label}
                        </p>
                        <p className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-bold text-[#111827] break-words">
                          {kpi.value}
                        </p>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-[#6b7280]">
                          {kpi.subtext}
                        </p>
                      </div>
                      <div className={`rounded-xl sm:rounded-2xl ${kpi.color} p-2 sm:p-2.5 md:p-3 flex-shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Charts Grid ────────────────────────────────────────────────── */}
        <section className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-2">
          {/* Service Distribution */}
          <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                  Service Distribution
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6b7280]">
                  Transaction breakdown by service type
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {services.service_distribution && services.service_distribution.length > 0 ? (
                services.service_distribution.map((service) => (
                  <div key={service.type}>
                    <div className="mb-1.5 sm:mb-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium text-[#111827]">
                        {service.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#4a5ff7]">
                        {service.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                      <div
                        className="h-full rounded-full bg-[#4a5ff7]"
                        style={{ width: `${Math.max(service.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#6b7280]">No service distribution data available</p>
              )}
            </div>
          </Card>

          {/* Network Performance */}
          <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
                <Network className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                  Network Performance
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6b7280]">
                  VTU transactions by network
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {services.vtu_by_network && services.vtu_by_network.length > 0 ? (
                services.vtu_by_network.map((network) => (
                  <div
                    key={network.network}
                    className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 sm:pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-[#111827]">
                        {network.network}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#6b7280]">
                        {network.transaction_count} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-bold text-[#111827]">
                        {formatCompactCurrency(network.volume)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#6b7280]">
                        {formatCompactCurrency(network.commission)} commission
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#6b7280]">No network performance data available</p>
              )}
            </div>
          </Card>
        </section>

        {/* ── Performance & Top Performers Grid ──────────────────────────– */}
        <section className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-2">
          {/* Success Rate by Type */}
          <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                  Success Rates
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6b7280]">
                  By transaction type
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {performance?.success_rate_by_type && performance.success_rate_by_type.length > 0 ? (
                performance.success_rate_by_type.map((type) => (
                  <div key={type.type}>
                    <div className="mb-1.5 sm:mb-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium text-[#111827]">
                        {type.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-green-600">
                        {type.success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${type.success_rate}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] sm:text-xs text-[#6b7280]">
                      {type.successful} of {type.total} successful
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#6b7280]">No success rate data available</p>
              )}
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                  Top Networks
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6b7280]">
                  By transaction volume
                </p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {topPerformers?.top_networks && topPerformers.top_networks.length > 0 ? (
                topPerformers.top_networks.slice(0, 4).map((network, idx) => (
                  <div key={network.network} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#eef2ff] text-[11px] sm:text-xs font-bold text-[#4a5ff7]">
                        {idx + 1}
                      </div>
                      <span className="text-sm sm:text-base font-medium text-[#111827]">
                        {network.network}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#111827]">
                      {formatCompactCurrency(network.volume)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#6b7280]">No network data available</p>
              )}
            </div>
          </Card>
        </section>

        {/* ── Recent & Health Grid ───────────────────────────────────────– */}
        <section className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-2">
          {/* Top Users */}
          <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                  Top Users
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6b7280]">
                  By transaction volume
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {topPerformers?.top_users_by_volume && topPerformers.top_users_by_volume.length > 0 ? (
                topPerformers.top_users_by_volume.slice(0, 5).map((user, idx) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 sm:pb-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[11px] sm:text-xs font-bold text-[#4a5ff7]">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#111827]">
                          {user.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-[#6b7280]">
                          {user.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#111827]">
                      {formatCompactCurrency(user.total_volume)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-[#6b7280]">No user data available</p>
              )}
            </div>
          </Card>

          {/* System Health */}
          <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                  System Health
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6b7280]">
                  Status and alerts
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-xl sm:rounded-2xl bg-[#f8fafc] p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-[#6b7280]">
                    Failed Transactions (24h)
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#111827]">
                    {health.transaction_health.failed_last_24h}
                  </span>
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-[#f8fafc] p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-[#6b7280]">
                    Unverified Users
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#111827]">
                    {health.user_health.unverified_users}
                  </span>
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-[#f8fafc] p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-[#6b7280]">
                    Active Offer Codes
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#111827]">
                    {health.offers.active_codes}
                  </span>
                </div>
              </div>

              {health?.alerts && health.alerts.length > 0 && (
                <div className="rounded-xl sm:rounded-2xl border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
                  <p className="text-[11px] sm:text-xs font-semibold text-yellow-700">
                    Alerts
                  </p>
                  <div className="mt-2 space-y-2">
                    {health.alerts.slice(0, 2).map((alert, idx) => (
                      <p key={idx} className="text-[11px] sm:text-xs text-yellow-600">
                        • {alert.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* ── Transaction Trends ─────────────────────────────────────────– */}
        <Card className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
          <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2.5 sm:gap-3">
            <div className="rounded-xl sm:rounded-2xl bg-[#eef2ff] p-2 sm:p-2.5 md:p-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a5ff7]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                Hourly Breakdown (Today)
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6b7280]">
                Transaction volume by hour
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {performance?.hourly_trend_today && performance.hourly_trend_today.filter((h) => h.transaction_count > 0).length > 0 ? (
              performance.hourly_trend_today.filter((h) => h.transaction_count > 0).map((hour) => (
                <div
                  key={hour.hour}
                  className="rounded-xl sm:rounded-2xl bg-[#f8fafc] p-3 sm:p-4 text-center"
                >
                  <p className="text-[11px] sm:text-xs font-medium text-[#6b7280]">
                    {hour.hour}:00
                  </p>
                  <p className="mt-1.5 sm:mt-2 text-base sm:text-lg font-bold text-[#111827]">
                    {hour.transaction_count}
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs text-[#6b7280]">
                    {formatCompactCurrency(hour.volume)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-[#6b7280] col-span-full text-center">No hourly trend data available</p>
            )}
          </div>
        </Card>

        {/* ── Footer ─────────────────────────────────────────────────────– */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-4 sm:p-6 text-center">
          <p className="text-[11px] sm:text-xs text-[#6b7280]">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}