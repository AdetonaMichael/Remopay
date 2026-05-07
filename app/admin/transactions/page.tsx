'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  Filter,
} from 'lucide-react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminStats } from '@/components/admin/AdminStats';
import { FilterPanel, type FilterField } from '@/components/shared/FilterPanel';
import { useFilters } from '@/hooks/useFilters';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { useAuthStore } from '@/store/auth.store';
import { adminService } from '@/services/admin.service';
import { formatCurrency, formatDate } from '@/utils/format.utils';
import { Modal } from '@/components/shared/Modal';

interface Transaction {
  id: string | number;
  user_id: number;
  transaction_type: string;
  amount: number;
  status: string;
  transaction_date: string;
  reference: string;
  metadata?: Record<string, any>;
}

interface TransactionStats {
  total_transactions?: number;
  total_amount?: number;
  completed_count?: number;
  failed_count?: number;
  pending_count?: number;
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

  const isAdmin = useMemo(() => {
    return Boolean(user?.roles?.some((role) => role === 'admin'));
  }, [user]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  // Define filter fields
  const filterFields: FilterField[] = [
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Reference, user ID...',
      helpText: 'Search by transaction reference or user ID',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      id: 'transaction_type',
      label: 'Transaction Type',
      type: 'select',
      options: [
        { value: 'vtu_purchase', label: 'VTU Purchase' },
        { value: 'airtime_conversion', label: 'Airtime Conversion' },
        { value: 'bill_payment', label: 'Bill Payment' },
      ],
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

      if (response?.data) {
        if (response.data.data) {
          setTransactions(response.data.data);
          const pagination = response.data.pagination;
          setTotalPages(pagination?.last_page || 1);
        }

        // Calculate stats
        if (response.data.data && Array.isArray(response.data.data)) {
          const total = response.data.data.length;
          const completed = response.data.data.filter(
            (t: Transaction) => t.status === 'completed'
          ).length;
          const failed = response.data.data.filter(
            (t: Transaction) => t.status === 'failed'
          ).length;
          const pending = response.data.data.filter(
            (t: Transaction) => t.status === 'pending'
          ).length;
          const totalAmount = response.data.data.reduce(
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
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
      completed: 'success',
      failed: 'danger',
      pending: 'warning',
    };
    const variant = statusMap[status] || 'info';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-400" />;
    }
  };

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
      key: 'reference',
      label: 'Reference',
      width: '120px',
    },
    {
      key: 'user_id',
      label: 'User ID',
      width: '100px',
    },
    {
      key: 'transaction_type',
      label: 'Type',
      width: '150px',
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '120px',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'transaction_date',
      label: 'Date',
      width: '150px',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'id',
      label: 'Action',
      width: '80px',
      align: 'center' as const,
      render: (value: string | number, row: Transaction) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedTransaction(row);
            setShowDetails(true);
          }}
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
        description="View and manage all platform transactions"
        action={{
          label: 'Export Report',
          onClick: () => console.log('Export report'),
        }}
      />

      <AdminStats stats={statsItems} />

      {/* Filter Button */}
      <div className="flex justify-end">
        <Button
          onClick={openFilters}
          className={`h-11 rounded-xl px-4 font-semibold transition ${
            hasActiveFilters
              ? 'bg-[#d71927] text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]'
              : 'border border-black/10 text-[#111] hover:bg-[#f8f8f8]'
          }`}
        >
          <Filter className="h-4 w-4 mr-2 inline" />
          Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        title="Filter Transactions"
        description="Narrow down transactions by status, type, date range, or search term"
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

      {showDetails && selectedTransaction && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Transaction Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Reference</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTransaction.reference}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="mt-1">
                  {getStatusBadge(selectedTransaction.status)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">User ID</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTransaction.user_id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTransaction.transaction_type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatDate(selectedTransaction.transaction_date)}
                </p>
              </div>
            </div>

            {selectedTransaction.metadata && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Additional Details
                </p>
                <pre className="rounded-lg bg-gray-50 p-3 text-xs overflow-auto max-h-[200px] text-gray-900">
                  {JSON.stringify(selectedTransaction.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3 pt-4">
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
