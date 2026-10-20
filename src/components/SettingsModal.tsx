'use client';

import React, { useState } from 'react';
import { UserSettings } from '@/types';
import { X, Key, Database, Clock, Mail, CheckCircle2, ShieldCheck, Trash2, Copy, Check } from 'lucide-react';
import { syncLocalDataToSupabase, clearAllStoredData } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onResetData?: () => void;
  onResetAllData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  onResetAllData,
}) => {
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [userEmail, setUserEmail] = useState(settings.userEmail || '');
  const [cronSecret, setCronSecret] = useState(settings.cronSecret || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Pushing products & posts...');
    try {
      const res = await syncLocalDataToSupabase();
      if (res.success) {
        setSyncStatus(`✅ Synced ${res.syncedPosts} posts across ${res.syncedCampaigns} campaigns!`);
      } else {
        setSyncStatus(`⚠️ Sync failed: ${res.error || 'Check credentials'}`);
      }
    } catch (err: any) {
      setSyncStatus(`❌ Sync error: ${err?.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Clear all stored products, campaigns, and posts to start completely fresh?')) {
      if (onResetData) {
        onResetData();
      } else if (onResetAllData) {
        onResetAllData();
      } else {
        await clearAllStoredData();
        window.location.reload();
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: geminiApiKey.trim(),
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      userEmail: userEmail.trim(),
      cronSecret: cronSecret.trim(),
      cronIntervalDays: 2,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const copyCronCurl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const curlCommand = cronSecret
      ? `curl -X POST -H "Authorization: Bearer ${cronSecret}" ${origin}/api/cron`
      : `curl -X POST ${origin}/api/cron`;
    navigator.clipboard.writeText(curlCommand);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl my-auto text-slate-100 font-sans max-h-[90vh] flex flex-col overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Settings & Scheduler</h2>
              <p className="text-xs text-slate-400 font-medium">Configure AI keys, email briefings, and cron timed events.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 dark-scrollbar overscroll-contain">
            {/* 1. Gemini API Key */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Google Gemini API Key (100% Free)
                </label>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-indigo-400 hover:underline"
                >
                  Get Free Key ↗
                </a>
              </div>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                Powers autonomous copywriting and campaign generation.
              </p>
            </div>

            {/* 2. Notification Email */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-2">
                <Mail className="w-4 h-4 text-purple-400" />
                Notification Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 mb-2 font-mono"
              />
              <p className="text-[11px] text-slate-400 font-medium">
                Receives automated social post briefings when new marketing content is ready.
              </p>
            </div>

            {/* 3. Cron Job / Timed Event Server */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Timed Event Server Endpoint
                </label>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Ready
                </span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-2 mb-2">
                <code className="text-xs text-amber-200 font-mono truncate">
                  /api/cron
                </code>
                <button
                  type="button"
                  onClick={copyCronCurl}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEndpoint ? 'Copied' : 'Copy curl'}</span>
                </button>
              </div>

              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Optional CRON_SECRET (Security Token)
              </label>
              <input
                type="password"
                value={cronSecret}
                onChange={(e) => setCronSecret(e.target.value)}
                placeholder="Leave blank for public/local or enter a secret token"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                Trigger via Vercel Cron, system Task Scheduler, or GitHub Actions. Or trigger instantly with the dashboard &quot;Run Scheduler Now&quot; button.
              </p>
            </div>

            {/* 4. Supabase Database (Optional) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Supabase Database (Optional)
                </label>
                <a
                  href="https://supabase.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  Free Supabase DB ↗
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxx.supabase.co"
                  className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="Anon public key"
                  className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Sync Now Button */}
              <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-300/80 break-words flex-1 min-w-[160px]">
                  {syncStatus || 'Store and sync posts across devices'}
                </span>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleManualSync}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {isSyncing ? 'Syncing...' : '⚡ Push Data to Supabase'}
                </button>
              </div>
            </div>

            {/* 5. Reset All Data */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Clear Stored Data
                </p>
                <p className="text-[11px] text-slate-400">
                  Wipe all products and campaigns to start completely fresh.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-between gap-3 p-4 sm:px-6 border-t border-white/10 bg-slate-950/80 backdrop-blur-xs shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
