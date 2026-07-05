'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Filter,
  Eye,
  ImageIcon,
} from 'lucide-react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminStats } from '@/components/admin/AdminStats';
import { TransactionCharts } from '@/components/admin/TransactionCharts';
import { FilterPanel, type FilterField } from '@/components/shared/FilterPanel';
import { useFilters } from '@/hooks/useFilters';
import { Button } from '@/components/shared/Button';
import { useAuthStore } from '@/store/auth.store';
import { adminService } from '@/services/admin.service';
import { formatCurrency, formatDate } from '@/utils/format.utils';
import { Modal } from '@/components/shared/Modal';
import { Card } from '@/components/shared/Card';
import type { TransactionUser } from '@/types/api.types';

interface Transaction {
  id: string | number;
  user_id: number;
  transaction_type: string;
  amount: string | number;
  status: string;
  transaction_date: string;
  reference: string;
  metadata?: Record<string, any>;
  user?: TransactionUser;
  transactionable?: Record<string, any>;
  service_logo?: string | null;
}

interface TransactionStats {
  total_transactions?: number;
  total_amount?: number;
  completed_count?: number;
  failed_count?: number;
  pending_count?: number;
}

/** Render a user avatar with initials fallback */
function UserAvatar({ user, size = 'sm' }: { user: TransactionUser; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';

  if (user.profile_photo_url) {
    return (
      <img
        src={user.profile_photo_url}
        alt={`${user.first_name} ${user.last_name}`}
        className={`${sizeClasses} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-[#d71927]/10 text-[#d71927] flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
}

/** Status badge with backend status values */
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    success:    { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    completed:  { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    failed:     { bg: 'bg-red-100',   text: 'text-red-800',   dot: 'bg-red-500' },
    pending:    { bg: 'bg-yellow-100',text: 'text-yellow-800',dot: 'bg-yellow-500' },
    reversed:   { bg: 'bg-purple-100',text: 'text-purple-800',dot: 'bg-purple-500' },
    refunded:   { bg: 'bg-blue-100',  text: 'text-blue-800',  dot: 'bg-blue-500' },
    delivered:  { bg: 'bg-blue-100',  text: 'text-blue-800',  dot: 'bg-blue-500' },
  };

  const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} ${style.text} px-3 py-1 text-xs font-medium`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number; fill: string }[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<{ name: string; amount: number; count: number }[]>([]);

  const isAdmin = useMemo(() => {
    return Boolean(user?.roles?.some((role) => role === 'admin'));
  }, [user]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  // Define filter fields — matches backend query params
  const filterFields: FilterField[] = [
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Reference, transaction type...',
      helpText: 'Search by reference or transaction type',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'success', label: 'Success' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'reversed', label: 'Reversed' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
    {
      id: 'transaction_type',
      label: 'Transaction Type',
      type: 'select',
      options: [
        { value: 'VTU Transaction', label: 'VTU Transaction' },
        { value: 'Wallet Funding', label: 'Wallet Funding' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
      ],
    },
    {
      id: 'user_id',
      label: 'User ID',
      type: 'number',
      placeholder: 'Filter by user ID',
      helpText: 'Enter a user ID to see their transactions',
    },
    {
      id: 'date_from',
      label: 'From Date',
      type: 'date',
      helpText: 'Filter from this date',
    },
    {
      id: 'date_to',
      label: 'To Date',
      type: 'date',
      helpText: 'Filter to this date',
    },
    {
      id: 'amount_min',
      label: 'Min Amount',
      type: 'number',
      placeholder: '₦0',
      helpText: 'Minimum transaction amount',
    },
    {
      id: 'amount_max',
      label: 'Max Amount',
      type: 'number',
      placeholder: '₦1,000,000',
      helpText: 'Maximum transaction amount',
    },
  ];

  // Use filters hook
  const {
    isOpen,
    filters,
    isLoading: filtersLoading,
    hasActiveFilters,
    openFilters,
    closeFilters,
    applyFilters,
    resetFilters,
    getActiveFilterCount,
  } = useFilters({
    fields: filterFields,
    onFiltersChange: (newFilters) => {
      setCurrentPage(1);
      fetchTransactions(1, newFilters);
    },
  });

  const fetchTransactions = async (page = 1, filterValues?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const filtersToUse = filterValues || filters;

      const response = await adminService.getAllTransactions(page, 50, filtersToUse);

      const transactionsData = response?.data?.transactions;
      const paginationData = response?.data?.pagination;

      if (!response?.data) {
        setTransactions([]);
        setStats({});
        return;
      }

      // Set transactions
      if (Array.isArray(transactionsData)) {
        setTransactions(transactionsData);
      } else {
        setTransactions([]);
      }

      // Set pagination
      if (paginationData) {
        setTotalPages(paginationData.last_page || 1);
      }

      // Calculate stats
      if (Array.isArray(transactionsData) && transactionsData.length > 0) {
        const total = transactionsData.length;
        const completed = transactionsData.filter(
          (t: Transaction) => t.status === 'success' || t.status === 'completed'
        ).length;
        const failed = transactionsData.filter(
          (t: Transaction) => t.status === 'failed'
        ).length;
        const pending = transactionsData.filter(
          (t: Transaction) => t.status === 'pending'
        ).length;
        const totalAmount = transactionsData.reduce(
          (sum: number, t: Transaction) => sum + Number(t.amount),
          0
        );

        setStats({
          total_transactions: total,
          total_amount: totalAmount,
          completed_count: completed,
          failed_count: failed,
          pending_count: pending,
        });

        // Status distribution for pie chart
        const statusMap: Record<string, number> = {};
        transactionsData.forEach((t: Transaction) => {
          const s = t.status === 'completed' || t.status === 'success' ? 'Completed' :
                    t.status === 'failed' ? 'Failed' :
                    t.status === 'pending' ? 'Pending' :
                    t.status === 'reversed' ? 'Reversed' :
                    t.status === 'refunded' ? 'Refunded' : t.status;
          statusMap[s] = (statusMap[s] || 0) + 1;
        });

        const fillMap: Record<string, string> = {
          Completed: '#10b981',
          Pending: '#f59e0b',
          Failed: '#ef4444',
          Reversed: '#8b5cf6',
          Refunded: '#3b82f6',
        };

        setStatusDistribution(
          Object.entries(statusMap)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name, value, fill: fillMap[name] || '#6b7280' }))
        );

        // Transaction type distribution for bar chart
        const typeMap: Record<string, { amount: number; count: number }> = {};
        transactionsData.forEach((t: Transaction) => {
          const type = t.transaction_type || t.transactionable?.type || 'Unknown';
          if (!typeMap[type]) {
            typeMap[type] = { amount: 0, count: 0 };
          }
          typeMap[type].amount += Number(t.amount);
          typeMap[type].count += 1;
        });
        const typeData = Object.entries(typeMap).map(([name, data]) => ({
          name: name.replace(/_/g, ' '),
          amount: data.amount,
          count: data.count,
        }));
        setTypeDistribution(typeData);
      } else {
        setStats({
          total_transactions: 0,
          total_amount: 0,
          completed_count: 0,
          failed_count: 0,
          pending_count: 0,
        });
        setStatusDistribution([]);
        setTypeDistribution([]);
      }
    } catch (error) {
      console.error('[AdminTransactions] Error fetching transactions:', error);
      setTransactions([]);
      setStats({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const statsItems = [
    {
      title: 'Total Transactions',
      value: stats.total_transactions || 0,
      change: { value: 'Last 24h', direction: 'neutral' as const },
    },
    {
      title: 'Total Volume',
      value: formatCurrency(stats.total_amount || 0),
      change: { value: '+5.2%', direction: 'up' as const },
    },
    {
      title: 'Successful',
      value: stats.completed_count || 0,
      change: {
        value: `${stats.total_transactions ? Math.round((stats.completed_count || 0) / stats.total_transactions * 100) : 0}%`,
        direction: 'up' as const,
      },
    },
    {
      title: 'Failed',
      value: stats.failed_count || 0,
      change: { value: '-2.1%', direction: 'down' as const },
    },
  ];

  const tableColumns = [
    {
      key: 'user',
      label: 'User',
      width: '280px',
      render: (_: any, row: Transaction) => {
        const txUser = row.user;
        if (!txUser) {
          return (
            <span className="text-sm text-gray-500">User #{row.user_id}</span>
          );
        }
        return (
          <div className="flex items-center gap-3">
            <UserAvatar user={txUser} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {txUser.first_name} {txUser.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{txUser.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'reference',
      label: 'Reference',
      width: '130px',
    },
    {
      key: 'transaction_type',
      label: 'Type',
      width: '150px',
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value?.replace(/_/g, ' ') || '—'}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '120px',
      render: (value: string | number) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(typeof value === 'string' ? parseFloat(value) : value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'transaction_date',
      label: 'Date',
      width: '150px',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
    {
      key: 'id',
      label: 'Action',
      width: '80px',
      align: 'center' as const,
      render: (value: string | number, row: Transaction) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedTransaction(row);
            setShowDetails(true);
          }}
          aria-label={`View transaction details for ${row.reference}`}
          title={`View transaction ${row.reference}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] p-6 text-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white">
      <AdminHeader
        title="Transactions"
        description="View and manage all platform transactions with user information"
        action={{
          label: 'Export Report',
          onClick: () => console.log('Export report'),
        }}
      />
      <AdminStats stats={statsItems} />

      {/* Charts Section */}
      <TransactionCharts statusDistribution={statusDistribution} typeDistribution={typeDistribution} />

      {/* Filter Button */}
      <div className="flex justify-end">
        <Button
          onClick={openFilters}
          className={`h-11 rounded-xl px-4 font-semibold transition ${
            hasActiveFilters
              ? 'bg-[#d71927] text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]'
              : 'border border-black/10 text-white hover:bg-[#f8f8f8]'
          }`}
        >
          <Filter className="h-4 w-4 mr-2 inline" />
          Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        title="Filter Transactions"
        description="Narrow down transactions by status, type, date range, amount, or user"
        fields={filterFields}
        isOpen={isOpen}
        onClose={closeFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        isLoading={filtersLoading}
        position="right"
        mobilePosition="auto"
      />

      <AdminTable
        columns={tableColumns}
        data={transactions}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={stats.total_transactions}
        onPageChange={setCurrentPage}
        title="All Transactions"
        perPage={50}
      />

      {/* Transaction Detail Modal */}
      {showDetails && selectedTransaction && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Transaction Details"
          size="lg"
        >
          <div className="space-y-5">
            {/* User Info Section */}
            {selectedTransaction.user && (
              <div className="rounded-xl bg-[#f8fafc] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  User Information
                </p>
                <div className="flex items-center gap-4">
                  <UserAvatar user={selectedTransaction.user} size="md" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 flex-1">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedTransaction.user.first_name} {selectedTransaction.user.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="text-sm font-semibold text-gray-900">#{selectedTransaction.user_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-700">{selectedTransaction.user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-700">{selectedTransaction.user.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Reference</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 font-mono">
                  {selectedTransaction.reference}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Status</p>
                <p className="mt-1">
                  <StatusBadge status={selectedTransaction.status} />
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Type</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedTransaction.transaction_type?.replace(/_/g, ' ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Amount</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(typeof selectedTransaction.amount === 'string' ? parseFloat(selectedTransaction.amount) : selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(selectedTransaction.transaction_date)}
                </p>
              </div>
              {selectedTransaction.service_logo && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Service</p>
                  <img
                    src={selectedTransaction.service_logo}
                    alt="Service logo"
                    className="mt-1 h-8 w-8 rounded object-contain"
                  />
                </div>
              )}
            </div>

            {/* Metadata */}
            {selectedTransaction.metadata && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Additional Details</p>
                <pre className="rounded-lg bg-gray-50 p-3 text-xs overflow-auto max-h-[200px] text-gray-900">
                  {JSON.stringify(selectedTransaction.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Transactionable */}
            {selectedTransaction.transactionable && Object.keys(selectedTransaction.transactionable).length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Transactionable Data</p>
                <pre className="rounded-lg bg-gray-50 p-3 text-xs overflow-auto max-h-[150px] text-gray-900">
                  {JSON.stringify(selectedTransaction.transactionable, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
