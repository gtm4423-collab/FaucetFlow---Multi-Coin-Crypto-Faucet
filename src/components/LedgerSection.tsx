import React, { useState } from 'react';
import { ClaimRecord, CoinType, UserProfile } from '../types';
import { COIN_CONFIGS } from '../data/coins';
import { UI_TEXT } from '../data/translations';
import { Download, Filter, Database, CheckCircle, Search, ExternalLink } from 'lucide-react';

interface LedgerSectionProps {
  claims: ClaimRecord[];
  currentUser: UserProfile | null;
  onNavigateFaucet: () => void;
}

export const LedgerSection: React.FC<LedgerSectionProps> = ({
  claims,
  currentUser,
  onNavigateFaucet,
}) => {
  const t = UI_TEXT;
  const [selectedCoin, setSelectedCoin] = useState<CoinType | 'ALL'>('ALL');
  const [viewScope, setViewScope] = useState<'mine' | 'all'>('mine');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    if (viewScope === 'mine' && currentUser && claim.user_id !== currentUser.id) {
      return false;
    }
    if (selectedCoin !== 'ALL' && claim.coin !== selectedCoin) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCoin = claim.coin.toLowerCase().includes(q);
      const matchTx = claim.tx_hash?.toLowerCase().includes(q) || false;
      const matchUser = claim.username?.toLowerCase().includes(q) || false;
      return matchCoin || matchTx || matchUser;
    }
    return true;
  });

  // Export CSV
  const exportToCsv = () => {
    if (filteredClaims.length === 0) return;
    const headers = ['Claim_ID', 'User_ID', 'Username', 'Coin', 'Amount', 'Claimed_At', 'Tx_Hash'];
    const rows = filteredClaims.map((c) => [
      c.id,
      c.user_id,
      c.username || 'Anonymous',
      c.coin,
      c.amount,
      c.claimed_at,
      c.tx_hash || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `faucetflow_claims_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>{t.tab_ledger} (public.claims)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auditable, immutable ledger recording every reward generated via{' '}
            <code className="text-emerald-300 font-mono">claim_reward()</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportToCsv}
            disabled={filteredClaims.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.export_csv}</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Scope Tabs + Coin Filter + Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Scope tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setViewScope('mine')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              viewScope === 'mine'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Claims ({claims.filter((c) => c.user_id === currentUser?.id).length})
          </button>
          <button
            onClick={() => setViewScope('all')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              viewScope === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All System Claims ({claims.length})
          </button>
        </div>

        {/* Coin pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="text-slate-500 text-xs mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Coin:
          </span>
          {(['ALL', 'BTC', 'LTC', 'DOGE', 'USDT'] as const).map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
                selectedCoin === coin
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-transparent'
              }`}
            >
              {coin}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tx / user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Database className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No claims found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {viewScope === 'mine'
                ? "You haven't claimed any faucet rewards with this account yet. Hit the faucet to earn your first crypto payout!"
                : 'No claims match your selected filters.'}
            </p>
            {viewScope === 'mine' && (
              <button
                onClick={onNavigateFaucet}
                className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Go to Faucet & Claim
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Est. USD</th>
                  <th className="py-3 px-4">Tx Hash</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredClaims.map((claim) => {
                  const cfg = COIN_CONFIGS[claim.coin];
                  const usdVal = claim.amount * cfg.usdPrice;
                  const dateStr = new Date(claim.claimed_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const isCurrent = currentUser?.id === claim.user_id;

                  return (
                    <tr
                      key={claim.id}
                      className="hover:bg-slate-800/40 transition-colors font-normal"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            isCurrent ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {claim.username || 'User'}
                        </span>
                        {isCurrent && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="font-mono font-semibold px-2 py-0.5 rounded text-[11px]"
                          style={{
                            backgroundColor: cfg.accentBg,
                            color: cfg.color,
                          }}
                        >
                          {claim.coin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                        +{claim.amount.toFixed(cfg.decimals)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        ${usdVal.toFixed(6)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1 hover:text-slate-200 cursor-pointer">
                          {claim.tx_hash}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Settled</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
