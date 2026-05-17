'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useAdvertisementsAdmin } from '@/hooks/useAdvertisements';
import {
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
  AdvertisementAdmin,
  ActionType,
  Platform,
} from '@/types/api.types';

const ICONS = [
  'wallet',
  'send',
  'credit-card',
  'star',
  'gift',
  'share-2',
  'trending-up',
  'zap',
  'shield-check',
  'external-link',
  'target',
  'award',
];

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'navigation', label: 'Navigation (Internal Route)' },
  { value: 'deepLink', label: 'Deep Link (External App)' },
  { value: 'externalUrl', label: 'External URL' },
  { value: 'customAction', label: 'Custom Action' },
];

const NAVIGATION_ROUTES = [
  'fund',
  'transfer',
  'bills',
  'cards',
  'profile',
  'referrals',
  'swap',
  'stake',
];

interface AdvertisementFormProps {
  ad?: AdvertisementAdmin;
  onClose: () => void;
  onSave?: () => void;
}

/**
 * Advertisement Form Component for creating/editing ads
 */
export const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  ad,
  onClose,
  onSave,
}) => {
  const { createAd, updateAd } = useAdvertisementsAdmin();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: ad?.title || '',
    subtitle: ad?.subtitle || '',
    icon: ad?.icon || 'wallet',
    button_text: ad?.buttonText || '',
    action_type: ad?.actionType || ('navigation' as ActionType),
    action_value: ad?.actionValue || '',
    image_url: ad?.image.url || '',
    fallback_color: ad?.image.fallbackColor || '#1E40AF',
    gradient_start: ad?.gradient.start || '#1E40AF',
    gradient_end: ad?.gradient.end || '#1E3A8A',
    display_duration: ad?.displayDuration || 5500,
    display_order: ad?.displayOrder || 1,
    is_active: ad?.isActive || true,
    platform: ad?.platform || ('all' as Platform),
    valid_from: ad ? new Date(ad.validFrom).toISOString().split('T')[0] : '',
    valid_until: ad ? new Date(ad.validUntil).toISOString().split('T')[0] : '',
    notes: ad?.notes || '',
  });

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          image_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 40) newErrors.title = 'Title must not exceed 40 characters';

    if (!formData.subtitle.trim()) newErrors.subtitle = 'Subtitle is required';
    if (formData.subtitle.length > 50) newErrors.subtitle = 'Subtitle must not exceed 50 characters';

    if (!formData.button_text.trim()) newErrors.button_text = 'Button text is required';
    if (formData.button_text.length > 20) newErrors.button_text = 'Button text must not exceed 20 characters';

    if (!formData.action_value.trim()) newErrors.action_value = 'Action value is required';
    if (formData.action_value.length > 500) newErrors.action_value = 'Action value must not exceed 500 characters';

    if (!formData.image_url.trim()) newErrors.image_url = 'Image URL is required';
    try {
      new URL(formData.image_url);
    } catch {
      newErrors.image_url = 'Invalid image URL';
    }

    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(formData.fallback_color)) newErrors.fallback_color = 'Invalid hex color';
    if (!hexColorRegex.test(formData.gradient_start)) newErrors.gradient_start = 'Invalid hex color';
    if (!hexColorRegex.test(formData.gradient_end)) newErrors.gradient_end = 'Invalid hex color';

    if (formData.display_duration < 3000 || formData.display_duration > 10000) {
      newErrors.display_duration = 'Duration must be between 3000 and 10000 ms';
    }

    if (formData.display_order < 1) newErrors.display_order = 'Display order must be at least 1';

    if (!formData.valid_from) newErrors.valid_from = 'Valid from date is required';
    if (!formData.valid_until) newErrors.valid_until = 'Valid until date is required';

    if (new Date(formData.valid_from) >= new Date(formData.valid_until)) {
      newErrors.valid_until = 'Valid until must be after valid from';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Format dates to PHP format: Y-m-d H:i:s
      const formatDateForAPI = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const data = {
        ...formData,
        valid_from: formatDateForAPI(formData.valid_from),
        valid_until: formatDateForAPI(formData.valid_until),
        display_duration: Number(formData.display_duration),
        display_order: Number(formData.display_order),
      };

      if (ad) {
        await updateAd(ad.id, data as UpdateAdvertisementRequest);
      } else {
        await createAd(data as CreateAdvertisementRequest);
      }

      onSave?.();
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {ad ? 'Edit Advertisement' : 'Create Advertisement'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Instant Funding"
                  maxLength={40}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/40</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Icon <span className="text-red-500">*</span>
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Subtitle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="e.g., Get up to 5% bonus on deposits"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
              <p className="text-xs text-gray-500 mt-1">{formData.subtitle.length}/50</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Button Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="button_text"
                value={formData.button_text}
                onChange={handleInputChange}
                placeholder="e.g., Fund Now"
                maxLength={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.button_text && <p className="text-red-500 text-sm mt-1">{errors.button_text}</p>}
              <p className="text-xs text-gray-500 mt-1">{formData.button_text.length}/20</p>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Action</h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Action Type <span className="text-red-500">*</span>
              </label>
              <select
                name="action_type"
                value={formData.action_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Action Value <span className="text-red-500">*</span>
              </label>
              {formData.action_type === 'navigation' ? (
                <select
                  name="action_value"
                  value={formData.action_value}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a route</option>
                  {NAVIGATION_ROUTES.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  name="action_value"
                  value={formData.action_value}
                  onChange={handleInputChange}
                  placeholder="e.g., https://example.com/promo"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              {errors.action_value && <p className="text-red-500 text-sm mt-1">{errors.action_value}</p>}
            </div>
          </div>

          {/* Visual */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Visual</h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/ad-image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
              {imagePreview && (
                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Fallback Color <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="fallback_color"
                    value={formData.fallback_color}
                    onChange={handleInputChange}
                    className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.fallback_color}
                    onChange={handleInputChange}
                    name="fallback_color"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                {errors.fallback_color && <p className="text-red-500 text-sm mt-1">{errors.fallback_color}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Gradient Start <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="gradient_start"
                    value={formData.gradient_start}
                    onChange={handleInputChange}
                    className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.gradient_start}
                    onChange={handleInputChange}
                    name="gradient_start"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                {errors.gradient_start && <p className="text-red-500 text-sm mt-1">{errors.gradient_start}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Gradient End <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="gradient_end"
                    value={formData.gradient_end}
                    onChange={handleInputChange}
                    className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.gradient_end}
                    onChange={handleInputChange}
                    name="gradient_end"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                {errors.gradient_end && <p className="text-red-500 text-sm mt-1">{errors.gradient_end}</p>}
              </div>
            </div>

            <div
              className="h-32 rounded-lg border-2 border-gray-300"
              style={{
                background: `linear-gradient(135deg, ${formData.gradient_start} 0%, ${formData.gradient_end} 100%)`,
              }}
            />
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Display Settings</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Display Duration (ms) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="display_duration"
                  value={formData.display_duration}
                  onChange={handleInputChange}
                  min={3000}
                  max={10000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.display_duration && <p className="text-red-500 text-sm mt-1">{errors.display_duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Display Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.display_order && <p className="text-red-500 text-sm mt-1">{errors.display_order}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Platform <span className="text-red-500">*</span>
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="mobile">Mobile</option>
                  <option value="web">Web</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-900">Active</span>
              </label>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Scheduling</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.valid_from && <p className="text-red-500 text-sm mt-1">{errors.valid_from}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.valid_until && <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Internal notes about this advertisement..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : ad ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvertisementForm;
