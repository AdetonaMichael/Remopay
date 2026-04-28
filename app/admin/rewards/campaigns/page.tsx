'use client';

import { useState, useEffect } from 'react';
import { Plus, Pause, Play, Trash2, Edit } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/utils/toast.utils';
import { Modal } from '@/components/shared/Modal';
import { rewardService } from '@/services/reward.service';
import { Campaign } from '@/types/rewards.types';
import Link from 'next/link';

export default function AdminCampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cashback' as 'cashback' | 'bonus' | 'streak',
    reward_percentage: '',
    reward_amount: '',
    start_date: '',
    end_date: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [selectedStatus]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await rewardService.getAllCampaigns(selectedStatus || undefined);
      setCampaigns(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload: any = {
        name: formData.name,
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        conditions: { min_transactions: 0, min_funding: 0 },
      };

      if (formData.type === 'cashback' && formData.reward_percentage) {
        payload.reward_percentage = parseFloat(formData.reward_percentage);
      } else if (formData.type === 'bonus' && formData.reward_amount) {
        payload.reward_amount = parseFloat(formData.reward_amount);
      }

      await rewardService.createCampaign(payload);
      Toast.success('Campaign created successfully');
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'cashback',
        reward_percentage: '',
        reward_amount: '',
        start_date: '',
        end_date: '',
      });
      loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseCampaign = async (campaignId: number) => {
    try {
      await rewardService.pauseCampaign(campaignId);
      Toast.success('Campaign paused');
      loadCampaigns();
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : 'Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId: number) => {
    try {
      await rewardService.resumeCampaign(campaignId);
      Toast.success('Campaign resumed');
      loadCampaigns();
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : 'Failed to resume campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await rewardService.deleteCampaign(campaignId);
        Toast.success('Campaign deleted');
        loadCampaigns();
      } catch (err) {
        Toast.error(err instanceof Error ? err.message : 'Failed to delete campaign');
      }
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} cols={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="mt-2 text-gray-600">Create and manage reward campaigns</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#4a5ff7] hover:bg-[#3d4fe0] text-white flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> New Campaign
        </Button>
      </div>

      {/* Status Filter */}
      <Card className="bg-gray-50">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
        >
          <option value="">All Campaigns</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
      </Card>

      {/* Campaigns Table */}
      {campaigns.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.reward_percentage
                        ? `${campaign.reward_percentage}%`
                        : `₦${campaign.reward_amount}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.start_date} to {campaign.end_date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex items-center justify-end">
                      {campaign.status === 'active' ? (
                        <button
                          onClick={() => handlePauseCampaign(campaign.id)}
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                          title="Pause campaign"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResumeCampaign(campaign.id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Resume campaign"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-600">No campaigns found</p>
        </Card>
      )}

      {/* Create Campaign Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Campaign">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekend Bonus"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
            >
              <option value="cashback">Cashback (%)</option>
              <option value="bonus">Bonus (Fixed Amount)</option>
              <option value="streak">Streak Bonus</option>
            </select>
          </div>

          {formData.type === 'cashback' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cashback Percentage</label>
              <input
                type="number"
                value={formData.reward_percentage}
                onChange={(e) => setFormData({ ...formData, reward_percentage: e.target.value })}
                placeholder="e.g., 2.5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
              />
            </div>
          )}

          {formData.type === 'bonus' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus Amount (₦)</label>
              <input
                type="number"
                value={formData.reward_amount}
                onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
                placeholder="e.g., 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5ff7]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateCampaign}
              isLoading={isSubmitting}
              className="flex-1 bg-[#4a5ff7] hover:bg-[#3d4fe0] text-white"
            >
              Create Campaign
            </Button>
            <Button onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
