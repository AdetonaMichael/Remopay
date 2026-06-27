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
  Eye,
  RefreshCw,
  Zap,
  Clock,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { useAuthStore } from '@/store/auth.store';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';
import { formatCurrency } from '@/utils/format.utils';
import { adminService } from '@/services/admin.service';
import { paymentService } from '@/services/payment.service';
import { AdminStatisticsData } from '@/types/vtu.types';

function formatCompactCurrency(value: number | null | undefined): string {
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

function formatFullCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₦0.00';
  }
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatUSDCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: 'default' | 'success' | 'danger' | 'warning' | 'info'; text: string }> = {
    success: { variant: 'success', text: 'Success' },
    pending: { variant: 'warning', text: 'Pending' },
    failed: { variant: 'danger', text: 'Failed' },
  };
  const config = statusConfig[status?.toLowerCase()] || { variant: 'default', text: status };
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<AdminStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const [providerBalances, setProviderBalances] = useState<{
    paystack: number | null;
    vtpass: number | null;
    maplerad: number | null;
    telnyx: number | null;
  }>({ paystack: null, vtpass: null, maplerad: null, telnyx: null });
  const [balancesLoading, setBalancesLoading] = useState(true);

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

        const response = await adminService.getAdminDashboardComprehensive(selectedPeriod);
        console.log('[AdminDashboard] API Response:', response);
        console.log('[AdminDashboard] Response Data:', response.data);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          throw new Error(response.message || 'Invalid dashboard response');
        }
      } catch (err: any) {
        console.error('[AdminDashboard] Error fetching dashboard:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };

    if (isAdmin) {
      fetchDashboard();
    }
  }, [isAdmin, selectedPeriod]);

  useEffect(() => {
    const fetchProviderBalances = async () => {
      try {
        setBalancesLoading(true);
        const balances: {
          paystack: number | null;
          vtpass: number | null;
          maplerad: number | null;
          telnyx: number | null;
        } = { paystack: null, vtpass: null, maplerad: null, telnyx: null };

        try {
          const paystackResponse = await paymentService.getPaystackBalance();
          let balanceValue: any = null;
          if (paystackResponse?.data && Array.isArray(paystackResponse.data) && paystackResponse.data.length > 0) {
            balanceValue = paystackResponse.data[0].balance;
          } else if (paystackResponse?.data?.data && Array.isArray(paystackResponse.data.data)) {
            balanceValue = paystackResponse.data.data[0].balance;
          } else if (typeof (paystackResponse as any)?.balance === 'number') {
            balanceValue = (paystackResponse as any).balance;
          }
          const balanceNum = typeof balanceValue === 'string' ? parseFloat(balanceValue) : balanceValue;
          if (!isNaN(balanceNum)) {
            balances.paystack = balanceNum / 100;
          }
        } catch (err: any) {
          console.error('[AdminDashboard] Paystack balance error:', err);
        }

        try {
          const vtpassResponse = await paymentService.getVTPassBalance();
          if (vtpassResponse.code === 1 && vtpassResponse.contents?.balance) {
            balances.vtpass = parseFloat(vtpassResponse.contents.balance);
          }
        } catch (err: any) {
          console.warn('[AdminDashboard] VTPass balance error:', err);
        }

        try {
          const mapleradResponse = await paymentService.getMapleradBalance();
          const balanceValue = typeof mapleradResponse.data?.balance === 'string'
            ? parseFloat(mapleradResponse.data.balance)
            : mapleradResponse.data?.balance;
          if (!isNaN(balanceValue)) {
            balances.maplerad = balanceValue;
          }
        } catch (err: any) {
          console.error('[AdminDashboard] Maplerad error:', err);
        }

        try {
          const telnyxResponse = await paymentService.getTelnyxBalance();
          const creditValue = telnyxResponse.data?.available_credit;
          const balanceValue = typeof creditValue === 'string' ? parseFloat(creditValue) : creditValue;
          if (!isNaN(balanceValue)) {
            balances.telnyx = balanceValue;
          }
        } catch (err: any) {
          console.error('[AdminDashboard] Telnyx error:', err);
        }

        setProviderBalances(balances);
      } finally {
        setBalancesLoading(false);
      }
    };

    fetchProviderBalances();
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    setLoading(true);

    try {
      const response = await adminService.getAdminDashboardComprehensive(selectedPeriod);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Invalid dashboard response');
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Retry failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="w-full max-w-md rounded-3xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-[#111827] mb-2">Unable to Load Dashboard</h3>
          <p className="text-sm text-[#6b7280] mb-6">{error || 'Failed to load dashboard data.'}</p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-lg bg-[#d71927] px-6 py-2 text-sm font-medium text-white hover:bg-[#b01620] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const verifiedRate = data.users.total ? (data.users.verified / data.users.total) * 100 : 0;
  const totalVtuVolume = data.vtu.by_product_type.reduce((sum, item) => sum + (item.total_amount || 0), 0);

  const kpiCards = [
    {
      label: 'Total Users',
      value: data.users.total.toLocaleString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      subtext: `${data.users.verified.toLocaleString()} verified (${verifiedRate.toFixed(1)}%)`,
    },
    {
      label: 'New Users (Period)',
      value: data.users.new.toLocaleString(),
      icon: Eye,
      color: 'bg-slate-50 text-slate-700',
      subtext: `This ${data.period}`,
    },
    {
      label: 'Total Transactions',
      value: data.performance.total_transactions.toLocaleString(),
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600',
      subtext: `${data.performance.successful_transactions.toLocaleString()} successful`,
    },
    {
      label: 'Success Rate',
      value: `${data.performance.success_rate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      subtext: `${data.performance.failed_transactions.toLocaleString()} failed`,
    },
    {
      label: 'Wallet Balance',
      value: formatCurrency(data.wallet.total_balance),
      icon: Wallet,
      color: 'bg-indigo-50 text-indigo-600',
      subtext: `${data.wallet.transactions.length} transaction types`,
    },
    {
      label: 'VTU Total Volume',
      value: formatCompactCurrency(data.vtu.summary.total_amount),
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600',
      subtext: `${data.vtu.summary.total_transactions.toLocaleString()} transactions`,
    },
    {
      label: 'Total Commission',
      value: formatCompactCurrency(data.vtu.summary.total_commission),
      icon: TrendingUp,
      color: 'bg-cyan-50 text-cyan-600',
      subtext: 'VTU earnings',
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-[#fafafa]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              {data.period.charAt(0).toUpperCase() + data.period.slice(1)} • {data.start_date} — {data.end_date}
            </p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((opt) => (
              <Button
                key={opt}
                variant={selectedPeriod === opt ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedPeriod(opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#6b7280]">{card.label}</p>
                    <p className="mt-3 text-2xl font-bold text-[#111827]">{card.value}</p>
                    <p className="mt-2 text-sm text-[#6b7280]">{card.subtext}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* VTU Performance & Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* VTU by Product Type */}
          <Card className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">VTU by Product Type</h2>
                <p className="text-sm text-[#6b7280]">Volume distribution</p>
              </div>
              <Badge variant="info">{data.vtu.by_product_type.length} types</Badge>
            </div>
            <div className="space-y-4">
              {data.vtu.by_product_type.length > 0 ? (
                data.vtu.by_product_type.map((item) => {
                  const pct = totalVtuVolume ? (item.total_amount / totalVtuVolume) * 100 : 0;
                  return (
                    <div key={item.type}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium text-[#111827]">{item.type}</p>
                        <p className="text-sm font-semibold text-[#4a5ff7]">{pct.toFixed(1)}%</p>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-[#eef2ff]">
                        <div className="h-full bg-[#4a5ff7]" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-[#6b7280]">
                        <span>{item.count} txns</span>
                        <span>{formatCurrency(item.total_amount)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-[#6b7280]">No data available</p>
              )}
            </div>
          </Card>

          {/* VTU by Status */}
          <Card className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">VTU by Status</h2>
                <p className="text-sm text-[#6b7280]">Transaction outcomes</p>
              </div>
              <Badge variant="default">{data.vtu.by_status.length} statuses</Badge>
            </div>
            <div className="space-y-3">
              {data.vtu.by_status.map((status) => (
                <div key={status.status} className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#111827] capitalize">{status.status}</p>
                      <p className="text-xs text-[#6b7280]">{status.count.toLocaleString()} transactions</p>
                    </div>
                    {getStatusBadge(status.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white p-2">
                      <p className="text-xs text-[#6b7280]">Amount</p>
                      <p className="font-semibold text-[#111827]">{formatCurrency(status.total_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2">
                      <p className="text-xs text-[#6b7280]">Commission</p>
                      <p className="font-semibold text-[#111827]">{formatCurrency(status.total_commission)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Wallet & Provider Balances */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Wallet Transactions</h2>
                <p className="text-sm text-[#6b7280]">By type and status</p>
              </div>
              <Badge variant="default">{data.wallet.transactions.length} types</Badge>
            </div>
            <div className="space-y-3">
              {data.wallet.transactions.map((item) => (
                <div key={`${item.type}-${item.status}`} className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#111827]">{item.type}</p>
                      <p className="text-xs text-[#6b7280]">{item.count.toLocaleString()} transactions</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xl font-bold text-[#111827]">{formatCompactCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#111827]">Provider Balances</h2>
              <p className="text-sm text-[#6b7280]">Live balances</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Paystack', balance: providerBalances.paystack, fmt: formatFullCurrency },
                { label: 'VTPass', balance: providerBalances.vtpass, fmt: formatFullCurrency },
                { label: 'Maplerad', balance: providerBalances.maplerad, fmt: formatFullCurrency },
                { label: 'Telnyx', balance: providerBalances.telnyx, fmt: formatUSDCurrency },
              ].map((p) => (
                <div key={p.label} className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
                  <p className="text-sm font-semibold text-[#111827]">{p.label}</p>
                  <p className="mt-2 text-lg font-bold text-[#111827]">{p.fmt(p.balance)}</p>
                  <p className="text-xs text-[#6b7280]">{balancesLoading ? 'Loading...' : 'Updated'}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary */}
        <Card className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111827]">Summary</h2>
            <p className="text-xs text-[#6b7280]">Period: {data.period}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Start Date', value: data.start_date },
              { label: 'End Date', value: data.end_date },
              { label: 'Total VTU Txns', value: data.vtu.summary.total_transactions.toLocaleString() },
              { label: 'Wallet Balance', value: formatCurrency(data.wallet.total_balance) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="text-xs text-[#6b7280]">{item.label}</p>
                <p className="mt-2 font-semibold text-[#111827]">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
