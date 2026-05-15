/**
 * Tier Upgrade Validation Utilities
 * Updated: May 10, 2026
 * Matches backend API specifications for individual tier endpoints
 * 
 * Tier 0: PATCH /api/v1/payment/customers/tier-zero
 * Tier 1: PATCH /api/v1/payment/customers/tier-one  
 * Tier 2: PATCH /api/v1/payment/customers/tier-two
 */

import { ValidationResult, ValidationError } from '@/types/tier-upgrade.types';

// ============= VALIDATION HELPERS =============

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10-11 digits, numeric only)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '');
  return cleanedPhone.length >= 10 && cleanedPhone.length <= 11;
};

/**
 * Validate DOB in DD-MM-YYYY format and age >= 18
 */
export const validateDateOfBirth = (dob: string): boolean => {
  const dobRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!dobRegex.test(dob)) return false;

  const [day, month, year] = dob.split('-').map(Number);

  // Validate ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Simple age check - must be at least 18 years old
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }

  return age >= 18;
};

/**
 * Validate BVN (exactly 11 digits)
 */
export const validateBVN = (bvn: string): boolean => {
  const cleanedBVN = bvn.replace(/\D/g, '');
  return cleanedBVN.length === 11 && /^\d{11}$/.test(cleanedBVN);
};

/**
 * Validate postal code (3-10 characters)
 */
export const validatePostalCode = (postalCode: string): boolean => {
  const cleaned = postalCode.trim();
  return cleaned.length >= 3 && cleaned.length <= 10;
};

/**
 * Validate base64 encoded image
 */
export const validateBase64Image = (base64String: string): boolean => {
  if (!base64String) return false;
  try {
    // Check if it matches data URL format or is pure base64
    const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    if (base64Regex.test(base64String)) {
      return true;
    }
    // Try to validate as pure base64
    return /^[A-Za-z0-9+/=]+$/.test(base64String);
  } catch {
    return false;
  }
};

/**
 * Validate a URL string
 */
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Validate identity document number (minimum 5 characters)
 */
export const validateDocumentNumber = (docNumber: string): boolean => {
  const cleaned = docNumber.trim();
  return cleaned.length >= 5 && cleaned.length <= 50;
};

/**
 * Validate country code (2 letters, ISO 3166-1 alpha-2)
 */
export const validateCountryCode = (code: string): boolean => {
  return /^[A-Z]{2}$/.test(code);
};

// ============= TIER 0 VALIDATION =============
/**
 * Tier 0: PATCH /api/v1/payment/customers/tier-zero
 * Required fields: first_name, last_name, email, country
 */
export const validateTier0 = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // First Name
  if (!data.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  } else if (data.first_name.length > 255) {
    errors.push({ field: 'first_name', message: 'First name must be less than 255 characters' });
  }

  // Last Name
  if (!data.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  } else if (data.last_name.length > 255) {
    errors.push({ field: 'last_name', message: 'Last name must be less than 255 characters' });
  }

  // Email
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email address' });
  }

  // Country
  if (!data.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' });
  } else if (data.country.length > 255) {
    errors.push({ field: 'country', message: 'Country must be less than 255 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============= TIER 1 VALIDATION =============
/**
 * Tier 1: PATCH /api/v1/payment/customers/tier-one
 * Required fields:
 * - dob (DD-MM-YYYY format)
 * - phone.phone_country_code (e.g., "+234")
 * - phone.phone_number (10-11 digits)
 * - address.street, address.city, address.state, address.country, address.postal_code
 * - identification_number (BVN - exactly 11 digits)
 * - photo (uploaded image URL)
 */
export const validateTier1 = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Date of Birth (DD-MM-YYYY format, age >= 18)
  if (!data.dob?.trim()) {
    errors.push({ field: 'dob', message: 'Date of birth is required (DD-MM-YYYY)' });
  } else if (!validateDateOfBirth(data.dob)) {
    errors.push({
      field: 'dob',
      message: 'Invalid date of birth. Must be DD-MM-YYYY format and at least 18 years old',
    });
  }

  // Phone Country Code
  if (!data.phone?.phone_country_code?.trim()) {
    errors.push({ field: 'phone.phone_country_code', message: 'Phone country code is required (e.g., +234)' });
  } else if (!data.phone.phone_country_code.startsWith('+')) {
    errors.push({ field: 'phone.phone_country_code', message: 'Phone country code must start with +' });
  }

  // Phone Number
  if (!data.phone?.phone_number?.trim()) {
    errors.push({ field: 'phone.phone_number', message: 'Phone number is required' });
  } else if (!validatePhoneNumber(data.phone.phone_number)) {
    errors.push({
      field: 'phone.phone_number',
      message: 'Phone number must be 10-11 digits',
    });
  }

  // Address: Street
  if (!data.address?.street?.trim()) {
    errors.push({ field: 'address.street', message: 'Street address is required' });
  }

  // Address: City
  if (!data.address?.city?.trim()) {
    errors.push({ field: 'address.city', message: 'City is required' });
  }

  // Address: State
  if (!data.address?.state?.trim()) {
    errors.push({ field: 'address.state', message: 'State/Province is required' });
  }

  // Address: Country
  if (!data.address?.country?.trim()) {
    errors.push({ field: 'address.country', message: 'Country is required' });
  }

  // Address: Postal Code
  if (!data.address?.postal_code?.trim()) {
    errors.push({ field: 'address.postal_code', message: 'Postal code is required' });
  } else if (!validatePostalCode(data.address.postal_code)) {
    errors.push({ field: 'address.postal_code', message: 'Postal code must be 3-10 characters' });
  }

  // Identification Number (BVN - exactly 11 digits)
  if (!data.identification_number?.trim()) {
    errors.push({ field: 'identification_number', message: 'BVN is required' });
  } else if (!validateBVN(data.identification_number)) {
    errors.push({
      field: 'identification_number',
      message: 'BVN must be exactly 11 digits',
    });
  }

  // Profile photo URL (required for Tier 1 upgrade)
  if (!data.photo?.trim()) {
    errors.push({ field: 'photo', message: 'Profile photo is required' });
  } else if (!validateUrl(data.photo)) {
    errors.push({ field: 'photo', message: 'Profile photo must be a valid URL' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============= TIER 2 VALIDATION =============
/**
 * Tier 2: PATCH /api/v1/payment/customers/tier-two
 * Required fields:
 * - identity.type (nin, passport, drivers_license, voters_card)
 * - identity.image (base64 encoded image)
 * - identity.number (document number)
 * - identity.country (2-letter country code)
 */
export const validateTier2 = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Identity Type
  if (!data.identity?.type?.trim()) {
    errors.push({ field: 'identity.type', message: 'Identity document type is required' });
  } else {
    const validTypes = ['nin', 'passport', 'drivers_license', 'voters_card'];
    if (!validTypes.includes(data.identity.type.toLowerCase())) {
      errors.push({
        field: 'identity.type',
        message: `Identity type must be one of: ${validTypes.join(', ')}`,
      });
    }
  }

  // Identity Image (base64 encoded)
  if (!data.identity?.image?.trim()) {
    errors.push({ field: 'identity.image', message: 'Identity document image is required' });
  } else if (!validateBase64Image(data.identity.image)) {
    errors.push({
      field: 'identity.image',
      message: 'Identity image must be a valid base64 encoded image',
    });
  }

  // Identity Number
  if (!data.identity?.number?.trim()) {
    errors.push({ field: 'identity.number', message: 'Document number is required' });
  } else if (!validateDocumentNumber(data.identity.number)) {
    errors.push({
      field: 'identity.number',
      message: 'Document number must be 5-50 characters',
    });
  }

  // Identity Country Code (2-letter ISO code)
  if (!data.identity?.country?.trim()) {
    errors.push({ field: 'identity.country', message: 'Country code is required' });
  } else if (!validateCountryCode(data.identity.country)) {
    errors.push({
      field: 'identity.country',
      message: 'Country code must be a 2-letter code (e.g., NG)',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============= HELPER FUNCTIONS FOR UI =============

const COUNTRIES = [
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'India', label: 'India' },
  { value: 'Egypt', label: 'Egypt' },
];

const PHONE_COUNTRY_CODES = [
  { value: '+234', label: 'Nigeria (+234)' },
  { value: '+233', label: 'Ghana (+233)' },
  { value: '+254', label: 'Kenya (+254)' },
  { value: '+27', label: 'South Africa (+27)' },
  { value: '+1', label: 'United States (+1)' },
  { value: '+44', label: 'United Kingdom (+44)' },
  { value: '+1', label: 'Canada (+1)' },
  { value: '+61', label: 'Australia (+61)' },
  { value: '+91', label: 'India (+91)' },
  { value: '+20', label: 'Egypt (+20)' },
];

const IDENTITY_DOCUMENT_TYPES = [
  { value: 'nin', label: 'National ID (NIN)' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_card', label: "Voter's Card" },
];

export const getCountryOptions = () => COUNTRIES;

export const getPhoneCountryCodeOptions = () => PHONE_COUNTRY_CODES;

export const getIdentityDocumentTypeOptions = () => IDENTITY_DOCUMENT_TYPES;

export const getFieldErrorMessage = (
  errors: ValidationError[],
  fieldName: string
): string | undefined => {
  return errors.find((e) => e.field === fieldName)?.message;
};

export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some((e) => e.field === fieldName);
};
