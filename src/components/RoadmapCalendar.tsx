'use client';

import React from 'react';
import { AppProfile, CampaignRoadmap, ContentPillar, DayPlanBlueprint, PostContent } from '@/types';
import { Calendar, CheckCircle2, Sparkles, ArrowRight, Eye, Loader2 } from 'lucide-react';

interface RoadmapCalendarProps {
  app: AppProfile;
  campaign: CampaignRoadmap | null;
  selectedPostId: string | null;
  onSelectPost: (post: PostContent) => void;
  onOpenGenerator: () => void;
  blueprint?: DayPlanBlueprint[];
  isGeneratingPosts?: boolean;
  currentGeneratingIndex?: number;
}

const PILLAR_CONFIG: Record<ContentPillar, { label: string; color: string; icon: string }> = {
  pain_solution: { label: 'Problem & Solution', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '🎯' },
  feature_spotlight: { label: 'Feature Deep-Dive', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '⚡' },
  founder_story: { label: 'Founder Story', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: '📖' },
  tips_value: { label: 'Actionable Tips', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '💡' },
  social_proof: { label: 'Results & Proof', color: 'bg-sky-50 text-sky-800 border-sky-200', icon: '📈' },
};

export const RoadmapCalendar: React.FC<RoadmapCalendarProps> = ({
  app,
  campaign,
  selectedPostId,
  onSelectPost,
  onOpenGenerator,
  blueprint = [],
  isGeneratingPosts = false,
  currentGeneratingIndex = 0,
}) => {
  const posts = campaign?.posts || [];
  const totalPosts = blueprint.length > 0 ? blueprint.length : (posts.length || 7);

  if (!campaign && !isGeneratingPosts) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto my-12 shadow-sm animate-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Campaign</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
          Generate an AI-powered marketing roadmap for <strong className="text-slate-700">{app.name}</strong> with ready-to-post LinkedIn and Instagram content.
        </p>
        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          Generate Campaign
        </button>
      </div>
    );
  }

  // Calculate remaining placeholders if generating
  const completedCount = posts.length;
  const remainingCount = Math.max(0, totalPosts - completedCount);

  return (
    <div className="space-y-4">
      {/* Campaign Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs animate-in">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isGeneratingPosts ? '⚡ Generating Campaign...' : 'Active 14-Day Strategy'}
            </span>
            <span className="text-xs text-slate-400 font-medium">• 1 Post Every 2 Days</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {campaign?.name || `${app.name} - 14-Day Growth Campaign`}
          </h2>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
          {isGeneratingPosts ? (
            <span className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {completedCount} of {totalPosts} posts ready
            </span>
          ) : (
            <div>
              <span className="font-bold text-emerald-600">
                {posts.filter(p => p.status === 'published').length}
              </span> of {posts.length} published
            </div>
          )}
        </div>
      </div>

      {/* Post Cards Grid (Completed + Generating Skeletons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Completed Posts */}
        {posts.map((post, index) => {
          const isSelected = selectedPostId === post.id;
          const pillar = PILLAR_CONFIG[post.pillar] || PILLAR_CONFIG.pain_solution;
          const isPublished = post.status === 'published';

          return (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className={`group p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between animate-in ${
                isSelected
                  ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600 shadow-sm'
                  : isPublished
                    ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300 hover:shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div>
                {/* Day & Pillar Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                    Day {post.dayNumber || (index * 2) + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${pillar.color}`}>
                    {pillar.icon} {pillar.label}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-2">
                  {post.title}
                </h4>

                {/* Hook preview */}
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 font-sans leading-relaxed">
                  &ldquo;{post.linkedin?.hook || post.title}&rdquo;
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs font-semibold">
                <span className={`flex items-center gap-1 ${isPublished ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {isPublished ? 'Published' : 'Ready to Post'}
                </span>

                <span className="flex items-center gap-1 text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Post</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}

        {/* Shimmer Skeletons for In-Progress Posts */}
        {isGeneratingPosts && Array.from({ length: remainingCount }).map((_, i) => {
          const bpIndex = completedCount + i;
          const bp = blueprint[bpIndex];
          const isCurrentlyBeingWritten = i === 0;
          const dayNum = bp?.dayNumber || (bpIndex * 2) + 1;
          const title = bp?.title || `Day ${dayNum} Marketing Angle`;
          const pillarKey = (bp?.pillar || 'pain_solution') as ContentPillar;
          const pillar = PILLAR_CONFIG[pillarKey] || PILLAR_CONFIG.pain_solution;

          return (
            <div
              key={`skeleton-${i}`}
              className={`p-4 rounded-2xl border border-dashed relative flex flex-col justify-between transition-all ${
                isCurrentlyBeingWritten
                  ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-300 shadow-xs animate-pulse'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600 font-bold text-xs">
                    Day {dayNum}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${pillar.color}`}>
                    {pillar.icon} {pillar.label}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-1.5 line-clamp-1">
                  {title}
                </h4>

                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1.5">
                  <div className="h-2.5 bg-slate-200 rounded-full w-3/4 animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                {isCurrentlyBeingWritten ? (
                  <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Writing copy & graphics...
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">Queued</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
