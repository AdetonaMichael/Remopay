'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import promotionalEmailService from '@/services/promotional-email.service';
import type { CampaignAnalytics, PromotionalEmailLog } from '@/types/promotional-email.types';
import { useAlert } from '@/hooks/useAlert';

export default function CampaignAnalytics() {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const campaignId = params.id as string;

  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId, currentPage]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await promotionalEmailService.getCampaignAnalytics(parseInt(campaignId));
      setAnalytics(data);
    } catch (error) {
      showAlert('Failed to load analytics', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gray-500">No analytics available</div>;
  }

  const stats = analytics.stats;
  const logs = analytics.logs.data;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const StatCard = ({ label, value, color = 'blue' }: any) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
      <p className={`text-${color}-600 text-sm font-medium`}>{label}</p>
      <p className={`text-${color}-900 text-3xl font-bold mt-2`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">View delivery statistics and recipient engagement</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          ← Back
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Recipients"
          value={stats.total_recipients.toLocaleString()}
          color="blue"
        />
        <StatCard label="Successfully Sent" value={stats.total_sent.toLocaleString()} color="green" />
        <StatCard label="Failed" value={stats.total_failed.toLocaleString()} color="red" />
        <StatCard label="Opened" value={stats.total_opened.toLocaleString()} color="purple" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Success Rate</p>
          <div className="mt-3">
            <p className="text-3xl font-bold text-green-600">{stats.success_rate.toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.success_rate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Open Rate</p>
          <div className="mt-3">
            <p className="text-3xl font-bold text-purple-600">{stats.open_rate.toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(stats.open_rate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Click Rate</p>
          <div className="mt-3">
            <p className="text-3xl font-bold text-orange-600">{stats.click_rate.toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min(stats.click_rate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Logs */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Logs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Opened
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Clicked
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{log.email_address}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.opened_at ? new Date(log.opened_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.clicked_at ? new Date(log.clicked_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-300 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {logs.length} of {analytics.logs.total} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-3 py-1 text-sm text-gray-600">
              Page {analytics.logs.current_page} of {analytics.logs.last_page}
            </span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(analytics.logs.last_page, currentPage + 1))
              }
              disabled={currentPage === analytics.logs.last_page}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
