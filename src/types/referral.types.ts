/**
 * Referral Types
 * Based on the GET /api/v1/referrals/single endpoint response
 */

// ============= Referral User =============
export interface ReferralUserInfo {
  id: number;
  name: string;
  email: string;
  transaction_pin: boolean;
  created_at: string;
  referralLinks: ReferralUserLink[];
  authReferralLink: string | null;
}

export interface ReferralUserLink {
  code: string;
  link: string;
  program: string;
  referrals: ReferralUserLinkItem[];
}

export interface ReferralUserLinkItem {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// ============= Referral Link Info =============
export interface ReferralLinkInfo {
  id: number;
  code: string;
  link: string;
  program: string;
  program_id: number;
  total_referred: number;
  qualified_referred: number;
  created_at: string;
}

// ============= Referred User =============
export interface ReferredUser {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_verified: boolean;
  joined_at: string;
}

// ============= Milestones =============
export interface MilestoneItem {
  completed: boolean;
  completed_at: string | null;
}

export interface ReferralMilestones {
  email_verified: MilestoneItem;
  phone_verified: MilestoneItem;
  wallet_funded_100: MilestoneItem;
  first_transaction: MilestoneItem;
}

// ============= Referral Record =============
export type ReferralStatus = 'pending' | 'eligible' | 'paid';

export interface ReferralRecord {
  milestone_id: number;
  referral_relationship_id: number;
  referred_user: ReferredUser;
  referral_code: string;
  referral_link: string;
  program: string;
  referred_at: string;
  progress_percentage: number;
  milestones: ReferralMilestones;
  is_fully_qualified: boolean;
  payout_earned: number;
  payout_paid_at: string | null;
  status: ReferralStatus;
}

// ============= Referral Stats =============
export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  fully_qualified_referrals: number;
  total_earnings: number;
  pending_rewards: number;
  available_balance: number;
  total_paid: number;
  status_breakdown: {
    pending: number;
    eligible: number;
    paid: number;
  };
}

// ============= Pagination Meta =============
export interface ReferralPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ============= API Response =============
export interface ReferralApiResponseData {
  user: ReferralUserInfo;
  referral_links: ReferralLinkInfo[];
  referrals: {
    data: ReferralRecord[];
    meta: ReferralPaginationMeta;
  };
  stats: ReferralStats;
  authReferralLink: string | null;
}

export interface ReferralApiResponse {
  success: boolean;
  message: string;
  data: ReferralApiResponseData;
}

// ============= Filter Types =============
export interface ReferralFilters {
  page?: number;
  per_page?: number;
  status?: ReferralStatus | '';
  program_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'referred_at' | 'status';
  sort_dir?: 'asc' | 'desc';
}

// ============= Status Config for UI =============
export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

export const REFERRAL_STATUS_CONFIG: Record<ReferralStatus, StatusConfig> = {
  pending: {
    label: 'In Progress',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-400',
  },
  eligible: {
    label: 'Ready for Payout',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  paid: {
    label: 'Paid',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
};

// ============= Milestone Labels =============
export const MILESTONE_LABELS: Array<{ key: keyof ReferralMilestones; label: string; description: string }> = [
  { key: 'email_verified', label: 'Email Verified', description: 'User confirmed their email address' },
  { key: 'phone_verified', label: 'Phone Verified', description: 'User confirmed their phone number' },
  { key: 'wallet_funded_100', label: 'Wallet Funded (₦100+)', description: 'User funded wallet with at least ₦100' },
  { key: 'first_transaction', label: 'First Transaction', description: 'User completed their first transaction' },
];
