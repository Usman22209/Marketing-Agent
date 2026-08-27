'use client';

import React, { useState } from 'react';
import { UserSettings } from '@/types';
import { X, Key, Database, Workflow, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onResetData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(settings.n8nWebhookUrl || '');
  const [userEmail, setUserEmail] = useState(settings.userEmail || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: geminiApiKey.trim(),
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      n8nWebhookUrl: n8nWebhookUrl.trim(),
      userEmail: userEmail.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">API Keys & Integrations</h2>
              <p className="text-xs text-slate-400 font-medium">Configure free AI keys, Supabase DB, and n8n webhook automation.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Gemini Free API Key */}
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
              Used for live AI marketing strategy and post generation.
            </p>
          </div>

          {/* n8n Webhook & Gmail */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20">
            <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-2">
              <Workflow className="w-4 h-4 text-purple-400" />
              n8n Webhook URL (For 2-Day Scheduled Triggers)
            </label>
            <input
              type="url"
              value={n8nWebhookUrl}
              onChange={(e) => setN8nWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-instance.cloud/webhook/trigger-marketing-post"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 mb-2.5 font-mono"
            />

            <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1.5">
              <Mail className="w-4 h-4 text-purple-400" />
              Your Gmail Address (For Post Notifications)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Supabase Free Database (Optional) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Supabase URL & Anon Key (Optional)
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
          </div>

          {/* Reset All Data Section */}
          {onResetData && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all stored products and campaigns to start completely fresh?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline"
              >
                🗑️ Clear All Stored Data (Start Fresh)
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

