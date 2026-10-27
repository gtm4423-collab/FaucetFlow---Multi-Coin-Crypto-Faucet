import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CoinType, OfferwallTask, UserProfile } from '../types';
import { COIN_CONFIGS, OFFERWALL_TASKS, FLEX_MEDIA_OFFER_URL } from '../data/coins';
import { faucetDb } from '../lib/faucetStore';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ExternalLink,
  Award,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Filter,
  Flame,
  ShieldCheck,
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<{
    taskTitle: string;
    amount: number;
    coin: CoinType;
  } | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // All tasks in Flex Media
  const allFlexTasks = OFFERWALL_TASKS.filter((t) => t.offerwall === 'flexmedia');

  const filteredTasks = allFlexTasks.filter((task) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'sponsor') return task.category === 'Sponsor Offer';
    if (categoryFilter === 'survey') return task.category === 'Survey';
    if (categoryFilter === 'apps') return task.category === 'App Install' || task.category === 'Game Quest';
    if (categoryFilter === 'micro') return task.category === 'Micro Task';
    return true;
  });

  const handleStartTask = async (task: OfferwallTask) => {
    if (!currentUser) {
      onOpenSignIn();
      return;
    }

    if (faucetDb.isTaskCompleted(task.id)) {
      setErrorNotice('You have already completed this offer.');
      return;
    }

    setErrorNotice(null);
    setSuccessNotice(null);
    setLoadingTaskId(task.id);

    // Always launch the Flex Media offer URL in a new tab
    const targetUrl = task.linkUrl || FLEX_MEDIA_OFFER_URL;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

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
      setErrorNotice(err instanceof Error ? err.message : 'Offer verification failed');
    } finally {
      setLoadingTaskId(null);
    }
  };

  const primaryTask = allFlexTasks.find((t) => t.id === 'bestplay-offer') || allFlexTasks[0];

  return (
    <div className="space-y-6">
      {/* Header Hero Banner for Flex Media */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flex Media Official Offerwall</span>
            <span aria-hidden="true">·</span>
            <span>Instant Crypto Payouts</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flex Media <span className="text-emerald-400">Offerwall</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Complete high-paying verified partner tasks, surveys, app installations, and promotional campaigns from Flex Media. Earn BTC, LTC, DOGE, and USDT credited instantly to your account wallet.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={FLEX_MEDIA_OFFER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Launch Flex Media Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-1.5 text-slate-300 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earn up to $0.50+ per offer</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero Waiting Delay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Top Flex Media Campaign Card */}
      {primaryTask && (
        <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-5 shadow-lg shadow-emerald-950/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  <Flame className="w-3 h-3" /> Featured Top Offer
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  Flex Media Partner
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">{primaryTask.title}</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {primaryTask.description}
              </p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="flex flex-col text-left md:text-right">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {primaryTask.points ? `${primaryTask.points.toLocaleString()} Points · High Payout` : 'Instant Payout'}
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  +{primaryTask.rewardAmount} {primaryTask.rewardCoin}
                </span>
                {primaryTask.points && (
                  <span className="text-[11px] text-amber-300 font-mono font-semibold">
                    ~${(primaryTask.rewardAmount * COIN_CONFIGS[primaryTask.rewardCoin].usdPrice).toFixed(2)} USD Value
                  </span>
                )}
              </div>

              <button
                onClick={() => handleStartTask(primaryTask)}
                disabled={loadingTaskId === primaryTask.id || faucetDb.isTaskCompleted(primaryTask.id)}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingTaskId === primaryTask.id ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : faucetDb.isTaskCompleted(primaryTask.id) ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <span>Start Featured Offer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'sponsor', label: 'Sponsor Offers' },
            { id: 'survey', label: 'Surveys' },
            { id: 'apps', label: 'Apps & Games' },
            { id: 'micro', label: 'Micro Tasks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 px-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Showing <strong>{filteredTasks.length}</strong> Flex Media offers
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-200 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Offer <strong>"{successNotice.taskTitle}"</strong> verified! Credited{' '}
              <strong className="text-white font-mono">
                +{successNotice.amount} {successNotice.coin}
              </strong>{' '}
              to your wallet.
            </span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs font-semibold cursor-pointer"
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

      {/* Flex Media Tasks Grid */}
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
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/40 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                      {task.category}
                    </span>
                    <span className="text-[11px] text-emerald-400/90 font-mono">
                      {task.partnerName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      task.difficulty === 'Instant'
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 font-bold'
                        : task.difficulty === 'Easy'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
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
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +{task.rewardAmount} {task.rewardCoin}
                    </span>
                    {task.points ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                        {task.points.toLocaleString()} pts (~${estUsd.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        (~${estUsd.toFixed(4)})
                      </span>
                    )}
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

      {/* Flex Media Integration & Postback Info Card */}
      <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Flex Media Gateway &amp; Postback</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Flex Media Active</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          Offers are powered by <strong className="text-white">Flex Media</strong>. Users can engage directly via{' '}
          <a
            href={FLEX_MEDIA_OFFER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline font-mono hover:text-emerald-300"
          >
            flexmediax.link/go/MTUyfDM1OTkx
          </a>{' '}
          and receive automated multi-coin wallet payouts.
        </p>
      </div>
    </div>
  );
};
