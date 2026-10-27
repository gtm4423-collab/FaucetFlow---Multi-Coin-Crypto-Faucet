/**
 * FaucetFlow Data Types & Schema Interfaces
 * Aligned with public.assets.aistudio.faucetflow_supabase_all_58fd9fca.sql
 */

export type CoinType = 'BTC' | 'LTC' | 'DOGE' | 'USDT';

export interface CoinConfig {
  symbol: CoinType;
  name: string;
  decimals: number;
  rewardAmount: number; // Reward returned by public.claim_reward() RPC
  rewardDisplay: string;
  usdPrice: number;
  minWithdraw: number;
  minWithdrawUsd: number;
  networkFee: number;
  color: string;
  accentBg: string;
  iconSymbol: string;
  cooldownSeconds: number; // 60s as defined in SQL
}

export interface UserProfile {
  id: string; // uuid
  email: string;
  username: string;
  referrer_id?: string | null;
  created_at: string;
  role: 'user';
}

export interface UserBalance {
  user_id: string;
  coin: CoinType;
  amount: number;
  updated_at: string;
}

export interface ClaimRecord {
  id: string; // uuid
  user_id: string;
  username?: string;
  coin: CoinType;
  amount: number;
  claimed_at: string;
  tx_hash?: string;
}

export interface ReferralClaimRecord {
  id: string;
  referrer_id: string;
  referee_id: string;
  referee_username?: string;
  coin: CoinType;
  amount: number;
  claimed_at: string;
}

export interface OfferwallTask {
  id: string;
  offerwall: 'flexmedia' | 'timewall' | 'monlix';
  title: string;
  description: string;
  category: 'Survey' | 'App Install' | 'Game Quest' | 'Micro Task' | 'Sponsor Offer';
  rewardCoin: CoinType;
  rewardAmount: number;
  estMinutes: number;
  partnerName: string;
  difficulty: 'Easy' | 'Medium' | 'High' | 'Instant';
  linkUrl?: string;
  points?: number;
}

export interface FaucetStats {
  totalClaimsCount: number;
  totalDispensed: Record<CoinType, number>;
  faucetReserves: Record<CoinType, number>;
  activeUsersCount: number;
  claimsLast24h: number;
}

export type ActiveTab = 'faucet' | 'offerwalls' | 'referral' | 'withdraw' | 'ledger';

