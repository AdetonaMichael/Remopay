/**
 * Ledger Accounts List Component
 * Date: June 12, 2026
 * 
 * Component for viewing and managing ledger accounts with:
 * - Account listing with filters
 * - Status and type indicators
 * - Create new account modal
 * - Pagination support
 */

'use client';

import React, { useState } from 'react';
import { LedgerAccount, AccountFilters, AccountStatus, AccountType } from '@/types/ledger.types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useLedger } from '@/hooks/useLedger';

interface LedgerAccountsListProps {
  accounts: LedgerAccount[];
  isLoading: boolean;
  pagination: any;
  filters: AccountFilters;
  onFiltersChange: (filters: AccountFilters) => void;
}

export const LedgerAccountsList: React.FC<LedgerAccountsListProps> = ({
  accounts,
  isLoading,
  pagination,
  filters,
  onFiltersChange,
}) => {
  const { createAccount, fetchAccount, updateAccountStatus, syncAccountBalance } = useLedger();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'ASSET' as AccountType,
    currency: 'NGN',
    description: '',
  });

  const accountTypeColors: Record<AccountType, string> = {
    ASSET: 'bg-blue-100 text-blue-800',
    LIABILITY: 'bg-red-100 text-red-800',
    EQUITY: 'bg-purple-100 text-purple-800',
    REVENUE: 'bg-green-100 text-green-800',
    EXPENSE: 'bg-orange-100 text-orange-800',
  };

  const statusColors: Record<AccountStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    archived: 'bg-blue-100 text-blue-800',
  };

  const handleCreateAccount = async () => {
    const result = await createAccount(formData);
    if (result) {
      setFormData({
        account_code: '',
        account_name: '',
        account_type: 'ASSET',
        currency: 'NGN',
        description: '',
      });
      setShowCreateModal(false);
    }
  };

  const handleStatusChange = async (accountId: number, newStatus: AccountStatus) => {
    await updateAccountStatus(accountId, { status: newStatus });
  };

  const handleSyncBalance = async (accountId: number) => {
    await syncAccountBalance(accountId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading accounts...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ledger Accounts</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Account
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as AccountStatus) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              type: (e.target.value as AccountType) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="ASSET">Asset</option>
          <option value="LIABILITY">Liability</option>
          <option value="EQUITY">Equity</option>
          <option value="REVENUE">Revenue</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {/* Accounts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{account.account_code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{account.account_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${accountTypeColors[account.account_type]}`}>
                    {account.account_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                  ₦{account.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[account.status]}`}>
                    {account.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <Button
                    size="sm"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                    onClick={() => handleSyncBalance(account.id)}
                  >
                    Sync
                  </Button>
                  <select
                    defaultValue={account.status}
                    onChange={(e) => handleStatusChange(account.id, e.target.value as AccountStatus)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Account</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                <input
                  type="text"
                  value={formData.account_code}
                  onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., CUSTOM_001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Custom Reserve"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value as AccountType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="REVENUE">Revenue</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Account description"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateAccount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
