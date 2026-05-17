'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  Search,
} from 'lucide-react';
import { useAdvertisementsAdmin } from '@/hooks/useAdvertisements';
import { AdvertisementAdmin, Platform, AdStatus } from '@/types/api.types';

interface AdvertisementListProps {
  onEdit?: (ad: AdvertisementAdmin) => void;
  onDelete?: (id: number) => void;
  onCreate?: () => void;
}

/**
 * Advertisement List Component for Admin Dashboard
 */
export const AdvertisementList: React.FC<AdvertisementListProps> = ({
  onEdit,
  onDelete,
  onCreate,
}) => {
  const {
    ads,
    loading,
    pagination,
    params,
    updateParams,
    deleteAd,
  } = useAdvertisementsAdmin();

  const [searchValue, setSearchValue] = useState('');
  const [selectedAds, setSelectedAds] = useState<number[]>([]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParams({ search: value, page: 1 });
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      const success = await deleteAd(id);
      if (success && onDelete) {
        onDelete(id);
      }
    }
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleSortChange = (sortBy: string) => {
    updateParams({
      sort_by: sortBy as any,
      sort_order: params.sort_order === 'asc' ? 'desc' : 'asc',
    });
  };

  const toggleSelectAd = (id: number) => {
    setSelectedAds((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(ads.map((ad) => ad.id));
    }
  };

  const getStatusBadge = (ad: AdvertisementAdmin): AdStatus => {
    const now = new Date();
    const validFrom = new Date(ad.validFrom);
    const validUntil = new Date(ad.validUntil);

    if (now > validUntil) return 'expired';
    if (!ad.isActive) return 'inactive';
    return 'active';
  };

  const getStatusColor = (status: AdStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading && ads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Advertisements</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Advertisement
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search ads by title or subtitle..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={params.platform || 'all'}
            onChange={(e) => updateParams({ platform: e.target.value as Platform })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="mobile">Mobile</option>
            <option value="web">Web</option>
          </select>
          <select
            value={params.status || 'all'}
            onChange={(e) => updateParams({ status: e.target.value as AdStatus })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedAds.length === ads.length && ads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('title')}
              >
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Platform
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('display_order')}
              >
                Order
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('impressions')}
              >
                Impressions
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortChange('clicks')}
              >
                Clicks
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">CTR</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => {
              const status = getStatusBadge(ad);
              const statusColor = getStatusColor(status);

              return (
                <tr key={ad.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAds.includes(ad.id)}
                      onChange={() => toggleSelectAd(ad.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{ad.title}</p>
                      <p className="text-sm text-gray-600">{ad.subtitle}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {ad.platform || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {ad.displayOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{ad.analytics.impressions}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{ad.analytics.clicks}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {ad.analytics.ctr.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit && onEdit(ad)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ad.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pagination.current_page === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {ads.length === 0 && !loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No advertisements found</p>
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create First Advertisement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementList;
