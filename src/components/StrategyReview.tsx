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
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Edit,
  Quote,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface StrategyReviewProps {
  app: AppProfile;
  strategy: MarketingStrategyPlan;
  onActivateCampaign: () => void;
  onEditApp?: () => void;
  onRegenerateStrategy?: () => void;
  onBack?: () => void;
  isGeneratingStrategy?: boolean;
  isActivating?: boolean;
  hasExistingPosts?: boolean;
}

export const StrategyReview: React.FC<StrategyReviewProps> = ({
  app,
  strategy,
  onActivateCampaign,
  onEditApp,
  onRegenerateStrategy,
  onBack,
  isGeneratingStrategy = false,
  isActivating = false,
  hasExistingPosts = false,
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
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold mr-1 transition-colors cursor-pointer border border-slate-700"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Posts</span>
                </button>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Strategy Formulated
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                AI CMO Analysis Complete
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onEditApp && (
                <button
                  onClick={onEditApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
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
              <span className="font-bold text-white block mt-0.5">4 Strategic Pillars</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Roadmap Duration</span>
              <span className="font-bold text-white block mt-0.5">14-Day Blueprint</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 1. Brand Positioning & Primary Hook ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Positioning */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            Core Brand Positioning
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            &ldquo;{strategy.brandPositioning}&rdquo;
          </p>
          <p className="text-xs text-slate-500">
            How we differentiate your product from crowded legacy alternatives in the market.
          </p>
        </div>

        {/* Primary Viral Hook */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500" />
            Primary Viral Hook Angle
          </div>
          <p className="text-base sm:text-lg font-bold text-indigo-950 leading-snug">
            &ldquo;{strategy.primaryHook}&rdquo;
          </p>
          <p className="text-xs text-indigo-700">
            The core attention-grabber we use across LinkedIn hooks and Instagram opening slides.
          </p>
        </div>
      </div>

      {/* ─── 2. Target Personas ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            3 Target Buyer Personas
          </h2>
          <span className="text-xs text-slate-500">Tailored messaging angles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategy.personas.map((persona, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  Persona #{idx + 1}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {persona.role}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-slate-700">
                  <span className="font-bold text-rose-700 block mb-0.5">Frustration / Pain:</span>
                  {persona.painPoint}
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-700">
                  <span className="font-bold text-emerald-700 block mb-0.5">Desired Outcome:</span>
                  {persona.coreDesire}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Content Pillars ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            4 Strategic Content Pillars
          </h2>
          <span className="text-xs text-slate-500">Balanced content mix</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategy.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                {pillar.icon || '📌'}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. 14-Day Editorial Blueprint ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            14-Day Roadmap Blueprint
          </h2>
          <span className="text-xs text-slate-500">{strategy.blueprint.length} Scheduled Publications</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {strategy.blueprint.map((bp, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 font-extrabold text-xs flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                  <span className="text-[10px] text-indigo-400 uppercase">Day</span>
                  <span className="text-sm leading-none font-black">{bp.dayNumber}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {bp.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {bp.conceptSummary}
                  </p>
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
            {hasExistingPosts ? 'Your 14-day social posts & graphics are ready!' : 'Ready to generate your social posts?'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {hasExistingPosts
              ? 'Click to return to your roadmap, view LinkedIn copy, Instagram carousels, and 8K visual artwork.'
              : 'The AI will write full LinkedIn copies, Instagram captions, carousels, and render matching 8K AI artwork.'}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onRegenerateStrategy && !hasExistingPosts && (
            <button
              onClick={onRegenerateStrategy}
              disabled={isGeneratingStrategy || isActivating}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Refine Strategy
            </button>
          )}

          <button
            onClick={() => {
              if (hasExistingPosts && onBack) {
                onBack();
              } else {
                onActivateCampaign();
              }
            }}
            disabled={isActivating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isActivating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Posts...</span>
              </>
            ) : hasExistingPosts ? (
              <>
                <span>← Back to Posts & Roadmap</span>
              </>
            ) : (
              <>
                <span>Activate & View Posts</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
