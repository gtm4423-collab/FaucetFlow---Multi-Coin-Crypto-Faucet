import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CoinType, OfferwallTask, UserProfile } from '../types';
import { COIN_CONFIGS, OFFERWALL_TASKS, SPONSOR_LINKS } from '../data/coins';
import { faucetDb } from '../lib/faucetStore';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ExternalLink,
  Smartphone,
  Layers,
  Award,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface OfferwallsSectionProps {
  currentUser: UserProfile | null;
  onRewardClaimed: () => void;
  onOpenSignIn: () => void;
}

export const OfferwallsSection: React.FC<OfferwallsSectionProps> = ({
  currentUser,
  onRewardClaimed,
  onOpenSignIn,
}) => {
  const [activeWall, setActiveWall] = useState<'timewall' | 'monlix'>('timewall');
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<{
    taskTitle: string;
    amount: number;
    coin: CoinType;
  } | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const filteredTasks = OFFERWALL_TASKS.filter((t) => t.offerwall === activeWall);

  const handleStartTask = async (task: OfferwallTask) => {
    if (!currentUser) {
      onOpenSignIn();
      return;
    }

    if (faucetDb.isTaskCompleted(task.id)) {
      setErrorNotice('You have already completed this task.');
      return;
    }

    setErrorNotice(null);
    setSuccessNotice(null);
    setLoadingTaskId(task.id);

    if (task.id === 'sponsor-direct-1') {
      window.open(SPONSOR_LINKS.smartlink2, '_blank', 'noopener,noreferrer');
    } else if (task.id === 'sponsor-direct-2') {
      window.open(SPONSOR_LINKS.primary, '_blank', 'noopener,noreferrer');
    } else if (task.id.startsWith('sponsor-direct')) {
      window.open(SPONSOR_LINKS.smartlink3, '_blank', 'noopener,noreferrer');
    }

    try {
      const result = await faucetDb.completeOfferwallTask(task.id);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
      });

      setSuccessNotice({
        taskTitle: task.title,
        amount: result.creditedAmount,
        coin: result.coin,
      });

      onRewardClaimed();
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Task verification failed');
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Yield Offerwall Tasks</span>
            <span aria-hidden="true">·</span>
            <span>Instant Wallet Credit</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Earn Crypto via <span className="text-emerald-400">Offerwalls</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Complete quick surveys, test mobile games, and engage with verified sponsors to earn high micro-rewards credited directly to your BTC, LTC, DOGE, or USDT balance.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Earn up to $0.50+ per offer</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-200">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero Waiting: Instant Crediting</span>
            </span>
          </div>
        </div>
      </div>

      {/* Offerwall Switcher Bar (2 Offerwalls: Timewall & Monlix) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          {/* Offerwall 1: Timewall */}
          <button
            onClick={() => {
              setActiveWall('timewall');
              setErrorNotice(null);
            }}
            className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeWall === 'timewall'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-tight">Timewall</div>
              <div className={`text-[10px] font-normal ${activeWall === 'timewall' ? 'text-slate-900/80' : 'text-slate-500'}`}>
                Surveys & Clicks
              </div>
            </div>
          </button>

          {/* Offerwall 2: Monlix */}
          <button
            onClick={() => {
              setActiveWall('monlix');
              setErrorNotice(null);
            }}
            className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeWall === 'monlix'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-tight">Monlix</div>
              <div className={`text-[10px] font-normal ${activeWall === 'monlix' ? 'text-slate-900/80' : 'text-slate-500'}`}>
                Apps & Game Quests
              </div>
            </div>
          </button>
        </div>

        {/* Info Indicator */}
        <div className="text-xs text-slate-400 px-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>
            Showing verified <strong>{activeWall === 'timewall' ? 'Timewall' : 'Monlix'}</strong> sponsored tasks
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-200 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Task <strong>"{successNotice.taskTitle}"</strong> verified! Credited{' '}
              <strong className="text-white font-mono">
                +{successNotice.amount} {successNotice.coin}
              </strong>{' '}
              to your wallet.
            </span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const cfg = COIN_CONFIGS[task.rewardCoin];
          const estUsd = task.rewardAmount * cfg.usdPrice;
          const isCompleted = faucetDb.isTaskCompleted(task.id);
          const isLoading = loadingTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between gap-4 ${
                isCompleted
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                      {task.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {task.partnerName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      task.difficulty === 'Easy'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : task.difficulty === 'Medium'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                    }`}
                  >
                    {task.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    Task Reward
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +{task.rewardAmount} {task.rewardCoin}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (~${estUsd.toFixed(4)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>~{task.estMinutes}m</span>
                  </span>

                  {isCompleted ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed border border-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Completed</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Zap className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Start Offer</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Info Card for Webmasters */}
      <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Offerwall Postback & Webmaster Integration</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Timewall & Monlix Ready</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          To connect your live publisher account from Timewall.io or Monlix.com, configure your postback URL in your offerwall publisher panel to credit your Supabase <code className="text-emerald-300 font-mono">public.balances</code> table upon user task completions.
        </p>
      </div>
    </div>
  );
};
