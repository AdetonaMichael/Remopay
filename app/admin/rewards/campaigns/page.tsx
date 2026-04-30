'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pause,
  Play,
  Trash2,
  AlertCircle,
  Megaphone,
  CalendarDays,
  Gift,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/utils/toast.utils';
import { Modal } from '@/components/shared/Modal';
import { rewardService } from '@/services/reward.service';
import { Campaign } from '@/types/rewards.types';

const formatMoney = (amount?: number | string | null) => {
  const value = Number(amount || 0);
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'paused':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case 'expired':
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    default:
      return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  }
};

export default function AdminCampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'cashback' as 'cashback' | 'bonus' | 'streak',
    reward_percentage: '',
    reward_amount: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, [selectedStatus]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await rewardService.getAllCampaigns(
        selectedStatus || undefined,
      );

      setCampaigns(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cashback',
      reward_percentage: '',
      reward_amount: '',
      start_date: '',
      end_date: '',
    });
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
        conditions: {
          min_transactions: 0,
          min_funding: 0,
        },
      };

      if (formData.type === 'cashback' && formData.reward_percentage) {
        payload.reward_percentage = parseFloat(formData.reward_percentage);
      }

      if (formData.type === 'bonus' && formData.reward_amount) {
        payload.reward_amount = parseFloat(formData.reward_amount);
      }

      await rewardService.createCampaign(payload);

      Toast.success('Campaign created successfully');
      setShowCreateModal(false);
      resetForm();
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
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await rewardService.deleteCampaign(campaignId);
      Toast.success('Campaign deleted');
      loadCampaigns();
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} cols={6} />;
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
 

      {error && (
        <Card className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">
              {error}
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border border-[#620707]/10 bg-[#620707] p-6 text-white shadow-sm">
          <Megaphone className="h-7 w-7" />
          <p className="mt-4 text-sm text-white/75">Total Campaigns</p>
          <h2 className="mt-2 text-3xl font-black">{campaigns.length}</h2>
        </Card>

        <Card className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <Gift className="h-7 w-7 text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">
            Active Campaigns
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {campaigns.filter((item) => item.status === 'active').length}
          </h2>
        </Card>

        <Card className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <Pause className="h-7 w-7 text-amber-600" />
          <p className="mt-4 text-sm text-slate-500">
            Paused Campaigns
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {campaigns.filter((item) => item.status === 'paused').length}
          </h2>
        </Card>
      </div>

      <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#620707]/10 p-3 text-[#620707]">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black">Filter Campaigns</h2>
              <p className="text-sm text-slate-500">
                Narrow campaigns by operational status.
              </p>
            </div>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10 md:w-64"
          >
            <option value="">All Campaigns</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['Campaign', 'Type', 'Reward', 'Period', 'Status', 'Actions'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={`px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500 ${
                          heading === 'Actions' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="transition hover:bg-[#620707]/5"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-950">
                        {campaign.name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-[#620707]/10 px-3 py-1 text-xs font-bold capitalize text-[#620707] ring-1 ring-[#620707]/15">
                        {campaign.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-black text-slate-950">
                      {campaign.reward_percentage
                        ? `${campaign.reward_percentage}%`
                        : formatMoney(campaign.reward_amount)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {campaign.start_date} to {campaign.end_date}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                          campaign.status,
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {campaign.status === 'active' ? (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50"
                            title="Pause campaign"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResumeCampaign(campaign.id)}
                            className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50"
                            title="Resume campaign"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="rounded-3xl bg-[#620707]/10 p-5 text-[#620707]">
              <Megaphone className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-black">No campaigns found</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first reward campaign to start driving user retention,
              cashback incentives, deposits, referrals, and transaction volume.
            </p>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 rounded-2xl bg-[#620707] px-5 py-3 text-white hover:bg-[#4d0505]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Campaign
            </Button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Reward Campaign"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. April Cashback Boost"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Campaign Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as 'cashback' | 'bonus' | 'streak',
                }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
            >
              <option value="cashback">Cashback</option>
              <option value="bonus">Bonus</option>
              <option value="streak">Streak</option>
            </select>
          </div>

          {formData.type === 'cashback' && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Reward Percentage
              </label>
              <input
                type="number"
                value={formData.reward_percentage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reward_percentage: e.target.value,
                  }))
                }
                placeholder="e.g. 2.5"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
              />
            </div>
          )}

          {formData.type === 'bonus' && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Reward Amount
              </label>
              <input
                type="number"
                value={formData.reward_amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reward_amount: e.target.value,
                  }))
                }
                placeholder="e.g. 500"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="rounded-2xl"
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateCampaign}
              disabled={isSubmitting}
              className="rounded-2xl bg-[#620707] text-white hover:bg-[#4d0505]"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}