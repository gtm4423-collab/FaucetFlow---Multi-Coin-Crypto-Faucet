import {
  ClaimRecord,
  CoinType,
  FaucetStats,
  OfferwallTask,
  ReferralClaimRecord,
  UserBalance,
  UserProfile,
} from '../types';
import { COIN_CONFIGS, OFFERWALL_TASKS } from '../data/coins';

const STORAGE_KEYS = {
  USERS: 'faucetflow_users_v2',
  CURRENT_USER_ID: 'faucetflow_current_user_id_v2',
  BALANCES: 'faucetflow_balances_v2',
  CLAIMS: 'faucetflow_claims_v2',
  REFERRAL_CLAIMS: 'faucetflow_ref_claims_v2',
  STATS: 'faucetflow_stats_v2',
  COOLDOWNS: 'faucetflow_cooldowns_v2',
  COMPLETED_TASKS: 'faucetflow_completed_tasks_v2',
  PASSWORDS: 'faucetflow_passwords_v2',
};

// Seed users
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-492a-seeker',
    email: 'seeker@crypto.io',
    username: 'CryptoSeeker',
    referrer_id: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    role: 'user',
  },
  {
    id: 'usr-923c-satoshifan',
    email: 'satoshifan@web3.org',
    username: 'SatoshiFan21',
    referrer_id: 'usr-492a-seeker', // Referred by CryptoSeeker to showcase 10% referral bonus!
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    role: 'user',
  },
  {
    id: 'usr-381x-bitcoiner',
    email: 'bitcoiner@gmail.com',
    username: 'BitCoiner99',
    referrer_id: 'usr-492a-seeker', // Also referred by CryptoSeeker
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    role: 'user',
  },
];

const INITIAL_BALANCES: UserBalance[] = [
  // CryptoSeeker
  { user_id: 'usr-492a-seeker', coin: 'BTC', amount: 0.00000028, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { user_id: 'usr-492a-seeker', coin: 'LTC', amount: 0.00002800, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { user_id: 'usr-492a-seeker', coin: 'DOGE', amount: 0.00028000, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { user_id: 'usr-492a-seeker', coin: 'USDT', amount: 0.00350000, updated_at: new Date(Date.now() - 3600000).toISOString() },
  // SatoshiFan21
  { user_id: 'usr-923c-satoshifan', coin: 'BTC', amount: 0.00000008, updated_at: new Date(Date.now() - 1800000).toISOString() },
  { user_id: 'usr-923c-satoshifan', coin: 'LTC', amount: 0.00000800, updated_at: new Date(Date.now() - 1800000).toISOString() },
  { user_id: 'usr-923c-satoshifan', coin: 'DOGE', amount: 0.00008000, updated_at: new Date(Date.now() - 1800000).toISOString() },
  { user_id: 'usr-923c-satoshifan', coin: 'USDT', amount: 0.00080000, updated_at: new Date(Date.now() - 1800000).toISOString() },
  // BitCoiner99
  { user_id: 'usr-381x-bitcoiner', coin: 'BTC', amount: 0.00000010, updated_at: new Date(Date.now() - 5400000).toISOString() },
  { user_id: 'usr-381x-bitcoiner', coin: 'LTC', amount: 0.00001000, updated_at: new Date(Date.now() - 5400000).toISOString() },
  { user_id: 'usr-381x-bitcoiner', coin: 'DOGE', amount: 0.00010000, updated_at: new Date(Date.now() - 5400000).toISOString() },
  { user_id: 'usr-381x-bitcoiner', coin: 'USDT', amount: 0.00100000, updated_at: new Date(Date.now() - 5400000).toISOString() },
];

const INITIAL_CLAIMS: ClaimRecord[] = [
  {
    id: 'clm-8472-btc-01',
    user_id: 'usr-492a-seeker',
    username: 'CryptoSeeker',
    coin: 'BTC',
    amount: 0.00000001,
    claimed_at: new Date(Date.now() - 120000).toISOString(),
    tx_hash: '0x8f2a...c31b',
  },
  {
    id: 'clm-8472-doge-02',
    user_id: 'usr-492a-seeker',
    username: 'CryptoSeeker',
    coin: 'DOGE',
    amount: 0.00001000,
    claimed_at: new Date(Date.now() - 180000).toISOString(),
    tx_hash: '0x4e19...a02f',
  },
  {
    id: 'clm-8472-usdt-03',
    user_id: 'usr-923c-satoshifan',
    username: 'SatoshiFan21',
    coin: 'USDT',
    amount: 0.00010000,
    claimed_at: new Date(Date.now() - 240000).toISOString(),
    tx_hash: '0x9d11...bb52',
  },
];

const INITIAL_REFERRAL_CLAIMS: ReferralClaimRecord[] = [
  {
    id: 'ref-clm-001',
    referrer_id: 'usr-492a-seeker',
    referee_id: 'usr-923c-satoshifan',
    referee_username: 'SatoshiFan21',
    coin: 'USDT',
    amount: 0.00001000, // 10% of 0.00010000
    claimed_at: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'ref-clm-002',
    referrer_id: 'usr-492a-seeker',
    referee_id: 'usr-381x-bitcoiner',
    referee_username: 'BitCoiner99',
    coin: 'BTC',
    amount: 0.000000001, // 10% of 0.00000001
    claimed_at: new Date(Date.now() - 600000).toISOString(),
  },
];

const INITIAL_STATS: FaucetStats = {
  totalClaimsCount: 1428,
  totalDispensed: {
    BTC: 0.00014200,
    LTC: 0.01420000,
    DOGE: 14.2000000,
    USDT: 14.2000000,
  },
  faucetReserves: {
    BTC: 0.50000000,
    LTC: 15.0000000,
    DOGE: 10000.000000,
    USDT: 2500.000000,
  },
  activeUsersCount: 421,
  claimsLast24h: 365,
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

export class FaucetDatabase {
  private users: UserProfile[];
  private currentUserId: string;
  private balances: UserBalance[];
  private claims: ClaimRecord[];
  private referralClaims: ReferralClaimRecord[];
  private stats: FaucetStats;
  private cooldowns: Record<string, number>;
  private completedTaskIds: string[];
  private passwords: Record<string, string>;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUserId = loadStorage(STORAGE_KEYS.CURRENT_USER_ID, 'usr-492a-seeker');
    this.balances = loadStorage(STORAGE_KEYS.BALANCES, INITIAL_BALANCES);
    this.claims = loadStorage(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
    this.referralClaims = loadStorage(STORAGE_KEYS.REFERRAL_CLAIMS, INITIAL_REFERRAL_CLAIMS);
    this.stats = loadStorage(STORAGE_KEYS.STATS, INITIAL_STATS);
    this.cooldowns = loadStorage(STORAGE_KEYS.COOLDOWNS, {});
    this.completedTaskIds = loadStorage(STORAGE_KEYS.COMPLETED_TASKS, []);
    this.passwords = loadStorage(STORAGE_KEYS.PASSWORDS, {});
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    saveStorage(STORAGE_KEYS.BALANCES, this.balances);
    saveStorage(STORAGE_KEYS.CLAIMS, this.claims);
    saveStorage(STORAGE_KEYS.REFERRAL_CLAIMS, this.referralClaims);
    saveStorage(STORAGE_KEYS.STATS, this.stats);
    saveStorage(STORAGE_KEYS.COOLDOWNS, this.cooldowns);
    saveStorage(STORAGE_KEYS.COMPLETED_TASKS, this.completedTaskIds);
    saveStorage(STORAGE_KEYS.PASSWORDS, this.passwords);
    this.listeners.forEach((fn) => fn());
  }

  public getCurrentUser(): UserProfile | null {
    return this.users.find((u) => u.id === this.currentUserId) || null;
  }

  public getAllUsers(): UserProfile[] {
    return [...this.users];
  }

  public switchUser(userId: string): void {
    const exists = this.users.find((u) => u.id === userId);
    if (exists) {
      this.currentUserId = userId;
      this.notify();
    }
  }

  public createUser(username: string, email: string, referrerId?: string | null): UserProfile {
    // If referrerId is provided as a username, find user id
    let resolvedRefId: string | null = null;
    if (referrerId) {
      const match = this.users.find(
        (u) => u.id === referrerId || u.username.toLowerCase() === referrerId.toLowerCase()
      );
      if (match) {
        resolvedRefId = match.id;
      }
    }

    const newUser: UserProfile = {
      id: `usr-${Math.random().toString(36).substring(2, 8)}`,
      username: username.trim(),
      email: email.trim(),
      referrer_id: resolvedRefId,
      created_at: new Date().toISOString(),
      role: 'user',
    };
    this.users.unshift(newUser);

    // Initial balances zeroed (mirrors public.handle_new_user trigger)
    const coins: CoinType[] = ['BTC', 'LTC', 'DOGE', 'USDT'];
    coins.forEach((coin) => {
      this.balances.push({
        user_id: newUser.id,
        coin,
        amount: 0,
        updated_at: new Date().toISOString(),
      });
    });

    this.currentUserId = newUser.id;
    this.stats.activeUsersCount += 1;
    this.notify();
    return newUser;
  }

  public signIn(identifier: string, password?: string): UserProfile {
    const clean = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (!user) {
      throw new Error(`Account not found for "${identifier}". Please create an account via Sign Up.`);
    }

    // If account has a password, check it
    if (this.passwords[user.id] && password) {
      if (this.passwords[user.id] !== password) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }
    }

    this.currentUserId = user.id;
    this.notify();
    return user;
  }

  public signOut(): void {
    this.currentUserId = '';
    this.notify();
  }

  public signUp(username: string, email: string, password?: string, referrerId?: string | null): UserProfile {
    const existing = this.users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() ||
        u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      throw new Error('An account with that email or username already exists. Please Sign In.');
    }
    const newUser = this.createUser(username, email, referrerId);
    if (password && password.trim()) {
      this.passwords[newUser.id] = password.trim();
      saveStorage(STORAGE_KEYS.PASSWORDS, this.passwords);
    }
    return newUser;
  }

  public getUserBalances(userId?: string): Record<CoinType, number> {
    const targetId = userId || this.currentUserId;
    const result: Record<CoinType, number> = {
      BTC: 0,
      LTC: 0,
      DOGE: 0,
      USDT: 0,
    };

    if (!targetId) return result;

    this.balances
      .filter((b) => b.user_id === targetId)
      .forEach((b) => {
        result[b.coin] = b.amount;
      });

    return result;
  }

  public getRemainingCooldown(coin: CoinType, userId?: string): number {
    const targetId = userId || this.currentUserId;
    if (!targetId) return 0;
    const key = `${targetId}:${coin}`;
    const last = this.cooldowns[key] || 0;
    const elapsed = Math.floor((Date.now() - last) / 1000);
    const config = COIN_CONFIGS[coin];
    const rem = config.cooldownSeconds - elapsed;
    return rem > 0 ? rem : 0;
  }

  /**
   * Mirrors public.claim_reward(p_coin text) RPC
   * Includes 60s cooldown, advisory lock simulation, and 10% referral bonus payout
   */
  public async claimReward(coin: CoinType): Promise<{
    coin: CoinType;
    amount: number;
    claimed_at: string;
    tx_hash: string;
    referralBonusCredited?: { referrerUsername: string; amount: number };
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Please sign in before claiming.');
    }

    const remaining = this.getRemainingCooldown(coin, user.id);
    if (remaining > 0) {
      throw new Error(`Cooldown active. Please wait ${remaining}s before claiming ${coin}.`);
    }

    const config = COIN_CONFIGS[coin];
    const reward = config.rewardAmount;

    // Simulate advisory lock latency (100ms)
    await new Promise((res) => setTimeout(res, 100));

    const nowIso = new Date().toISOString();
    const key = `${user.id}:${coin}`;
    this.cooldowns[key] = Date.now();

    // 1. Payout reward to claimant
    const balanceEntry = this.balances.find((b) => b.user_id === user.id && b.coin === coin);
    if (balanceEntry) {
      balanceEntry.amount = Number((balanceEntry.amount + reward).toFixed(12));
      balanceEntry.updated_at = nowIso;
    } else {
      this.balances.push({
        user_id: user.id,
        coin,
        amount: reward,
        updated_at: nowIso,
      });
    }

    const txHash = `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...${Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Add to claims ledger
    const claimRecord: ClaimRecord = {
      id: `clm-${Math.random().toString(36).substring(2, 9)}`,
      user_id: user.id,
      username: user.username,
      coin,
      amount: reward,
      claimed_at: nowIso,
      tx_hash: txHash,
    };
    this.claims.unshift(claimRecord);

    // 2. 10% Referral Commission Payout to Referrer (matches SQL)
    let referralBonusCredited: { referrerUsername: string; amount: number } | undefined;
    if (user.referrer_id && user.referrer_id !== user.id) {
      const referrer = this.users.find((u) => u.id === user.referrer_id);
      if (referrer) {
        const refBonus = Number((reward * 0.10).toFixed(12));
        if (refBonus > 0) {
          const refBalance = this.balances.find((b) => b.user_id === referrer.id && b.coin === coin);
          if (refBalance) {
            refBalance.amount = Number((refBalance.amount + refBonus).toFixed(12));
            refBalance.updated_at = nowIso;
          } else {
            this.balances.push({
              user_id: referrer.id,
              coin,
              amount: refBonus,
              updated_at: nowIso,
            });
          }

          this.referralClaims.unshift({
            id: `ref-clm-${Math.random().toString(36).substring(2, 9)}`,
            referrer_id: referrer.id,
            referee_id: user.id,
            referee_username: user.username,
            coin,
            amount: refBonus,
            claimed_at: nowIso,
          });

          referralBonusCredited = {
            referrerUsername: referrer.username,
            amount: refBonus,
          };
        }
      }
    }

    // Update stats
    this.stats.totalClaimsCount += 1;
    this.stats.claimsLast24h += 1;
    this.stats.totalDispensed[coin] = Number((this.stats.totalDispensed[coin] + reward).toFixed(12));

    this.notify();

    return {
      coin,
      amount: reward,
      claimed_at: nowIso,
      tx_hash: txHash,
      referralBonusCredited,
    };
  }

  /**
   * Completes an Offerwall Task (Timewall or Monlix) and credits reward to user wallet
   */
  public async completeOfferwallTask(taskId: string): Promise<{
    task: OfferwallTask;
    creditedAmount: number;
    coin: CoinType;
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Please sign in to complete offerwall tasks and receive rewards.');
    }

    const task = OFFERWALL_TASKS.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('Offerwall task not found.');
    }

    // Simulate task verification latency
    await new Promise((res) => setTimeout(res, 600));

    const nowIso = new Date().toISOString();

    // Credit user balance
    const balanceEntry = this.balances.find((b) => b.user_id === user.id && b.coin === task.rewardCoin);
    if (balanceEntry) {
      balanceEntry.amount = Number((balanceEntry.amount + task.rewardAmount).toFixed(12));
      balanceEntry.updated_at = nowIso;
    } else {
      this.balances.push({
        user_id: user.id,
        coin: task.rewardCoin,
        amount: task.rewardAmount,
        updated_at: nowIso,
      });
    }

    // Log to ledger
    this.claims.unshift({
      id: `task-${Math.random().toString(36).substring(2, 9)}`,
      user_id: user.id,
      username: user.username,
      coin: task.rewardCoin,
      amount: task.rewardAmount,
      claimed_at: nowIso,
      tx_hash: `${task.offerwall.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    if (!this.completedTaskIds.includes(taskId)) {
      this.completedTaskIds.push(taskId);
    }

    this.stats.totalClaimsCount += 1;
    this.notify();

    return {
      task,
      creditedAmount: task.rewardAmount,
      coin: task.rewardCoin,
    };
  }

  public isTaskCompleted(taskId: string): boolean {
    return this.completedTaskIds.includes(taskId);
  }

  public getClaims(userId?: string): ClaimRecord[] {
    if (userId) {
      return this.claims.filter((c) => c.user_id === userId);
    }
    return [...this.claims];
  }

  public getReferralClaims(userId?: string): ReferralClaimRecord[] {
    const targetId = userId || this.currentUserId;
    if (!targetId) return [];
    return this.referralClaims.filter((r) => r.referrer_id === targetId);
  }

  public getReferees(userId?: string): UserProfile[] {
    const targetId = userId || this.currentUserId;
    if (!targetId) return [];
    return this.users.filter((u) => u.referrer_id === targetId);
  }

  public getStats(): FaucetStats {
    return { ...this.stats };
  }

  public withdraw(
    coin: CoinType,
    address: string,
    amount: number,
    destinationType: 'faucetpay' | 'direct'
  ): { txId: string; fee: number; netAmount: number } {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Please sign in before withdrawing.');

    const config = COIN_CONFIGS[coin];
    const currentBalance = this.getUserBalances(user.id)[coin];

    if (amount > currentBalance) {
      throw new Error(`Insufficient ${coin} balance. Current balance: ${currentBalance}`);
    }
    if (amount < config.minWithdraw) {
      throw new Error(`Minimum withdrawal is $0.20 USD (${config.minWithdraw} ${coin})`);
    }

    const fee = destinationType === 'faucetpay' ? 0 : config.networkFee;
    const netAmount = Number((amount - fee).toFixed(8));

    if (netAmount <= 0) {
      throw new Error(`Amount must exceed network fee of ${fee} ${coin}`);
    }

    // Deduct user balance
    const balanceEntry = this.balances.find((b) => b.user_id === user.id && b.coin === coin);
    if (balanceEntry) {
      balanceEntry.amount = Number((balanceEntry.amount - amount).toFixed(12));
      balanceEntry.updated_at = new Date().toISOString();
    }

    const txId = `tx_${destinationType}_${Math.random().toString(36).substring(2, 10)}`;
    this.notify();

    return { txId, fee, netAmount };
  }

  public resetToFactory(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.BALANCES);
    localStorage.removeItem(STORAGE_KEYS.CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.REFERRAL_CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.COOLDOWNS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_TASKS);
    localStorage.removeItem(STORAGE_KEYS.PASSWORDS);

    this.users = [...INITIAL_USERS];
    this.currentUserId = 'usr-492a-seeker';
    this.balances = [...INITIAL_BALANCES];
    this.claims = [...INITIAL_CLAIMS];
    this.referralClaims = [...INITIAL_REFERRAL_CLAIMS];
    this.stats = { ...INITIAL_STATS };
    this.cooldowns = {};
    this.completedTaskIds = [];
    this.passwords = {};
    this.notify();
  }
}

export const faucetDb = new FaucetDatabase();
