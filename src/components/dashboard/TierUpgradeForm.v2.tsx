'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Upload, X, Phone, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { DatePicker } from '@/components/shared/DatePicker';
import { Spinner } from '@/components/shared/Spinner';
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

// Country data
interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const getCountryFlag = (code: string): string => {
  return code
    .toUpperCase()
    .split('')
    .map((char: string) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', flag: getCountryFlag('NG'), dialCode: '+234' },
  { code: 'GB', name: 'United Kingdom', flag: getCountryFlag('GB'), dialCode: '+44' },
  { code: 'US', name: 'United States', flag: getCountryFlag('US'), dialCode: '+1' },
  { code: 'CA', name: 'Canada', flag: getCountryFlag('CA'), dialCode: '+1' },
  { code: 'ZA', name: 'South Africa', flag: getCountryFlag('ZA'), dialCode: '+27' },
  { code: 'GH', name: 'Ghana', flag: getCountryFlag('GH'), dialCode: '+233' },
  { code: 'KE', name: 'Kenya', flag: getCountryFlag('KE'), dialCode: '+254' },
  { code: 'IN', name: 'India', flag: getCountryFlag('IN'), dialCode: '+91' },
  { code: 'AE', name: 'United Arab Emirates', flag: getCountryFlag('AE'), dialCode: '+971' },
].sort((a, b) => a.name.localeCompare(b.name));

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

  // Phone input state
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(
    COUNTRIES.find(c => c.code === 'NG') || COUNTRIES[0]
  );
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const phoneSearchInputRef = useRef<HTMLInputElement>(null);

  const filteredPhoneCountries = useMemo(() => {
    if (!phoneSearchQuery.trim()) {
      return COUNTRIES;
    }
    
    const query = phoneSearchQuery.toLowerCase();
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query) ||
      country.dialCode.includes(query)
    );
  }, [phoneSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setPhoneDropdownOpen(false);
      }
    };

    if (phoneDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => phoneSearchInputRef.current?.focus(), 0);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [phoneDropdownOpen]);

  // Form state
  const [formState, setFormState] = useState<TierFormState>({
    tier0: initialData ? {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
    } : {},
    tier1: {
      phone: {
        phone_country_code: '+234', // Default to Nigeria
        phone_number: '',
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: 'NG',
        postal_code: '',
      },
    },
    tier2: {},
  });

  const [errors, setErrors] = useState<TierFormErrors>({
    tier0: {},
    tier1: {},
    tier2: {},
  });

  const [previewImage, setPreviewImage] = useState<{ [key: string]: string }>({});
  const [photoUploadStatus, setPhotoUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const getTierNumber = (tier: TierLevel | string): number => {
    if (tier === 'TIER_ZERO') return 0;
    if (tier === 'TIER_ONE') return 1;
    if (tier === 'TIER_TWO') return 2;
    return 0;
  };

  const [activeTier, setActiveTier] = useState<ActiveTier>(
    currentTier === 'TIER_ZERO' ? 0 : currentTier === 'TIER_ONE' ? 1 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bvnVerified, setBvnVerified] = useState(false);
  const [submitState, setSubmitState] = useState<{ tier: TierLevel; success: boolean } | null>(null);

  // ============= FIELD HANDLERS =============

  const updateTierField = useCallback((tier: 0 | 1 | 2, fieldPath: string, value: any) => {
    setFormState((prev) => {
      const currentData = prev[`tier${tier}` as keyof TierFormState] || {};
      const newData = JSON.parse(JSON.stringify(currentData));
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
    async (e: React.ChangeEvent<HTMLInputElement>, fieldPath: string) => {
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
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        setPreviewImage((prev) => ({
          ...prev,
          [tier === 1 && fieldPath === 'tier1.photo' ? 'photo' : fieldPath]: base64String,
        }));

        const tierMatch = fieldPath.match(/^tier(\d+)\./);
        if (!tierMatch) return;
        const tier = parseInt(tierMatch[1]) as 0 | 1 | 2;

        if (fieldPath === 'tier1.photo') {
          setPhotoUploadStatus('uploading');
          setPhotoUploadError(null);

          try {
            const response = await tierUpgradeService.uploadProfileImage(file);
            const imageUrl = response?.data?.image_url;

            if (!imageUrl) {
              throw new Error('Image upload failed. Please try again.');
            }

            updateTierField(tier, 'photo', imageUrl);
            setPhotoUploadStatus('uploaded');
            success('Profile photo uploaded successfully.');
          } catch (uploadError: any) {
            const message = uploadError?.message || 'Image upload failed. Please try again.';
            setPhotoUploadStatus('error');
            setPhotoUploadError(message);
            alertError(message);
          }
        } else {
          updateTierField(tier, fieldPath, base64String);
        }
      };

      reader.readAsDataURL(file);
    },
    [updateTierField, alertError, success]
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
        setSubmitState({ tier: 'TIER_ZERO', success: true });
        success('Successfully enrolled! You can now upgrade to Bronze.');
        onSuccess?.('TIER_ZERO');
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
    if (photoUploadStatus === 'uploading') {
      alertError('Please wait for your profile photo to finish uploading before submitting.');
      return;
    }

    console.log('Tier 1 form data:', formState.tier1);

    const validation = validateTier1(formState.tier1);
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
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
      console.log('Sending tier 1 data:', formState.tier1);
      const response = await execute(tierUpgradeService.upgradeTierOne(formState.tier1 as Tier1UpgradeData));
      
      if (response?.data) {
        setSubmitState({ tier: 'TIER_ONE', success: true });
        success('Successfully upgraded to Bronze! You can now upgrade to Silver.');
        onSuccess?.('TIER_ONE');
      } else {
        alertError('Tier 1 upgrade failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Tier 1 submission error:', err);
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
        setSubmitState({ tier: 'TIER_TWO', success: true });
        success('Successfully upgraded to Silver! Maximum account tier reached.');
        onSuccess?.('TIER_TWO');
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
        value={formState.tier1.dob || ''}
        onChange={(value) => updateTierField(1, 'dob', value)}
        helperText="You must be at least 18 years old"
        error={errors.tier1.dob}
        required
      />

      {/* Phone Number */}
      <div>
        <h4 className="font-semibold text-[#111] mb-4">Phone Number</h4>
        <div className="w-full">
          <div className="flex items-center w-full rounded-2xl border-2 border-black/10 bg-white hover:border-black/20 focus-within:border-[#d71927] focus-within:ring-4 focus-within:ring-[#d71927]/10 transition-all" style={{ zIndex: phoneDropdownOpen ? 40 : 'auto' }}>
            {/* Country Selector */}
            <div className="relative" ref={phoneDropdownRef}>
              <button
                type="button"
                onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                className="flex items-center gap-2 px-4 py-3 hover:bg-black/5 transition-colors border-r-2 border-black/10 min-w-fit flex-shrink-0"
                disabled={false}
              >
                <span className="text-xl leading-none">{selectedPhoneCountry?.flag}</span>
                <span className="text-sm font-semibold text-[#111] hidden sm:inline">{selectedPhoneCountry?.code}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-black/40 transition-transform duration-200 ${phoneDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {phoneDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-black/10 rounded-2xl shadow-xl z-50"
                >
                  {/* Search Header */}
                  <div className="sticky top-0 p-3 border-b-2 border-black/10 bg-gradient-to-b from-black/2 to-white rounded-t-2xl">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        ref={phoneSearchInputRef}
                        type="text"
                        placeholder="Search country..."
                        value={phoneSearchQuery}
                        onChange={(e) => setPhoneSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border-2 border-black/10 rounded-lg text-sm focus:outline-none focus:border-[#d71927] focus:ring-4 focus:ring-[#d71927]/10 transition-all"
                      />
                      {phoneSearchQuery && (
                        <button
                          onClick={() => setPhoneSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded transition-colors"
                        >
                          <X size={14} className="text-black/40" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Countries List */}
                  <div className="max-h-80 overflow-y-auto">
                    {filteredPhoneCountries.length > 0 ? (
                      filteredPhoneCountries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setSelectedPhoneCountry(country);
                            setPhoneDropdownOpen(false);
                            setPhoneSearchQuery('');
                            updateTierField(1, 'phone.phone_country_code', country.dialCode);
                          }}
                          type="button"
                          className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center gap-3 border-l-4 hover:bg-black/2 focus:outline-none ${
                            country.code === selectedPhoneCountry?.code 
                              ? 'bg-red-50 border-l-[#d71927]' 
                              : 'border-l-transparent hover:border-l-black/20'
                          }`}
                        >
                          <span className="text-lg leading-none flex-shrink-0">{country.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#111]">{country.name}</div>
                            <div className="text-xs text-black/50">{country.dialCode}</div>
                          </div>
                          {country.code === selectedPhoneCountry?.code && (
                            <div className="w-2 h-2 rounded-full bg-[#d71927] flex-shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-12 text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <p className="text-sm text-black/60">No countries found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number Input */}
            <input
              type="tel"
              placeholder="Enter phone number"
              value={formState.tier1.phone?.phone_number || ''}
              onChange={(e) => updateTierField(1, 'phone.phone_number', e.target.value)}
              className={`flex-1 px-4 py-3 text-[#111] text-sm font-medium outline-none transition placeholder:text-black/35 bg-transparent
                ${errors.tier1['phone.phone_number'] ? 'text-[#d71927] placeholder:text-[#d71927]/40' : ''}`}
            />
          </div>
          {errors.tier1['phone.phone_number'] && (
            <p className="mt-2 text-sm font-semibold text-[#d71927]">{errors.tier1['phone.phone_number']}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="font-semibold text-[#111] mb-4">Address</h4>
        <Input
          label="Street Address"
          type="text"
          placeholder="Street address"
          value={formState.tier1.address?.street || ''}
          onChange={(e) => updateTierField(1, 'address.street', e.target.value)}
          error={errors.tier1['address.street']}
          required
        />

        <Input
          label="Street Address 2 (Optional)"
          type="text"
          placeholder="Apartment, suite, etc."
          value={formState.tier1.address?.street2 || ''}
          onChange={(e) => updateTierField(1, 'address.street2', e.target.value)}
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
            value={formState.tier1.address?.state || ''}
            onChange={(e) => updateTierField(1, 'address.state', e.target.value)}
            error={errors.tier1['address.state']}
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
        {!bvnVerified && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">BVN verification is required before upgrading. Click the "Verify" button above to proceed.</p>
          </div>
        )}
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
            onChange={(e) => handleImageUpload(e, 'tier1.photo')}
            className="hidden"
            id="profile-photo-input"
          />
          <label htmlFor="profile-photo-input" className="cursor-pointer">
            {previewImage['photo'] ? (
              <div className="space-y-2">
                <img src={previewImage['photo']} alt="Profile" className="w-24 h-24 rounded-lg mx-auto object-cover" />
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
        {photoUploadStatus === 'uploading' && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[#111]">
            <Spinner size="sm" className="text-[#6b7280]" />
            Uploading photo…
          </div>
        )}
        {photoUploadStatus === 'uploaded' && (
          <p className="mt-3 text-sm font-medium text-green-600">Photo uploaded successfully.</p>
        )}
        {photoUploadError && (
          <p className="mt-3 text-sm font-medium text-[#d71927]">{photoUploadError}</p>
        )}
      </div>

      <Button
        onClick={handleSubmitTier1}
        disabled={isSubmitting || !bvnVerified}
        isLoading={isSubmitting}
        className="w-full h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!bvnVerified ? 'Verify BVN First' : 'Upgrade to Bronze'}
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
        value={formState.tier2.identity?.type || ''}
        onChange={(e) => updateTierField(2, 'identity.type', e.target.value)}
        error={errors.tier2['identity.type']}
        required
      />

      {/* Document Number */}
      <Input
        label="Document Number"
        type="text"
        placeholder="Document number"
        value={formState.tier2.identity?.number || ''}
        onChange={(e) => updateTierField(2, 'identity.number', e.target.value)}
        error={errors.tier2['identity.number']}
        required
      />

      {/* Country of Issue */}
      <Select
        label="Country of Issue"
        options={getCountryOptions()}
        value={formState.tier2.identity?.country || ''}
        onChange={(e) => updateTierField(2, 'identity.country', e.target.value)}
        error={errors.tier2['identity.country']}
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
            onChange={(e) => handleImageUpload(e, 'tier2.identity.image')}
            className="hidden"
            id="document-input"
          />
          <label htmlFor="document-input" className="cursor-pointer">
            {previewImage['tier2.identity.image'] ? (
              <div className="space-y-2">
                <img src={previewImage['tier2.identity.image']} alt="Document" className="w-24 h-24 rounded-lg mx-auto object-cover" />
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
          <h3 className="text-2xl font-black text-[#111]">Tier {getTierNumber(submitState.tier)} Complete!</h3>
          <p className="text-sm text-black/50 mt-2">Your tier has been successfully upgraded.</p>
        </div>

        {getTierNumber(submitState.tier) < 2 && (
          <Button
            onClick={() => {
              setSubmitState(null);
              const tierMap: Record<string, ActiveTier> = {
                'TIER_ZERO': 1,
                'TIER_ONE': 2,
                'TIER_TWO': 2,
              };
              setActiveTier(tierMap[submitState.tier] || 0);
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
      {activeTier === null && getTierNumber(currentTier) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getTierNumber(currentTier) === 1 && (
            <button
              onClick={() => setActiveTier(1)}
              className="p-6 rounded-2xl border-2 border-[#d71927] bg-[#fff1f2] hover:bg-[#ffe6e8] transition text-left"
            >
              <h3 className="font-black text-[#111] text-lg">Tier 1: Bronze</h3>
              <p className="text-sm text-black/50 mt-1">Add personal information</p>
            </button>
          )}
          {getTierNumber(currentTier) <= 1 && (
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
