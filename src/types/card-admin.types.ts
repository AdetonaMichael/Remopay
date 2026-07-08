/**
 * Card Admin Types
 * Complete type definitions for admin card management operations
 * Based on the backend API specification
 */

import type { CardStatus, CardBrand } from './card.types';

// ═══════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════

export enum AdminCardStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  TERMINATED = 'TERMINATED',
  DISABLED = 'DISABLED',
}

export enum AuditLogAction {
  CREATED = 'created',
  UPDATED = 'updated',
  FROZEN = 'frozen',
  UNFROZEN = 'unfrozen',
  TERMINATED = 'terminated',
}

// ═══════════════════════════════════════════════════════════════════════
// ADMIN CARD VIEW
// ═══════════════════════════════════════════════════════════════════════

export interface CardAdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface CardAdminView {
  id: number;
  maplerad_reference: string;
  user_id: number;
  masked_pan: string;
  name: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  brand: CardBrand;
  currency: string;
  status: AdminCardStatus;
  balance: string; // Backend returns string for balance
  auto_approve: boolean;
  has_details: boolean;
  user?: CardAdminUser;
  created_at: string;
  updated_at: string;
  audit_logs?: CardAuditLog[];
}

// ═══════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════

export interface CardAuditLog {
  id: number;
  action: AuditLogAction;
  fields_modified: string[] | null;
  admin_name: string;
  admin_email: string;
  notes: string | null;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════
// SET CARD DETAILS
// ═══════════════════════════════════════════════════════════════════════

export interface SetCardDetailsRequest {
  card_number?: string;  // 16-digit card number
  expiry?: string;        // MM/YY format
  cvv?: string;           // 3-digit CVV
  notes?: string;         // Admin notes for audit log
}

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

// ═══════════════════════════════════════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════════════════════════════════════

export interface AdminCardPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface GetAllCardsAdminResponse {
  success: boolean;
  data: {
    cards: CardAdminView[];
    pagination: AdminCardPagination;
  };
}

export interface GetCardAuditLogsResponse {
  success: boolean;
  data: {
    card_id: number;
    maplerad_reference: string;
    masked_pan: string;
    audit_logs: CardAuditLog[];
  };
}

export interface AdminCardActionResponse {
  success: boolean;
  message: string;
  data: {
    card_id: number;
    status: AdminCardStatus;
    masked_pan: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════════════

export interface CardAdminFilters {
  status?: AdminCardStatus;
  user_id?: number;
  has_details?: boolean;
  page?: number;
  per_page?: number;
}
