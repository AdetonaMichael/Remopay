'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import type { FeeConfig, FeeCalculationType, UpdateFeeConfigRequest } from '@/types/card-fee.types';
import { FEE_TYPE_META } from '@/types/card-fee.types';
import { FeePreview } from './FeePreview';

interface FeeConfigEditFormProps {
  fee: FeeConfig | null;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string | null;
  success?: string | null;
  onBack: () => void;
  onSave: (data: UpdateFeeConfigRequest) => void;
}

const CALCULATION_TYPES = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Percentage', value: 'percentage' },
  { label: 'Hybrid (Fixed + Percentage)', value: 'hybrid' },
  { label: 'Threshold', value: 'threshold' },
];

export function FeeConfigEditForm({
  fee,
  isLoading,
  isSaving,
  error,
  success,
  onBack,
  onSave,
}: FeeConfigEditFormProps) {
  const [formData, setFormData] = useState<UpdateFeeConfigRequest>({});
  const [activeTab, setActiveTab] = useState<'our_fee' | 'provider_fee'>('our_fee');

  useEffect(() => {
    if (fee) {
      setFormData({
        display_name: fee.display_name,
        description: fee.description,
        fee_calculation_type: fee.fee_calculation_type,
        fixed_amount: fee.fixed_amount ? parseFloat(fee.fixed_amount) : undefined,
        percentage_rate: fee.percentage_rate ? parseFloat(fee.percentage_rate) : undefined,
        threshold_amount: fee.threshold_amount ? parseFloat(fee.threshold_amount) : undefined,
        below_threshold_fixed: fee.below_threshold_fixed ? parseFloat(fee.below_threshold_fixed) : undefined,
        below_threshold_percentage: fee.below_threshold_percentage ? parseFloat(fee.below_threshold_percentage) : undefined,
        above_threshold_fixed: fee.above_threshold_fixed ? parseFloat(fee.above_threshold_fixed) : undefined,
        above_threshold_percentage: fee.above_threshold_percentage ? parseFloat(fee.above_threshold_percentage) : undefined,
        provider_fixed_amount: fee.provider_fixed_amount ? parseFloat(fee.provider_fixed_amount) : undefined,
        provider_percentage_rate: fee.provider_percentage_rate ? parseFloat(fee.provider_percentage_rate) : undefined,
        provider_threshold_amount: fee.provider_threshold_amount ? parseFloat(fee.provider_threshold_amount) : undefined,
        provider_below_threshold_fixed: fee.provider_below_threshold_fixed ? parseFloat(fee.provider_below_threshold_fixed) : undefined,
        provider_below_threshold_percentage: fee.provider_below_threshold_percentage ? parseFloat(fee.provider_below_threshold_percentage) : undefined,
        provider_above_threshold_fixed: fee.provider_above_threshold_fixed ? parseFloat(fee.provider_above_threshold_fixed) : undefined,
        provider_above_threshold_percentage: fee.provider_above_threshold_percentage ? parseFloat(fee.provider_above_threshold_percentage) : undefined,
        currency: fee.currency,
        is_active: fee.is_active,
        applies_to: fee.applies_to,
        sort_order: fee.sort_order,
      });
    }
  }, [fee]);

  const updateField = useCallback((field: keyof UpdateFeeConfigRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (isLoading || !fee) {
    return (
      <Card className="rounded-2xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#d71927] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Loading fee configuration...</p>
        </div>
      </Card>
    );
  }

  const meta = FEE_TYPE_META[fee.fee_type];
  const calcType = formData.fee_calculation_type || fee.fee_calculation_type;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <HelpCircle size={20} className="mt-0.5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">{meta?.label}</p>
          <p className="mt-1">{meta?.description}. Provider fee: {meta?.providerFeeLabel}</p>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={formData.display_name || ''}
            onChange={(e) => updateField('display_name', e.target.value)}
            placeholder="Fee display name"
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Fee description"
              rows={3}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-4 focus:ring-[#d71927]/10 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Currency"
              value={formData.currency || 'USD'}
              onChange={(e) => updateField('currency', e.target.value)}
              placeholder="USD"
            />
            <Input
              label="Sort Order"
              type="number"
              value={formData.sort_order?.toString() || '0'}
              onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
            />
            <Select
              label="Applies To"
              options={[
                { label: 'User', value: 'user' },
                { label: 'Admin Only', value: 'admin_only' },
                { label: 'Both', value: 'both' },
              ]}
              value={formData.applies_to || 'user'}
              onChange={(e) => updateField('applies_to', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Our Fee */}
      <Card className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Our Fee (Remopay Service Fee)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure the fee Remopay charges on top of the provider fee for this operation.
        </p>

        <Select
          label="Calculation Type"
          options={CALCULATION_TYPES}
          value={calcType}
          onChange={(e) => updateField('fee_calculation_type', e.target.value)}
        />

        <div className="mt-4 space-y-4">
          {/* Fixed */}
          {(calcType === 'fixed' || calcType === 'hybrid') && (
            <Input
              label={calcType === 'fixed' ? 'Fixed Amount ($)' : 'Fixed Amount ($) — added to percentage'}
              type="number"
              step="0.01"
              min="0"
              value={formData.fixed_amount?.toString() || ''}
              onChange={(e) => updateField('fixed_amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          )}

          {/* Percentage */}
          {(calcType === 'percentage' || calcType === 'hybrid') && (
            <Input
              label={calcType === 'hybrid' ? 'Percentage Rate (%)' : 'Percentage Rate (%)'}
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.percentage_rate?.toString() || ''}
              onChange={(e) => updateField('percentage_rate', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          )}

          {/* Threshold */}
          {calcType === 'threshold' && (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <h4 className="text-sm font-bold text-gray-700">Threshold Configuration</h4>
              <Input
                label="Threshold Amount ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.threshold_amount?.toString() || ''}
                onChange={(e) => updateField('threshold_amount', parseFloat(e.target.value) || 0)}
                placeholder="100.00"
                helperText="Fee changes when amount crosses this threshold"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">Below Threshold</p>
                  <Input
                    label="Fixed ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.below_threshold_fixed?.toString() || ''}
                    onChange={(e) => updateField('below_threshold_fixed', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <div className="mt-2">
                    <Input
                      label="Percentage (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.below_threshold_percentage?.toString() || ''}
                      onChange={(e) => updateField('below_threshold_percentage', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">At or Above Threshold</p>
                  <Input
                    label="Fixed ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.above_threshold_fixed?.toString() || ''}
                    onChange={(e) => updateField('above_threshold_fixed', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <div className="mt-2">
                    <Input
                      label="Percentage (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.above_threshold_percentage?.toString() || ''}
                      onChange={(e) => updateField('above_threshold_percentage', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Provider Fee */}
      <Card className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Provider Fee (Maplerad)</h3>
        <p className="text-sm text-gray-500 mb-4">
          These are the fees charged by Maplerad (the card issuer). You can update them to match current provider rates.
          Provider calculation type: <strong className="text-gray-900 capitalize">{fee.provider_calculation_type || 'N/A'}</strong>
        </p>

        {/* Provider Threshold (when threshold amount is set) */}
        {fee.provider_threshold_amount && parseFloat(fee.provider_threshold_amount) > 0 && (
          <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Threshold Configuration</p>
            <Input
              label="Threshold Amount ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.provider_threshold_amount?.toString() || ''}
              onChange={(e) => updateField('provider_threshold_amount', parseFloat(e.target.value) || 0)}
              placeholder="100.00"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500 mb-2">Below Threshold</p>
                <Input
                  label="Fixed ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.provider_below_threshold_fixed?.toString() || ''}
                  onChange={(e) => updateField('provider_below_threshold_fixed', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <div className="mt-2">
                  <Input
                    label="Percentage (%)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.provider_below_threshold_percentage?.toString() || ''}
                    onChange={(e) => updateField('provider_below_threshold_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-500 mb-2">At/Above Threshold</p>
                <Input
                  label="Fixed ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.provider_above_threshold_fixed?.toString() || ''}
                  onChange={(e) => updateField('provider_above_threshold_fixed', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <div className="mt-2">
                  <Input
                    label="Percentage (%)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.provider_above_threshold_percentage?.toString() || ''}
                    onChange={(e) => updateField('provider_above_threshold_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preview */}
      <FeePreview feeType={fee.fee_type} formValues={formData} />

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-xl border-gray-200 px-5"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active ?? fee.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#d71927] focus:ring-[#d71927]"
            />
            <span className="text-sm font-semibold text-gray-700">Active</span>
          </label>

          <Button
            type="submit"
            disabled={isSaving}
            isLoading={isSaving}
            className="rounded-xl bg-[#d71927] px-6 font-bold text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91420]"
          >
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
