'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Gift,
  History,
  ReceiptText,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { rewardService } from '@/services/reward.service';
import { RewardTransaction, RewardTransactionType } from '@/types/rewards.types';

const transactionTypes: { value: RewardTransactionType; label: string }[] = [
  { value: 'cashback', label: 'Cashback' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'streak', label: 'Streak' },
  { value: 'referral', label: 'Referral' },
  { value: 'first_transaction', label: 'First Transaction' },
  { value: 'redemption', label: 'Redemption' },
];

const formatCurrency = (amount?: number) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date?: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatType = (type: string) =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusClass = (status: string) => {
  if (status === 'completed') {
    return 'border-green-200 bg-green-50 text-green-700';
  }

  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-red-200 bg-red-50 text-red-700';
};

export default function RewardHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [selectedType, setSelectedType] = useState<RewardTransactionType | ''>('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [selectedType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await rewardService.getRewardTransactions(
        100,
        selectedType || undefined
      );

      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load transactions'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return transactions;

    return transactions.filter((transaction) => {
      return (
        transaction.reason?.toLowerCase().includes(keyword) ||
        transaction.type?.toLowerCase().includes(keyword) ||
        transaction.status?.toLowerCase().includes(keyword)
      );
    });
  }, [transactions, search]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'redemption') {
          acc.redeemed += Number(transaction.amount || 0);
        } else {
          acc.earned += Number(transaction.amount || 0);
        }

        acc.count += 1;
        return acc;
      },
      { earned: 0, redeemed: 0, count: 0 }
    );
  }, [transactions]);

  if (loading) return <PageSkeleton />;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {error && (
        <Card className="rounded-[28px] border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={22} />
            <p className="text-sm font-semibold leading-6 text-red-800">{error}</p>
          </div>
        </Card>
      )}

      <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              size={18}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by reason, type, or status"
              className="h-13 w-full rounded-2xl border border-[#E6E9F5] bg-[#FCFCFF] pl-11 pr-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#4A5FF7] focus:ring-4 focus:ring-[#4A5FF7]/10"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              size={18}
            />
            <select
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value as RewardTransactionType | '')
              }
              className="h-13 w-full appearance-none rounded-2xl border border-[#E6E9F5] bg-[#FCFCFF] pl-11 pr-4 text-sm font-bold text-[#111827] outline-none transition focus:border-[#4A5FF7] focus:ring-4 focus:ring-[#4A5FF7]/10"
            >
              <option value="">All Transactions</option>
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filteredTransactions.length > 0 ? (
        <Card className="overflow-hidden rounded-[32px] border border-[#E6E9F5] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead className="border-b border-[#EEF2F7] bg-[#FCFCFF]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEF2F7]">
                {filteredTransactions.map((transaction) => {
                  const isDebit = transaction.type === 'redemption';

                  return (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-[#FCFCFF]"
                    >
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE3FF] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold text-[#4A5FF7]">
                          {isDebit ? (
                            <ArrowDownLeft size={13} />
                          ) : (
                            <ArrowUpRight size={13} />
                          )}
                          {formatType(transaction.type)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-extrabold">
                        <span className={isDebit ? 'text-red-600' : 'text-green-600'}>
                          {isDebit ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      <td className="max-w-[360px] px-6 py-5 text-sm leading-6 text-[#667085]">
                        {transaction.reason}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#667085]">
                        {formatDate(transaction.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 lg:hidden">
            {filteredTransactions.map((transaction) => {
              const isDebit = transaction.type === 'redemption';

              return (
                <div
                  key={transaction.id}
                  className="rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFF] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE3FF] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold text-[#4A5FF7]">
                        {isDebit ? (
                          <ArrowDownLeft size={13} />
                        ) : (
                          <ArrowUpRight size={13} />
                        )}
                        {formatType(transaction.type)}
                      </span>

                      <p className="mt-3 text-sm font-semibold leading-6 text-[#667085]">
                        {transaction.reason}
                      </p>
                    </div>

                    <p
                      className={`shrink-0 text-sm font-extrabold ${
                        isDebit ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {isDebit ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>

                    <p className="text-xs font-bold text-[#98A2B3]">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="rounded-[32px] border border-dashed border-[#E6E9F5] bg-white py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EEF2FF] text-[#4A5FF7]">
            <History size={30} />
          </div>

          <h3 className="mt-5 text-lg font-extrabold text-[#111827]">
            No reward transactions found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
            Your reward history will appear here once you start earning cashback,
            bonuses, referrals, streak rewards, or redemptions.
          </p>
        </Card>
      )}
    </div>
  );
}