'use client';

/**
 * UpdateProfileForm Component
 * Allows users to update their Maplerad customer profile information
 */

import React, { useState, useCallback } from 'react';
import { ChevronRight, Upload, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { useUpdateCustomer } from '@/hooks/useUpdateCustomer';
import { UpdateCustomerPayload, CustomerProfile } from '@/types/customer.types';

interface UpdateProfileFormProps {
  mapleradCustomerId: string;
  currentData?: Partial<CustomerProfile>;
  onSuccess?: (data: CustomerProfile) => void;
  className?: string;
}

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  nationality: string;
  identification_number: string;
  phone: {
    phone_country_code: string;
    phone_number: string;
  };
  address: {
    street: string;
    street2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  identity: {
    type: 'NIN' | 'PASSPORT' | 'VOTERS_CARD' | 'DRIVERS_LICENSE';
    number: string;
    country: string;
  };
}

const IDENTITY_TYPES = [
  { label: 'National ID (NIN)', value: 'NIN' },
  { label: 'Passport', value: 'PASSPORT' },
  { label: "Voter's Card", value: 'VOTERS_CARD' },
  { label: "Driver's License", value: 'DRIVERS_LICENSE' },
];

const COUNTRIES = [
  { label: 'Nigeria (NG)', value: 'NG' },
  { label: 'Ghana (GH)', value: 'GH' },
  { label: 'Kenya (KE)', value: 'KE' },
  { label: 'South Africa (ZA)', value: 'ZA' },
  { label: 'Uganda (UG)', value: 'UG' },
];

export const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({
  mapleradCustomerId,
  currentData,
  onSuccess,
  className = '',
}) => {
  const { loading, error, fieldErrors, success, updateCustomer, clearError } = useUpdateCustomer({
    onSuccess,
  });

  const [formData, setFormData] = useState<FormData>({
    first_name: currentData?.first_name || '',
    middle_name: currentData?.middle_name || '',
    last_name: currentData?.last_name || '',
    nationality: currentData?.nationality || '',
    identification_number: currentData?.identification_number || '',
    phone: {
      phone_country_code: currentData?.phone?.phone_country_code || '+234',
      phone_number: currentData?.phone?.phone_number || '',
    },
    address: {
      street: currentData?.address?.street || '',
      street2: currentData?.address?.street2 || '',
      city: currentData?.address?.city || '',
      state: currentData?.address?.state || '',
      country: currentData?.address?.country || 'NG',
      postal_code: currentData?.address?.postal_code || '',
    },
    identity: {
      type: (currentData?.identity?.type as any) || 'NIN',
      number: currentData?.identity?.number || '',
      country: currentData?.identity?.country || 'NG',
    },
  });

  const [activeSection, setActiveSection] = useState<'personal' | 'contact' | 'address' | 'identity'>('personal');
  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) clearError();
  }, [error, clearError]);

  const handleNestedChange = useCallback(
    (section: 'phone' | 'address' | 'identity', field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [field]: value,
        },
      }));
      if (error) clearError();
    },
    [error, clearError]
  );

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIdentityImage(file);
      if (error) clearError();
    }
  }, [error, clearError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuccessMessage(false);

      // Build payload without customer_id
      const payloadWithId: any = {
        customer_id: String(mapleradCustomerId),
        ...(formData.first_name && { first_name: formData.first_name }),
        ...(formData.middle_name && { middle_name: formData.middle_name }),
        ...(formData.last_name && { last_name: formData.last_name }),
        ...(formData.nationality && { nationality: formData.nationality }),
        ...(formData.identification_number && { identification_number: formData.identification_number }),
      };

      // Destructure to remove customer_id
      const { customer_id, ...payload } = payloadWithId;

      // Add phone if populated
      if (formData.phone.phone_number) {
        payload.phone = {
          phone_country_code: formData.phone.phone_country_code,
          phone_number: formData.phone.phone_number,
        };
      }

      // Add address if street is populated
      if (formData.address.street) {
        payload.address = {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          country: formData.address.country,
          postal_code: formData.address.postal_code,
          ...(formData.address.street2 && { street2: formData.address.street2 }),
        };
      }

      // Add identity if number is populated
      if (formData.identity.number) {
        payload.identity = {
          type: formData.identity.type,
          number: formData.identity.number,
          country: formData.identity.country,
          ...(identityImage && { image: identityImage.name }), // In production, upload to Cloudinary
        };
      }

      const result = await updateCustomer(payload as UpdateCustomerPayload);
      if (result) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    },
    [mapleradCustomerId, formData, identityImage, updateCustomer]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Update Failed</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
            
            {/* Display field-level errors */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="mt-3 space-y-1 border-t border-red-200 pt-3">
                <p className="text-xs font-semibold text-red-900">Validation Errors:</p>
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <div key={field} className="text-xs text-red-700 pl-3">
                    • <span className="font-semibold">{field.replace(/_/g, ' ')}:</span> {message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Profile Updated</p>
            <p className="text-sm text-green-800 mt-1">Your profile has been successfully updated</p>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'personal', label: 'Personal' },
          { id: 'contact', label: 'Contact' },
          { id: 'address', label: 'Address' },
          { id: 'identity', label: 'Identity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
              activeSection === tab.id
                ? 'text-[#d71927] border-b-2 border-[#d71927]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        {activeSection === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>

            <Input
              label="First Name"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="John"
              required
            />

            <Input
              label="Middle Name (Optional)"
              type="text"
              value={formData.middle_name}
              onChange={(e) => handleInputChange('middle_name', e.target.value)}
              placeholder="Emeka"
            />

            <Input
              label="Last Name"
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Doe"
              required
            />

            <Select
              label="Nationality"
              options={COUNTRIES}
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            />

            <Input
              label="Identification Number"
              type="text"
              value={formData.identification_number}
              onChange={(e) => handleInputChange('identification_number', e.target.value)}
              placeholder="e.g., BVN"
            />
          </div>
        )}

        {/* Contact Information Section */}
        {activeSection === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>

            <Input
              label="Phone Country Code"
              type="text"
              value={formData.phone.phone_country_code}
              onChange={(e) => handleNestedChange('phone', 'phone_country_code', e.target.value)}
              placeholder="+234"
            />

            <Input
              label="Phone Number"
              type="text"
              value={formData.phone.phone_number}
              onChange={(e) => handleNestedChange('phone', 'phone_number', e.target.value)}
              placeholder="8012345678"
            />
          </div>
        )}

        {/* Address Section */}
        {activeSection === 'address' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Address</h3>

            <Input
              label="Street Address"
              type="text"
              value={formData.address.street}
              onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
              placeholder="123 Main Street"
            />

            <Input
              label="Street Address Line 2 (Optional)"
              type="text"
              value={formData.address.street2}
              onChange={(e) => handleNestedChange('address', 'street2', e.target.value)}
              placeholder="Apartment 4B"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                type="text"
                value={formData.address.city}
                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                placeholder="Lagos"
              />

              <Input
                label="State/Province"
                type="text"
                value={formData.address.state}
                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                placeholder="Lagos"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Country"
                options={COUNTRIES}
                value={formData.address.country}
                onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
              />

              <Input
                label="Postal Code"
                type="text"
                value={formData.address.postal_code}
                onChange={(e) => handleNestedChange('address', 'postal_code', e.target.value)}
                placeholder="100001"
              />
            </div>
          </div>
        )}

        {/* Identity Verification Section */}
        {activeSection === 'identity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Identity Verification</h3>

            <Select
              label="Identity Document Type"
              options={IDENTITY_TYPES}
              value={formData.identity.type}
              onChange={(e) => handleNestedChange('identity', 'type', e.target.value)}
            />

            <Input
              label="Document Number"
              type="text"
              value={formData.identity.number}
              onChange={(e) => handleNestedChange('identity', 'number', e.target.value)}
              placeholder="12345678901"
            />

            <Select
              label="Document Country"
              options={COUNTRIES}
              value={formData.identity.country}
              onChange={(e) => handleNestedChange('identity', 'country', e.target.value)}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Document Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#d71927] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="identity-image-input"
                />
                <label htmlFor="identity-image-input" className="cursor-pointer">
                  {identityImage ? (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-green-600" />
                      <p className="text-sm font-semibold text-green-600">Selected: {identityImage.name}</p>
                      <p className="text-xs text-gray-600">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-gray-700">Click to upload document image</p>
                      <p className="text-xs text-gray-600">PNG, JPG, or PDF (max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="flex-1 h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Update Profile
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
