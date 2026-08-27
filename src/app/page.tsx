'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppProfile, CampaignRoadmap, MarketingStrategyPlan, PostContent, UserSettings } from '@/types';
import {
  getStoredApps,
  saveAppProfile,
  deleteAppProfile,
  getActiveAppId,
  setActiveAppId,
  getStoredCampaigns,
  saveCampaign,
  getUserSettings,
  saveUserSettings,
  clearAllStoredData,
  DEFAULT_DEMO_APP,
} from '@/lib/storage';
import { generateMockCampaign, generateMockSinglePost, generateMockStrategy } from '@/lib/gemini';
import { Navbar } from '@/components/Navbar';
import { AppFormModal } from '@/components/AppFormModal';
import { SettingsModal } from '@/components/SettingsModal';
import { StrategyReview } from '@/components/StrategyReview';
import { RoadmapCalendar } from '@/components/RoadmapCalendar';
import { CampaignGenerator } from '@/components/CampaignGenerator';
import { LinkedInPreviewCard } from '@/components/LinkedInPreviewCard';
import { InstagramPreviewCard } from '@/components/InstagramPreviewCard';
import {
  Sparkles,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Linkedin,
  Instagram,
  Rocket,
  Plus,
  AlertTriangle,
  RefreshCw,
  Check,
  BrainCircuit,
  Compass,
} from 'lucide-react';

// ─── VIEW STATES ───
type ViewState = 'welcome' | 'strategy-generating' | 'strategy-review' | 'dashboard' | 'generator' | 'post-detail';

export default function Dashboard() {
  const [apps, setApps] = useState<AppProfile[]>([]);
  const [activeApp, setActiveApp] = useState<AppProfile | null>(null);
  const [campaign, setCampaign] = useState<CampaignRoadmap | null>(null);
  const [currentStrategy, setCurrentStrategy] = useState<MarketingStrategyPlan | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostContent | null>(null);
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram'>('linkedin');

  // View state
  const [view, setView] = useState<ViewState>('welcome');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Modals
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isEditingApp, setIsEditingApp] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({});
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);

  // Progress messaging
  const [strategyProgressText, setStrategyProgressText] = useState('Analyzing product positioning...');
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(0);

  // Cancellation ref for background generations
  const generationAbortRef = useRef(false);

  // Load data on startup
  useEffect(() => {
    async function loadData() {
      const storedApps = await getStoredApps();
      setApps(storedApps);

      const loadedSettings = getUserSettings();
      setSettings(loadedSettings);

      if (storedApps.length === 0) {
        // Clean slate: show Welcome
        setActiveApp(null);
        setCampaign(null);
        setView('welcome');
      } else {
        const activeId = getActiveAppId();
        const current = storedApps.find((a) => a.id === activeId) || storedApps[0];
        setActiveApp(current);

        const existingCampaigns = getStoredCampaigns(current.id);
        if (existingCampaigns.length > 0) {
          setCampaign(existingCampaigns[0]);
          if (existingCampaigns[0].strategy) {
            setCurrentStrategy(existingCampaigns[0].strategy);
          }
          setView('dashboard');
        } else {
          // If app exists but no campaign, show welcome/strategy
          setView('dashboard');
        }
      }

      setIsFirstLoad(false);
    }
    loadData();
  }, []);

  // Toast notification with smooth animation
  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false);
      setTimeout(() => setStatusNotification(null), 300);
    }, 3000);
  };

  // Reset All Data & Start Fresh
  const handleResetAllData = async () => {
    generationAbortRef.current = true;
    await clearAllStoredData();
    setApps([]);
    setActiveApp(null);
    setCampaign(null);
    setCurrentStrategy(null);
    setSelectedPost(null);
    setIsGeneratingPosts(false);
    setIsGeneratingStrategy(false);
    setView('welcome');
    showNotification('All data cleared. Welcome to the fresh start!');
  };


  // Load Demo Product
  const handleLoadDemoProduct = async () => {
    const saved = await saveAppProfile(DEFAULT_DEMO_APP);
    setApps([saved]);
    setActiveApp(saved);
    setActiveAppId(saved.id);
    await formulateStrategyForApp(saved, 'Product Launch & User Acquisition');
  };

  // Handle app switch from navbar
  const handleSelectApp = (appId: string) => {
    const selected = apps.find((a) => a.id === appId);
    if (selected) {
      setActiveApp(selected);
      setActiveAppId(selected.id);
      const existing = getStoredCampaigns(selected.id);
      if (existing.length > 0) {
        setCampaign(existing[0]);
        if (existing[0].strategy) {
          setCurrentStrategy(existing[0].strategy);
        }
      } else {
        setCampaign(null);
        setCurrentStrategy(null);
      }
      setSelectedPost(null);
      setView('dashboard');
    }
  };

  // Save app (either new or edited)
  const handleSaveApp = async (savedApp: AppProfile) => {
    const isNew = !apps.some((a) => a.id === savedApp.id);
    const updated = await saveAppProfile(savedApp);
    const stored = await getStoredApps();
    setApps(stored);
    setActiveApp(updated);

    if (isNew || !campaign) {
      // Formulate Strategy first (The Convincing Plan Step)
      await formulateStrategyForApp(updated, 'Product Launch & User Acquisition');
    } else {
      showNotification(`Saved "${updated.name}"!`);
      if (view === 'strategy-review') {
        await formulateStrategyForApp(updated, campaign?.objective || 'Product Launch & User Acquisition');
      }
    }
  };

  // Delete active app
  const handleDeleteApp = async (appId: string) => {
    if (apps.length <= 1) {
      handleResetAllData();
      return;
    }
    if (confirm(`Are you sure you want to delete ${activeApp?.name}?`)) {
      await deleteAppProfile(appId);
      const stored = await getStoredApps();
      setApps(stored);
      setActiveApp(stored[0]);
      setActiveAppId(stored[0].id);
      const existing = getStoredCampaigns(stored[0].id);
      setCampaign(existing.length > 0 ? existing[0] : null);
      setSelectedPost(null);
      setView('dashboard');
      showNotification('Business profile removed.');
    }
  };

  // Save user settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveUserSettings(newSettings);
    showNotification('Settings saved!');
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: FORMULATE MARKETING STRATEGY (Convincing Plan Step)
  // ─────────────────────────────────────────────────────────────
  const formulateStrategyForApp = async (appToUse: AppProfile, objective: string) => {
    setIsGeneratingStrategy(true);
    setView('strategy-generating');
    setStrategyProgressText(`Analyzing ${appToUse.name}'s target audience & pain points...`);

    const timer1 = setTimeout(() => {
      setStrategyProgressText('Formulating 4 core content marketing pillars...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setStrategyProgressText('Structuring 14-day high-converting social roadmap...');
    }, 2400);

    try {
      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: appToUse,
          objective,
          apiKey: settings.geminiApiKey,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();
      if (data.success && data.strategy) {
        setCurrentStrategy(data.strategy);
        setView('strategy-review');
        showNotification('✨ AI Marketing Strategy formulated!');
      } else {
        throw new Error(data.error || 'Failed strategy generation');
      }
    } catch (err) {
      console.warn('Strategy API fallback:', err);
      const fallbackStrategy = generateMockStrategy(appToUse);
      setCurrentStrategy(fallbackStrategy);
      setView('strategy-review');
      showNotification('Marketing Strategy plan ready!');
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 2: ACTIVATE CAMPAIGN & GENERATE POSTS IN BACKGROUND
  // ─────────────────────────────────────────────────────────────
  const handleActivateCampaign = async () => {
    if (!activeApp || !currentStrategy) return;

    generationAbortRef.current = false;
    setIsGeneratingPosts(true);

    // Create initial campaign container with strategy
    const blueprint = currentStrategy.blueprint;
    const initialCampaign: CampaignRoadmap = {
      id: `campaign-${activeApp.id}-${Date.now()}`,
      appId: activeApp.id,
      name: `${activeApp.name} - 14-Day Growth Campaign`,
      objective: 'Product Launch & User Acquisition',
      durationDays: 14,
      strategy: currentStrategy,
      createdAt: new Date().toISOString(),
      posts: [],
    };

    setCampaign(initialCampaign);
    saveCampaign(initialCampaign);

    // Switch immediately to dashboard so user sees live progress & roadmap!
    setView('dashboard');
    showNotification('🚀 Generating your 14-day posts in the background...');

    // Progressively generate posts one by one
    const generatedPosts: PostContent[] = [];

    for (let i = 0; i < blueprint.length; i++) {
      if (generationAbortRef.current) break;

      setCurrentGeneratingIndex(i);
      const bp = blueprint[i];

      try {
        const postRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app: activeApp,
            singlePost: true,
            blueprint: bp,
            strategy: currentStrategy,
            apiKey: settings.geminiApiKey,
          }),
        });

        const postData = await postRes.json();
        if (postData.success && postData.post) {
          generatedPosts.push(postData.post);
        } else {
          generatedPosts.push(generateMockSinglePost(activeApp, bp, i));
        }
      } catch (err) {
        console.warn(`Post ${i + 1} fallback:`, err);
        generatedPosts.push(generateMockSinglePost(activeApp, bp, i));
      }

      // Live update campaign with newly generated post
      const updatedCampaign: CampaignRoadmap = {
        ...initialCampaign,
        posts: [...generatedPosts],
      };

      setCampaign(updatedCampaign);
      saveCampaign(updatedCampaign);
    }

    setIsGeneratingPosts(false);
    showNotification('🎉 All 14-day social posts & graphics are ready to copy!');
  };

  // AI Refine Copy for single post
  const handleRefineWithAI = async (instruction: string) => {
    if (!selectedPost) return;
    setIsRefining(true);

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: selectedPost,
          instruction,
          apiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (data.success && data.post) {
        handleUpdatePost(data.post);
        showNotification('Post updated with AI!');
      }
    } catch (err) {
      console.error('Refine failed', err);
    } finally {
      setIsRefining(false);
    }
  };

  // Update specific post
  const handleUpdatePost = (updatedPost: PostContent) => {
    setSelectedPost(updatedPost);
    if (campaign) {
      const updatedPosts = campaign.posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
      const updatedCampaign = { ...campaign, posts: updatedPosts };
      setCampaign(updatedCampaign);
      saveCampaign(updatedCampaign);
    }
  };

  // Delete single post
  const handleDeletePost = (postId: string) => {
    if (!campaign) return;
    const updatedPosts = campaign.posts.filter((p) => p.id !== postId);
    const updatedCampaign = { ...campaign, posts: updatedPosts };
    setCampaign(updatedCampaign);
    saveCampaign(updatedCampaign);
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      setView('dashboard');
    }
    showNotification('Post removed');
  };

  // Mark post as published
  const handleTogglePublished = (post: PostContent) => {
    const newStatus = post.status === 'published' ? 'ready' : 'published';
    handleUpdatePost({ ...post, status: newStatus });
    showNotification(newStatus === 'published' ? '✅ Marked as published' : 'Marked as ready to post');
  };

  // View post details
  const handleViewPost = (post: PostContent) => {
    setSelectedPost(post);
    setActivePlatform('linkedin');
    setView('post-detail');
  };

  if (isFirstLoad) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Starting MarketAgent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ─── FLOATING TOAST NOTIFICATION ─── */}
      {statusNotification && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-2xl transition-all duration-300 ${
            notificationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* ─── CONFIRMATION MODAL BEFORE REGENERATION ─── */}
      {showConfirmRegenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center animate-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Formulate New Campaign?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              This will create a new marketing strategy and fresh social posts for {activeApp?.name}.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmRegenerate(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Keep Current
              </button>
              <button
                onClick={() => {
                  setShowConfirmRegenerate(false);
                  if (activeApp) {
                    formulateStrategyForApp(activeApp, 'Product Launch & User Acquisition');
                  }
                }}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
              >
                Start Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── NAVBAR ─── */}
      {apps.length > 0 && activeApp && (
        <Navbar
          apps={apps}
          activeApp={activeApp}
          onSelectApp={handleSelectApp}
          onOpenNewAppModal={() => {
            setIsEditingApp(false);
            setIsAppModalOpen(true);
          }}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />
      )}

      {/* ─── MAIN CONTENT ROUTER ─── */}
      <main className="flex-1 w-full">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* 1. WELCOME ONBOARDING (Clean Slate / First-Time User)   */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === 'welcome' && (
          <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center animate-in">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/30 text-white">
              <Rocket className="w-8 h-8" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              AI Marketing Agent
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              Enter your product details once. The AI will formulate a customized marketing plan, write 14 days of high-converting social posts, and generate matching promo graphics.
            </p>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-2xl mb-2.5">📝</div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 1</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Enter Your Product</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Name, audience, main pain points, and tone.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-2xl mb-2.5">🧠</div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 2</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Review Strategy</h3>
                <p className="text-xs text-slate-500 leading-relaxed">See your positioning, 3 buyer personas & 4 content pillars.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-2xl mb-2.5">📋</div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 3</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Copy & Publish</h3>
                <p className="text-xs text-slate-500 leading-relaxed">1-Click copy for LinkedIn & Instagram. Zero API ban risk.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsEditingApp(false);
                  setIsAppModalOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all active:scale-98 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your Product</span>
              </button>

              <button
                onClick={handleLoadDemoProduct}
                className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Explore with demo product (DevFlow AI) →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 2. STRATEGY GENERATING SCREEN (Animated AI Loader)      */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === 'strategy-generating' && activeApp && (
          <div className="max-w-xl mx-auto px-4 py-20 text-center animate-in">
            <div className="relative w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/30 text-white animate-pulse">
              <BrainCircuit className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Formulating Strategy for {activeApp.name}
            </h2>

            <p className="text-sm font-medium text-indigo-600 mb-8 animate-fade">
              {strategyProgressText}
            </p>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-6">
              <div className="bg-indigo-600 h-2 rounded-full w-3/4 animate-pulse" />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 max-w-md mx-auto space-y-1 text-left">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                AI Chief Marketing Officer is analyzing:
              </div>
              <div>• Target audience: <strong className="text-slate-700">{activeApp.targetAudience}</strong></div>
              <div>• Tone: <strong className="text-slate-700 capitalize">{activeApp.toneOfVoice}</strong></div>
              <div>• Key features & positioning differentiators</div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 3. STRATEGY REVIEW SCREEN (The Convincing Visual Plan)   */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === 'strategy-review' && activeApp && currentStrategy && (
          <StrategyReview
            app={activeApp}
            strategy={currentStrategy}
            onActivateCampaign={handleActivateCampaign}
            onEditApp={() => {
              setIsEditingApp(true);
              setIsAppModalOpen(true);
            }}
            onRegenerateStrategy={() => formulateStrategyForApp(activeApp, 'Product Launch & User Acquisition')}
            isGeneratingStrategy={isGeneratingStrategy}
          />
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 4. DASHBOARD (Live Roadmap + Progressive Generation)    */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === 'dashboard' && activeApp && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in">
            {/* Active Business Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-extrabold text-slate-900">{activeApp.name}</h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                    {activeApp.toneOfVoice} Tone
                  </span>
                  {currentStrategy && (
                    <button
                      onClick={() => setView('strategy-review')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 ml-1"
                    >
                      <span>View Marketing Plan ↗</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {activeApp.tagline} • Target: <strong className="text-slate-800">{activeApp.targetAudience}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setIsEditingApp(true);
                    setIsAppModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setShowConfirmRegenerate(true)}
                  disabled={isGeneratingPosts}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs disabled:opacity-50"
                >
                  {isGeneratingPosts ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing Posts...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate Posts</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteApp(activeApp.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Business"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multi-Model Background Generation Notice Bar */}
            {isGeneratingPosts && currentStrategy && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-xs flex flex-wrap items-center justify-between gap-4 animate-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-indigo-950">Multi-Model AI Engine Active (No Rush • High Quality)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/70 text-indigo-800">
                        Auto-Failover Enabled
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Writing Day {currentStrategy.blueprint[currentGeneratingIndex]?.dayNumber || currentGeneratingIndex + 1} Copy & Pre-Rendering 8K 3D Visual: &ldquo;
                      {currentStrategy.blueprint[currentGeneratingIndex]?.title || 'Copy & Graphic'}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-extrabold text-indigo-700 bg-white px-3.5 py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                    {campaign?.posts.length || 0} / {currentStrategy.blueprint.length} Posts Ready
                  </div>
                </div>
              </div>
            )}


            {/* Roadmap Calendar (Live Card Skeletons + Progressive Rendering) */}
            <RoadmapCalendar
              app={activeApp}
              campaign={campaign}
              selectedPostId={selectedPost?.id || null}
              onSelectPost={handleViewPost}
              onOpenGenerator={() => setShowConfirmRegenerate(true)}
              blueprint={currentStrategy?.blueprint || []}
              isGeneratingPosts={isGeneratingPosts}
              currentGeneratingIndex={currentGeneratingIndex}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 5. POST DETAIL VIEW (LinkedIn & Instagram Card Studio)   */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === 'post-detail' && selectedPost && activeApp && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-in">
            {/* Top Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setView('dashboard');
                  setSelectedPost(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Content Roadmap
              </button>

              {/* Per-post actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePublished(selectedPost)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedPost.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {selectedPost.status === 'published' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Published</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (confirm('Delete this post?')) {
                      handleDeletePost(selectedPost.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Header + Platform Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                    Day {selectedPost.dayNumber || 1}
                  </span>
                  {selectedPost.status === 'published' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      ✅ Published
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900">{selectedPost.title}</h2>
              </div>

              {/* Platform switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setActivePlatform('linkedin')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    activePlatform === 'linkedin'
                      ? 'bg-white text-[#0a66c2] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </button>
                <button
                  onClick={() => setActivePlatform('instagram')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    activePlatform === 'instagram'
                      ? 'bg-white text-pink-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </button>
              </div>
            </div>

            {/* Platform Preview Card */}
            {activePlatform === 'linkedin' ? (
              <LinkedInPreviewCard
                app={activeApp}
                post={selectedPost}
                onUpdatePost={handleUpdatePost}
                onRefineWithAI={handleRefineWithAI}
                isRefining={isRefining}
              />
            ) : (
              <InstagramPreviewCard
                app={activeApp}
                post={selectedPost}
                onUpdatePost={handleUpdatePost}
                onRefineWithAI={handleRefineWithAI}
                isRefining={isRefining}
              />
            )}
          </div>
        )}
      </main>

      {/* ─── MODALS ─── */}
      <AppFormModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSave={handleSaveApp}
        initialApp={isEditingApp ? activeApp : null}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetAllData}
      />
    </div>
  );
}
