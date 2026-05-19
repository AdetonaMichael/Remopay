'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
} from 'lucide-react';

import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { adminService } from '@/services/admin.service';
import { AdminStatisticsData, AdminVtuStatistics } from '@/types/vtu.types';
import { formatCurrency } from '@/utils/format.utils';

interface VtuStatisticsDashboardProps {
  period?: 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

export const VtuStatisticsDashboard: React.FC<VtuStatisticsDashboardProps> = ({
  period = 'month',
  onPeriodChange,
}) => {
  const [data, setData] = useState<AdminStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>(period);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getAdminVtuStatistics(selectedPeriod);
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch VTU statistics');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
    setSelectedPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardBody>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data || !data.vtu) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardBody>
          <p className="text-sm text-yellow-800">No VTU statistics available</p>
        </CardBody>
      </Card>
    );
  }

  const vtuData = data.vtu;
  const summary = vtuData.summary;
  const successRate = ((summary.successful_count || 0) / (summary.total_transactions || 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VTU Statistics</h2>
          <p className="mt-1 text-sm text-gray-600">
            {data.start_date} to {data.end_date}
          </p>
        </div>

        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              onClick={() => handlePeriodChange(p as 'week' | 'month' | 'year')}
              variant={selectedPeriod === p ? 'primary' : 'secondary'}
              size="sm"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Amount */}
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <DollarSign className="h-4 w-4 text-[#d71927]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total_amount)}
            </p>
            <p className="text-xs text-gray-600">
              {summary.total_transactions} transactions
            </p>
          </CardBody>
        </Card>

        {/* Total Commission */}
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-600">Commission</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total_commission)}
            </p>
            <p className="text-xs text-gray-600">
              {((summary.total_commission / summary.total_amount) * 100).toFixed(2)}% of total
            </p>
          </CardBody>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {successRate.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-600">
              {summary.successful_count} completed, {summary.failed_count} failed
            </p>
          </CardBody>
        </Card>

        {/* Discount Applied */}
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-600">Discount</p>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total_discount)}
            </p>
            <p className="text-xs text-gray-600">
              {((summary.total_discount / summary.total_amount) * 100).toFixed(2)}% savings
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-gray-900">Transaction Status Breakdown</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {vtuData.by_status.map((status) => (
              <div key={status.status} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {status.status}
                  </p>
                  <Badge
                    variant={
                      status.status === 'completed'
                        ? 'success'
                        : status.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {status.count}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(status.total_amount)}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Commission: {formatCurrency(status.total_commission)}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Product Type Performance */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-gray-900">Performance by Product Type</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {vtuData.by_product_type.map((product) => {
              const productSuccessRate = product.success_count
                ? ((product.success_count / product.count) * 100).toFixed(2)
                : '0.00';

              return (
                <div key={product.type} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-gray-900">{product.type}</p>
                    <Badge variant="default">{product.count} transactions</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(product.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Commission</p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(product.total_commission)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Avg Transaction</p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(product.total_amount / product.count)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Success Rate</p>
                      <p className="font-bold text-gray-900">{productSuccessRate}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-gray-900">Overall Platform Performance</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{data.performance.total_transactions}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {data.performance.success_rate.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">Failed Transactions</p>
              <p className="text-3xl font-bold text-red-600">
                {data.performance.failed_transactions}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
