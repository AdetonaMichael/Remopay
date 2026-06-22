/**
 * Card Admin Types
 * Types for admin card management operations
 */

/**
 * Card admin view with audit information
 */
export interface CardAdminView {
  id: number;
  maplerad_reference: string;
  masked_pan: string;
  name: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  brand: 'VISA' | 'MASTERCARD';
  currency: string;
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  balance: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  has_details: boolean;
  audit_logs: CardAuditLog[];
}

/**
 * Card audit log entry
 */
export interface CardAuditLog {
  id: number;
  action: 'created' | 'updated';
  fields_modified: string[];
  admin_name: string;
  admin_email: string;
  notes: string;
  ip_address: string;
  created_at: string;
}

/**
 * Set card details request
 */
export interface SetCardDetailsRequest {
  card_id: number;
  card_number?: string;
  expiry?: string;
  cvv?: string;
  notes?: string;
}

/**
 * Set card details response
 */
export interface SetCardDetailsResponse {
  success: boolean;
  message: string;
  data: {
    card_id: number;
    maplerad_reference: string;
    masked_pan: string;
    status: string;
    has_details: boolean;
  };
}

/**
 * Get all cards response
 */
export interface GetAllCardsAdminResponse {
  success: boolean;
  data: {
    cards: CardAdminView[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

/**
 * Get card audit logs response
 */
export interface GetCardAuditLogsResponse {
  success: boolean;
  data: {
    card_id: number;
    maplerad_reference: string;
    masked_pan: string;
    audit_logs: CardAuditLog[];
  };
}

/**
 * Card list filters
 */
export interface CardAdminFilters {
  status?: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  user_id?: number;
  has_details?: boolean;
  search?: string;
}
