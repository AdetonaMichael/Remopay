'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Upload, X, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { DatePicker } from '@/components/shared/DatePicker';
import { useAlert } from '@/hooks/useAlert';
import { useApi } from '@/hooks/useApi';
import { tierUpgradeService } from '@/services/tier-upgrade.service';
import {
  Tier0UpgradeData,
  Tier1UpgradeData,
  Tier2UpgradeData,
  TierLevel,
} from '@/types/tier-upgrade.types';
import {
  validateTier0,
  validateTier1,
  validateTier2,
  getCountryOptions,
  getPhoneCountryCodeOptions,
  getIdentityDocumentTypeOptions,
  getFieldErrorMessage,
} from '@/utils/tier-upgrade-validation.utils';

interface InitialFormData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

interface TierUpgradeFormProps {
  currentTier: TierLevel;
  onSuccess?: (tier: TierLevel) => void;
  initialData?: InitialFormData;
}

interface TierFormState {
  tier0: Partial<Tier0UpgradeData>;
  tier1: Partial<Tier1UpgradeData>;
  tier2: Partial<Tier2UpgradeData>;
}

interface TierFormErrors {
  tier0: Record<string, string>;
  tier1: Record<string, string>;
  tier2: Record<string, string>;
}

type ActiveTier = 0 | 1 | 2 | null;

const TIER_TITLES = {
  0: 'Basic Information',
  1: 'Personal Details',
  2: 'Identity Verification',
};

const TIER_DESCRIPTIONS = {
  0: 'Set up your basic profile to get started',
  1: 'Add personal information to unlock Bronze benefits',
  2: 'Verify your identity to unlock Silver benefits',
};

export const TierUpgradeFormV2: React.FC<TierUpgradeFormProps> = ({
  currentTier,
  onSuccess,
  initialData,
}) => {
  const { success, error: alertError } = useAlert();
  const { execute } = useApi();

  // Form state
  const [formState, setFormState] = useState<TierFormState>({
    tier0: initialData ? {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
    } : {},
    tier1: {},
    tier2: {},
  });

  const [errors, setErrors] = useState<TierFormErrors>({
    tier0: {},
    tier1: {},
    tier2: {},
  });

  const [previewImage, setPreviewImage] = useState<{ [key: string]: string }>({});
  const [activeTier, setActiveTier] = useState<ActiveTier>(currentTier === 0 ? 0 : currentTier === 1 ? 1 : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bvnVerified, setBvnVerified] = useState(false);
  const [submitState, setSubmitState] = useState<{ tier: TierLevel; success: boolean } | null>(null);

  // ============= FIELD HANDLERS =============

  const updateTierField = useCallback((tier: 0 | 1 | 2, fieldPath: string, value: any) => {
    setFormState((prev) => {
      const newData = JSON.parse(JSON.stringify(prev[`tier${tier}` as keyof TierFormState]));
      const keys = fieldPath.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return {
        ...prev,
        [`tier${tier}`]: newData,
      };
    });

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [`tier${tier}`]: {
        ...prev[`tier${tier}` as keyof TierFormErrors],
        [fieldPath]: '',
      },
    }));
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, fieldPath: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alertError('Please upload a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alertError('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        const tier = parseInt(fieldPath.split('.')[0]) as 0 | 1 | 2;
        updateTierField(tier, fieldPath, base64String);
        setPreviewImage((prev) => ({
          ...prev,
          [fieldPath]: base64String,
        }));
      };

      reader.readAsDataURL(file);
    },
    [updateTierField, alertError]
  );

  // ============= BVN VERIFICATION =============

  const handleVerifyBVN = async () => {
    const bvn = formState.tier1.identification_number;
    if (!bvn || bvn.length !== 11) {
      alertError('Please enter a valid 11-digit BVN');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await execute(tierUpgradeService.verifyBVN(bvn));
      if (response?.data) {
        setBvnVerified(true);
        success('BVN verified successfully!');
        // Pre-fill name if available
        if (response.data.first_name && response.data.last_name) {
          updateTierField(1, 'first_name', response.data.first_name);
          updateTierField(1, 'last_name', response.data.last_name);
        }
      } else {
        alertError('BVN verification failed. Please check and try again.');
      }
    } catch (err: any) {
      alertError(err.message || 'BVN verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============= SUBMIT HANDLERS =============

  const handleSubmitTier0 = async () => {
    const validation = validateTier0(formState.tier0);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors((prev) => ({ ...prev, tier0: errorMap }));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await execute(tierUpgradeService.enrollCustomer(formState.tier0 as Tier0UpgradeData));
      
      if (response?.data) {
        setSubmitState({ tier: 0, success: true });
        success('Successfully enrolled! You can now upgrade to Bronze.');
        onSuccess?.(0);
      } else {
        alertError('Enrollment failed. Please try again.');
      }
    } catch (err: any) {
      alertError(err.message || 'Enrollment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTier1 = async () => {
    const validation = validateTier1(formState.tier1);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors((prev) => ({ ...prev, tier1: errorMap }));
      return;
    }

    if (!bvnVerified) {
      alertError('Please verify your BVN before upgrading');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await execute(tierUpgradeService.upgradeTierOne(formState.tier1 as Tier1UpgradeData));
      
      if (response?.data) {
        setSubmitState({ tier: 1, success: true });
        success('Successfully upgraded to Bronze! You can now upgrade to Silver.');
        onSuccess?.(1);
      } else {
        alertError('Tier 1 upgrade failed. Please try again.');
      }
    } catch (err: any) {
      alertError(err.message || 'Tier 1 upgrade failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTier2 = async () => {
    const validation = validateTier2(formState.tier2);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors((prev) => ({ ...prev, tier2: errorMap }));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await execute(tierUpgradeService.upgradeTierTwo(formState.tier2 as Tier2UpgradeData));
      
      if (response?.data) {
        setSubmitState({ tier: 2, success: true });
        success('Successfully upgraded to Silver! Maximum account tier reached.');
        onSuccess?.(2);
      } else {
        alertError('Tier 2 upgrade failed. Please try again.');
      }
    } catch (err: any) {
      alertError(err.message || 'Tier 2 upgrade failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============= RENDER TIER 0 =============

  const renderTier0 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          type="text"
          placeholder="John"
          value={formState.tier0.first_name || ''}
          onChange={(e) => updateTierField(0, 'first_name', e.target.value)}
          error={errors.tier0.first_name}
          required
        />
        <Input
          label="Last Name"
          type="text"
          placeholder="Doe"
          value={formState.tier0.last_name || ''}
          onChange={(e) => updateTierField(0, 'last_name', e.target.value)}
          error={errors.tier0.last_name}
          required
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        value={formState.tier0.email || ''}
        onChange={(e) => updateTierField(0, 'email', e.target.value)}
        error={errors.tier0.email}
        required
      />

      <Select
        label="Country"
        options={getCountryOptions()}
        value={formState.tier0.country || ''}
        onChange={(e) => updateTierField(0, 'country', e.target.value)}
        error={errors.tier0.country}
        required
      />

      <Button
        onClick={handleSubmitTier0}
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
      >
        Complete Enrollment
      </Button>
    </div>
  );

  // ============= RENDER TIER 1 =============

  const renderTier1 = () => (
    <div className="space-y-6">
      {/* Date of Birth */}
      <DatePicker
        label="Date of Birth"
        value={formState.tier1.date_of_birth || ''}
        onChange={(value) => updateTierField(1, 'date_of_birth', value)}
        helperText="You must be at least 18 years old"
        error={errors.tier1.date_of_birth}
        required
      />

      {/* Phone Number */}
      <div>
        <h4 className="font-semibold text-[#111] mb-4">Phone Number</h4>
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 items-end">
          <Select
            label="Code"
            options={getPhoneCountryCodeOptions()}
            value={formState.tier1.phone_number?.country_code || ''}
            onChange={(e) => updateTierField(1, 'phone_number.country_code', e.target.value)}
            error={errors.tier1['phone_number.country_code']}
            required
          />
          <div>
            <label className="block text-sm font-black text-[#111] mb-2">
              Number
              <span className="text-[#d71927] ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                placeholder="10-11 digits"
                value={formState.tier1.phone_number?.number || ''}
                onChange={(e) => updateTierField(1, 'phone_number.number', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 bg-white text-[#111] text-sm font-medium outline-none transition placeholder:text-black/35
                  ${errors.tier1['phone_number.number'] ? 'border-[#d71927] focus:ring-4 focus:ring-[#d71927]/10' : 'border-black/10 focus:border-[#d71927] focus:ring-4 focus:ring-[#d71927]/10'}
                  hover:border-black/20`}
              />
            </div>
            {errors.tier1['phone_number.number'] && (
              <p className="mt-2 text-sm font-semibold text-[#d71927]">{errors.tier1['phone_number.number']}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="font-semibold text-[#111] mb-4">Address</h4>
        <Input
          label="Street Address"
          type="text"
          placeholder="Street address"
          value={formState.tier1.address?.street_address || ''}
          onChange={(e) => updateTierField(1, 'address.street_address', e.target.value)}
          error={errors.tier1['address.street_address']}
          required
        />

        <Input
          label="Street Address 2 (Optional)"
          type="text"
          placeholder="Apartment, suite, etc."
          value={formState.tier1.address?.street_address_2 || ''}
          onChange={(e) => updateTierField(1, 'address.street_address_2', e.target.value)}
          className="mt-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="City"
            type="text"
            placeholder="City"
            value={formState.tier1.address?.city || ''}
            onChange={(e) => updateTierField(1, 'address.city', e.target.value)}
            error={errors.tier1['address.city']}
            required
          />
          <Input
            label="State / Province"
            type="text"
            placeholder="State or province"
            value={formState.tier1.address?.state_province || ''}
            onChange={(e) => updateTierField(1, 'address.state_province', e.target.value)}
            error={errors.tier1['address.state_province']}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Select
            label="Country"
            options={getCountryOptions()}
            value={formState.tier1.address?.country || ''}
            onChange={(e) => updateTierField(1, 'address.country', e.target.value)}
            error={errors.tier1['address.country']}
            required
          />
          <Input
            label="Postal Code"
            type="text"
            placeholder="Postal code"
            value={formState.tier1.address?.postal_code || ''}
            onChange={(e) => updateTierField(1, 'address.postal_code', e.target.value)}
            error={errors.tier1['address.postal_code']}
            required
          />
        </div>
      </div>

      {/* BVN */}
      <div>
        <h4 className="font-semibold text-[#111] mb-4">Identification</h4>
        <div className="flex gap-2">
          <Input
            label="BVN (11 digits)"
            type="text"
            placeholder="11-digit BVN"
            value={formState.tier1.identification_number || ''}
            onChange={(e) => updateTierField(1, 'identification_number', e.target.value)}
            error={errors.tier1.identification_number}
            required
            className="flex-1"
          />
          <div className="pt-8">
            <Button
              type="button"
              onClick={handleVerifyBVN}
              disabled={isSubmitting || bvnVerified}
              variant={bvnVerified ? 'secondary' : 'outline'}
              className={`h-11 rounded-xl px-4 font-black ${bvnVerified ? 'bg-green-50 border-green-300 text-green-700' : 'border-black/10'}`}
            >
              {bvnVerified ? '✓ Verified' : 'Verify'}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block font-semibold text-[#111] mb-3">
          Profile Photo <span className="text-[#d71927]">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-[#d71927] transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'tier1.profile_photo')}
            className="hidden"
            id="profile-photo-input"
          />
          <label htmlFor="profile-photo-input" className="cursor-pointer">
            {previewImage['tier1.profile_photo'] ? (
              <div className="space-y-2">
                <img src={previewImage['tier1.profile_photo']} alt="Profile" className="w-24 h-24 rounded-lg mx-auto object-cover" />
                <p className="text-sm text-gray-600">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-gray-700">Click to upload photo</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <Button
        onClick={handleSubmitTier1}
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
      >
        Upgrade to Bronze
      </Button>
    </div>
  );

  // ============= RENDER TIER 2 =============

  const renderTier2 = () => (
    <div className="space-y-6">
      {/* Identity Document Type */}
      <Select
        label="Identity Document Type"
        options={getIdentityDocumentTypeOptions()}
        value={formState.tier2.identity_document?.type || ''}
        onChange={(e) => updateTierField(2, 'identity_document.type', e.target.value)}
        error={errors.tier2['identity_document.type']}
        required
      />

      {/* Document Number */}
      <Input
        label="Document Number"
        type="text"
        placeholder="Document number"
        value={formState.tier2.identity_document?.document_number || ''}
        onChange={(e) => updateTierField(2, 'identity_document.document_number', e.target.value)}
        error={errors.tier2['identity_document.document_number']}
        required
      />

      {/* Country of Issue */}
      <Select
        label="Country of Issue"
        options={getCountryOptions()}
        value={formState.tier2.identity_document?.country_of_issue || ''}
        onChange={(e) => updateTierField(2, 'identity_document.country_of_issue', e.target.value)}
        error={errors.tier2['identity_document.country_of_issue']}
        required
      />

      {/* Document Image */}
      <div>
        <label className="block font-semibold text-[#111] mb-3">
          Document Image <span className="text-[#d71927]">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-[#d71927] transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'tier2.identity_document.document_image')}
            className="hidden"
            id="document-input"
          />
          <label htmlFor="document-input" className="cursor-pointer">
            {previewImage['tier2.identity_document.document_image'] ? (
              <div className="space-y-2">
                <img src={previewImage['tier2.identity_document.document_image']} alt="Document" className="w-24 h-24 rounded-lg mx-auto object-cover" />
                <p className="text-sm text-gray-600">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-gray-700">Click to upload document</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <Button
        onClick={handleSubmitTier2}
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
      >
        Upgrade to Silver
      </Button>
    </div>
  );

  // ============= SUCCESS STATE =============

  if (submitState?.success) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#111]">Tier {submitState.tier} Complete!</h3>
          <p className="text-sm text-black/50 mt-2">Your tier has been successfully upgraded.</p>
        </div>

        {submitState.tier < 2 && (
          <Button
            onClick={() => {
              setSubmitState(null);
              setActiveTier((submitState.tier + 1) as ActiveTier);
            }}
            className="w-full h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
          >
            Proceed to Next Tier
          </Button>
        )}

        <Button
          onClick={() => window.location.href = '/dashboard'}
          variant="outline"
          className="w-full h-11 rounded-xl border-black/10 px-6 font-black text-[#111] hover:bg-[#fff1f2]"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ============= MAIN RENDER =============

  return (
    <div className="space-y-6">
      {/* Tier Selection */}
      {activeTier === null && currentTier > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTier === 1 && (
            <button
              onClick={() => setActiveTier(1)}
              className="p-6 rounded-2xl border-2 border-[#d71927] bg-[#fff1f2] hover:bg-[#ffe6e8] transition text-left"
            >
              <h3 className="font-black text-[#111] text-lg">Tier 1: Bronze</h3>
              <p className="text-sm text-black/50 mt-1">Add personal information</p>
            </button>
          )}
          {currentTier <= 1 && (
            <button
              onClick={() => setActiveTier(2)}
              className="p-6 rounded-2xl border-2 border-black/10 bg-[#f8f8f8] hover:bg-white transition text-left"
            >
              <h3 className="font-black text-[#111] text-lg">Tier 2: Silver</h3>
              <p className="text-sm text-black/50 mt-1">Verify your identity</p>
            </button>
          )}
        </div>
      )}

      {/* Tier Form */}
      {activeTier === 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#111]">{TIER_TITLES[0]}</h2>
            <p className="text-sm text-black/50 mt-1">{TIER_DESCRIPTIONS[0]}</p>
          </div>
          {renderTier0()}
        </div>
      )}

      {activeTier === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#111]">{TIER_TITLES[1]}</h2>
            <p className="text-sm text-black/50 mt-1">{TIER_DESCRIPTIONS[1]}</p>
          </div>
          {renderTier1()}
        </div>
      )}

      {activeTier === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#111]">{TIER_TITLES[2]}</h2>
            <p className="text-sm text-black/50 mt-1">{TIER_DESCRIPTIONS[2]}</p>
          </div>
          {renderTier2()}
        </div>
      )}
    </div>
  );
};
