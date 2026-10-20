'use client';

import React, { useState } from 'react';
import { AppProfile } from '@/types';
import { Sparkles, Plus, Settings, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  apps: AppProfile[];
  activeApp: AppProfile | null;
  onSelectApp: (appId: string) => void;
  onOpenNewAppModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apps,
  activeApp,
  onSelectApp,
  onOpenNewAppModal,
  onOpenSettingsModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">MarketAgent</span>
            <span className="text-xs text-slate-500 block hidden sm:block">AI Marketing for Your Business</span>
          </div>
        </div>

        {/* Desktop: Business Selector & Settings */}
        <div className="hidden md:flex items-center gap-3">
          {apps.length > 0 ? (
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 pl-2 hidden sm:inline">Active:</span>
              <div className="relative flex items-center">
                <select
                  value={activeApp?.id || ''}
                  onChange={(e) => onSelectApp(e.target.value)}
                  aria-label="Select active business"
                  className="bg-white text-slate-900 text-sm font-bold pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer appearance-none shadow-2xs"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={onOpenNewAppModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Add another business"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenNewAppModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile: Hamburger */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in">
          {/* App selector if apps exist */}
          {apps.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 shrink-0">Business:</span>
              <div className="relative flex-1">
                <select
                  value={activeApp?.id || ''}
                  onChange={(e) => {
                    onSelectApp(e.target.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-slate-900 text-sm font-bold pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none appearance-none"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenNewAppModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Business
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenSettingsModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
