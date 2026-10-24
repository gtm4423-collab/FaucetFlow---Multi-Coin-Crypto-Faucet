import { useState } from 'react';
import { RAW_SQL_SCHEMA } from '../data/coins';
import { UI_TEXT } from '../data/translations';
import { Copy, Check, FileCode, Server, Shield, Database, Terminal, BookOpen } from 'lucide-react';

interface SqlSchemaSectionProps {
  onOpenSupabaseConnect?: () => void;
}

export const SqlSchemaSection: React.FC<SqlSchemaSectionProps> = ({ onOpenSupabaseConnect }) => {
  const t = UI_TEXT;
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'raw_sql' | 'guide'>('architecture');

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <span>{t.sql_overview_title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">{t.sql_overview_desc}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Full SQL Script'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'architecture' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Schema & Security Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'guide' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Supabase Setup Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('raw_sql')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'raw_sql' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>faucetflow_supabase_all.sql</span>
        </button>
      </div>

      {/* View 1: Architecture breakdown */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Core Tables */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>1. Core Database Tables</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-emerald-400 font-semibold">public.profiles</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Stores username and links to Supabase auth user (<code>references auth.users(id)</code>).
                  </div>
                </li>
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-cyan-400 font-semibold">public.balances</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Multi-coin balance per user (<code>BTC</code>, <code>LTC</code>, <code>DOGE</code>, <code>USDT</code>) with <code>numeric(28,12)</code> precision.
                  </div>
                </li>
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-amber-400 font-semibold">public.claims</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Append-only ledger logging every single reward claim with exact timestamp.
                  </div>
                </li>
              </ul>
            </div>

            {/* Box 2: Security & Definer RPCs */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>2. Security Definer RPCs & Anti-Abuse</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-purple-400 font-semibold">public.claim_reward(p_coin)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Enforces 60-second cooldown per coin. Serializes execution with{' '}
                    <code className="text-purple-300">pg_advisory_xact_lock()</code> to prevent double claims.
                  </div>
                </li>
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-emerald-400 font-semibold">Zero Client Mutations (RLS)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    No client insert/update/delete policies are granted on <code>balances</code> or <code>claims</code>.
                    Only the server-side RPC function can modify funds.
                  </div>
                </li>
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-amber-400 font-semibold">public.handle_new_user() Trigger</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Automatically initializes zeroed balances for BTC, LTC, DOGE, and USDT upon sign-up.
                  </div>
                </li>
              </ul>
            </div>

            {/* Box 3: Admin Role & RBAC */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Server className="w-4 h-4 text-rose-400" />
                <span>3. Admin Controls & Activity Auditing</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-rose-400 font-semibold">public.admin_roles & is_admin()</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Restricts elevated endpoints to authorized admins. Replaces owner-only policies with owner OR admin.
                  </div>
                </li>
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-cyan-400 font-semibold">admin_list_users()</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Safely joins <code>auth.users</code> with profiles after checking caller's admin privileges.
                  </div>
                </li>
                <li className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <div className="font-mono text-emerald-400 font-semibold">admin_activity_logs</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Audit trail logging admin operations with structured JSON payloads.
                  </div>
                </li>
              </ul>
            </div>

            {/* Box 4: Explanatory Summary */}
            <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <span>What is this Platform & How Does it Work?</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>
                  This application is a production-grade <strong>Multi-Coin Crypto Faucet & Security Hub</strong> grounded in your Supabase PostgreSQL schema.
                </p>
                <p>
                  <strong>1. User Experience:</strong> Authenticated users select from <strong>BTC, LTC, DOGE, or USDT</strong> and claim automated micro-rewards every 60 seconds.
                </p>
                <p>
                  <strong>2. Concurrency & Security:</strong> Front-end balance manipulation is prevented by PostgreSQL Row Level Security (RLS). Claims are serialized through <code>pg_advisory_xact_lock()</code> to stop double-claim race conditions.
                </p>
                <p>
                  <strong>3. Admin Control:</strong> Role-based access (<code>is_admin()</code>) allows platform owners to view all user balances, audit claims in real-time, refill hot wallet reserves, and review activity logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Supabase Setup Guide */}
      {activeTab === 'guide' && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
          <h3 className="font-bold text-white text-base">How to deploy this schema to Supabase in 3 steps:</h3>

          <ol className="space-y-4 text-xs text-slate-300 list-decimal list-inside">
            <li className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white">Step 1: Execute SQL in Supabase SQL Editor</span>
              <p className="text-slate-400 leading-relaxed">
                Log in to your <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Supabase Dashboard</a>, select your project, go to the <strong>SQL Editor</strong> tab on the left sidebar, click <strong>"New Query"</strong>, paste the full SQL schema, and click <strong>"Run"</strong>.
              </p>
            </li>

            <li className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white">Step 2: Assign Yourself as an Admin</span>
              <p className="text-slate-400 leading-relaxed">
                Go to <strong>Authentication &gt; Users</strong> in Supabase, copy your User UUID, and execute this query:
              </p>
              <div className="bg-slate-900 p-2.5 rounded font-mono text-emerald-300 border border-slate-800">
                insert into public.admin_roles (user_id) values ('your-supabase-user-uuid-here');
              </div>
            </li>

            <li className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white">Step 3: Connect Frontend</span>
              <p className="text-slate-400 leading-relaxed">
                In Supabase, find your Project URL and Anon Key under <strong>Project Settings &gt; API</strong>. Set them in your environment variables:
              </p>
              <div className="bg-slate-900 p-2.5 rounded font-mono text-slate-300 border border-slate-800 space-y-1">
                <div>VITE_SUPABASE_URL="https://xyzcompany.supabase.co"</div>
                <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."</div>
              </div>
              {onOpenSupabaseConnect && (
                <div className="pt-1">
                  <button
                    onClick={onOpenSupabaseConnect}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Open Supabase Connection Manager</span>
                  </button>
                </div>
              )}
            </li>
          </ol>
        </div>
      )}

      {/* View 3: Raw SQL Code */}
      {activeTab === 'raw_sql' && (
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
            <span className="font-mono text-slate-400">faucetflow_supabase_all_58fd9fca.sql</span>
            <button
              onClick={handleCopy}
              className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-[500px]">
            {RAW_SQL_SCHEMA}
          </pre>
        </div>
      )}
    </div>
  );
};
