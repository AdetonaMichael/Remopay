'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Snowflake,
  Flame,
  Ban,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  ShieldOff,
  Trash2,
} from 'lucide-react';
import { cardAdminService } from '@/services/card-admin.service';
import { CardAdminView, CardAdminFilters, AdminCardStatus } from '@/types/card-admin.types';
import { useUIStore } from '@/store/ui.store';

export default function AdminCardManagementPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [cards, setCards] = useState<CardAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [filters, setFilters] = useState<CardAdminFilters>({});
  const [searchUserId, setSearchUserId] = useState('');

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
          addToast({ type: 'error', message: 'Failed to load cards' });
        }
      } catch (error: any) {
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

  const handleStatusFilter = (status: AdminCardStatus | '') => {
    const newFilters = { ...filters };
    if (status) {
      newFilters.status = status;
    } else {
      delete newFilters.status;
    }
    setFilters(newFilters);
    fetchCards(1, newFilters);
  };

  const handleUserSearch = () => {
    const newFilters = { ...filters };
    if (searchUserId) {
      newFilters.user_id = parseInt(searchUserId);
    } else {
      delete newFilters.user_id;
    }
    setFilters(newFilters);
    fetchCards(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchCards(page, filters);
  };

  const handleViewDetails = (cardId: number) => {
    router.push(`/admin/cards/${cardId}`);
  };

  const handleFreeze = async (cardId: number) => {
    if (!confirm('Are you sure you want to freeze this card?')) return;
    setActionLoading(cardId);
    try {
      const response = await cardAdminService.freezeCard(cardId);
      if (response.success) {
        addToast({ type: 'success', message: response.message || 'Card frozen successfully' });
        fetchCards(currentPage, filters);
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to freeze card' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfreeze = async (cardId: number) => {
    if (!confirm('Unfreeze this card?')) return;
    setActionLoading(cardId);
    try {
      const response = await cardAdminService.unfreezeCard(cardId);
      if (response.success) {
        addToast({ type: 'success', message: response.message || 'Card unfrozen successfully' });
        fetchCards(currentPage, filters);
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to unfreeze card' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTerminate = async (cardId: number) => {
    if (!confirm('WARNING: This will permanently terminate this card. This action CANNOT be undone. Continue?')) return;
    setActionLoading(cardId);
    try {
      const response = await cardAdminService.terminateCard(cardId);
      if (response.success) {
        addToast({ type: 'success', message: response.message || 'Card terminated successfully' });
        fetchCards(currentPage, filters);
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to terminate card' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      FROZEN: 'bg-blue-100 text-blue-800 border-blue-200',
      TERMINATED: 'bg-red-100 text-red-800 border-red-200',
      DISABLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status === 'FROZEN' && <Snowflake className="h-3 w-3" />}
        {status === 'TERMINATED' && <Ban className="h-3 w-3" />}
        {status === 'ACTIVE' && <Shield className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  const canFreeze = (status: string) => status === 'ACTIVE';
  const canUnfreeze = (status: string) => status === 'FROZEN';
  const canTerminate = (status: string) => status === 'ACTIVE' || status === 'FROZEN';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Card Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage, freeze, or terminate virtual cards</p>
        </div>
        <button
          onClick={() => fetchCards(currentPage, filters)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Info Alert */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-bold">Card Lifecycle Management</p>
          <p className="mt-1">Active cards can be frozen or terminated. Frozen cards can be unfrozen or terminated. Termination is permanent and irreversible.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {(['', 'ACTIVE', 'FROZEN', 'TERMINATED', 'DISABLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                (status === '' && !filters.status) || filters.status === status
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <input
            type="number"
            placeholder="User ID..."
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm w-32 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleUserSearch}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Card</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Loading cards...
                    </div>
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Ban className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-900">No cards found</p>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                cards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-500">#{card.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-mono font-bold text-gray-900">{card.masked_pan}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">
                          {card.user?.first_name} {card.user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
                        card.brand === 'VISA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {card.brand}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(card.status)}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900">
                        ${parseFloat(card.balance).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${card.has_details ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs font-medium text-gray-600">
                          {card.has_details ? 'Populated' : 'Missing'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(card.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canFreeze(card.status) && (
                          <button
                            onClick={() => handleFreeze(card.id)}
                            disabled={actionLoading === card.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors"
                            title="Freeze Card"
                          >
                            {actionLoading === card.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Snowflake className="h-3.5 w-3.5" />}
                            Freeze
                          </button>
                        )}
                        {canUnfreeze(card.status) && (
                          <button
                            onClick={() => handleUnfreeze(card.id)}
                            disabled={actionLoading === card.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
                            title="Unfreeze Card"
                          >
                            {actionLoading === card.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                            Unfreeze
                          </button>
                        )}
                        {canTerminate(card.status) && (
                          <button
                            onClick={() => handleTerminate(card.id)}
                            disabled={actionLoading === card.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                            title="Terminate Card (Irreversible)"
                          >
                            {actionLoading === card.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            Terminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing page {currentPage} of {totalPages} · {totalCards} total cards
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
