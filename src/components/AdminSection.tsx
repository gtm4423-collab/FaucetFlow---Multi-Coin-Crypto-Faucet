import React, { useState, useEffect } from 'react';
import { AdminActivityLog, CoinType, FaucetStats, UserProfile } from '../types';
import { COIN_CONFIGS, ADMIN_MASTER_PASSWORD } from '../data/coins';
import { faucetDb } from '../lib/faucetStore';
import { UI_TEXT } from '../data/translations';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Coins,
  Activity,
  PlusCircle,
  Clock,
  Search,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';

interface AdminSectionProps {
  currentUser: UserProfile | null;
  stats: FaucetStats;
  onRefresh: () => void;
  onPromoteMe: () => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  currentUser,
  stats,
  onRefresh,
  onPromoteMe,
}) => {
  const t = UI_TEXT;
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'overview' | 'users' | 'claims' | 'logs'>('overview');
  const [usersList, setUsersList] = useState<Array<UserProfile & { balances: Record<CoinType, number>; totalClaims: number }>>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [refillCoin, setRefillCoin] = useState<CoinType>('BTC');
  const [refillAmount, setRefillAmount] = useState('0.1');

  // Master password state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('faucetflow_admin_unlocked') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Load data & log action when sub-tab changes (only when password is verified and user is admin)
  useEffect(() => {
    if (!isAdmin || !isUnlocked) return;

    try {
      if (activeAdminSubTab === 'overview') {
        faucetDb.adminLogActivity('dashboard_view', { tab: 'overview', timestamp: Date.now() });
      } else if (activeAdminSubTab === 'users') {
        faucetDb.adminLogActivity('users_view', { tab: 'users_directory' });
        setUsersList(faucetDb.adminListUsers());
      } else if (activeAdminSubTab === 'claims') {
        faucetDb.adminLogActivity('claims_view', { tab: 'all_claims' });
      } else if (activeAdminSubTab === 'logs') {
        faucetDb.adminLogActivity('activity_logs_view', { tab: 'audit_logs' });
        setActivityLogs(faucetDb.adminListActivityLogs());
      }
    } catch (err) {
      console.warn('Admin action error:', err);
    }
  }, [activeAdminSubTab, isAdmin, isUnlocked]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_MASTER_PASSWORD) {
      sessionStorage.setItem('faucetflow_admin_unlocked', 'true');
      setIsUnlocked(true);
      setPasswordError(null);
      if (!isAdmin) {
        onPromoteMe();
      }
      onRefresh();
    } else {
      setPasswordError('Incorrect administrator password. Access denied.');
    }
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('faucetflow_admin_unlocked');
    setIsUnlocked(false);
    setPasswordInput('');
  };

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(refillAmount);
    if (isNaN(val) || val <= 0) return;
    faucetDb.refillReserve(refillCoin, val);
    setRefillModalOpen(false);
    onRefresh();
  };

  // If Admin Console is locked: require Master Password Ssshahin375@@#
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-7 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">Admin Console Authentication</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the master administrator security password to manage treasury vaults, users, and audit logs.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs text-left">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs text-left">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Master Admin Password</span>
                <span className="text-[10px] text-slate-500 font-mono">Protected Gate</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrator password..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono pr-10 text-xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enforced by Security Definer RPC</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is not admin in database:
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
            <p className="text-xs font-mono text-amber-400">
              PostgreSQL Exception: 42501 (insufficient_privilege)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Your current account (<span className="text-slate-200 font-semibold">{currentUser?.username || 'Guest'}</span>) does not exist in the <code className="text-emerald-300 font-mono">public.admin_roles</code> table.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onPromoteMe}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Assign Administrator Role to {currentUser?.username || 'Current User'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allClaims = faucetDb.getClaims();

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{t.tab_admin}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Password Verified</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure console backed by <code className="text-emerald-300 font-mono">admin_list_users()</code> and <code className="text-emerald-300 font-mono">admin_activity_logs</code>.
            </p>
          </div>
        </div>

        {/* Action Buttons: Refill Vault & Lock Console */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setRefillModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Refill Faucet Vault</span>
          </button>

          <button
            onClick={handleLockSession}
            title="Lock Administrator Session"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminSubTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeAdminSubTab === 'overview'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Vault & Platform Stats</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('users')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeAdminSubTab === 'users'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Directory (admin_list_users)</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeAdminSubTab === 'claims'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Claims Stream ({allClaims.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeAdminSubTab === 'logs'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Logs (admin_activity_logs)</span>
        </button>
      </div>

      {/* Subtab 1: Vault & Stats */}
      {activeAdminSubTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
              <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">Total Claims</span>
              <div className="text-xl font-bold text-white font-mono tabular-nums">{stats.totalClaimsCount}</div>
              <span className="text-[11px] text-emerald-400">+{stats.claimsLast24h} in 24h</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
              <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">Registered Users</span>
              <div className="text-xl font-bold text-white font-mono tabular-nums">{stats.activeUsersCount}</div>
              <span className="text-[11px] text-slate-400">profiles with RLS</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
              <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">Total BTC Dispensed</span>
              <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">{stats.totalDispensed.BTC.toFixed(8)}</div>
              <span className="text-[11px] text-slate-400">≈ ${(stats.totalDispensed.BTC * COIN_CONFIGS.BTC.usdPrice).toFixed(2)}</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
              <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">Total USDT Dispensed</span>
              <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">{stats.totalDispensed.USDT.toFixed(4)}</div>
              <span className="text-[11px] text-slate-400">Stable reserve payout</span>
            </div>
          </div>

          {/* Faucet Treasury Vault Reserves */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Faucet Treasury Reserves</h3>
                <p className="text-xs text-slate-400">Hot wallet reserves available for automated user payouts.</p>
              </div>
              <button
                onClick={() => setRefillModalOpen(true)}
                className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                + Top Up Reserves
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {(['BTC', 'LTC', 'DOGE', 'USDT'] as const).map((coin) => {
                const cfg = COIN_CONFIGS[coin];
                const resAmount = stats.faucetReserves[coin];
                const usdRes = resAmount * cfg.usdPrice;

                return (
                  <div key={coin} className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{coin}</span>
                      <span className="text-xs text-slate-400">{cfg.name}</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono tabular-nums">
                      {resAmount.toLocaleString()} {coin}
                    </div>
                    <div className="text-xs text-slate-400 font-mono tabular-nums">
                      ≈ ${usdRes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: User Directory (admin_list_users) */}
      {activeAdminSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Fetched via RPC <code className="text-emerald-300 font-mono">public.admin_list_users()</code>
            </div>
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">User ID (UUID)</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">BTC Balance</th>
                  <th className="py-3 px-4 text-right">USDT Balance</th>
                  <th className="py-3 px-4 text-center">Claims Made</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {usersList
                  .filter((u) => {
                    if (!searchTerm) return true;
                    const q = searchTerm.toLowerCase();
                    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                  })
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 font-normal">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{u.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{u.username}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                            u.role === 'admin'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-white">
                        {u.balances.BTC.toFixed(8)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                        {u.balances.USDT.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-300">
                        {u.totalClaims}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            faucetDb.toggleRole(u.id);
                            setUsersList(faucetDb.adminListUsers());
                            onRefresh();
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Live Claims Stream */}
      {activeAdminSubTab === 'claims' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Real-time feed of all reward transactions from <code className="text-emerald-300 font-mono">public.claims</code>.
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Coin</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {allClaims.slice(0, 50).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{c.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{c.username || c.user_id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{c.coin}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white tabular-nums">
                      +{c.amount}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(c.claimed_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{c.tx_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Audit Logs (admin_activity_logs) */}
      {activeAdminSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Immutable admin audit trail populated via <code className="text-emerald-300 font-mono">admin_log_activity(action, details)</code>.
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Actor Email</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">JSON Payload (details)</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400">#{log.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{log.actor_email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-emerald-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      <code className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {JSON.stringify(log.details)}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refill Modal */}
      {refillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Refill Faucet Treasury Vault</h3>
              <button
                onClick={() => setRefillModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Select Currency</label>
                <select
                  value={refillCoin}
                  onChange={(e) => setRefillCoin(e.target.value as CoinType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="LTC">Litecoin (LTC)</option>
                  <option value="DOGE">Dogecoin (DOGE)</option>
                  <option value="USDT">Tether USD (USDT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Deposit Amount</label>
                <input
                  type="number"
                  step="any"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  placeholder="0.00"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefillModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Deposit to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
