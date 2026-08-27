'use client';

import React, { useState } from 'react';
import { AppProfile } from '@/types';
import { Sparkles, Rocket, Zap, Target, BookOpen, TrendingUp, Loader2, CheckCircle2, Clock } from 'lucide-react';

interface CampaignGeneratorProps {
  app: AppProfile;
  onGenerate: (objective: string, durationDays: number) => Promise<void>;
  isGenerating: boolean;
}

const OBJECTIVES = [
  {
    id: 'launch',
    title: 'Product Launch Announcement',
    description: 'Build excitement and drive initial early signups and beta traffic.',
    icon: Rocket,
  },
  {
    id: 'pain_point',
    title: 'Customer Problem & Solution',
    description: 'Highlight daily user pain points and present your product as the fix.',
    icon: Target,
  },
  {
    id: 'feature',
    title: 'Key Feature Deep-Dive',
    description: 'Explain your most powerful features and why they help users save time.',
    icon: Zap,
  },
  {
    id: 'growth',
    title: 'Founder Story & Journey',
    description: 'Share why you built the product to build trust and authority.',
    icon: TrendingUp,
  },
  {
    id: 'educational',
    title: 'Actionable Industry Tips',
    description: 'Value-first tips and best practices tailored for your target audience.',
    icon: BookOpen,
  },
];

export const CampaignGenerator: React.FC<CampaignGeneratorProps> = ({
  app,
  onGenerate,
  isGenerating,
}) => {
  const [selectedObjective, setSelectedObjective] = useState(OBJECTIVES[0].title);
  const [durationDays, setDurationDays] = useState(14);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(selectedObjective, durationDays);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Clean Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Generate New Marketing Campaign for {app.name}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Select a marketing focus below. The AI will write ready-to-publish LinkedIn posts, Instagram carousels, and matching promo images.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Objective */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Select Campaign Focus
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OBJECTIVES.map((obj) => {
              const Icon = obj.icon;
              const isSelected = selectedObjective === obj.title;

              return (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObjective(obj.title)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-2.5">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{obj.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{obj.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-xs font-bold">
                    <span className={isSelected ? 'text-indigo-600 flex items-center gap-1' : 'text-slate-400'}>
                      {isSelected ? <><CheckCircle2 className="w-3.5 h-3.5" /> Selected</> : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Duration */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Choose Schedule Duration
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { days: 7, label: '7-Day Sprint', posts: '3 Posts (Every 2 days)' },
              { days: 14, label: '14-Day Campaign', posts: '7 Posts (Recommended)' },
              { days: 30, label: '30-Day Master', posts: '15 Posts (Full month)' },
            ].map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDurationDays(opt.days)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  durationDays === opt.days
                    ? 'bg-indigo-50/50 border-indigo-600 text-slate-900 ring-1 ring-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xs text-slate-500">{opt.posts}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex items-center justify-center">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto min-w-[300px] flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Posts with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Marketing Campaign</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
