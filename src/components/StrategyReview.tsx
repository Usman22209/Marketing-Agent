'use client';

import React from 'react';
import { AppProfile, MarketingStrategyPlan } from '@/types';
import {
  Sparkles,
  Target,
  Zap,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Edit,
  Quote,
  ShieldCheck,
} from 'lucide-react';

interface StrategyReviewProps {
  app: AppProfile;
  strategy: MarketingStrategyPlan;
  onActivateCampaign: () => void;
  onEditApp: () => void;
  onRegenerateStrategy: () => void;
  isGeneratingStrategy?: boolean;
}

export const StrategyReview: React.FC<StrategyReviewProps> = ({
  app,
  strategy,
  onActivateCampaign,
  onEditApp,
  onRegenerateStrategy,
  isGeneratingStrategy = false,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in">
      {/* Top Banner: Success & Strategy Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        {/* Glow effect */}
        <div
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: app.primaryColor || '#6366f1' }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Strategy Formulated
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                AI CMO Analysis Complete
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEditApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Marketing Strategy for {app.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl leading-relaxed">
              We analyzed your product, audience, and key pain points. Here is your tailored go-to-market strategy and 14-day content roadmap.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Primary Target</span>
              <span className="font-bold text-white truncate block mt-0.5">{app.targetAudience}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Tone of Voice</span>
              <span className="font-bold text-indigo-300 capitalize block mt-0.5">{app.toneOfVoice}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Content Pillars</span>
              <span className="font-bold text-emerald-300 block mt-0.5">{strategy.pillars.length} Strategic Themes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Roadmap Posts</span>
              <span className="font-bold text-amber-300 block mt-0.5">{strategy.blueprint.length} Scheduled Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Positioning & Primary Hook Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              Brand Positioning Statement
            </div>
            <p className="text-base text-slate-800 font-semibold leading-relaxed">
              &ldquo;{strategy.brandPositioning}&rdquo;
            </p>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Positioned specifically to differentiate {app.name} from manual and bloated alternatives.</span>
          </div>
        </div>

        <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              <Quote className="w-4 h-4" />
              Viral Hook Angle
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              &ldquo;{strategy.primaryHook}&rdquo;
            </p>
          </div>
          <p className="text-xs text-purple-900/70 pt-2 border-t border-purple-200/60">
            Engineered to stop scrolling on LinkedIn and Instagram by exposing the cost of inaction.
          </p>
        </div>
      </div>

      {/* Target Personas Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Target Audience Personas & Pain Points
          </h2>
          <span className="text-xs text-slate-500 font-medium">Whom we are talking to</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategy.personas.map((persona, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-xs mb-2.5">
                  0{idx + 1}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">{persona.role}</h3>
                <div className="text-xs text-rose-700 bg-rose-50/70 border border-rose-100 p-2.5 rounded-xl mb-2 leading-relaxed">
                  <strong className="block text-[10px] uppercase tracking-wider text-rose-500 font-bold mb-0.5">Core Pain Point</strong>
                  {persona.painPoint}
                </div>
              </div>

              <div className="text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl leading-relaxed">
                <strong className="block text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-0.5">Target Desire</strong>
                {persona.coreDesire}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Pillars Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            4 Content Strategy Pillars
          </h2>
          <span className="text-xs text-slate-500 font-medium">Balanced narrative system</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {strategy.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
            >
              <div className="text-2xl">{pillar.icon || '📌'}</div>
              <h3 className="text-sm font-extrabold text-slate-900">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 14-Day Content Schedule Timeline Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            14-Day Content Blueprint Preview
          </h2>
          <span className="text-xs text-slate-500 font-medium">1 post every 2 days</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {strategy.blueprint.map((bp, idx) => (
            <div
              key={idx}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-16 shrink-0 text-center px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs">
                  Day {bp.dayNumber}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{bp.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{bp.conceptSummary}</div>
                </div>
              </div>

              <div className="text-xs font-medium text-indigo-600 bg-indigo-50/60 px-3 py-1 rounded-lg self-start sm:self-auto border border-indigo-100/60">
                &ldquo;{bp.hookIdea.substring(0, 45)}...&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Ready to generate your social posts?
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            The AI will write full LinkedIn copies, Instagram captions, carousels, and design matching promo graphics.
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRegenerateStrategy}
            disabled={isGeneratingStrategy}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Refine Strategy
          </button>

          <button
            onClick={onActivateCampaign}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <span>Activate & Generate Posts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
