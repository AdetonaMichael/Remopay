/**
 * Maplerad Wallet Types
 * Based on the backend Maplerad Wallet Balances API specification
 */

export interface MapleradWallet {
  id: string;
  currency: string;
  wallet_type: 'TREASURY' | 'SPEND';
  ledger_balance: number;
  available_balance: number;
  holding_balance: number;
  active: boolean;
  disabled: boolean;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  ledger_balance: number;
  available_balance: number;
}

export interface MapleradWalletBalancesData {
  ngn: WalletBalance;
  usd: WalletBalance;
}

// Response from /payment/wallets/balances returns wallets directly in data
// ApiResponse<MapleradWalletBalancesData> is the correct typing

export interface MapleradRawWalletsData {
  wallets: MapleradWallet[];
}

export interface MapleradRawWalletsResponse {
  success: boolean;
  message: string;
  data: MapleradRawWalletsData;
}
