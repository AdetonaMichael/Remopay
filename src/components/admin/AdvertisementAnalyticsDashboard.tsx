'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Zap, Target } from 'lucide-react';
import { advertisementService } from '@/services/advertisement.service';
import { AdvertisementAnalyticsSummary } from '@/types/api.types';
import { useAlert } from '@/hooks/useAlert';

/**
 * Advertisement Analytics Dashboard Component
 */
export const AdvertisementAnalyticsDashboard: React.FC = () => {
  const { showAlert } = useAlert();
  const [data, setData] = useState<AdvertisementAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await advertisementService.getAnalyticsSummary();

        if (response.success && response.data) {
          // Handle both response structures
          const analyticsData = Array.isArray(response.data) 
            ? response.data 
            : response.data;
          setData(analyticsData as AdvertisementAnalyticsSummary);
        } else {
          setError(response.message || 'Failed to fetch analytics');
          showAlert(response.message || 'Failed to fetch analytics', 'error');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        showAlert(`Failed to fetch analytics: ${errorMessage}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [showAlert]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ads */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Ads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.total_ads}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Ads */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Ads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.active_ads}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Impressions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Impressions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.total_impressions.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Eye size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.total_clicks.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Zap size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Average CTR */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Average CTR</h3>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-bold text-blue-600">{data.average_ctr.toFixed(2)}%</div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(data.average_ctr, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {data.total_impressions > 0
                ? `${data.total_clicks} clicks from ${data.total_impressions} impressions`
                : 'No data available'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Ads */}
      {data.top_performing && data.top_performing.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Ads</h3>
          <div className="space-y-4">
            {data.top_performing.map((ad, index) => (
              <div key={ad.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{ad.title}</p>
                  <p className="text-sm text-gray-600">{ad.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Impressions</p>
                      <p className="text-lg font-bold text-gray-900">{ad.analytics.impressions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Clicks</p>
                      <p className="text-lg font-bold text-gray-900">{ad.analytics.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">CTR</p>
                      <p className="text-lg font-bold text-blue-600">{ad.analytics.ctr.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementAnalyticsDashboard;
