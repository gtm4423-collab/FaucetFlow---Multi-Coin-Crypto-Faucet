import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CoinType, UserProfile } from '../types';
import { COIN_CONFIGS } from '../data/coins';
import { faucetDb } from '../lib/faucetStore';
import { UI_TEXT } from '../data/translations';
import {
  Lock,
  Timer,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const CLAIM_SPONSOR_URL = 'https://surl.li/pwwkjr';

interface FaucetSectionProps {
  currentUser: UserProfile | null;
  balances: Record<CoinType, number>;
  onClaimSuccess: () => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
}

export const FaucetSection: React.FC<FaucetSectionProps> = ({
  currentUser,
  balances,
  onClaimSuccess,
  onOpenSignIn,
  onOpenSignUp,
}) => {
  const t = UI_TEXT;
  const [cooldowns, setCooldowns] = useState<Record<CoinType, number>>({
    BTC: 0,
    LTC: 0,
    DOGE: 0,
    USDT: 0,
  });
  const [loadingCoins, setLoadingCoins] = useState<Record<CoinType, boolean>>({
    BTC: false,
    LTC: false,
    DOGE: false,
    USDT: false,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<{ coin: CoinType; amount: number; tx: string } | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(true);

  // Update cooldown timers every second
  useEffect(() => {
    const updateTimers = () => {
      if (!currentUser) return;
      const coins: CoinType[] = ['BTC', 'LTC', 'DOGE', 'USDT'];
      const updated: Record<CoinType, number> = { BTC: 0, LTC: 0, DOGE: 0, USDT: 0 };
      coins.forEach((c) => {
        updated[c] = faucetDb.getRemainingCooldown(c, currentUser.id);
      });
      setCooldowns(updated);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleClaim = async (coin: CoinType) => {
    if (!currentUser) {
      if (onOpenSignIn) {
        onOpenSignIn();
      } else {
        setErrorMsg('Please Sign In or Sign Up to claim crypto rewards.');
      }
      return;
    }

    if (!captchaVerified) {
      setErrorMsg('Please verify the security captcha check before claiming.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingCoins((prev) => ({ ...prev, [coin]: true }));

    try {
      const result = await faucetDb.claimReward(coin);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: [COIN_CONFIGS[coin].color, '#10B981', '#38BDF8'],
      });

      setSuccessMsg({
        coin: result.coin,
        amount: result.amount,
        tx: result.tx_hash,
      });

      onClaimSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim failed.';
      setErrorMsg(msg);
    } finally {
      setLoadingCoins((prev) => ({ ...prev, [coin]: false }));
    }
  };

  const coinsList: CoinType[] = ['BTC', 'LTC', 'DOGE', 'USDT'];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.security_verified}</span>
            <span aria-hidden="true">·</span>
            <span>60s Cooldown</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Trust RLS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            High-Frequency Multi-Coin Faucet <br />
            <span className="text-emerald-400">Claim BTC, LTC, DOGE & USDT</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Directly grounded in your Supabase schema. Claim micro-rewards every 60 seconds. Concurrency-safe via PostgreSQL advisory locks and enforced Security Definer RPC.
          </p>

          {/* Captcha / Anti-Bot toggle simulator & Sponsor Link */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 cursor-pointer select-none text-xs hover:border-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={captchaVerified}
                onChange={(e) => setCaptchaVerified(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
              />
              <span className="text-slate-200 font-medium">I am human (Anti-Bot Verification)</span>
              {captchaVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </label>

            <a
              href={CLAIM_SPONSOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <span className="text-slate-400">Claim Sponsor:</span>
              <span className="font-mono font-medium underline">https://surl.li/pwwkjr</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>

            <div className="text-xs text-slate-400">
              Active account:{' '}
              <span className="text-slate-200 font-semibold">{currentUser?.username || 'Guest'}</span>
            </div>
          </div>

          {!currentUser && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-xs mt-3">
              <div className="text-slate-300">
                <span className="font-semibold text-white">Join FaucetFlow:</span> Sign In or create a free account to start accumulating BTC, LTC, DOGE & USDT rewards.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenSignIn}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenSignUp}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold cursor-pointer transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 text-sm animate-in fade-in duration-150">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-200 text-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-white">
                Claim Successful! Added {successMsg.amount} {successMsg.coin}
              </p>
              <p className="text-xs text-emerald-300 font-mono">Receipt: {successMsg.tx}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">60s cooldown active</span>
        </div>
      )}

      {/* 4 Coin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {coinsList.map((coin) => {
          const config = COIN_CONFIGS[coin];
          const remSec = cooldowns[coin];
          const isCooling = remSec > 0;
          const userBal = balances[coin] || 0;
          const usdVal = userBal * config.usdPrice;
          const isLoading = loadingCoins[coin];

          // Progress percentage for 60s cooldown
          const progressPercent = isCooling ? ((60 - remSec) / 60) * 100 : 100;

          return (
            <div
              key={coin}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all shadow-sm relative overflow-hidden"
            >
              {/* Top Row: Coin Icon & Name */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border"
                      style={{
                        backgroundColor: config.accentBg,
                        borderColor: `${config.color}40`,
                        color: config.color,
                      }}
                    >
                      {config.iconSymbol}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{config.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">{config.symbol}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    ${config.usdPrice.toLocaleString()}
                  </span>
                </div>

                {/* Reward Rate & User Balance */}
                <div className="space-y-3 py-3 border-y border-slate-800/80 my-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t.reward_rate}:</span>
                    <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                      +{config.rewardAmount} {config.symbol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Your Balance:</span>
                    <div className="text-right">
                      <div className="font-bold text-white font-mono tabular-nums">
                        {userBal.toFixed(config.decimals)} {config.symbol}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        ≈ ${usdVal.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Cooldown status & Claim button */}
              <div className="space-y-3 pt-2">
                {/* Cooldown bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {isCooling ? (
                        <span className="text-amber-400 font-medium">
                          {remSec} {t.seconds_remaining}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">{t.ready_to_claim}</span>
                      )}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {isCooling ? `${Math.round(progressPercent)}%` : '100%'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isCooling ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Claim Button with Sponsor Link */}
                {isCooling || isLoading ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-slate-800/80 text-slate-400 cursor-not-allowed border border-slate-700/50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 animate-spin" />
                        Executing RPC...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Lock className="w-3.5 h-3.5" />
                        Wait {remSec}s
                      </span>
                    )}
                  </button>
                ) : (
                  <a
                    href={CLAIM_SPONSOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClaim(coin)}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10 cursor-pointer active:scale-[0.98] text-center"
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.claim_reward}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-75 shrink-0" />
                  </a>
                )}

                {/* Direct Sponsor Link Reference */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500">Reward Link:</span>
                  <a
                    href={CLAIM_SPONSOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 transition-colors"
                  >
                    <span>surl.li/pwwkjr</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mechanism-to-Outcome Architecture Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Advisory Locks Serialization</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The SQL uses <code className="text-emerald-300 font-mono text-[11px]">pg_advisory_xact_lock()</code> to
            serialize claim attempts per user and coin, preventing race condition double-spending.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>60-Second Cooldown Interval</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verified directly against <code className="text-cyan-300 font-mono text-[11px]">public.claims</code> table
            where <code className="text-cyan-300 font-mono text-[11px]">claimed_at &gt; now() - interval '60s'</code>.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Security Definer RPC</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct client inserts to <code className="text-purple-300 font-mono text-[11px]">balances</code> are
            blocked by RLS. Mutations must flow through <code className="text-purple-300 font-mono text-[11px]">claim_reward()</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
