import { ApiClient } from './api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import {
  RewardBalance,
  RewardTransaction,
  Campaign,
  RedemptionResponse,
  EligibilityCheck,
  RewardStatistics,
  LoyaltyTier,
  CurrentTier,
  StreakData,
  ReferralMilestone,
  PayoutStatus,
  RewardDashboard,
  AdminRewardTransaction,
  UserRewardDetails,
  ManualRewardResponse,
  AbuseFlag,
  UserAbuseFlagsSummary,
  LoyaltyDashboard,
  AdminLoyaltyUser,
  AdminLoyaltyProgress,
  ReferralDashboard,
  AdminReferralMilestone,
  TransactionGrowthMetrics,
  RewardImpactMetrics,
  CashbackLiability,
  RewardDistribution,
  TopRewardedUser,
  ConversionFunnel,
} from '@/types/rewards.types';

class RewardService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ============= USER REWARD ENDPOINTS =============

  async getRewardBalance(): Promise<RewardBalance> {
    const response = await this.apiClient.get<RewardBalance>(
      '/rewards/balance'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch reward balance');
    }
    return response.data!;
  }

  async getRewardTransactions(
    limit: number = 20,
    type?: string
  ): Promise<RewardTransaction[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (type) params.append('type', type);

    const response = await this.apiClient.get<RewardTransaction[]>(
      `/rewards/transactions?${params.toString()}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch transactions');
    }
    const data = response.data || [];
    return Array.isArray(data) ? data : [];
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const response = await this.apiClient.get<Campaign[]>(
      '/rewards/campaigns'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch campaigns');
    }
    const data = response.data || [];
    return Array.isArray(data) ? data : [];
  }

  async redeemRewards(amount: number): Promise<RedemptionResponse> {
    const response = await this.apiClient.post<any>(
      '/rewards/redeem',
      { amount }
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to redeem rewards');
    }
    return response.data!;
  }

  async checkEligibility(): Promise<EligibilityCheck> {
    const response = await this.apiClient.get<EligibilityCheck>(
      '/rewards/eligibility-check'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to check eligibility');
    }
    const eligibilityData = response.data!;
    // Ensure eligibility_messages is always an array
    if (!Array.isArray(eligibilityData.eligibility_messages)) {
      eligibilityData.eligibility_messages = [];
    }
    return eligibilityData;
  }

  async getRewardStatistics(): Promise<RewardStatistics> {
    const response = await this.apiClient.get<RewardStatistics>(
      '/rewards/statistics'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch statistics');
    }
    return response.data!;
  }

  // ============= LOYALTY TIER ENDPOINTS =============

  async getCurrentTier(): Promise<CurrentTier> {
    const response = await this.apiClient.get<CurrentTier>(
      '/loyalty/my-tier'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch current tier');
    }
    
    // Handle nested data structure where actual data might be in response.data.data
    const data = response.data as any;
    const tierData = data?.data || data;
    
    // Ensure all required fields exist with defaults
    const result: CurrentTier = {
      current_tier: tierData?.current_tier || { level: 0, name: 'None' as any },
      progress_to_next: tierData?.progress_to_next || {
        next_tier_name: '',
        next_tier_level: 0,
        transaction_progress: '0 / 0',
        volume_progress: '0 / 0',
        funding_progress: '0 / 0',
        days_active_progress: '0 / 0',
      },
      current_metrics: tierData?.current_metrics || {
        transactions: 0,
        total_volume: 0,
        total_funding: 0,
        days_active: 0,
      },
      benefits: tierData?.benefits || {
        cashback_multiplier: 1,
        referral_multiplier: 1,
        bonus_multiplier: 1,
      },
    };
    
    return result;
  }

  async getAllTiers(): Promise<LoyaltyTier[]> {
    const response = await this.apiClient.get<LoyaltyTier[]>(
      '/loyalty/tiers'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch tiers');
    }
    return response.data || [];
  }

  async getTransactionStreaks(): Promise<StreakData> {
    const response = await this.apiClient.get<StreakData>(
      '/loyalty/streak'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch streaks');
    }
    return response.data!;
  }

  // ============= REFERRAL ENDPOINTS =============

  async getReferralMilestones(): Promise<ReferralMilestone[]> {
    const response = await this.apiClient.get<ReferralMilestone[]>(
      '/referrals/my-milestones'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch milestones');
    }
    return response.data || [];
  }

  async getPayoutStatus(): Promise<PayoutStatus> {
    const response = await this.apiClient.get<PayoutStatus>(
      '/referrals/payout-status'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch payout status');
    }
    return response.data!;
  }

  // ============= PHONE VERIFICATION ENDPOINTS =============

  async sendPhoneVerificationOtp(phoneNumber: string): Promise<void> {
    const response = await this.apiClient.post<any>(
      '/auth/send-phone-verification-otp',
      { phone_number: phoneNumber }
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to send OTP');
    }
  }

  async verifyPhoneWithOtp(
    phoneNumber: string,
    otp: string
  ): Promise<{ message: string }> {
    const response = await this.apiClient.post<any>(
      '/auth/verify-phone-with-otp',
      { phone_number: phoneNumber, otp }
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to verify phone');
    }
    return { message: response.data?.message || 'Phone verified successfully' };
  }

  // ============= ADMIN REWARD ENDPOINTS =============

  async getRewardDashboard(): Promise<RewardDashboard> {
    const response = await this.apiClient.get<RewardDashboard>(
      '/admin/rewards/dashboard'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch dashboard');
    }
    return response.data!;
  }

  async getAllRewardTransactions(
    perPage: number = 20,
    type?: string,
    status?: string,
    userId?: number
  ): Promise<PaginatedResponse<AdminRewardTransaction>> {
    const params = new URLSearchParams();
    params.append('per_page', perPage.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (userId) params.append('user_id', userId.toString());

    const response = await this.apiClient.get<
      PaginatedResponse<AdminRewardTransaction>
    >(`/admin/rewards/transactions?${params.toString()}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch transactions');
    }
    return response.data!;
  }

  async getUserRewardDetails(userId: number): Promise<UserRewardDetails> {
    const response = await this.apiClient.get<UserRewardDetails>(
      `/admin/rewards/users/${userId}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch user details');
    }
    return response.data!;
  }

  async issueManualReward(
    userId: number,
    amount: number,
    type: string,
    reason: string
  ): Promise<ManualRewardResponse> {
    const response = await this.apiClient.post<ManualRewardResponse>(
      '/admin/rewards/manual-issue',
      { user_id: userId, amount, type, reason }
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to issue reward');
    }
    return response.data!;
  }

  // ============= ADMIN CAMPAIGN ENDPOINTS =============

  async getAllCampaigns(
    status?: string,
    perPage: number = 15
  ): Promise<PaginatedResponse<Campaign>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('per_page', perPage.toString());

    const response = await this.apiClient.get<PaginatedResponse<Campaign>>(
      `/admin/reward-campaigns?${params.toString()}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch campaigns');
    }
    return response.data!;
  }

  async createCampaign(campaignData: any): Promise<Campaign> {
    const response = await this.apiClient.post<Campaign>(
      '/admin/reward-campaigns',
      campaignData
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to create campaign');
    }
    return response.data!;
  }

  async getCampaignDetails(campaignId: number): Promise<Campaign> {
    const response = await this.apiClient.get<Campaign>(
      `/admin/reward-campaigns/${campaignId}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch campaign');
    }
    return response.data!;
  }

  async updateCampaign(campaignId: number, updates: any): Promise<Campaign> {
    const response = await this.apiClient.patch<Campaign>(
      `/admin/reward-campaigns/${campaignId}`,
      updates
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to update campaign');
    }
    return response.data!;
  }

  async pauseCampaign(campaignId: number): Promise<Campaign> {
    const response = await this.apiClient.post<Campaign>(
      `/admin/reward-campaigns/${campaignId}/pause`,
      {}
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to pause campaign');
    }
    return response.data!;
  }

  async resumeCampaign(campaignId: number): Promise<Campaign> {
    const response = await this.apiClient.post<Campaign>(
      `/admin/reward-campaigns/${campaignId}/resume`,
      {}
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to resume campaign');
    }
    return response.data!;
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    const response = await this.apiClient.delete<any>(
      `/admin/reward-campaigns/${campaignId}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete campaign');
    }
  }

  // ============= ADMIN LOYALTY ENDPOINTS =============

  async getLoyaltyDashboard(): Promise<LoyaltyDashboard> {
    const response = await this.apiClient.get<LoyaltyDashboard>(
      '/admin/loyalty/dashboard'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch loyalty dashboard');
    }
    return response.data!;
  }

  async getAllUsersWithLoyalty(
    perPage: number = 20,
    tierLevel?: number,
    sortBy?: string,
    sortDir?: string
  ): Promise<PaginatedResponse<AdminLoyaltyUser>> {
    const params = new URLSearchParams();
    params.append('per_page', perPage.toString());
    if (tierLevel !== undefined) params.append('tier_level', tierLevel.toString());
    if (sortBy) params.append('sort_by', sortBy);
    if (sortDir) params.append('sort_dir', sortDir);

    const response = await this.apiClient.get<PaginatedResponse<AdminLoyaltyUser>>(
      `/admin/loyalty/users?${params.toString()}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch users');
    }
    return response.data!;
  }

  async getUserLoyaltyProgress(userId: number): Promise<AdminLoyaltyProgress> {
    const response = await this.apiClient.get<AdminLoyaltyProgress>(
      `/admin/loyalty/users/${userId}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch loyalty progress');
    }
    return response.data!;
  }

  async recalculateAllTiers(): Promise<{
    users_evaluated: number;
    users_upgraded: number;
    duration_seconds: number;
  }> {
    const response = await this.apiClient.post<{
      users_evaluated: number;
      users_upgraded: number;
      duration_seconds: number;
    }>('/admin/loyalty/recalculate-all', {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to recalculate tiers');
    }
    return response.data!;
  }

  // ============= ADMIN REFERRAL ENDPOINTS =============

  async getReferralDashboard(): Promise<ReferralDashboard> {
    const response = await this.apiClient.get<ReferralDashboard>(
      '/admin/referrals/dashboard'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch referral dashboard');
    }
    return response.data!;
  }

  async getReferralsByStatus(
    status: string,
    perPage: number = 20
  ): Promise<PaginatedResponse<AdminReferralMilestone>> {
    const params = new URLSearchParams();
    params.append('per_page', perPage.toString());

    const response = await this.apiClient.get<
      PaginatedResponse<AdminReferralMilestone>
    >(`/admin/referrals/by-status/${status}?${params.toString()}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch referrals');
    }
    return response.data!;
  }

  async getReferralMilestoneDetails(
    milestoneId: number
  ): Promise<AdminReferralMilestone> {
    const response = await this.apiClient.get<
      AdminReferralMilestone
    >(`/admin/referrals/${milestoneId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch milestone');
    }
    return response.data!;
  }

  async manualReferralPayout(milestoneId: number): Promise<any> {
    const response = await this.apiClient.post<any>(
      `/admin/referrals/${milestoneId}/manual-payout`,
      {}
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to process payout');
    }
    return response.data;
  }

  // ============= ADMIN ABUSE FLAGS ENDPOINTS =============

  async getAllAbuseFlags(
    perPage: number = 20,
    severity?: string,
    flagType?: string,
    resolved?: boolean
  ): Promise<PaginatedResponse<AbuseFlag>> {
    const params = new URLSearchParams();
    params.append('per_page', perPage.toString());
    if (severity) params.append('severity', severity);
    if (flagType) params.append('flag_type', flagType);
    if (resolved !== undefined) params.append('resolved', resolved.toString());

    const response = await this.apiClient.get<PaginatedResponse<AbuseFlag>>(
      `/admin/abuse-flags?${params.toString()}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch flags');
    }
    return response.data!;
  }

  async getUserAbuseFlags(userId: number): Promise<UserAbuseFlagsSummary> {
    const response = await this.apiClient.get<UserAbuseFlagsSummary>(
      `/admin/abuse-flags/users/${userId}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch user flags');
    }
    return response.data!;
  }

  async resolveAbuseFlag(flagId: number, notes: string): Promise<AbuseFlag> {
    const response = await this.apiClient.patch<AbuseFlag>(
      `/admin/abuse-flags/${flagId}/resolve`,
      { notes }
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to resolve flag');
    }
    return response.data!;
  }

  async resolveAllUserFlags(userId: number): Promise<any> {
    const response = await this.apiClient.post<any>(
      `/admin/abuse-flags/users/${userId}/resolve-all`,
      {}
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to resolve flags');
    }
    return response.data;
  }

  async getFlagTypeDistribution(): Promise<Record<string, number>> {
    const response = await this.apiClient.get<Record<string, number>>(
      '/admin/abuse-flags/summary/by-type'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch flag distribution');
    }
    return response.data || {};
  }

  async getHighSeverityUsers(): Promise<any[]> {
    const response = await this.apiClient.get<any[]>(
      '/admin/abuse-flags/high-severity/users'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch high severity users');
    }
    return response.data || [];
  }

  async getFlagsForReview(): Promise<AbuseFlag[]> {
    const response = await this.apiClient.get<AbuseFlag[]>(
      '/admin/abuse-flags/for-review'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch flags for review');
    }
    return response.data || [];
  }

  // ============= ADMIN METRICS ENDPOINTS =============

  async getTransactionGrowthMetrics(
    period: string = 'daily',
    days: number = 30
  ): Promise<TransactionGrowthMetrics> {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('days', days.toString());

    const response = await this.apiClient.get<TransactionGrowthMetrics>(
      `/admin/metrics/transaction-growth?${params.toString()}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch metrics');
    }
    return response.data!;
  }

  async getRewardImpactMetrics(days: number = 30): Promise<RewardImpactMetrics> {
    const response = await this.apiClient.get<RewardImpactMetrics>(
      `/admin/metrics/reward-impact?days=${days}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch impact metrics');
    }
    return response.data!;
  }

  async getCashbackLiability(): Promise<CashbackLiability> {
    const response = await this.apiClient.get<CashbackLiability>(
      '/admin/metrics/cashback-liability'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch liability');
    }
    return response.data!;
  }

  async getRewardDistribution(): Promise<RewardDistribution[]> {
    const response = await this.apiClient.get<RewardDistribution[]>(
      '/admin/metrics/reward-distribution'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch distribution');
    }
    return response.data || [];
  }

  async getTopRewardedUsers(limit: number = 10): Promise<TopRewardedUser[]> {
    const response = await this.apiClient.get<TopRewardedUser[]>(
      `/admin/metrics/top-rewarded-users?limit=${limit}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch top users');
    }
    return response.data || [];
  }

  async getConversionFunnel(): Promise<ConversionFunnel> {
    const response = await this.apiClient.get<ConversionFunnel>(
      '/admin/metrics/conversion-funnel'
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch funnel');
    }
    return response.data!;
  }
}

export const rewardService = new RewardService();







