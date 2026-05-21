'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import promotionalEmailService from '@/services/promotional-email.service';
import { PromotionalEmailCampaign, CampaignListResponse } from '@/types/promotional-email.types';
import { useAlert } from '@/hooks/useAlert';

export default function PromotionalEmailCampaigns() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [campaigns, setCampaigns] = useState<PromotionalEmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, pagination.page]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await promotionalEmailService.getCampaigns(
        pagination.page,
        pagination.per_page,
        statusFilter || undefined
      );

      setCampaigns(response.data);
      setPagination({
        page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page,
      });
    } catch (error) {
      showAlert('Failed to load campaigns', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (campaign: PromotionalEmailCampaign) => {
    if (confirm(`Send campaign "${campaign.campaign_name}" now?`)) {
      try {
        await promotionalEmailService.sendCampaign(campaign.id);
        showAlert('Campaign sent successfully!', 'success');
        await fetchCampaigns();
      } catch (error) {
        showAlert('Failed to send campaign', 'error');
        console.error(error);
      }
    }
  };

  const handleDelete = async (campaign: PromotionalEmailCampaign) => {
    if (confirm(`Delete draft campaign "${campaign.campaign_name}"?`)) {
      try {
        await promotionalEmailService.deleteCampaign(campaign.id);
        showAlert('Campaign deleted', 'success');
        await fetchCampaigns();
      } catch (error) {
        showAlert('Failed to delete campaign', 'error');
        console.error(error);
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      sending: 'bg-purple-100 text-purple-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your promotional email campaigns</p>
        </div>
        <button
          onClick={() => router.push('/admin/promotional-emails/create')}
          className="px-6 py-3 bg-[#620707] text-white rounded-lg font-semibold hover:bg-[#4a0505] transition"
        >
          + Create New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707]"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Campaign Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {campaign.campaign_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.template?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.target_user_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(campaign.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() =>
                                router.push(`/admin/promotional-emails/${campaign.id}/edit`)
                              }
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleSend(campaign)}
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition font-medium"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => handleDelete(campaign)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {campaign.status !== 'draft' && (
                          <button
                            onClick={() =>
                              router.push(`/admin/promotional-emails/${campaign.id}/analytics`)
                            }
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition font-medium"
                          >
                            Analytics
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
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {campaigns.length} of {pagination.total} campaigns
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: pagination.last_page }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                  className={`px-3 py-1 text-sm rounded transition ${
                    pagination.page === i + 1
                      ? 'bg-[#620707] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.last_page, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.last_page}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
