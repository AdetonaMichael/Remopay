/**
 * Tier Upgrade Validation Utilities
 */

import { ValidationResult, ValidationError } from '@/types/tier-upgrade.types';

const COUNTRIES = [
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
];

const PHONE_COUNTRY_CODES = [
  { value: '+234', label: '+234 Nigeria' },
  { value: '+233', label: '+233 Ghana' },
  { value: '+254', label: '+254 Kenya' },
  { value: '+27', label: '+27 South Africa' },
  { value: '+1', label: '+1 North America' },
  { value: '+44', label: '+44 UK' },
  { value: '+61', label: '+61 Australia' },
];

const IDENTITY_DOCUMENT_TYPES = [
  { value: 'NIN', label: 'National ID (NIN)' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Driver_License', label: "Driver's License" },
  { value: 'Voters_Card', label: "Voter's Card" },
];

// ============= VALIDATION FUNCTIONS =============

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // 10-11 digits
  const phoneRegex = /^\d{10,11}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateDateOfBirth = (dob: string): boolean => {
  // Format: DD-MM-YYYY
  const dobRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!dobRegex.test(dob)) return false;

  const [day, month, year] = dob.split('-').map(Number);

  // Validate ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Simple age check - must be at least 18 years old
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    return age - 1 >= 18;
  }

  return age >= 18;
};

export const validateIdentificationNumber = (id: string): boolean => {
  // 11 characters - typically BVN/NIN
  return id.replace(/\s/g, '').length === 11 && /^\d+$/.test(id);
};

export const validatePostalCode = (postalCode: string): boolean => {
  // General validation - 3-10 characters
  return postalCode.trim().length >= 3 && postalCode.trim().length <= 10;
};

export const validateBase64Image = (base64String: string): boolean => {
  // Check if it's a valid base64 string
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif);base64,/;
  return base64Regex.test(base64String);
};

export const validateDocumentNumber = (docNumber: string): boolean => {
  // Document number validation - at least 5 characters
  return docNumber.trim().length >= 5;
};

// ============= STEP-WISE VALIDATION =============

export const validateTier0 = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (!data.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email address' });
  }

  if (!data.country) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTier1 = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate Tier 0 fields first
  const tier0Validation = validateTier0(data);
  errors.push(...tier0Validation.errors);

  // Date of Birth
  if (!data.date_of_birth?.trim()) {
    errors.push({ field: 'date_of_birth', message: 'Date of birth is required' });
  } else if (!validateDateOfBirth(data.date_of_birth)) {
    errors.push({
      field: 'date_of_birth',
      message: 'Invalid date (must be DD-MM-YYYY and at least 18 years old)',
    });
  }

  // Phone Number
  if (!data.phone_number?.country_code) {
    errors.push({ field: 'phone_country_code', message: 'Phone country code is required' });
  }

  if (!data.phone_number?.number) {
    errors.push({ field: 'phone_number', message: 'Phone number is required' });
  } else if (!validatePhoneNumber(data.phone_number.number)) {
    errors.push({
      field: 'phone_number',
      message: 'Invalid phone number (must be 10-11 digits)',
    });
  }

  // Address
  if (!data.address?.street_address?.trim()) {
    errors.push({ field: 'street_address', message: 'Street address is required' });
  }

  if (!data.address?.city?.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!data.address?.state_province?.trim()) {
    errors.push({ field: 'state_province', message: 'State/Province is required' });
  }

  if (!data.address?.country?.trim()) {
    errors.push({ field: 'address_country', message: 'Country is required' });
  }

  if (!data.address?.postal_code?.trim()) {
    errors.push({ field: 'postal_code', message: 'Postal code is required' });
  } else if (!validatePostalCode(data.address.postal_code)) {
    errors.push({ field: 'postal_code', message: 'Invalid postal code' });
  }

  // Identification Number
  if (!data.identification_number?.trim()) {
    errors.push({ field: 'identification_number', message: 'Identification number is required' });
  } else if (!validateIdentificationNumber(data.identification_number)) {
    errors.push({
      field: 'identification_number',
      message: 'Invalid ID number (must be 11 digits)',
    });
  }

  // Profile Photo
  if (!data.profile_photo) {
    errors.push({ field: 'profile_photo', message: 'Profile photo is required' });
  } else if (!validateBase64Image(data.profile_photo)) {
    errors.push({ field: 'profile_photo', message: 'Invalid image format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTier2 = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate Tier 1 fields first
  const tier1Validation = validateTier1(data);
  errors.push(...tier1Validation.errors);

  // Identity Document
  if (!data.identity_document?.type) {
    errors.push({ field: 'identity_document_type', message: 'Document type is required' });
  }

  if (!data.identity_document?.document_image) {
    errors.push({ field: 'identity_document_image', message: 'Document image is required' });
  } else if (!validateBase64Image(data.identity_document.document_image)) {
    errors.push({ field: 'identity_document_image', message: 'Invalid image format' });
  }

  if (!data.identity_document?.document_number?.trim()) {
    errors.push({ field: 'document_number', message: 'Document number is required' });
  } else if (!validateDocumentNumber(data.identity_document.document_number)) {
    errors.push({ field: 'document_number', message: 'Invalid document number' });
  }

  if (!data.identity_document?.country_of_issue) {
    errors.push({ field: 'country_of_issue', message: 'Country of issue is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============= HELPER FUNCTIONS =============

export const getCountryOptions = () => COUNTRIES;

export const getPhoneCountryCodeOptions = () => PHONE_COUNTRY_CODES;

export const getIdentityDocumentTypeOptions = () => IDENTITY_DOCUMENT_TYPES;

export const formatPhoneNumber = (countryCode: string, phoneNumber: string): string => {
  return `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
};

export const formatDateOfBirth = (dob: string): string => {
  // Ensure DD-MM-YYYY format
  const parts = dob.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }
  return dob;
};

export const getFieldErrorMessage = (
  errors: ValidationError[],
  fieldName: string
): string | undefined => {
  return errors.find((e) => e.field === fieldName)?.message;
};

export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some((e) => e.field === fieldName);
};
