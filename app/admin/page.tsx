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

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(0)}K`;
  }
  return `₦${value.toLocaleString()}`;
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
        
        console.log('[AdminDashboard] Fetching dashboard data...');
        
        // Use adminService to fetch dashboard data
        const response = await adminService.getDashboard();

        console.log('[AdminDashboard] Response received:', {
          success: response.success,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
        });

        if (response.success && response.data) {
          console.log('[AdminDashboard] Setting dashboard data');
          
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

  const handleRetry = () => {
    setRetrying(true);
    setError(null);
    
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[AdminDashboard] Retrying dashboard fetch...');
        
        const response = await adminService.getDashboard();

        if (response.success && response.data) {
          console.log('[AdminDashboard] Retry successful');
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
        <div className="w-full max-w-md rounded-[24px] border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-sm text-[#6b7280] mb-6">
            {error || 'Failed to load dashboard data. Please check your connection and try again.'}
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4a5ff7] px-6 py-2 text-sm font-medium text-white hover:bg-[#3a4fe7] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
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

  const kpiCards = [
    {
      label: 'Total Users',
      value: users.total.toLocaleString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      subtext: `${users.verified} verified (${users.verification_rate.toFixed(1)}%)`,
    },
    {
      label: 'Monthly Volume',
      value: formatCompactCurrency(transactionStats.volume_this_month),
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600',
      subtext: `Growth: ${transactionStats.month_growth_rate}`,
    },
    {
      label: 'Daily Revenue',
      value: formatCurrency(revenue.commission_today),
      icon: Wallet,
      color: 'bg-purple-50 text-purple-600',
      subtext: `Total: ${formatCompactCurrency(revenue.total_commission)}`,
    },
    {
      label: 'VTU Success Rate',
      value: `${vtuStats.success_rate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      subtext: `${vtuStats.completed_transactions.toLocaleString()} completed`,
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-[#fafafa] text-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="space-y-8 p-4 sm:p-6 md:p-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <section>
          <h1 className="text-3xl font-bold text-[#111827]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Real-time system metrics and performance analytics
          </p>
        </section>

        {/* ── KPI Cards (Horizontally Scrollable) ────────────────────────── */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-x-visible lg:grid-cols-4">
            {kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={kpi.label}
                  className="min-w-full snap-start rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] md:min-w-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#6b7280]">
                        {kpi.label}
                      </p>
                      <p className="mt-3 text-2xl font-bold text-[#111827]">
                        {kpi.value}
                      </p>
                      <p className="mt-2 text-xs text-[#6b7280]">
                        {kpi.subtext}
                      </p>
                    </div>
                    <div className={`rounded-2xl ${kpi.color} p-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Charts Grid ────────────────────────────────────────────────── */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Service Distribution */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <BarChart3 className="h-5 w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  Service Distribution
                </h3>
                <p className="text-xs text-[#6b7280]">
                  Transaction breakdown by service type
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {services.service_distribution && services.service_distribution.length > 0 ? (
                services.service_distribution.map((service) => (
                  <div key={service.type}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#111827]">
                        {service.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-[#4a5ff7]">
                        {service.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                      <div
                        className="h-full rounded-full bg-[#4a5ff7]"
                        style={{ width: `${Math.max(service.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No service distribution data available</p>
              )}
            </div>
          </Card>

          {/* Network Performance */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <Network className="h-5 w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  Network Performance
                </h3>
                <p className="text-xs text-[#6b7280]">
                  VTU transactions by network
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {services.vtu_by_network && services.vtu_by_network.length > 0 ? (
                services.vtu_by_network.map((network) => (
                  <div
                    key={network.network}
                    className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-[#111827]">
                        {network.network}
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        {network.transaction_count} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#111827]">
                        {formatCompactCurrency(network.volume)}
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        {formatCompactCurrency(network.commission)} commission
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No network performance data available</p>
              )}
            </div>
          </Card>
        </section>

        {/* ── Performance & Top Performers Grid ──────────────────────────– */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Success Rate by Type */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <TrendingUp className="h-5 w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  Success Rates
                </h3>
                <p className="text-xs text-[#6b7280]">
                  By transaction type
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {performance?.success_rate_by_type && performance.success_rate_by_type.length > 0 ? (
                performance.success_rate_by_type.map((type) => (
                  <div key={type.type}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#111827]">
                        {type.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {type.success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${type.success_rate}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#6b7280]">
                      {type.successful} of {type.total} successful
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No success rate data available</p>
              )}
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <Zap className="h-5 w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  Top Networks
                </h3>
                <p className="text-xs text-[#6b7280]">
                  By transaction volume
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {topPerformers?.top_networks && topPerformers.top_networks.length > 0 ? (
                topPerformers.top_networks.slice(0, 4).map((network, idx) => (
                  <div key={network.network} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#4a5ff7]">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-[#111827]">
                        {network.network}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#111827]">
                      {formatCompactCurrency(network.volume)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No network data available</p>
              )}
            </div>
          </Card>
        </section>

        {/* ── Recent & Health Grid ───────────────────────────────────────– */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Top Users */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <Users className="h-5 w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  Top Users
                </h3>
                <p className="text-xs text-[#6b7280]">
                  By transaction volume
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {topPerformers?.top_users_by_volume && topPerformers.top_users_by_volume.length > 0 ? (
                topPerformers.top_users_by_volume.slice(0, 5).map((user, idx) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#4a5ff7]">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          {user.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#111827]">
                      {formatCompactCurrency(user.total_volume)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No user data available</p>
              )}
            </div>
          </Card>

          {/* System Health */}
          <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef2ff] p-3">
                <Activity className="h-5 w-5 text-[#4a5ff7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  System Health
                </h3>
                <p className="text-xs text-[#6b7280]">
                  Status and alerts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Failed Transactions (24h)
                  </span>
                  <span className="text-lg font-bold text-[#111827]">
                    {health.transaction_health.failed_last_24h}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Unverified Users
                  </span>
                  <span className="text-lg font-bold text-[#111827]">
                    {health.user_health.unverified_users}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Active Offer Codes
                  </span>
                  <span className="text-lg font-bold text-[#111827]">
                    {health.offers.active_codes}
                  </span>
                </div>
              </div>

              {health?.alerts && health.alerts.length > 0 && (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-xs font-semibold text-yellow-700">
                    Alerts
                  </p>
                  <div className="mt-2 space-y-2">
                    {health.alerts.slice(0, 2).map((alert, idx) => (
                      <p key={idx} className="text-xs text-yellow-600">
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
        <Card className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-[#eef2ff] p-3">
              <Clock className="h-5 w-5 text-[#4a5ff7]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">
                Hourly Breakdown (Today)
              </h3>
              <p className="text-xs text-[#6b7280]">
                Transaction volume by hour
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            {performance?.hourly_trend_today && performance.hourly_trend_today.filter((h) => h.transaction_count > 0).length > 0 ? (
              performance.hourly_trend_today.filter((h) => h.transaction_count > 0).map((hour) => (
                <div
                  key={hour.hour}
                  className="rounded-2xl bg-[#f8fafc] p-4 text-center"
                >
                  <p className="text-xs font-medium text-[#6b7280]">
                    {hour.hour}:00
                  </p>
                  <p className="mt-2 text-lg font-bold text-[#111827]">
                    {hour.transaction_count}
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {formatCompactCurrency(hour.volume)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6b7280] col-span-full text-center">No hourly trend data available</p>
            )}
          </div>
        </Card>

        {/* ── Footer ─────────────────────────────────────────────────────– */}
        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 text-center">
          <p className="text-xs text-[#6b7280]">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
