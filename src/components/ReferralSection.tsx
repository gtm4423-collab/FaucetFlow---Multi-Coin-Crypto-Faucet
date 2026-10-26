import React, { useState } from 'react';
import { CoinType, ReferralClaimRecord, UserProfile } from '../types';
import { COIN_CONFIGS } from '../data/coins';
import { faucetDb } from '../lib/faucetStore';
import {
  Users,
  Copy,
  Check,
  Gift,
  Share2,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck,
} from 'lucide-react';

interface ReferralSectionProps {
  currentUser: UserProfile | null;
  onOpenSignIn: () => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({
  currentUser,
  onOpenSignIn,
}) => {
  const [copied, setCopied] = useState(false);

  const referralLink = currentUser
    ? `${window.location.origin}/?ref=${currentUser.username}`
    : `${window.location.origin}/?ref=YOUR_USERNAME`;

  const handleCopyLink = () => {
    if (!currentUser) {
      onOpenSignIn();
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referees = currentUser ? faucetDb.getReferees(currentUser.id) : [];
  const referralClaims: ReferralClaimRecord[] = currentUser
    ? faucetDb.getReferralClaims(currentUser.id)
    : [];

  // Calculate total earnings in USD
  const totalEarnedUsd = referralClaims.reduce((acc, claim) => {
    const price = COIN_CONFIGS[claim.coin]?.usdPrice || 0;
    return acc + claim.amount * price;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold">
            <Percent className="w-3.5 h-3.5" />
            <span>10% Lifetime Referral Program</span>
            <span aria-hidden="true">·</span>
            <span>Instant Automated Payouts</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Invite Friends & Earn <span className="text-emerald-400">10% Lifetime Commission</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Share your personal referral link. Whenever your referred friends claim from the faucet, <strong>10% of their reward</strong> is automatically credited into your wallet in the same coin.
          </p>

          {/* Referral Link Box */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
              <div className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 truncate flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{referralLink}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Referral Link'}</span>
              </button>
            </div>
            {!currentUser && (
              <p className="text-[11px] text-amber-400 mt-2">
                * Please Sign In or Sign Up to generate your personal referral link.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Friends Invited</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{referees.length}</div>
          <div className="text-[11px] text-slate-500">Active referee accounts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Commission Claims Received</span>
            <Gift className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{referralClaims.length}</div>
          <div className="text-[11px] text-slate-500">10% automatic payouts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Referral Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            ${totalEarnedUsd.toFixed(6)}
          </div>
          <div className="text-[11px] text-slate-500">Estimated cumulative USD value</div>
        </div>
      </div>

      {/* Referral Claims Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Referral Payout History (public.referral_claims)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit of 10% commissions deposited to your account when friends claim.
            </p>
          </div>
        </div>

        {referralClaims.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Gift className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No referral commissions earned yet.</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Share your referral link with friends. As soon as they make their first claim, your 10% commission will show here!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Referee</th>
                  <th className="px-4 py-3">Coin</th>
                  <th className="px-4 py-3">Commission (10%)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {referralClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-sans text-xs">
                      {new Date(claim.claimed_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-sans font-medium">
                      {claim.referee_username || 'Referred Friend'}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{claim.coin}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">
                      +{claim.amount} {claim.coin}
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-sans text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Credited</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referral Engine Callout */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>How the 10% Referral Commission Works:</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          When anyone signs up using your username or referral link, your account is permanently linked as their referrer. Every time they claim crypto from the faucet, an automatic 10% commission bonus is calculated and instantly deposited into your wallet balances.
        </p>
      </div>
    </div>
  );
};
