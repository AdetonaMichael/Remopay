/**
 * Customer Types
 * Types for customer profile management and updates
 */

import { ApiResponse } from './api.types';
import { AddressData, PhoneData } from './tier-upgrade.types';

// ============= UPDATE CUSTOMER PAYLOAD =============

export interface IdentityData {
  type?: 'NIN' | 'PASSPORT' | 'VOTERS_CARD' | 'DRIVERS_LICENSE';
  image?: string; // base64 or URL
  number?: string;
  country?: string;
}

export interface UpdateCustomerPayload {
  customer_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  photo?: string;
  identification_number?: string;
  nationality?: string;
  identity?: IdentityData;
  phone?: PhoneData;
  address?: AddressData;
}

// ============= CUSTOMER PROFILE RESPONSE =============

export interface CustomerProfile {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone?: PhoneData;
  address?: AddressData;
  identity?: IdentityData;
  photo_url?: string;
  identification_number?: string;
  nationality?: string;
  status: string;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateCustomerResponse {
  success: boolean;
  message: string;
  data: {
    customer: CustomerProfile;
  };
}

// ============= UPDATE CUSTOMER ERROR =============

export interface UpdateCustomerError {
  success: false;
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

// ============= TYPE ALIASES =============

export type UpdateCustomerResult = ApiResponse<UpdateCustomerResponse>;
