/**
 * Tier 0 Upgrade Form Component
 * Basic enrollment with minimal information
 * 
 * Fields:
 * - first_name (string)
 * - last_name (string)
 * - email (string)
 * - country (string)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { TierUpgradeFormData } from '@/types/tier-upgrade.types';

interface Tier0FormProps {
  initialData?: Partial<TierUpgradeFormData>;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (data: TierUpgradeFormData) => void;
  onSaveDraft: (data: Partial<TierUpgradeFormData>) => void;
}

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
].sort((a, b) => a.name.localeCompare(b.name));

export const Tier0Form: React.FC<Tier0FormProps> = ({
  initialData,
  isSubmitting,
  error,
  onSubmit,
  onSaveDraft,
}) => {
  const [formData, setFormData] = useState<TierUpgradeFormData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    country: initialData?.country || 'NG',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Save draft on field change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSaveDraft(formData);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, onSaveDraft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.country?.trim()) {
      errors.country = 'Country is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* First Name */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">First Name *</label>
        <Input
          name="first_name"
          type="text"
          placeholder="Enter your first name"
          value={formData.first_name || ''}
          onChange={handleInputChange}
          disabled={isSubmitting}
          error={fieldErrors.first_name}
        />
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">Last Name *</label>
        <Input
          name="last_name"
          type="text"
          placeholder="Enter your last name"
          value={formData.last_name || ''}
          onChange={handleInputChange}
          disabled={isSubmitting}
          error={fieldErrors.last_name}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">Email *</label>
        <Input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email || ''}
          onChange={handleInputChange}
          disabled={isSubmitting}
          error={fieldErrors.email}
        />
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">Country *</label>
        <select
          name="country"
          value={formData.country || 'NG'}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className={`w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d71927] $
            {fieldErrors.country ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {fieldErrors.country && <p className="text-sm text-red-600">{fieldErrors.country}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : (
          <span className="flex items-center justify-center gap-2">
            Continue <ChevronRight size={18} />
          </span>
        )}
      </Button>
    </form>
  );
};
