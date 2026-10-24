import React, { useState, useEffect } from 'react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabaseClient';
import { RAW_SQL_SCHEMA } from '../data/coins';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Trash2,
} from 'lucide-react';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [config, setConfig] = useState(getSupabaseConfig());

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setConfig(current);
      setUrl(current.url);
      setAnonKey(current.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      saveSupabaseConfig(url, anonKey);
      setConfig(getSupabaseConfig());
      onConnectionChange();
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setConfig(getSupabaseConfig());
    setTestResult({
      success: true,
      message: 'Switched back to local storage simulator mode.',
    });
    onConnectionChange();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(RAW_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Connect to Supabase</span>
              {config.isConfigured ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  LIVE CONNECTED
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  SIMULATED MODE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Link your live Supabase project to execute your PostgreSQL schema and RPCs.
            </p>
          </div>
        </div>

        {/* Step-by-step guidance box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">How to Connect in 3 Simple Steps:</span>
            <button
              onClick={handleCopySql}
              className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <ol className="space-y-1.5 text-slate-400 list-decimal list-inside text-[11px]">
            <li>
              Log in to{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-2.5 h-2.5" />
              </a>{' '}
              and create or open a project.
            </li>
            <li>
              Open <strong>SQL Editor</strong>, paste your <code className="text-emerald-300">faucetflow_supabase_all.sql</code>, and click <strong>Run</strong>.
            </li>
            <li>
              Go to <strong>Project Settings &gt; API</strong>, copy the <strong>Project URL</strong> and <strong>anon public key</strong>, and paste them below.
            </li>
          </ol>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div
            className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs ${
              testResult.success
                ? 'border border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
                : 'border border-rose-500/30 bg-rose-950/40 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Supabase Anon Public API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {config.isConfigured ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-800/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect Live Supabase</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-500">
                Leave empty to keep using instant local simulator.
              </div>
            )}

            <button
              type="submit"
              disabled={isTesting || !url || !anonKey}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Verifying Tables...' : 'Test & Save Connection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
