'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Phone,
  ReceiptText,
  TrendingUp,
  Tv,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';
import { walletService } from '@/services/wallet.service';
import { transactionService } from '@/services/transaction.service';
import { customerService, DedicatedAccount } from '@/services/customer.service';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatRelativeTime } from '@/utils/format.utils';
import { TRANSACTION_STATUSES } from '@/utils/constants';

type WalletData = {
  balance: number;
  currency?: string;
  total_spent?: number;
};

type TransactionData = {
  id: string | number;
  type?: string;
  transaction_type?: string;
  provider?: string;
  amount: number | string;
  status: string;
  created_at?: string;
  transaction_date?: string;
  reference?: string;
  metadata?: Record<string, any>;
  service_logo?: string | null;
};

const quickActions = [
  {
    href: '/dashboard/airtime',
    label: 'Buy Airtime',
    description: 'Top up any network instantly',
    icon: Phone,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    href: '/dashboard/data',
    label: 'Buy Data',
    description: 'Activate data plans in seconds',
    icon: Wifi,
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    href: '/dashboard/bills',
    label: 'Pay Bills',
    description: 'Electricity, utilities and tokens',
    icon: Zap,
    image:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    href: '/dashboard/tv',
    label: 'TV Subscription',
    description: 'Renew DSTV, GOtv and more',
    icon: Tv,
    image:
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80',
  },
];

const getTransactionIcon = (type: string, status: string) => {
  const normalizedStatus = status?.toLowerCase?.() || '';

  if (normalizedStatus === 'success') {
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  }

  if (normalizedStatus === 'pending') {
    return <Clock className="h-5 w-5 text-amber-500" />;
  }

  if (normalizedStatus === 'failed') {
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  }

  return <CreditCard className="h-5 w-5 text-[#d71927]" />;
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [dedicatedAccount, setDedicatedAccount] = useState<DedicatedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Fetch customer dedicated account info
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!user?.email) return;

      try {
        setAccountLoading(true);
        const response = await customerService.getCurrentUserAccount(user.email);
        if (response.data?.customer?.dedicatedAccount) {
          setDedicatedAccount(response.data.customer.dedicatedAccount);
        }
      } catch (err) {
        console.error('Error fetching dedicated account info:', err);
        // Don't set error state for this - it's optional information
      } finally {
        setAccountLoading(false);
      }
    };

    fetchAccountInfo();
  }, [user?.email]);

  // Fetch wallet and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [walletRes, transactionsRes] = await Promise.all([
          walletService.getBalance(),
          user?.id
            ? transactionService.getTransactions(String(user.id), {
                page: currentPage,
                per_page: 10,
              })
            : Promise.resolve(null),
        ]);

        if (walletRes?.data) {
          setWallet(walletRes.data as WalletData);
        }

        if (transactionsRes?.data?.transactions) {
          setTransactions(transactionsRes.data.transactions);

          if (transactionsRes.data.pagination) {
            setPagination({
              currentPage: transactionsRes.data.pagination.current_page || currentPage,
              lastPage: transactionsRes.data.pagination.last_page || 1,
              total: transactionsRes.data.pagination.total || 0,
              perPage: transactionsRes.data.pagination.per_page || 10,
            });
          }
        } else if (Array.isArray(transactionsRes?.data?.transactions)) {
          setTransactions(transactionsRes.data.transactions);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, currentPage]);

  const monthlyTransactionsCount = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions.filter((transaction) => {
      const dateStr = transaction.created_at || transaction.transaction_date;
      if (!dateStr) return false;

      const createdAt = new Date(dateStr);

      return (
        createdAt.getMonth() === currentMonth &&
        createdAt.getFullYear() === currentYear
      );
    }).length;
  }, [transactions]);

  const successfulTransactionsCount = useMemo(() => {
    return transactions.filter(
      (transaction) => transaction.status?.toLowerCase() === 'success'
    ).length;
  }, [transactions]);

  const getTransactionTimestamp = (transaction: TransactionData): string => {
    return transaction.created_at || transaction.transaction_date || 'Unknown';
  };

  const getTransactionTypeLabel = (transaction: TransactionData): string => {
    return transaction.transaction_type || transaction.type || 'Transaction';
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#140404] p-6 text-white shadow-xl shadow-[#d71927]/10 lg:p-8">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#d71927]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#ff737b]/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="hidden lg:block">
            <p className="caption font-semibold text-[#ff737b]">Welcome back</p>

            <h1 className="mt-2 h2">
              Hi {user?.first_name || 'there'}, manage your Remopay.
            </h1>

            <p className="mt-3 max-w-2xl body-sm text-white/65">
              Buy airtime, data, pay bills, track your transactions and manage
              your payment activities from one clean dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/airtime"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d71927] px-5 py-3 button-md text-white shadow-lg shadow-[#d71927]/25 hover:bg-[#b91420]"
              >
                Start Transaction
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/dashboard/history"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 button-md text-white hover:bg-white/15"
              >
                View History
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              {/* Top Left - Balance */}
              <div className="col-span-2">
                <p className="caption font-semibold text-white/55">Available Balance</p>
                <h2 className="mt-1.5 text-3xl font-black">
                  {wallet ? formatCurrency(wallet.balance, wallet.currency) : '₦0.00'}
                </h2>
              </div>

              {/* Bottom Left - Dedicated Account (if exists) */}
              {dedicatedAccount && (
                <div className="col-span-2 border-t border-white/10 pt-3 space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">Account</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <p className="font-mono text-sm font-bold text-white">
                        {dedicatedAccount.account_number}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(dedicatedAccount.account_number);
                        }}
                        className="inline-flex items-center justify-center rounded-md bg-white/15 p-1 text-white/70 hover:bg-white/25 transition-colors flex-shrink-0"
                        title="Copy account number"
                      >
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2z" />
                          <path d="M2 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2.5a.5.5 0 0 0-1 0V16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.5a.5.5 0 0 0 0-1H2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 font-semibold">{dedicatedAccount.bank_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-5 overflow-x-auto md:grid md:grid-cols-3 pb-2 -mx-6 px-6 md:mx-0 md:px-0">
        <Card className="min-w-[calc(100%-2rem)] md:min-w-fit rounded-[1.5rem] border border-[#d71927]/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="caption font-semibold text-gray-500">Monthly Transactions</p>
              <p className="mt-3 h2 text-gray-950">
                {monthlyTransactionsCount}
              </p>
              <p className="mt-2 body-sm text-gray-500">Transactions this month</p>
            </div>

            <div className="rounded-2xl bg-[#fff1f2] p-3">
              <TrendingUp className="h-5 w-5 text-[#d71927]" />
            </div>
          </div>
        </Card>

        <Card className="min-w-[calc(100%-2rem)] md:min-w-fit rounded-[1.5rem] border border-[#d71927]/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="caption font-semibold text-gray-500">Successful Payments</p>
              <p className="mt-3 h2 text-gray-950">
                {successfulTransactionsCount}
              </p>
              <p className="mt-2 body-sm text-gray-500">Completed transactions</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="min-w-[calc(100%-2rem)] md:min-w-fit rounded-[1.5rem] border border-[#d71927]/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="caption font-semibold text-gray-500">Total Records</p>
              <p className="mt-3 h2 text-gray-950">
                {pagination.total || transactions.length}
              </p>
              <p className="mt-2 body-sm text-gray-500">Transaction records</p>
            </div>

            <div className="rounded-2xl bg-[#fff1f2] p-3">
              <ReceiptText className="h-5 w-5 text-[#d71927]" />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="h3 text-gray-950">Quick Actions</h2>
            <p className="mt-1 body-sm text-gray-500">
              Complete your most common Remopay transactions faster.
            </p>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto sm:grid sm:grid-cols-2 xl:grid-cols-4 pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group min-w-[calc(100vw-2rem)] sm:min-w-fit overflow-hidden rounded-[1.5rem] border border-[#d71927]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#d71927]/10"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={action.image}
                    alt={action.label}
                    className="h-full w-full object-cover brightness-95 contrast-110 saturate-110 transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d71927] text-white shadow-lg">
                    <Icon size={22} />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="h5 font-bold text-gray-950">{action.label}</h3>
                  <p className="mt-2 body-sm text-gray-500">
                    {action.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="button-sm text-[#d71927]">Continue</span>
                    <ArrowRight className="h-4 w-4 text-[#d71927] transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <Card className="overflow-hidden rounded-[1.5rem] border border-[#d71927]/10 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-950">Recent Transactions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your latest Remopay activities and payment records.
              </p>
            </div>

            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d71927]/15 px-4 py-2 text-sm font-black text-[#d71927] hover:bg-[#fff1f2]"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
              <p className="font-semibold text-gray-900">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center">
              <ReceiptText className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <h3 className="font-black text-gray-950">No transactions yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your transaction history will appear here once you start using Remopay.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="bg-[#fff7f7]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                        Transaction
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                        Reference
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-gray-500">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => {
                      const status =
                        TRANSACTION_STATUSES[
                          transaction.status as keyof typeof TRANSACTION_STATUSES
                        ];

                      const typeLabel = getTransactionTypeLabel(transaction);
                      const timestamp = getTransactionTimestamp(transaction);

                      return (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100 transition hover:bg-[#fffafa]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f2]">
                                {getTransactionIcon(typeLabel, transaction.status)}
                              </div>

                              <div>
                                <p className="text-sm font-black text-gray-950">
                                  {typeLabel}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {transaction.provider || 'Remopay'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {transaction.reference ? (
                              <code className="rounded-lg bg-[#fff1f2] px-2 py-1 text-xs font-bold text-[#d71927]">
                                {transaction.reference}
                              </code>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-black text-gray-950">
                              {formatCurrency(Number(transaction.amount))}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <Badge
                              variant={
                                status?.color === 'success'
                                  ? 'success'
                                  : status?.color === 'warning'
                                    ? 'warning'
                                    : status?.color === 'error'
                                      ? 'danger'
                                      : 'default'
                              }
                            >
                              {status?.label || transaction.status}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-gray-500">
                            {timestamp !== 'Unknown'
                              ? formatRelativeTime(timestamp)
                              : 'Unknown'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-100 lg:hidden">
                {transactions.map((transaction) => {
                  const status =
                    TRANSACTION_STATUSES[
                      transaction.status as keyof typeof TRANSACTION_STATUSES
                    ];

                  const typeLabel = getTransactionTypeLabel(transaction);
                  const timestamp = getTransactionTimestamp(transaction);

                  return (
                    <div key={transaction.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1f2]">
                            {getTransactionIcon(typeLabel, transaction.status)}
                          </div>

                          <div>
                            <p className="font-black text-gray-950">{typeLabel}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {timestamp !== 'Unknown'
                                ? formatRelativeTime(timestamp)
                                : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <p className="font-black text-gray-950">
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge
                          variant={
                            status?.color === 'success'
                              ? 'success'
                              : status?.color === 'warning'
                                ? 'warning'
                                : status?.color === 'error'
                                  ? 'danger'
                                  : 'default'
                          }
                        >
                          {status?.label || transaction.status}
                        </Badge>

                        {transaction.reference && (
                          <code className="rounded-lg bg-[#fff1f2] px-2 py-1 text-xs font-bold text-[#d71927]">
                            {transaction.reference}
                          </code>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 p-5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <p className="text-sm font-semibold text-gray-500">
                    Page {pagination.currentPage} of {pagination.lastPage}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, pagination.lastPage))
                    }
                    disabled={currentPage >= pagination.lastPage}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </section>
    </div>
  );
}