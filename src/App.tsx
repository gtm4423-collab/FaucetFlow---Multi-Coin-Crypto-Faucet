/**
 * FaucetFlow - Multi-Coin Crypto Faucet & Security Hub
 * Grounded in faucetflow_supabase_all_58fd9fca.sql
 */

import { useState, useEffect, useCallback } from 'react';
import { ActiveTab } from './types';
import { COIN_CONFIGS } from './data/coins';
import { faucetDb } from './lib/faucetStore';
import { Header } from './components/Header';
import { FaucetSection } from './components/FaucetSection';
import { LedgerSection } from './components/LedgerSection';
import { WithdrawSection } from './components/WithdrawSection';
import { AdminSection } from './components/AdminSection';
import { SqlSchemaSection } from './components/SqlSchemaSection';
import { CreateUserModal } from './components/CreateUserModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { Droplets, ShieldCheck, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('faucet');
  const [currentUser, setCurrentUser] = useState(faucetDb.getCurrentUser());
  const [allUsers, setAllUsers] = useState(faucetDb.getAllUsers());
  const [balances, setBalances] = useState(faucetDb.getUserBalances());
  const [claims, setClaims] = useState(faucetDb.getClaims());
  const [stats, setStats] = useState(faucetDb.getStats());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Sync state whenever the store updates
  const syncStore = useCallback(() => {
    const user = faucetDb.getCurrentUser();
    setCurrentUser(user);
    setAllUsers(faucetDb.getAllUsers());
    setBalances(faucetDb.getUserBalances(user?.id));
    setClaims(faucetDb.getClaims());
    setStats(faucetDb.getStats());
  }, []);

  useEffect(() => {
    const unsubscribe = faucetDb.subscribe(syncStore);
    return () => unsubscribe();
  }, [syncStore]);

  const handleSwitchUser = (userId: string) => {
    faucetDb.switchUser(userId);
    syncStore();
  };

  const handleOpenSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = () => {
    faucetDb.signOut();
    syncStore();
  };

  const handlePromoteCurrentToAdmin = () => {
    if (currentUser) {
      faucetDb.toggleRole(currentUser.id);
      syncStore();
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo balances, claims, and users back to initial schema seed state?')) {
      faucetDb.resetToFactory();
      syncStore();
    }
  };

  // Calculate total portfolio USD value
  const totalUsdValue = (['BTC', 'LTC', 'DOGE', 'USDT'] as const).reduce((acc, coin) => {
    const bal = balances[coin] || 0;
    return acc + bal * COIN_CONFIGS[coin].usdPrice;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onOpenSignIn={handleOpenSignIn}
        onOpenSignUp={handleOpenSignUp}
        onSignOut={handleSignOut}
        onResetData={handleResetData}
        onOpenSupabaseConnect={() => setIsSupabaseModalOpen(true)}
        totalUsdValue={totalUsdValue}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'faucet' && (
          <FaucetSection
            currentUser={currentUser}
            balances={balances}
            onClaimSuccess={syncStore}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerSection
            claims={claims}
            currentUser={currentUser}
            onNavigateFaucet={() => setActiveTab('faucet')}
          />
        )}

        {activeTab === 'withdraw' && (
          <WithdrawSection
            currentUser={currentUser}
            balances={balances}
            onWithdrawSuccess={syncStore}
          />
        )}

        {activeTab === 'admin' && (
          <AdminSection
            currentUser={currentUser}
            stats={stats}
            onRefresh={syncStore}
            onPromoteMe={handlePromoteCurrentToAdmin}
          />
        )}

        {activeTab === 'sql-architecture' && (
          <SqlSchemaSection onOpenSupabaseConnect={() => setIsSupabaseModalOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-300 font-semibold">FaucetFlow Engine</span>
            <span>·</span>
            <span>Supabase PostgreSQL Edition</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> RLS Enforced
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> 60s Transaction Cooldown
            </span>
          </div>
        </div>
      </footer>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={syncStore}
      />

      {/* Sign In & Sign Up Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={syncStore}
      />

      {/* Supabase Connection Modal */}
      <SupabaseConnectModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChange={syncStore}
      />
    </div>
  );
}
