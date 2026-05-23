import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api.types';
import { debug } from '@/utils/debug.utils';

/**
 * Referral Link Data
 */
export interface ReferralLink {
  code: string;
  link: string;
  program: string;
  created_at: string;
  referrals?: ReferralItem[]; // Nested referrals from single endpoint
}

/**
 * Individual Referral Item (from nested referrals)
 */
export interface ReferralItem {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

/**
 * Referral Program
 */
export interface ReferralProgram {
  id: number;
  name: string;
  url: string;
  lifetime_minutes: number;
  created_at: string;
  updated_at: string;
}

/**
 * Referral Statistics
 */
export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  pending_rewards: number;
  available_balance: number;
}

/**
 * Referral Milestone
 */
export interface ReferralMilestone {
  milestone_id: number;
  referred_user: {
    id: number;
    name: string;
    email: string;
  };
  referral_code: string;
  program: string;
  progress_percentage: number;
  milestones: {
    email_verified: {
      completed: boolean;
      completed_at: string | null;
    };
    phone_verified: {
      completed: boolean;
      completed_at: string | null;
    };
    wallet_funded_100: {
      completed: boolean;
      completed_at: string | null;
    };
    first_transaction: {
      completed: boolean;
      completed_at: string | null;
    };
  };
  is_fully_qualified: boolean;
  payout_earned: number;
  payout_paid_at: string | null;
  status: 'pending' | 'eligible' | 'paid';
}

/**
 * Referral Service
 * Handles all referral-related operations
 */
class ReferralService {
  /**
   * Get all available referral programs (public)
   */
  async getPrograms(): Promise<ReferralProgram[]> {
    try {
      debug.log('[ReferralService] Fetching referral programs');

      const response = await apiClient.get<ReferralProgram[]>('/referrals/programs');

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch programs');
      }

      debug.log('[ReferralService] Programs fetched successfully');
      return response.data || [];
    } catch (error: any) {
      debug.error('[ReferralService] Failed to fetch programs', error);
      throw error;
    }
  }

  /**
   * Get authenticated user's referral links
   */
  async getMyReferralLinks(): Promise<ReferralLink[]> {
    try {
      debug.log('[ReferralService] Fetching user referral links');

      const response = await apiClient.get<ReferralLink[]>('/referrals/my-link');

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch referral links');
      }

      debug.log('[ReferralService] Referral links fetched successfully');
      return response.data || [];
    } catch (error: any) {
      debug.error('[ReferralService] Failed to fetch referral links', error);
      throw error;
    }
  }

  /**
   * Get user's referral statistics
   */
  async getStats(): Promise<ReferralStats> {
    try {
      debug.log('[ReferralService] Fetching referral statistics');

      const response = await apiClient.get<ReferralStats>('/referrals/stats');

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch statistics');
      }

      debug.log('[ReferralService] Statistics fetched successfully');
      return response.data!;
    } catch (error: any) {
      debug.error('[ReferralService] Failed to fetch statistics', error);
      throw error;
    }
  }

  /**
   * Get referral milestones for all referred users
   */
  async getMilestones(): Promise<ReferralMilestone[]> {
    try {
      debug.log('[ReferralService] Fetching referral milestones');

      const response = await apiClient.get<ReferralMilestone[]>('/referrals/milestones');

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch milestones');
      }

      debug.log('[ReferralService] Milestones fetched successfully');
      return response.data || [];
    } catch (error: any) {
      debug.error('[ReferralService] Failed to fetch milestones', error);
      throw error;
    }
  }

  /**
   * Get single user's referral data (includes nested referrals per link)
   */
  async getUserReferralData(userId: number): Promise<{ referralLinks: ReferralLink[]; authReferralLink: string | null }> {
    try {
      debug.log('[ReferralService] Fetching user referral data for user:', userId);

      const response = await apiClient.get<any>(`/referrals/single/${userId}`);

      // This endpoint returns data directly, not wrapped in { success, message, data }
      // Response format: { data: {...}, authReferralLink: '...' }
      const responseData = response.data || response; // Handle both wrapped and unwrapped responses
      
      debug.log('[ReferralService] Raw response:', response);
      debug.log('[ReferralService] Response data:', responseData);

      // Check if we have the expected structure
      if (!responseData || (typeof responseData === 'object' && !responseData.data && !responseData.referralLinks)) {
        throw new Error('Invalid response structure from referral data endpoint');
      }

      // Extract referralLinks and authReferralLink from response
      // Handle both: { data: { referralLinks, ... }, authReferralLink } and direct structure
      const referralLinks = responseData.referralLinks || responseData.data?.referralLinks || [];
      const authReferralLink = responseData.authReferralLink || null;
      
      debug.log('[ReferralService] Extracted referralLinks:', referralLinks);
      debug.log('[ReferralService] Extracted authReferralLink:', authReferralLink);
      
      return {
        referralLinks,
        authReferralLink,
      };
    } catch (error: any) {
      debug.error('[ReferralService] Failed to fetch user referral data', error);
      throw error;
    }
  }

  /**
   * Create/get referral link for a program
   */
  async createReferralLink(programId: number, userId: number): Promise<ReferralLink> {
    try {
      debug.log('[ReferralService] Creating referral link');

      const response = await apiClient.post<ReferralLink>('/referrals/create', {
        programId,
        userId,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create referral link');
      }

      debug.log('[ReferralService] Referral link created successfully');
      return response.data!;
    } catch (error: any) {
      debug.error('[ReferralService] Failed to create referral link', error);
      throw error;
    }
  }

  /**
   * Submit withdrawal request
   */
  async requestWithdrawal(amount: number): Promise<void> {
    try {
      debug.log('[ReferralService] Submitting withdrawal request');

      const response = await apiClient.post('/referrals/withdraw', { amount });

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit withdrawal');
      }

      debug.log('[ReferralService] Withdrawal request submitted successfully');
    } catch (error: any) {
      debug.error('[ReferralService] Failed to submit withdrawal', error);
      throw error;
    }
  }

  /**
   * Convert reward points to cash (1 point = ₦100)
   */
  async convertPoints(points: number): Promise<{ converted_amount: number }> {
    try {
      debug.log('[ReferralService] Converting points to cash');

      const response = await apiClient.post<{ converted_amount: number }>(
        '/referrals/convert-points',
        { points }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to convert points');
      }

      debug.log('[ReferralService] Points converted successfully');
      return response.data!;
    } catch (error: any) {
      debug.error('[ReferralService] Failed to convert points', error);
      throw error;
    }
  }

  /**
   * Share referral link via Web Share API
   */
  async shareReferralLink(link: string, code: string): Promise<void> {
    try {
      if (!navigator.share) {
        await navigator.clipboard.writeText(link);
        return;
      }

      await navigator.share({
        title: 'Join Remopay',
        text: `Join me on Remopay and earn rewards! Use my referral code: ${code}`,
        url: link,
      });

      debug.log('[ReferralService] Referral link shared successfully');
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        debug.error('[ReferralService] Failed to share referral link', error);
        throw error;
      }
    }
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        debug.log('[ReferralService] Copied to clipboard');
        return true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
          debug.log('[ReferralService] Copied to clipboard (fallback)');
        }
        return success;
      }
    } catch (error: any) {
      debug.error('[ReferralService] Failed to copy to clipboard', error);
      return false;
    }
  }
}

export const referralService = new ReferralService();
