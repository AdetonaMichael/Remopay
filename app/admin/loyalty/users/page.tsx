'use client';

import { useState, useEffect } from 'react';
import { Users, Filter } from 'lucide-react';
import { PageSkeleton, TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import { rewardService } from '@/services/reward.service';
import { AdminLoyaltyUser } from '@/types/rewards.types';

export default function AdminLoyaltyUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminLoyaltyUser[]>([]);
  const [error, setError] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | 'Bronze' | 'Silver' | 'Gold'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await rewardService.getAllUsersWithLoyalty(100);
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesTier = tierFilter === 'All' || user.tier === tierFilter;
    const matchesSearch = searchTerm === '' ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    return matchesTier && matchesSearch;
  });

  const tierColors = {
    Bronze: 'bg-amber-100 text-amber-800',
    Silver: 'bg-slate-100 text-slate-800',
    Gold: 'bg-yellow-100 text-yellow-800',
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Users</h1>
          <p className="mt-2 text-gray-600">Manage users by loyalty tier</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">{filteredUsers.length} users</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option>All</option>
              <option>Bronze</option>
              <option>Silver</option>
              <option>Gold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Search</label>
            <Input
              placeholder="Email or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadUsers}
              className="w-full px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              <Filter className="inline h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Tier
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Transactions
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Total Volume
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Total Funding
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Days Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">#{user.id}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={tierColors[user.tier as keyof typeof tierColors]}>
                        {user.tier}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {user.transaction_count}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      ₦{user.total_volume.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      ₦{user.total_funding.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {user.days_active}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-gray-600">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
    </div>
  );
}
