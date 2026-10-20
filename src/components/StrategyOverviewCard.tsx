'use client';

import React from 'react';
import { MarketingStrategyPlan, PostContent } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Users,
  Target,
  ArrowRight,
  Layers,
  Compass,
} from 'lucide-react';

interface StrategyOverviewCardProps {
  strategy: MarketingStrategyPlan;
  posts: PostContent[];
  totalExpected: number;
  isGeneratingPosts: boolean;
  onViewPosts: () => void;
}

export const StrategyOverviewCard: React.FC<StrategyOverviewCardProps> = ({
  strategy,
  posts = [],
  totalExpected = 7,
  isGeneratingPosts = false,
  onViewPosts,
}) => {
  const readyCount = (posts || []).filter((p) => p?.status === 'ready').length;
  const progressPercent = Math.min(Math.round((readyCount / Math.max(totalExpected, 1)) * 100), 100);

  const personas = strategy?.personas || [];
  const pillars = strategy?.pillars || [];
  const blueprint = strategy?.blueprint || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Real-Time Background Generation Banner */}
      <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            {isGeneratingPosts ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                {isGeneratingPosts
                  ? `Writing social posts in background... (${readyCount} of ${totalExpected} ready)`
                  : `All ${readyCount > 0 ? readyCount : totalExpected} marketing posts ready!`}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Review your customized marketing strategy below while posts finish generating.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {readyCount > 0 && (
            <button
              type="button"
              onClick={onViewPosts}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>View {readyCount} Ready Posts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isGeneratingPosts && (
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progressPercent, 15)}%` }}
          />
        </div>
      )}

      {/* Section 1: Positioning & Primary Viral Hook */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
            <Compass className="w-4 h-4" />
            Brand Positioning
          </div>
          <p className="text-sm font-bold text-slate-900 leading-relaxed">
            {strategy?.brandPositioning || 'AI-powered positioning and value proposition tailored for your audience.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600">
            <Target className="w-4 h-4" />
            Primary Viral Hook
          </div>
          <p className="text-sm font-bold text-slate-900 leading-relaxed bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
            "{strategy?.primaryHook || 'Stop wasting hours on manual tasks — here is the modern way to get results.'}"
          </p>
        </div>
      </div>

      {/* Section 2: Target Audience Personas */}
      {personas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
            <Users className="w-4 h-4 text-indigo-600" />
            Target Audience Personas
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {personas.map((persona, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2"
              >
                <div className="font-extrabold text-sm text-slate-900">{persona?.role || `Persona ${idx + 1}`}</div>
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-rose-600 block mb-0.5">Frustration:</span>
                  {persona?.painPoint || 'Manual bottlenecks and slow execution.'}
                </div>
                <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span className="font-bold text-emerald-600 block mb-0.5">Core Desire:</span>
                  {persona?.coreDesire || 'Fast, automated results with seamless ease.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Content Pillars */}
      {pillars.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
            <Layers className="w-4 h-4 text-indigo-600" />
            Campaign Content Pillars
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center gap-2 font-extrabold text-xs text-indigo-600">
                  <span>{pillar?.icon || '📌'}</span>
                  <span>{pillar?.title || `Pillar ${idx + 1}`}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar?.description || 'High-converting strategic theme for social posts.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: 7-Day Campaign Blueprint Timeline */}
      {blueprint.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              7-Day Content Roadmap Blueprint
            </div>
            <span className="text-xs font-bold text-slate-400">Posts scheduled every 2 days</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {blueprint.map((day, idx) => {
              const dayNum = day?.dayNumber ?? (idx * 2 + 1);
              const isReady = (posts || []).some((p) => p?.dayNumber === dayNum && p?.status === 'ready');

              return (
                <div
                  key={dayNum}
                  className={`p-4 rounded-xl border transition-all ${
                    isReady
                      ? 'bg-white border-emerald-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-extrabold text-xs">
                      Day {dayNum}
                    </span>

                    {isReady ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Drafting...
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                    {day?.title || `Day ${dayNum} Strategy Post`}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {day?.conceptSummary || 'High-converting tactical angle for this campaign milestone.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
