import React, { useState } from 'react';
import { CoinType, UserProfile } from '../types';
import { COIN_CONFIGS } from '../data/coins';
import { faucetDb } from '../lib/faucetStore';
import { UI_TEXT } from '../data/translations';
import { ArrowUpRight, CheckCircle, AlertCircle, Wallet, Zap, ShieldCheck } from 'lucide-react';

interface WithdrawSectionProps {
  currentUser: UserProfile | null;
  balances: Record<CoinType, number>;
  onWithdrawSuccess: () => void;
}

export const WithdrawSection: React.FC<WithdrawSectionProps> = ({
  currentUser,
  balances,
  onWithdrawSuccess,
}) => {
  const t = UI_TEXT;
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('BTC');
  const [payoutMethod, setPayoutMethod] = useState<'faucetpay' | 'direct'>('faucetpay');
  const [targetAddress, setTargetAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string; tx?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cfg = COIN_CONFIGS[selectedCoin];
  const userBalance = balances[selectedCoin] || 0;
  const numAmount = parseFloat(withdrawAmount) || 0;
  const currentFee = payoutMethod === 'faucetpay' ? 0 : cfg.networkFee;
  const netReceived = Math.max(0, Number((numAmount - currentFee).toFixed(cfg.decimals)));

  const handleMaxClick = () => {
    setWithdrawAmount(userBalance.toString());
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setStatusMessage(null);

    if (!targetAddress.trim()) {
      setStatusMessage({
        type: 'error',
        text: payoutMethod === 'faucetpay' ? 'Please enter your FaucetPay linked email.' : 'Please enter your wallet address.',
      });
      return;
    }

    if (numAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }

    if (numAmount > userBalance) {
      setStatusMessage({
        type: 'error',
        text: `Insufficient ${selectedCoin} balance. You have ${userBalance} ${selectedCoin}.`,
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));

    try {
      const result = faucetDb.withdraw(selectedCoin, targetAddress, numAmount, payoutMethod);
      setStatusMessage({
        type: 'success',
        text: `Withdrawal initiated! ${result.netAmount} ${selectedCoin} will be dispatched.`,
        tx: result.txId,
      });
      setWithdrawAmount('');
      onWithdrawSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          <span>{t.withdraw_title}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulate withdrawing accumulated faucet rewards from{' '}
          <code className="text-emerald-300 font-mono">public.balances</code> to external wallets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleWithdraw} className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
            {/* Coin selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Select Currency Asset</label>
              <div className="grid grid-cols-4 gap-2">
                {(['BTC', 'LTC', 'DOGE', 'USDT'] as const).map((coin) => {
                  const coinConf = COIN_CONFIGS[coin];
                  const isSel = selectedCoin === coin;
                  return (
                    <button
                      type="button"
                      key={coin}
                      onClick={() => {
                        setSelectedCoin(coin);
                        setStatusMessage(null);
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        isSel
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">{coinConf.iconSymbol}</span>
                      <span>{coin}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payout method */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Payout Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('faucetpay')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    payoutMethod === 'faucetpay'
                      ? 'border-emerald-500 bg-emerald-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> FaucetPay
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">0% Fee</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Instant micro-payout via email.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('direct')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    payoutMethod === 'direct'
                      ? 'border-emerald-500 bg-emerald-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Direct Wallet
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Standard Fee</span>
                  </div>
                  <p className="text-[11px] text-slate-400">On-chain transfer to public address.</p>
                </button>
              </div>
            </div>

            {/* Target Address / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {payoutMethod === 'faucetpay' ? 'FaucetPay Linked Email Address' : `Your ${selectedCoin} Wallet Address`}
              </label>
              <input
                type={payoutMethod === 'faucetpay' ? 'email' : 'text'}
                placeholder={payoutMethod === 'faucetpay' ? 'e.g. user@faucetpay.io' : `Enter valid ${selectedCoin} address`}
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">Amount to Withdraw</label>
                <div className="text-slate-400">
                  Available:{' '}
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {userBalance.toFixed(cfg.decimals)} {selectedCoin}
                  </span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono tabular-nums pr-16"
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Net summary breakdown */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>{t.min_amount}:</span>
                <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                  $0.20 USD ({cfg.minWithdraw} {selectedCoin})
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t.network_fee}:</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  {currentFee} {selectedCoin}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-semibold text-white">
                <span>Net You Receive:</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  {netReceived.toFixed(cfg.decimals)} {selectedCoin}
                </span>
              </div>
            </div>

            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`flex items-start gap-2.5 p-3 rounded-lg text-xs ${
                  statusMessage.type === 'error'
                    ? 'border border-rose-500/30 bg-rose-950/30 text-rose-200'
                    : 'border border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
                }`}
              >
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{statusMessage.text}</p>
                  {statusMessage.tx && (
                    <p className="font-mono text-[10px] text-slate-400 mt-1">Tx: {statusMessage.tx}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || userBalance === 0}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Payout...' : 'Confirm Withdrawal Request'}</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Production Security Policy Notes */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Balance Security</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All balance modifications are strictly authenticated and verified against an immutable transaction ledger.
            </p>
            <div className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded border border-slate-800">
              Verified multi-coin payout threshold: $0.20 USD minimum
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This ensures malicious tampering is prevented. Withdrawals trigger automated ledger verification before dispatching payments to FaucetPay or direct on-chain addresses.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-950/40 space-y-2 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-300">Supported Payout Channels</h4>
            <ul className="space-y-1 text-[11px] list-disc list-inside">
              <li>FaucetPay instant API (recommended for micro-claims)</li>
              <li>Direct On-chain UTXO / EVM Transfer</li>
              <li>Batch consolidation payouts (scheduled daily)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
