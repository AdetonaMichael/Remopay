/**
 * USD Account Types
 * Types for USD virtual account creation and management
 */

// ============= EMPLOYMENT & DOCUMENT TYPES =============
export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED';
export type IdentificationType = 'PASSPORT' | 'NIN' | 'DRIVERS_LICENSE';
export type USResidencyStatus = 'NON_RESIDENT_ALIEN' | 'RESIDENT_ALIEN' | 'US_CITIZEN';

// ============= DOCUMENT REQUEST TYPES =============
export interface IdentificationDocuments {
  identification_country?: string;
  identification_type?: IdentificationType;
  identification_number?: string;
  identification_expiration?: string;
  identification_image_front?: string;
  identification_image_back?: string;
}

export interface DocumentFile {
  file_name: string;
  file: string;
}

export interface DocumentsMetadata extends IdentificationDocuments {
  source_of_funds: DocumentFile;
  proof_of_address: DocumentFile;
}

// ============= USD ACCOUNT REQUEST/RESPONSE TYPES =============
export interface USDAccountMeta {
  identification_number: string;
  passport_number?: string;
  employment_status: EmploymentStatus;
  employment_description: string;
  nationality: string;
  employer_name: string;
  occupation: string;
  us_residency_status: USResidencyStatus;
  documents: DocumentsMetadata;
}

export interface CreateUSDAccountRequest {
  customer_id: string;
  meta: USDAccountMeta;
}

export interface USDAccountData {
  id: string;
  customer_id: string;
  currency: 'USD';
  account_number: string;
  bank_name: string;
  account_type: 'virtual';
  status: 'active' | 'pending' | 'suspended';
  balance: number;
  created_at: string;
  metadata?: {
    employment_status?: EmploymentStatus;
    us_residency_status?: USResidencyStatus;
    document_status?: 'pending_review' | 'approved' | 'rejected';
  };
}

export interface CreateUSDAccountResponse {
  success: boolean;
  message: string;
  data: {
    account: USDAccountData;
    skipped?: boolean;
  };
}

export interface USDAccountStatusResponse {
  success: boolean;
  message: string;
  data: {
    reference: string;
    status: 'pending' | 'completed' | 'failed';
    account_id?: string;
    document_review_status?: 'pending_review' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
  };
}

// ============= FORM DATA TYPES =============
export interface USDAccountFormData {
  employmentStatus: EmploymentStatus;
  employmentDescription: string;
  nationality: string;
  employerName: string;
  occupation: string;
  usResidencyStatus: USResidencyStatus;
  identificationNumber: string;
  passportNumber?: string;
  identificationCountry?: string;
  identificationType?: IdentificationType;
  identificationExpiration?: string;
  sourceOfFundsFile?: File;
  proofOfAddressFile?: File;
  identificationFrontImage?: File;
  identificationBackImage?: File;
}

// ============= API ERROR TYPES =============
export interface USDAccountApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============= STATE TYPES =============
export interface USDAccountState {
  account: USDAccountData | null;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  creationStatus: 'idle' | 'pending' | 'success' | 'error';
}
