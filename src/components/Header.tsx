import { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { UI_TEXT } from '../data/translations';
import {
  Droplets,
  User,
  ChevronDown,
  Check,
  RefreshCw,
  LogIn,
  UserPlus,
  LogOut,
  Download,
  Sparkles,
  Percent,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onSwitchUser: (userId: string) => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onSignOut: () => void;
  onResetData: () => void;
  totalUsdValue: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
  onResetData,
  totalUsdValue,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = UI_TEXT;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Faucet<span className="text-emerald-400">Flow</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal -mt-1 hidden sm:inline">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Pure User Dashboard) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('faucet')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'faucet'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {t.tab_faucet}
            </button>

            {/* Offerwalls Tab */}
            <button
              onClick={() => setActiveTab('offerwalls')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'offerwalls'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.tab_offerwalls}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                HOT
              </span>
            </button>

            {/* 10% Referral Program Tab */}
            <button
              onClick={() => setActiveTab('referral')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'referral'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.tab_referral}</span>
            </button>

            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'withdraw'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {t.tab_withdraw}
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ledger'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {t.tab_ledger}
            </button>
          </nav>

          {/* Zone 3: Sign In, Sign Up & Account */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Total Balance Badge (visible when signed in) */}
            {currentUser && (
              <div className="hidden lg:flex flex-col items-end pr-2 border-r border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-medium tracking-wider">
                  {t.total_balance}
                </span>
                <span className="text-xs font-semibold text-emerald-400 tabular-nums font-mono">
                  ${totalUsdValue.toFixed(4)}
                </span>
              </div>
            )}

            {/* If Signed Out: Show Primary Sign In & Sign Up buttons */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={onOpenSignUp}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              /* If Signed In: Show User Profile Dropdown */
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentUser.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-900 border border-slate-800 shadow-xl py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-800 text-slate-400 font-medium flex items-center justify-between">
                        <span>{t.switch_user}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">1-click switch</span>
                      </div>

                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => onSwitchUser(u.id)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            u.id === currentUser.id ? 'bg-slate-800/80 text-white font-medium' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="truncate">{u.username}</span>
                            <span className="text-[10px] text-slate-400 truncate">{u.email}</span>
                          </div>
                          {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      ))}

                      <div className="border-t border-slate-800 mt-1 pt-1 px-2 space-y-1">
                        <button
                          onClick={onOpenSignIn}
                          className="w-full text-left px-2 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
                        >
                          <LogIn className="w-3 h-3 text-emerald-400" />
                          <span>Sign In to Another Account</span>
                        </button>
                        <button
                          onClick={onOpenSignUp}
                          className="w-full text-left px-2 py-1.5 text-emerald-400 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Create New Account (Sign Up)</span>
                        </button>
                        <button
                          onClick={onSignOut}
                          className="w-full text-left px-2 py-1.5 text-rose-400 hover:bg-rose-950/30 rounded transition-colors flex items-center gap-1.5"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Sign Out</span>
                        </button>
                        <a
                          href="/faucetflow-source-code.zip"
                          download="faucetflow-source-code.zip"
                          className="w-full text-left px-2 py-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Source Code (.ZIP)</span>
                        </a>
                        <button
                          onClick={onResetData}
                          className="w-full text-left px-2 py-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reset Demo Data</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional quick Sign In / Sign Up buttons */}
                <button
                  onClick={onOpenSignIn}
                  title="Sign In"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Sign In</span>
                </button>

                <button
                  onClick={onOpenSignUp}
                  title="Sign Up"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => setActiveTab('faucet')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'faucet' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tab_faucet}
          </button>
          <button
            onClick={() => setActiveTab('offerwalls')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'offerwalls' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tab_offerwalls}
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'referral' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tab_referral}
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'withdraw' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tab_withdraw}
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'ledger' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tab_ledger}
          </button>
        </div>
      </div>
    </header>
  );
};
