/**
 * Tier Upgrade Type Definitions
 * Complete data structures for user tier progression
 * Updated: May 10, 2026 - Individual tier endpoints
 */

// ============= TIER LEVELS =============
export type TierLevel = 'TIER_ZERO' | 'TIER_ONE' | 'TIER_TWO';
export type TierStatus = 'pending' | 'PENDING' | 'ACTIVE' | 'rejected';
export type IdentityDocumentType = 'nin' | 'passport' | 'drivers_license' | 'voters_card';

// ============= HELPER FUNCTIONS =============
/**
 * Convert tier level number to TierLevel type
 * @param level - Tier level (0, 1, 2)
 * @returns TierLevel type
 */
export const getTierLevelFromNumber = (level: number): TierLevel => {
  switch (level) {
    case 0:
      return 'TIER_ZERO';
    case 1:
      return 'TIER_ONE';
    case 2:
      return 'TIER_TWO';
    default:
      return 'TIER_ZERO';
  }
};

// ============= TIER 0 - BASIC ENROLLMENT =============
/**
 * Tier 0: POST /api/v1/payment/customers/tier-zero
 * Initial customer profile creation
 */
export interface Tier0UpgradeData {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
}

export interface Tier0UpgradeRequest extends Tier0UpgradeData {}

// ============= TIER 1 - BRONZE UPGRADE =============
/**
 * Tier 1: PATCH /api/v1/payment/customers/tier-one
 * Personal details + BVN verification
 * Prerequisites: Must complete Tier 0 first
 */
export interface PhoneData {
  phone_country_code?: string;
  phone_number?: string;
}

export interface AddressData {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface Tier1UpgradeData {
  dob: string; // DD-MM-YYYY format
  phone: PhoneData;
  address: AddressData;
  identification_number: string; // BVN - exactly 11 digits
  photo: string; // required: image URL from Cloudinary upload
}

export interface Tier1UpgradeRequest extends Tier1UpgradeData {}

// ============= TIER 2 - SILVER UPGRADE =============
/**
 * Tier 2: PATCH /api/v1/payment/customers/tier-two
 * Identity document verification
 * Prerequisites: Must complete Tier 1 first
 */
export interface IdentityDocumentData {
  type: IdentityDocumentType;
  image: string; // base64 encoded image
  number: string; // document number
  country: string; // 2-letter country code
}

export interface Tier2UpgradeData {
  identity: IdentityDocumentData;
}

export interface Tier2UpgradeRequest extends Tier2UpgradeData {}

// ============= TIER UPGRADE RESPONSES =============
/**
 * API Response structure from backend
 */
export interface MapleradCustomerData {
  id: number;
  maplerad_id: string;
  first_name: string;
  last_name: string;
  email: string;
  tier: TierLevel;
  status: TierStatus;
  dob?: string;
  phone?: PhoneData;
  address?: AddressData;
  identification_number?: string;
  identity_type?: string;
  identity_number?: string;
  identity_verified?: boolean;
  verification_level?: string;
  identity_verification_status?: string;
  virtual_account_created?: boolean;
}

export interface TierUpgradeResponse {
  success: boolean;
  message: string;
  data?: {
    customer: {
      id: number;
      user_id: number;
      customerable_id: number;
      customerable_type: string;
    };
    maplerad_customer: MapleradCustomerData;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      dob?: string;
    };
  };
}

// ============= TIER STATUS =============
export interface TierInfo {
  level: number;
  name: string;
  status: string;
}

export interface NextTierInfo {
  level: number;
  name: string;
  requirements: {
    [key: string]: string;
  };
}

export interface VerificationStatus {
  tier_zero_complete: boolean;
  tier_one_complete: boolean;
  tier_two_complete: boolean;
  tier_three_complete?: boolean;
}

export interface TierStatusInfo {
  current_tier: TierInfo;
  next_tier: NextTierInfo;
  verification_status: VerificationStatus;
}

// ============= FORM STATE =============
export type TierUpgradeStep = 'tier0' | 'tier1' | 'tier2' | 'review' | 'success';

export interface TierUpgradeFormState {
  step: TierUpgradeStep;
  tier0Data?: Tier0UpgradeData;
  tier1Data?: Tier1UpgradeData;
  tier2Data?: Tier2UpgradeData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isLoading: boolean;
  currentTier: TierLevel;
  mapleradId?: string;
  successMessage?: string;
}

// ============= BVN VERIFICATION =============
export interface BvnVerificationRequest {
  bvn: string; // exactly 11 digits
}

export interface BvnVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    bvn: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    phone_number: string;
  };
}

// ============= VALIDATION =============
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
