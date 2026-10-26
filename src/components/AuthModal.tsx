import React, { useState, useEffect } from 'react';
import { faucetDb } from '../lib/faucetStore';
import { LogIn, UserPlus, X, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, Users } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referrerCode, setReferrerCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 250));
      faucetDb.signIn(identifier, password);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError('Please enter both username and email.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password && password.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 300));
      faucetDb.signUp(username, email, password, referrerCode || null);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (userType: 'seeker' | 'satoshifan') => {
    if (userType === 'seeker') {
      faucetDb.signIn('CryptoSeeker');
    } else {
      faucetDb.signIn('SatoshiFan21');
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Tabs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to FaucetFlow' : 'Create an Account'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {mode === 'signin'
                  ? 'Access your balances, claim rewards, and complete offerwalls.'
                  : 'Get started and initialize your BTC, LTC, DOGE & USDT wallets.'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Email or Username</label>
              <input
                type="text"
                placeholder="e.g. seeker@crypto.io or CryptoSeeker"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Username</label>
              <input
                type="text"
                placeholder="e.g. SatoshiSeeker"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Email Address</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1 pt-0.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Referrer Code (Optional)</span>
                <span className="text-[10px] text-emerald-400 font-mono">10% commission</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CryptoSeeker"
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Instant registration initializes multi-coin wallets for BTC, LTC, DOGE, and USDT.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </form>
        )}

        {/* Fast 1-Click Demo Accounts */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Instant Demo Logins:</span>
            <span className="text-[10px] text-slate-500">1-click test</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seeker')}
              className="py-1.5 px-2.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="truncate">
                <span className="font-semibold text-white block truncate">CryptoSeeker</span>
                <span className="text-[10px] text-slate-500 block">Referrer Account</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('satoshifan')}
              className="py-1.5 px-2.5 rounded-lg border border-emerald-800/60 bg-emerald-950/20 hover:bg-emerald-950/40 text-slate-300 text-left transition-colors flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="truncate">
                <span className="font-semibold text-emerald-300 block truncate">SatoshiFan21</span>
                <span className="text-[10px] text-emerald-400/70 block">Referee Account</span>
              </div>
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
