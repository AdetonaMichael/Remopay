'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Activity,
  Network,
  RefreshCw,
  Zap,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { AdminDashboardCharts } from '@/components/admin/AdminDashboardCharts';
import { useAuthStore } from '@/store/auth.store';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';
import { formatCurrency } from '@/utils/format.utils';
import { adminService } from '@/services/admin.service';
import { paymentService } from '@/services/payment.service';
import { AdminStatisticsData } from '@/types/vtu.types';

function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '₦0';
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value.toLocaleString()}`;
}

function formatFullCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '₦0.00';
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatUSDCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<AdminStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [providerBalances, setProviderBalances] = useState({ paystack: 0, vtpass: 0, maplerad: 0, telnyx: 0 });

  const isAdmin = useMemo(() => Boolean(user?.roles?.some((r) => r === 'admin')), [user]);

  useEffect(() => {
    if (user && !isAdmin) router.push('/dashboard');
  }, [user, isAdmin, router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAdminDashboardComprehensive(selectedPeriod);
        if (res.success && res.data) {
          setData(res.data);
          setError(null);
        } else {
          setError('Invalid response');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetch();
  }, [isAdmin, selectedPeriod]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const balances = { paystack: 0, vtpass: 0, maplerad: 0, telnyx: 0 };

        try {
          const res = await paymentService.getPaystackBalance();
          const data = Array.isArray(res?.data) ? res.data[0] : null;
          const b = data?.balance || 0;
          balances.paystack = (typeof b === 'string' ? parseFloat(b) : b) / 100;
        } catch {}

        try {
          const res = await paymentService.getVTPassBalance();
          balances.vtpass = res.code === 1 ? parseFloat(res.contents?.balance || '0') : 0;
        } catch {}

        try {
          const res = await paymentService.getMapleradBalance();
          balances.maplerad = res.success ? parseFloat(res.data?.balance || '0') : 0;
        } catch {}

        try {
          const res = await paymentService.getTelnyxBalance();
          balances.telnyx = res.success ? parseFloat(res.data?.available_credit || '0') : 0;
        } catch {}

        setProviderBalances(balances);
      } catch {}
    };

    fetchBalances();
  }, []);

  if (!isAdmin) return null;
  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-[#6b7280] mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  const verifiedRate = data.users.total ? (data.users.verified / data.users.total) * 100 : 0;
  const totalVtuVolume = data.vtu.by_product_type.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const kpiCards = [
    { label: 'Total Users', value: data.users.total.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'New Users', value: data.users.new.toLocaleString(), icon: Users, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Total Transactions', value: data.performance.total_transactions.toLocaleString(), icon: CreditCard, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Success Rate', value: `${data.performance.success_rate.toFixed(1)}%`, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: 'Wallet Balance', value: formatCurrency(data.wallet.total_balance), icon: Wallet, color: 'bg-purple-50 text-purple-600' },
    { label: 'VTU Volume', value: formatCompactCurrency(data.vtu.summary.total_amount), icon: BarChart3, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Commission', value: formatCompactCurrency(data.vtu.summary.total_commission), icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-[#fafafa]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Admin Dashboard</h1>
            <p className="text-sm text-[#6b7280] mt-1">{data.period.toUpperCase()} • {data.start_date} — {data.end_date}</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <Button key={p} variant={selectedPeriod === p ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="p-6 rounded-2xl border border-[#e5e7eb]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#6b7280]">{kpi.label}</p>
                    <p className="text-2xl font-bold text-[#111827] mt-3">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* VTU Charts Grid */}
        <AdminDashboardCharts vtuByProduct={data.vtu.by_product_type} vtuByStatus={data.vtu.by_status} walletTransactions={data.wallet.transactions} />

        {/* Provider Balances */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 rounded-2xl border border-[#e5e7eb]">
            <h3 className="text-lg font-semibold mb-6">Provider Balances</h3>
            <div className="space-y-3">
              <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">Paystack</p><p className="font-bold text-lg mt-1">{formatFullCurrency(providerBalances.paystack)}</p></div>
              <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">VTPass</p><p className="font-bold text-lg mt-1">{formatFullCurrency(providerBalances.vtpass)}</p></div>
              <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">Maplerad</p><p className="font-bold text-lg mt-1">{formatFullCurrency(providerBalances.maplerad)}</p></div>
              <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">Telnyx</p><p className="font-bold text-lg mt-1">{formatUSDCurrency(providerBalances.telnyx)}</p></div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-6 rounded-2xl border border-[#e5e7eb]">
          <h3 className="text-lg font-semibold mb-6">Reporting Period</h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">Period</p><p className="font-bold mt-2">{data.period.toUpperCase()}</p></div>
            <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">Start</p><p className="font-bold mt-2">{data.start_date}</p></div>
            <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">End</p><p className="font-bold mt-2">{data.end_date}</p></div>
            <div className="bg-[#f8fafc] p-4 rounded-xl"><p className="text-[#6b7280] text-xs">Transactions</p><p className="font-bold mt-2">{data.vtu.summary.total_transactions}</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
