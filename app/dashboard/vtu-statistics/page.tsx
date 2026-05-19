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
} from 'lucide-react';

import { Card, CardBody, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { adminService } from '@/services/admin.service';
import { UserVtuStatistics } from '@/types/vtu.types';
import { formatCurrency } from '@/utils/format.utils';

export default function VtuStatisticsPage() {
  const [data, setData] = useState<UserVtuStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getUserVtuStatistics(selectedPeriod);

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

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardBody>
            <p className="text-sm text-yellow-800">No VTU statistics available</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const summary = data.summary;
  const successRate = data.summary.success_rate ?? ((data.summary.successful_count || 0) / (data.summary.total_transactions || 1)) * 100;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#f8f8f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_right,rgba(215,25,39,0.12),transparent_32%),#090707] dark:text-white"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header with Period Selector */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              VTU Statistics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {data.start_date} to {data.end_date}
            </p>
          </div>

          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                onClick={() => setSelectedPeriod(p)}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount
                </p>
                <DollarSign className="h-4 w-4 text-[#d71927]" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.total_amount)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.total_transactions} transactions
              </p>
            </CardBody>
          </Card>

          {/* Total Commission */}
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commission Earned
                </p>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.total_commission)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {((summary.total_commission / summary.total_amount) * 100).toFixed(2)}% of total
              </p>
            </CardBody>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {successRate.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.successful_count} completed
              </p>
            </CardBody>
          </Card>

          {/* Discount Applied */}
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Discount Savings
                </p>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.total_discount)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {((summary.total_discount / summary.total_amount) * 100).toFixed(2)}% savings
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Transaction Status Breakdown
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(data.by_status).map(([status, details]) => (
                <div
                  key={status}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600 capitalize dark:text-gray-400">
                      {status}
                    </p>
                    <Badge
                      variant={
                        status === 'completed'
                          ? 'success'
                          : status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {details.count}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(details.total_amount)}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Commission: {formatCurrency(details.total_commission)}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Product Type Performance */}
        {data.by_product_type.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Performance by Product Type
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {data.by_product_type.map((product) => {
                  const productSuccessRate = product.success_count
                    ? ((product.success_count / product.count) * 100).toFixed(2)
                    : '0.00';

                  return (
                    <div
                      key={product.type}
                      className="border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.type}
                        </p>
                        <Badge variant="default">{product.count} transactions</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Total Amount
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.total_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Commission
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.total_commission)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Avg Transaction
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.total_amount / product.count)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Success Rate
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {productSuccessRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
    </div>
  );
}
