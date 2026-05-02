/**
 * Tier Upgrade Type Definitions
 * Complete data structures for user tier progression
 */

// ============= TIER LEVELS =============
export type TierLevel = 0 | 1 | 2 | 3;
export type TierName = 'None' | 'Bronze' | 'Silver' | 'Gold';

export type IdentityDocumentType = 'NIN' | 'Passport' | 'Driver_License' | 'Voters_Card';

// ============= TIER 0 - BRONZE (BASIC PROFILE) =============
export interface Tier0UpgradeData {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
}

export interface Tier0UpgradeRequest extends Tier0UpgradeData {}

// ============= TIER 1 - SILVER (PERSONAL & ADDRESS INFO) =============
export interface PhoneNumber {
  country_code: string; // e.g., "+234"
  number: string; // 10-11 digits
}

export interface Address {
  street_address: string;
  street_address_2?: string; // optional
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
}

export interface Tier1UpgradeData extends Tier0UpgradeData {
  date_of_birth: string; // format: DD-MM-YYYY
  phone_number: PhoneNumber;
  address: Address;
  identification_number: string; // BVN/NIN - 11 characters
  profile_photo: string; // base64 encoded image
}

export interface Tier1UpgradeRequest extends Tier1UpgradeData {}

// ============= TIER 2 - GOLD (IDENTITY VERIFICATION) =============
export interface IdentityDocument {
  type: IdentityDocumentType;
  document_image: string; // base64 encoded
  document_number: string;
  country_of_issue: string;
}

export interface Tier2UpgradeData extends Tier1UpgradeData {
  identity_document: IdentityDocument;
}

export interface Tier2UpgradeRequest extends Tier2UpgradeData {}

// ============= TIER UPGRADE RESPONSES =============
export interface TierUpgradeResponse {
  success: boolean;
  message: string;
  data?: {
    tier_level: TierLevel;
    tier_name: TierName;
    upgrade_date: string;
    next_tier_requirements?: string[];
  };
}

// ============= TIER STATUS =============
export interface CurrentTierInfo {
  name: TierName;
  level: TierLevel;
  status: 'active' | 'inactive' | 'pending';
}

export interface NextTierRequirements {
  dob?: string;
  phone?: PhoneNumber;
  address?: Address;
  identification_number?: string;
  photo?: string;
  identity_document?: IdentityDocument;
}

export interface NextTierInfo {
  name: TierName;
  level: TierLevel;
  requirements: NextTierRequirements;
}

export interface VerificationStatus {
  tier_zero_complete: boolean;
  tier_one_complete: boolean;
  tier_two_complete: boolean;
  tier_three_complete: boolean;
}

export interface TierStatus {
  current_tier: CurrentTierInfo;
  next_tier: NextTierInfo;
  verification_status: VerificationStatus;
}

// ============= FORM STATE =============
export type TierUpgradeStep = 'tier0' | 'tier1' | 'tier2' | 'review' | 'success';

export interface TierUpgradeFormState {
  step: TierUpgradeStep;
  data: Partial<Tier2UpgradeData>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  currentTier: TierLevel;
  targetTier: TierLevel;
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
