'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import { VtuStatisticsDashboard } from '@/components/admin/VtuStatisticsDashboard';
import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { adminService } from '@/services/admin.service';
import { AdminStatisticsData } from '@/types/vtu.types';
import { formatCurrency } from '@/utils/format.utils';

export default function AdminServicesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [adminData, setAdminData] = useState<AdminStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => {
    return Boolean(user?.roles?.some((role) => role === 'admin'));
  }, [user]);

  const verifiedPercentage = useMemo(() => {
    if (!adminData?.users.total) return '0.0';

    return ((adminData.users.verified / adminData.users.total) * 100).toFixed(1);
  }, [adminData]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await adminService.getAdminDashboardComprehensive('month');

        if (response.success && response.data) {
          setAdminData(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  const overviewCards = adminData
    ? [
        {
          title: 'Total Users',
          value: adminData.users.total,
          helper: `${adminData.users.new} new this period`,
          icon: Users,
        },
        {
          title: 'Verified Users',
          value: `${verifiedPercentage}%`,
          helper: `${adminData.users.verified} verified accounts`,
          icon: ShieldCheck,
          badge: adminData.users.verified,
        },
        {
          title: 'Wallet Balance',
          value: formatCurrency(adminData.wallet.total_balance),
          helper: 'Across all users',
          icon: Wallet,
        },
        {
          title: 'Success Rate',
          value: `${adminData.performance.success_rate.toFixed(2)}%`,
          helper: 'System-wide performance',
          icon: TrendingUp,
        },
      ]
    : [];

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
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-gray-700" />
                Admin Dashboard
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                Services & Analytics
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Monitor platform growth, wallet activity, transaction insights, and
                service performance from one clean operational dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                Reporting Period
              </p>

              <p className="mt-1 text-lg font-extrabold text-black">This Month</p>
            </div>
          </div>
        </section>

        {loading && (
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {!loading && adminData && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    System Overview
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-black">
                    Platform Summary
                  </h3>
                </div>

                <Badge variant="success">Live Data</Badge>
              </div>
            </CardHeader>

            <CardBody>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100 transition-all duration-300 group-hover:scale-110" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500">
                            {item.title}
                          </p>

                          <p className="mt-3 break-words text-3xl font-black tracking-tight text-black">
                            {item.value}
                          </p>

                          <p className="mt-2 text-xs font-medium text-gray-500">
                            {item.helper}
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <div className="relative mt-4">
                          <Badge variant="success">{item.badge}</Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {!loading && adminData && adminData.wallet.transactions.length > 0 && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Wallet Transactions
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-black">
                    Transaction Summary
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <ArrowUpRight className="h-4 w-4" />
                  Monthly aggregation
                </div>
              </div>
            </CardHeader>

            <CardBody>
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                {adminData.wallet.transactions.map((txn, idx) => (
                  <div
                    key={`${txn.type}-${txn.status}-${idx}`}
                    className="flex flex-col gap-4 border-b border-gray-200 bg-white p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                        <Wallet className="h-5 w-5 text-black" />
                      </div>

                      <div>
                        <p className="font-bold capitalize text-black">{txn.type}</p>

                        <p className="text-xs text-gray-500">
                          {txn.count} transactions
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-lg font-black text-black">
                        {formatCurrency(txn.amount)}
                      </p>

                      <div className="mt-1">
                        <Badge variant={txn.status === 'success' ? 'success' : 'warning'}>
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {!loading && !adminData && (
          <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <CardBody>
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50">
                  <AlertCircle className="h-7 w-7 text-black" />
                </div>

                <h3 className="mt-5 text-xl font-black text-black">
                  No Admin Data Available
                </h3>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  We could not load the dashboard statistics at this moment. Please try
                  again later.
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <VtuStatisticsDashboard period="month" />
        </div>
      </div>
    </div>
  );
}