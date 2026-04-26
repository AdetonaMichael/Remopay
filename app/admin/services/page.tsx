'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Wifi,
  TrendingUp,
  Activity,
  Eye,
  BarChart3,
} from 'lucide-react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminStats } from '@/components/admin/AdminStats';
import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { useAuthStore } from '@/store/auth.store';
import { adminService } from '@/services/admin.service';
import { formatCurrency } from '@/utils/format.utils';
import { Modal } from '@/components/shared/Modal';
import { Spinner } from '@/components/shared/Spinner';

interface VTUTransaction {
  id: number;
  user_id: number;
  transaction_type: string;
  product_name: string;
  amount: number;
  phone: string;
  status: string;
  reference: string;
  transaction_date: string;
}

interface NetworkStats {
  count: number;
  volume: number;
  success_rate: number;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<VTUTransaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<VTUTransaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const isAdmin = useMemo(() => {
    return Boolean(user?.roles?.some((role) => role === 'admin'));
  }, [user]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [txnResponse, statsResponse] = await Promise.all([
          adminService.getVTUTransactions(currentPage, 50),
          adminService.getVTUTransactionStats(),
        ]);

        if (txnResponse?.data) {
          const data = Array.isArray(txnResponse.data)
            ? txnResponse.data
            : txnResponse.data.transactions || [];
          setTransactions(data);
          if (txnResponse.data.pagination) {
            setTotalPages(txnResponse.data.pagination.last_page || 1);
          }
        }

        if (statsResponse?.data) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching VTU data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const statsItems = [
    {
      title: 'Total Transactions',
      value: stats?.total_transactions || 0,
      icon: <BarChart3 className="h-6 w-6" />,
      change: { value: '+15.3%', direction: 'up' as const },
    },
    {
      title: 'Total Volume',
      value: formatCurrency(stats?.total_volume || 0),
      icon: <TrendingUp className="h-6 w-6" />,
      change: { value: '+9.8%', direction: 'up' as const },
    },
    {
      title: 'Success Rate',
      value: `${(stats?.success_rate || 0).toFixed(1)}%`,
      icon: <Activity className="h-6 w-6" />,
      change: { value: '+2.1%', direction: 'up' as const },
    },
    {
      title: 'Total Commissions',
      value: formatCurrency(stats?.total_commission || 0),
      icon: <Smartphone className="h-6 w-6" />,
      change: { value: '+6.5%', direction: 'up' as const },
    },
  ];

  const tableColumns = [
    {
      key: 'reference',
      label: 'Reference',
      width: '120px',
    },
    {
      key: 'product_name',
      label: 'Product',
      width: '150px',
    },
    {
      key: 'phone',
      label: 'Phone',
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
      width: '100px',
      render: (value: string) => (
        <Badge
          variant={
            value === 'completed'
              ? 'success'
              : value === 'failed'
                ? 'danger'
                : 'warning'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'transaction_date',
      label: 'Date',
      width: '150px',
      render: (value: string) =>
        new Date(value).toLocaleString('en-NG'),
    },
    {
      key: 'id',
      label: 'Action',
      width: '80px',
      align: 'center' as const,
      render: (value: number, row: VTUTransaction) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedTxn(row);
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
    <div className="space-y-6 p-6">
      <AdminHeader
        title="VTU Services"
        description="Manage VTU transactions and service performance"
      />

      <AdminStats stats={statsItems} />

      {/* Network Performance */}
      {stats?.by_network && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Network Performance
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(stats.by_network).map(
                ([network, data]: [string, any]) => (
                  <div
                    key={network}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{network}</h4>
                      <Badge variant="info">
                        {(data.success_rate || 0).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-medium text-gray-900">
                          {data.count}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(data.volume)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <AdminTable
        columns={tableColumns}
        data={transactions}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={stats?.total_transactions}
        onPageChange={setCurrentPage}
        title="VTU Transactions"
        perPage={50}
      />

      {showDetails && selectedTxn && (
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
                  {selectedTxn.reference}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="mt-1">
                  <Badge
                    variant={
                      selectedTxn.status === 'completed'
                        ? 'success'
                        : selectedTxn.status === 'failed'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {selectedTxn.status}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Product</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTxn.product_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTxn.phone}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(selectedTxn.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">User ID</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTxn.user_id}
                </p>
              </div>
            </div>

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
