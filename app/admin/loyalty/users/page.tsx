'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Filter,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Trophy,
  Wallet,
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
  Bronze: 'border border-gray-200 bg-gray-50 text-gray-700',
  Silver: 'border border-gray-300 bg-gray-100 text-gray-800',
  Gold: 'border border-black bg-black text-white',
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

  const {
    filters,
    isOpen,
    openFilters,
    closeFilters,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount,
  } = useFilters({
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
  const totalVolume = users.reduce(
    (sum, user) => sum + (user.total_volume || 0),
    0,
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

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
                <ShieldCheck className="h-3.5 w-3.5 text-gray-700" />
                Loyalty Users
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                Loyalty User Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Review users across Bronze, Silver, and Gold tiers, including
                transaction count, wallet funding, total volume, and active days.
              </p>
            </div>

            <Button
              onClick={loadUsers}
              variant="secondary"
              size="sm"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-700 hover:bg-gray-100 sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Users
            </Button>
          </div>
        </section>

        {error && (
          <Card className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                <AlertCircle className="h-5 w-5 text-black" />
              </div>

              <div>
                <h3 className="text-sm font-black text-black">
                  Unable to Load Loyalty Users
                </h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Total Loyalty Users
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-black">
                    {totalUsers.toLocaleString()}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Users in loyalty program
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Gold Tier Users
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-black">
                    {goldUsers.toLocaleString()}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Premium loyalty users
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Total User Volume
                  </p>

                  <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-black">
                    {formatMoney(totalVolume)}
                  </h2>

                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Combined transaction volume
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-black">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-black">Filter Loyalty Users</p>
            <p className="mt-1 text-xs text-gray-500">
              Search by email, user ID, or narrow the list by loyalty tier.
            </p>
          </div>

          <Button
            onClick={openFilters}
            variant="secondary"
            size="sm"
            className="w-full rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters {hasActiveFilters ? `(${getActiveFilterCount()})` : ''}
          </Button>
        </div>

        <FilterPanel
          title="Filter Loyalty Users"
          description="Search and filter by tier to find specific loyalty users."
          isOpen={isOpen}
          fields={LOYALTY_USER_FILTER_FIELDS}
          onApply={applyFilters}
          onClose={closeFilters}
          onReset={resetFilters}
        />

        <Card className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                Loyalty Directory
              </p>

              <h2 className="mt-1 text-2xl font-black text-black">
                Loyalty Users
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredUsers.length.toLocaleString()} of{' '}
                {users.length.toLocaleString()} users.
              </p>
            </div>

            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                variant="secondary"
                size="sm"
                className="w-full rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 sm:w-auto"
              >
                Reset Filters
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="border-b border-gray-200 bg-gray-50">
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
                      className={`px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-gray-500 ${
                        [
                          'Transactions',
                          'Total Volume',
                          'Total Funding',
                          'Days Active',
                        ].includes(heading)
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-black text-black">
                            #{user.id || 'N/A'}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {user.email || 'No email'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            tierColors[
                              (user.tier as keyof typeof tierColors) || 'Bronze'
                            ] || tierColors.Bronze
                          }`}
                        >
                          {user.tier || 'Unknown'}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-black">
                        {(user.transaction_count || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-black">
                        {formatMoney(user.total_volume || 0)}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-black">
                        {formatMoney(user.total_funding || 0)}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-black">
                        {(user.days_active || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50">
                          <Users className="h-7 w-7 text-black" />
                        </div>

                        <h3 className="mt-5 text-lg font-black text-black">
                          No Users Found
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
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
    </div>
  );
}