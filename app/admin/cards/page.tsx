'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Plus, AlertCircle } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { CardFilters } from '@/components/admin/cards';
import { cardAdminService } from '@/services/card-admin.service';
import { CardAdminView, CardAdminFilters } from '@/types/card-admin.types';
import { useUIStore } from '@/store/ui.store';

export default function CardManagementPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [cards, setCards] = useState<CardAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [filters, setFilters] = useState<CardAdminFilters>({});

  const fetchCards = useCallback(
    async (page: number = 1, appliedFilters: CardAdminFilters = {}) => {
      try {
        setLoading(true);
        const response = await cardAdminService.getCards(appliedFilters, page, 15);

        if (response.success && response.data) {
          setCards(response.data.cards);
          setCurrentPage(response.data.pagination.current_page);
          setTotalPages(response.data.pagination.last_page);
          setTotalCards(response.data.pagination.total);
        } else {
          addToast({
            type: 'error',
            message: 'Failed to load cards',
          });
        }
      } catch (error: any) {
        console.error('Error fetching cards:', error);
        addToast({
          type: 'error',
          message: error?.response?.data?.message || 'Failed to load cards',
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    fetchCards(1, filters);
  }, []);

  const handleFilterChange = (newFilters: CardAdminFilters) => {
    setFilters(newFilters);
    fetchCards(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchCards(page, filters);
  };

  const handleViewDetails = (cardId: number) => {
    router.push(`/admin/cards/${cardId}`);
  };

  const columns = [
    {
      key: 'masked_pan',
      label: 'Card Number',
      render: (value: string) => (
        <span className="font-mono font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: 'name',
      label: 'Cardholder Name',
      render: (value: string) => <span>{value || '—'}</span>,
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (value: string) => (
        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          ACTIVE: 'bg-emerald-100 text-emerald-800',
          DISABLED: 'bg-gray-100 text-gray-800',
          SUSPENDED: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: 'has_details',
      label: 'Details Status',
      render: (value: boolean) => (
        <div className="flex items-center gap-1">
          {value ? (
            <>
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Complete</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-amber-600" />
              <span className="text-xs font-medium text-amber-700">Missing</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User Email',
      render: (value: any) => (
        <span className="text-sm text-gray-700">{value?.email || '—'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => {
        const date = new Date(value);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        let timeString = '';
        if (diff < 60) timeString = 'just now';
        else if (diff < 3600)
          timeString = `${Math.floor(diff / 60)} minutes ago`;
        else if (diff < 86400) timeString = `${Math.floor(diff / 3600)} hours ago`;
        else timeString = `${Math.floor(diff / 86400)} days ago`;

        return (
          <span className="text-sm text-gray-600" title={date.toLocaleString()}>
            {timeString}
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value: number, row: CardAdminView) => (
        <button
          onClick={() => handleViewDetails(row.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Card Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and populate virtual card details
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Card Details Management</p>
          <p className="mt-1">
            Use this dashboard to populate missing card details (number, expiry, CVV) for cards that weren't fully returned by the payment provider.
          </p>
        </div>
      </div>

      {/* Filters */}
      <CardFilters
        onFiltersChange={handleFilterChange}
        isLoading={loading}
      />

      {/* Cards Table */}
      <AdminTable
        columns={columns}
        data={cards}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={totalCards}
        perPage={15}
        onPageChange={handlePageChange}
        title={`All Cards (${totalCards} total)`}
        emptyMessage="No cards found matching your filters"
      />
    </div>
  );
}
