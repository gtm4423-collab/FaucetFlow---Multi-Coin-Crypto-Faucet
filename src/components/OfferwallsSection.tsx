import React, { useState, useEffect } from 'react';
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
  Hourglass,
  RotateCcw,
} from 'lucide-react';

interface OfferwallsSectionProps {
  currentUser: UserProfile | null;
  onRewardClaimed: () => void;
  onOpenSignIn: () => void;
}

interface InProgressInfo {
  startedAt: number;
  minWaitSeconds: number;
}

const STORAGE_KEY_IN_PROGRESS = 'faucetflow_in_progress_tasks_v2';

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
  const [activeInfoNotice, setActiveInfoNotice] = useState<string | null>(null);

  // In-progress tracking: taskId -> InProgressInfo
  const [inProgressTasks, setInProgressTasks] = useState<Record<string, InProgressInfo>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_IN_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Current timestamp tick for live countdowns
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync in-progress tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IN_PROGRESS, JSON.stringify(inProgressTasks));
    } catch {}
  }, [inProgressTasks]);

  // All tasks in Flex Media
  const allFlexTasks = OFFERWALL_TASKS.filter((t) => t.offerwall === 'flexmedia');

  const filteredTasks = allFlexTasks.filter((task) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'canada') return !!task.geoTarget;
    if (categoryFilter === 'sponsor') return task.category === 'Sponsor Offer';
    if (categoryFilter === 'survey') return task.category === 'Survey';
    if (categoryFilter === 'apps') return task.category === 'App Install' || task.category === 'Game Quest';
    if (categoryFilter === 'micro') return task.category === 'Micro Task';
    return true;
  });

  /**
   * STEP 1: Launch the offer in a new tab & put it In-Progress.
   * Does NOT mark as completed yet!
   */
  const handleStartOffer = (task: OfferwallTask) => {
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

    // Open offer link in a new window/tab
    const targetUrl = task.linkUrl || FLEX_MEDIA_OFFER_URL;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Put into in-progress state with a 15-second minimum engagement cooldown
    setInProgressTasks((prev) => ({
      ...prev,
      [task.id]: {
        startedAt: Date.now(),
        minWaitSeconds: 15,
      },
    }));

    setActiveInfoNotice(
      `Offer opened in a new tab! Complete the requirements on the destination page, then click "Verify & Claim Reward" to receive your ${task.rewardCoin}.`
    );
  };

  /**
   * STEP 2: Verify completion after user finished the steps in the opened window.
   * Marks as completed and credits user balance!
   */
  const handleVerifyOffer = async (task: OfferwallTask) => {
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
    setActiveInfoNotice(null);
    setLoadingTaskId(task.id);

    try {
      const result = await faucetDb.completeOfferwallTask(task.id);

      // Remove from in-progress
      setInProgressTasks((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 65,
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

  /**
   * Cancel an in-progress offer if user wants to reset back to Start
   */
  const handleCancelInProgress = (taskId: string) => {
    setInProgressTasks((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setActiveInfoNotice(null);
  };

  /**
   * Helper to determine task state
   */
  const getTaskStatus = (task: OfferwallTask) => {
    if (faucetDb.isTaskCompleted(task.id)) {
      return { status: 'completed' as const, remainingSeconds: 0 };
    }
    const inProgress = inProgressTasks[task.id];
    if (inProgress) {
      const elapsedSec = Math.floor((now - inProgress.startedAt) / 1000);
      const remaining = Math.max(0, inProgress.minWaitSeconds - elapsedSec);
      if (remaining > 0) {
        return { status: 'in_progress_cooldown' as const, remainingSeconds: remaining };
      }
      return { status: 'ready_to_verify' as const, remainingSeconds: 0 };
    }
    return { status: 'not_started' as const, remainingSeconds: 0 };
  };

  const primaryTask = allFlexTasks.find((t) => t.id === 'bestplay-3apps-offer') || allFlexTasks[0];

  return (
    <div className="space-y-6">
      {/* Header Hero Banner for Flex Media */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flex Media Official Offerwall</span>
            <span aria-hidden="true">·</span>
            <span>Verified Payouts</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flex Media <span className="text-emerald-400">Offerwall</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Complete high-paying verified partner tasks, surveys, app installations, and promotional campaigns from Flex Media. Earn BTC, LTC, DOGE, and USDT credited to your wallet once verified.
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
              <span>Earn up to $4.80+ per offer</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fair-Use Verification Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Top Flex Media Campaign Card */}
      {primaryTask && (() => {
        const primaryStatus = getTaskStatus(primaryTask);
        const isLoading = loadingTaskId === primaryTask.id;

        return (
          <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-5 shadow-lg shadow-emerald-950/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    <Flame className="w-3 h-3" /> Featured Top Offer
                  </span>
                  {primaryTask.geoTarget && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {primaryTask.geoTarget}
                    </span>
                  )}
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

                <div className="flex items-center gap-2">
                  {primaryStatus.status === 'completed' ? (
                    <button
                      disabled
                      className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed</span>
                    </button>
                  ) : primaryStatus.status === 'in_progress_cooldown' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 cursor-wait"
                      >
                        <Hourglass className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Wait {primaryStatus.remainingSeconds}s to Verify</span>
                      </button>
                      <button
                        onClick={() => handleCancelInProgress(primaryTask.id)}
                        title="Cancel / Reset"
                        className="p-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : primaryStatus.status === 'ready_to_verify' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleVerifyOffer(primaryTask)}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/30 flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        {isLoading ? (
                          <>
                            <Zap className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify &amp; Claim Reward</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelInProgress(primaryTask.id)}
                        title="Cancel / Reset"
                        className="p-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartOffer(primaryTask)}
                      className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Featured Offer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'canada', label: '🇨🇦 Canada Only' },
            { id: 'apps', label: 'Apps & Games' },
            { id: 'sponsor', label: 'Sponsor Offers' },
            { id: 'survey', label: 'Surveys' },
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

      {/* Active Info Alert for in-progress tasks */}
      {activeInfoNotice && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-200 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{activeInfoNotice}</span>
          </div>
          <button
            onClick={() => setActiveInfoNotice(null)}
            className="text-amber-400 hover:text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification */}
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
            className="text-emerald-400 hover:text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
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
          const statusInfo = getTaskStatus(task);
          const isCompleted = statusInfo.status === 'completed';
          const isInProgressCooldown = statusInfo.status === 'in_progress_cooldown';
          const isReadyToVerify = statusInfo.status === 'ready_to_verify';
          const isLoading = loadingTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between gap-4 ${
                isCompleted
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                  : isReadyToVerify
                  ? 'bg-slate-900/90 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                  : isInProgressCooldown
                  ? 'bg-slate-900/80 border-amber-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/40 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                      {task.category}
                    </span>
                    {task.geoTarget && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {task.geoTarget}
                      </span>
                    )}
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
                  ) : isInProgressCooldown ? (
                    <div className="flex items-center gap-1">
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-wait"
                      >
                        <Hourglass className="w-3 h-3 animate-spin text-amber-400" />
                        <span>Wait {statusInfo.remainingSeconds}s</span>
                      </button>
                      <button
                        onClick={() => handleCancelInProgress(task.id)}
                        title="Cancel / Reset"
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  ) : isReadyToVerify ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleVerifyOffer(task)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        {isLoading ? (
                          <>
                            <Zap className="w-3 h-3 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify &amp; Claim</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelInProgress(task.id)}
                        title="Cancel / Reset"
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartOffer(task)}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Offer</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
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
          Offers are powered by <strong className="text-white">Flex Media</strong>. When you click <strong className="text-white">Start Offer</strong>, the campaign opens in a new tab. After completing the actions (downloading the app or completing surveys), return and click <strong className="text-emerald-400">Verify &amp; Claim</strong> to confirm and receive your multi-coin wallet payouts.
        </p>
      </div>
    </div>
  );
};
