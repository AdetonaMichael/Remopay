'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Filter,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { FilterPanel, type FilterField } from '@/components/shared/FilterPanel';
import { useFilters } from '@/hooks/useFilters';
import { rewardService } from '@/services/reward.service';
import { AdminLoyaltyUser } from '@/types/rewards.types';

const formatMoney = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const tierColors = {
  Bronze:
    'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-800',
  Silver:
    'bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10',
  Gold:
    'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:ring-yellow-800',
};

const LOYALTY_USER_FILTER_FIELDS: FilterField[] = [
  {
    id: 'search',
    label: 'Search',
    type: 'text',
    helpText: 'Search by email or user ID',
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'select',
    options: [
      { label: 'Bronze', value: 'Bronze' },
      { label: 'Silver', value: 'Silver' },
      { label: 'Gold', value: 'Gold' },
    ],
  },
];

export default function AdminLoyaltyUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminLoyaltyUser[]>([]);
  const [error, setError] = useState('');

  const { filters, isOpen, openFilters, closeFilters, applyFilters, resetFilters, hasActiveFilters, getActiveFilterCount } = useFilters({
    fields: LOYALTY_USER_FILTER_FIELDS,
    onFiltersChange: async () => {
      await loadUsers();
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await rewardService.getAllUsersWithLoyalty(100);
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = filters.search ? filters.search.trim().toLowerCase() : '';

    return users.filter((user) => {
      const matchesTier = !filters.tier || user.tier === filters.tier;

      const matchesSearch =
        query === '' ||
        (user.email?.toLowerCase?.().includes(query) ?? false) ||
        (user.id?.toString?.().includes(query) ?? false);

      return matchesTier && matchesSearch;
    });
  }, [users, filters]);

  const totalUsers = users.length;
  const goldUsers = users.filter((user) => user.tier === 'Gold').length;
  const totalVolume = users.reduce((sum, user) => sum + (user.total_volume || 0), 0);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#faf7f7] px-4 py-6 text-slate-950 dark:bg-[#090707] dark:text-white sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#620707]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#120d0d] md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#620707]/10 blur-3xl dark:bg-[#ffdddd]/10" />
        <div className="absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#620707]/15 bg-[#620707]/5 px-3 py-1 text-xs font-bold text-[#620707] dark:border-white/10 dark:bg-white/5 dark:text-[#ffb3b3]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Remopay Loyalty Users
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Loyalty User Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Review users across Bronze, Silver, and Gold tiers, including
              transaction count, funding activity, volume, and active days.
            </p>
          </div>

          <button
            onClick={loadUsers}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#620707] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d0505] sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Users
          </button>
        </div>
      </div>

      {error && (
        <Card className="rounded-3xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-300" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden rounded-3xl border border-[#620707]/10 bg-[#620707] p-6 text-white shadow-sm">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/75">
                Total Loyalty Users
              </p>
              <h2 className="mt-3 text-3xl font-black">
                {totalUsers.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <Users className="h-7 w-7" />
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-yellow-200 bg-white p-6 shadow-sm dark:border-yellow-900/50 dark:bg-[#120d0d]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Gold Tier Users
              </p>
              <h2 className="mt-3 text-3xl font-black text-yellow-700 dark:text-yellow-300">
                {goldUsers.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-3 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
              <Trophy className="h-7 w-7" />
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#120d0d]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total User Volume
              </p>
              <h2 className="mt-3 text-2xl font-black">
                {formatMoney(totalVolume)}
              </h2>
            </div>

            <div className="rounded-2xl bg-[#620707]/10 p-3 text-[#620707] dark:bg-white/10 dark:text-[#ffb3b3]">
              <Filter className="h-7 w-7" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Button */}
      <div className="flex gap-2">
        <Button onClick={openFilters} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        title="Filter Loyalty Users"
        description="Search and filter by tier to find specific loyalty users."
        isOpen={isOpen}
        fields={LOYALTY_USER_FILTER_FIELDS}
        onApply={applyFilters}
        onClose={closeFilters}
        onReset={resetFilters}
      />

      {/* Users Table */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#120d0d]">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <h2 className="text-lg font-black">Loyalty Users</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredUsers.length.toLocaleString()} of{' '}
            {users.length.toLocaleString()} users.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              <tr>
                {[
                  'User',
                  'Tier',
                  'Transactions',
                  'Total Volume',
                  'Total Funding',
                  'Days Active',
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
                      ['Transactions', 'Total Volume', 'Total Funding', 'Days Active'].includes(
                        heading,
                      )
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#620707]/5 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          #{user.id || 'N/A'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {user.email || 'No email'}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          tierColors[(user.tier as keyof typeof tierColors) || 'Bronze'] || tierColors.Bronze
                        }`}
                      >
                        {user.tier || 'Unknown'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">
                      {(user.transaction_count || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">
                      {formatMoney(user.total_volume || 0)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">
                      {formatMoney(user.total_funding || 0)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">
                      {(user.days_active || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-3xl bg-[#620707]/10 p-5 text-[#620707] dark:bg-white/10 dark:text-[#ffb3b3]">
                        <Users className="h-8 w-8" />
                      </div>

                      <h3 className="mt-5 text-lg font-black">
                        No users found
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Try adjusting your tier filter or search term to find
                        matching loyalty users.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}