import {
  AdminActivityLog,
  ClaimRecord,
  CoinType,
  FaucetStats,
  UserBalance,
  UserProfile,
} from '../types';
import { COIN_CONFIGS } from '../data/coins';

const STORAGE_KEYS = {
  USERS: 'faucetflow_users_v1',
  CURRENT_USER_ID: 'faucetflow_current_user_id_v1',
  BALANCES: 'faucetflow_balances_v1',
  CLAIMS: 'faucetflow_claims_v1',
  LOGS: 'faucetflow_admin_logs_v1',
  STATS: 'faucetflow_stats_v1',
  COOLDOWNS: 'faucetflow_cooldowns_v1',
};

// Seed users
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-492a-seeker',
    email: 'seeker@crypto.io',
    username: 'CryptoSeeker',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    role: 'user',
  },
  {
    id: 'adm-01ff-master',
    email: 'admin@faucetflow.io',
    username: 'FaucetAdmin',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    role: 'admin',
  },
  {
    id: 'usr-923c-satoshifan',
    email: 'satoshifan@web3.org',
    username: 'SatoshiFan21',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    role: 'user',
  },
];

const INITIAL_BALANCES: UserBalance[] = [
  // CryptoSeeker
  { user_id: 'usr-492a-seeker', coin: 'BTC', amount: 0.00000018, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { user_id: 'usr-492a-seeker', coin: 'LTC', amount: 0.00001400, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { user_id: 'usr-492a-seeker', coin: 'DOGE', amount: 0.00018000, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { user_id: 'usr-492a-seeker', coin: 'USDT', amount: 0.00150000, updated_at: new Date(Date.now() - 3600000).toISOString() },
  // FaucetAdmin
  { user_id: 'adm-01ff-master', coin: 'BTC', amount: 0.00005000, updated_at: new Date(Date.now() - 7200000).toISOString() },
  { user_id: 'adm-01ff-master', coin: 'LTC', amount: 0.00500000, updated_at: new Date(Date.now() - 7200000).toISOString() },
  { user_id: 'adm-01ff-master', coin: 'DOGE', amount: 25.0000000, updated_at: new Date(Date.now() - 7200000).toISOString() },
  { user_id: 'adm-01ff-master', coin: 'USDT', amount: 15.5000000, updated_at: new Date(Date.now() - 7200000).toISOString() },
  // SatoshiFan21
  { user_id: 'usr-923c-satoshifan', coin: 'BTC', amount: 0.00000005, updated_at: new Date(Date.now() - 1800000).toISOString() },
  { user_id: 'usr-923c-satoshifan', coin: 'LTC', amount: 0.00000400, updated_at: new Date(Date.now() - 1800000).toISOString() },
  { user_id: 'usr-923c-satoshifan', coin: 'DOGE', amount: 0.00004000, updated_at: new Date(Date.now() - 1800000).toISOString() },
  { user_id: 'usr-923c-satoshifan', coin: 'USDT', amount: 0.00040000, updated_at: new Date(Date.now() - 1800000).toISOString() },
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
    tx_hash: '0x3e1d...910a',
  },
  {
    id: 'clm-921a-usdt-03',
    user_id: 'usr-923c-satoshifan',
    username: 'SatoshiFan21',
    coin: 'USDT',
    amount: 0.00010000,
    claimed_at: new Date(Date.now() - 300000).toISOString(),
    tx_hash: '0x712a...f4bc',
  },
  {
    id: 'clm-771c-ltc-04',
    user_id: 'adm-01ff-master',
    username: 'FaucetAdmin',
    coin: 'LTC',
    amount: 0.00000100,
    claimed_at: new Date(Date.now() - 420000).toISOString(),
    tx_hash: '0x192e...44d1',
  },
];

const INITIAL_LOGS: AdminActivityLog[] = [
  {
    id: 1,
    actor_user_id: 'adm-01ff-master',
    actor_email: 'admin@faucetflow.io',
    action: 'dashboard_view',
    details: { ip: '192.168.1.1', client: 'FaucetFlow Web Console' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    actor_user_id: 'adm-01ff-master',
    actor_email: 'admin@faucetflow.io',
    action: 'data_refresh',
    details: { sync: 'full_ledger_refresh', status: 'ok' },
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const INITIAL_STATS: FaucetStats = {
  totalClaimsCount: 1420,
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
  activeUsersCount: 384,
  claimsLast24h: 312,
};

// Safe JSON loader
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
  private logs: AdminActivityLog[];
  private stats: FaucetStats;
  // Key format: `${userId}:${coin}` -> timestamp (ms)
  private cooldowns: Record<string, number>;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUserId = loadStorage(STORAGE_KEYS.CURRENT_USER_ID, 'usr-492a-seeker');
    this.balances = loadStorage(STORAGE_KEYS.BALANCES, INITIAL_BALANCES);
    this.claims = loadStorage(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
    this.logs = loadStorage(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    this.stats = loadStorage(STORAGE_KEYS.STATS, INITIAL_STATS);
    this.cooldowns = loadStorage(STORAGE_KEYS.COOLDOWNS, {});
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
    saveStorage(STORAGE_KEYS.LOGS, this.logs);
    saveStorage(STORAGE_KEYS.STATS, this.stats);
    saveStorage(STORAGE_KEYS.COOLDOWNS, this.cooldowns);
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

  public createUser(username: string, email: string, makeAdmin = false): UserProfile {
    const newUser: UserProfile = {
      id: `usr-${Math.random().toString(36).substring(2, 8)}`,
      username: username.trim(),
      email: email.trim(),
      created_at: new Date().toISOString(),
      role: makeAdmin ? 'admin' : 'user',
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

  public signIn(identifier: string): UserProfile {
    const clean = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (!user) {
      throw new Error(`Account not found for "${identifier}". Please create an account via Sign Up.`);
    }
    this.currentUserId = user.id;
    this.notify();
    return user;
  }

  public signOut(): void {
    this.currentUserId = '';
    this.notify();
  }

  public signUp(username: string, email: string, makeAdmin = false): UserProfile {
    const existing = this.users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() ||
        u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      throw new Error('A user with that email or username already exists.');
    }
    return this.createUser(username, email, makeAdmin);
  }

  public toggleRole(userId: string): void {
    const target = this.users.find((u) => u.id === userId);
    if (target) {
      target.role = target.role === 'admin' ? 'user' : 'admin';
      this.notify();
    }
  }

  public getUserBalances(userId?: string): Record<CoinType, number> {
    const uid = userId || this.currentUserId;
    const result: Record<CoinType, number> = {
      BTC: 0,
      LTC: 0,
      DOGE: 0,
      USDT: 0,
    };
    this.balances
      .filter((b) => b.user_id === uid)
      .forEach((b) => {
        result[b.coin] = b.amount;
      });
    return result;
  }

  public getRemainingCooldown(coin: CoinType, userId?: string): number {
    const uid = userId || this.currentUserId;
    const key = `${uid}:${coin}`;
    const lastClaimMs = this.cooldowns[key];
    if (!lastClaimMs) return 0;
    const elapsed = Date.now() - lastClaimMs;
    const cooldownMs = COIN_CONFIGS[coin].cooldownSeconds * 1000;
    if (elapsed >= cooldownMs) return 0;
    return Math.ceil((cooldownMs - elapsed) / 1000);
  }

  /**
   * Replicates PostgreSQL public.claim_reward(p_coin text)
   * 1. Check user authentication
   * 2. Check coin validity
   * 3. Simulate advisory lock (serialize access)
   * 4. Enforce 60-second cooldown
   * 5. Credit user balance & create claim log
   */
  public async claimReward(coin: CoinType): Promise<{
    coin: CoinType;
    amount: number;
    claimed_at: string;
    tx_hash: string;
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Please sign in before claiming.');
    }
    if (!['BTC', 'LTC', 'DOGE', 'USDT'].includes(coin)) {
      throw new Error('Unsupported coin.');
    }

    const remaining = this.getRemainingCooldown(coin, user.id);
    if (remaining > 0) {
      throw new Error(`Please wait ${remaining}s before making another claim for ${coin}.`);
    }

    const config = COIN_CONFIGS[coin];
    const reward = config.rewardAmount;

    // Simulate advisory lock latency (120ms)
    await new Promise((res) => setTimeout(res, 120));

    const nowIso = new Date().toISOString();
    const key = `${user.id}:${coin}`;
    this.cooldowns[key] = Date.now();

    // Update balances
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

    // Update stats & reserves
    this.stats.totalClaimsCount += 1;
    this.stats.claimsLast24h += 1;
    this.stats.totalDispensed[coin] = Number((this.stats.totalDispensed[coin] + reward).toFixed(12));
    this.stats.faucetReserves[coin] = Math.max(0, Number((this.stats.faucetReserves[coin] - reward).toFixed(12)));

    this.notify();

    return {
      coin,
      amount: reward,
      claimed_at: nowIso,
      tx_hash: txHash,
    };
  }

  public getClaims(userId?: string): ClaimRecord[] {
    if (userId) {
      return this.claims.filter((c) => c.user_id === userId);
    }
    return [...this.claims];
  }

  // Admin APIs mirroring SQL security definer RPCs
  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  public adminListUsers(): Array<UserProfile & { balances: Record<CoinType, number>; totalClaims: number }> {
    if (!this.isAdmin()) {
      throw new Error('Administrator access required [SQL 42501]');
    }

    return this.users.map((u) => {
      const balances = this.getUserBalances(u.id);
      const totalClaims = this.claims.filter((c) => c.user_id === u.id).length;
      return {
        ...u,
        balances,
        totalClaims,
      };
    });
  }

  public adminLogActivity(
    action: 'dashboard_view' | 'users_view' | 'claims_view' | 'activity_logs_view' | 'data_refresh',
    details: Record<string, unknown> = {}
  ): void {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'admin') {
      return; // SQL throws 42501
    }

    const log: AdminActivityLog = {
      id: this.logs.length + 1,
      actor_user_id: user.id,
      actor_email: user.email,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    this.logs.unshift(log);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    this.notify();
  }

  public adminListActivityLogs(): AdminActivityLog[] {
    if (!this.isAdmin()) {
      throw new Error('Administrator access required [SQL 42501]');
    }
    return [...this.logs];
  }

  public getStats(): FaucetStats {
    return { ...this.stats };
  }

  public refillReserve(coin: CoinType, amount: number): void {
    if (!this.isAdmin()) {
      throw new Error('Administrator access required [SQL 42501]');
    }
    this.stats.faucetReserves[coin] = Number((this.stats.faucetReserves[coin] + amount).toFixed(12));
    this.adminLogActivity('data_refresh', {
      action: 'vault_refill',
      coin,
      amount,
    });
    this.notify();
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
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.COOLDOWNS);

    this.users = [...INITIAL_USERS];
    this.currentUserId = 'usr-492a-seeker';
    this.balances = [...INITIAL_BALANCES];
    this.claims = [...INITIAL_CLAIMS];
    this.logs = [...INITIAL_LOGS];
    this.stats = { ...INITIAL_STATS };
    this.cooldowns = {};
    this.notify();
  }
}

export const faucetDb = new FaucetDatabase();
