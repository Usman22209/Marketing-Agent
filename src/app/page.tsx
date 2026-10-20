'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AppProfile,
  CampaignRoadmap,
  CronExecutionLog,
  MarketingStrategyPlan,
  PostContent,
  UserSettings,
} from '@/types';
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
  getStoredCronLogs,
  saveCronLog,
} from '@/lib/storage';
import { generateMockCampaign, generateMockStrategy, generateMockSinglePost } from '@/lib/gemini';
import { Navbar } from '@/components/Navbar';
import { AppFormModal } from '@/components/AppFormModal';
import { SettingsModal } from '@/components/SettingsModal';
import { StrategyOverviewCard } from '@/components/StrategyOverviewCard';
import { LinkedInPreviewCard } from '@/components/LinkedInPreviewCard';
import { InstagramPreviewCard } from '@/components/InstagramPreviewCard';
import {
  Sparkles,
  Edit,
  Trash2,
  Loader2,
  X,
  Compass,
  FileText,
  Plus,
  Clock,
  Play,
  CheckCircle2,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

export default function Dashboard() {
  const [apps, setApps] = useState<AppProfile[]>([]);
  const [activeApp, setActiveApp] = useState<AppProfile | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Strategy & Posts State
  const [strategy, setStrategy] = useState<MarketingStrategyPlan | null>(null);
  const [posts, setPosts] = useState<PostContent[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostContent | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'scheduler' | 'strategy'>('posts');
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram'>('linkedin');

  // Cron / Scheduler State
  const [cronLogs, setCronLogs] = useState<CronExecutionLog[]>([]);
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Modals & Progress
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isEditingApp, setIsEditingApp] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const [selectedObjective, setSelectedObjective] = useState('Product Launch & User Acquisition');
  const [settings, setSettings] = useState<UserSettings>({});
  const activeAppRef = useRef<string>('');

  // 1. Initial Load
  useEffect(() => {
    async function loadData() {
      try {
        const storedApps = await getStoredApps();
        setApps(storedApps);
        const activeId = getActiveAppId();
        const current = (activeId && storedApps.find((a) => a.id === activeId)) || (storedApps.length > 0 ? storedApps[0] : null);
        setActiveApp(current);
        if (current) {
          activeAppRef.current = current.id;
          loadProductCampaign(current);
        } else {
          activeAppRef.current = '';
        }

        const loadedSettings = getUserSettings();
        setSettings(loadedSettings);
        setCronLogs(getStoredCronLogs());
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // 2. Load Campaign for specific App
  const loadProductCampaign = (app: AppProfile) => {
    const defaultStrategy = generateMockStrategy(app);
    setStrategy(defaultStrategy);
    setPosts([]);
    setSelectedPost(null);

    const existingCampaigns = getStoredCampaigns(app.id);
    if (existingCampaigns.length > 0 && existingCampaigns[0].posts.length > 0) {
      const camp = existingCampaigns[0];
      setStrategy(camp.strategy || defaultStrategy);
      setPosts(camp.posts);
      setSelectedPost(camp.posts[0] || null);
      setActiveTab('posts');
    } else {
      startStrategyFirstGeneration(app, 'Product Launch & User Acquisition');
    }
  };

  // 3. Switch Active App
  const handleSelectApp = (appId: string) => {
    const selected = apps.find((a) => a.id === appId);
    if (selected) {
      setActiveApp(selected);
      setActiveAppId(selected.id);
      activeAppRef.current = selected.id;
      loadProductCampaign(selected);
    }
  };

  // 4. Save App Profile
  const handleSaveApp = async (savedApp: AppProfile) => {
    const updated = await saveAppProfile(savedApp);
    const stored = await getStoredApps();
    setApps(stored);
    setActiveApp(updated);
    activeAppRef.current = updated.id;

    setPosts([]);
    setSelectedPost(null);
    setStrategy(generateMockStrategy(updated));
    startStrategyFirstGeneration(updated, selectedObjective);
    showNotification(`Saved "${updated.name}"!`);
  };

  // 5. Strategy-First Post Generation Engine
  const startStrategyFirstGeneration = async (app: AppProfile, objective: string) => {
    const initialStrategy = generateMockStrategy(app);
    setStrategy(initialStrategy);
    setIsGeneratingStrategy(true);
    setIsGeneratingPosts(true);
    setActiveTab('posts');

    let currentStrategy: MarketingStrategyPlan = initialStrategy;

    try {
      const res = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app,
          objective,
          apiKey: settings.geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.success && data.strategy) {
        currentStrategy = data.strategy;
        setStrategy(currentStrategy);
      }
    } catch (e) {
      console.warn('Strategy API error, using instant baseline:', e);
    } finally {
      setIsGeneratingStrategy(false);
    }

    const generatedPosts: PostContent[] = [];
    const blueprintList = currentStrategy.blueprint || initialStrategy.blueprint;

    for (let i = 0; i < blueprintList.length; i++) {
      if (activeAppRef.current !== app.id) break;

      const bp = blueprintList[i];
      try {
        const postRes = await fetch('/api/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app,
            blueprint: bp,
            strategy: currentStrategy,
            apiKey: settings.geminiApiKey,
          }),
        });
        const postData = await postRes.json();
        if (postData.success && postData.post) {
          generatedPosts.push(postData.post);
        } else {
          generatedPosts.push(generateMockSinglePost(app, bp, i));
        }
      } catch (err) {
        console.warn(`Post error for Day ${bp.dayNumber}, using fallback:`, err);
        generatedPosts.push(generateMockSinglePost(app, bp, i));
      }

      setPosts([...generatedPosts]);
      if (!selectedPost && generatedPosts.length > 0) {
        setSelectedPost(generatedPosts[0]);
      }
    }

    setIsGeneratingPosts(false);

    const newCamp: CampaignRoadmap = {
      id: `campaign-${app.id}`,
      appId: app.id,
      name: `${app.name} - 14-Day Growth Campaign`,
      objective,
      durationDays: 14,
      strategy: currentStrategy,
      createdAt: new Date().toISOString(),
      posts: generatedPosts.length > 0 ? generatedPosts : generateMockCampaign(app, 14).posts,
    };
    saveCampaign(newCamp);
    showNotification('All 7 marketing posts ready!');
  };

  // 6. Autonomous Cron Run Trigger
  const handleRunCronNow = async () => {
    if (!activeApp) return;
    setIsRunningCron(true);

    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: activeApp,
          toEmail: settings.userEmail,
          apiKey: settings.geminiApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        const newPost: PostContent = data.post;
        const updatedPosts = [newPost, ...posts.filter((p) => p.id !== newPost.id)];
        setPosts(updatedPosts);
        setSelectedPost(newPost);

        const newLog: CronExecutionLog = {
          id: `log-${Date.now()}`,
          appId: activeApp.id,
          appName: activeApp.name,
          postTitle: newPost.title,
          dayNumber: newPost.dayNumber,
          status: 'success',
          executedAt: new Date().toISOString(),
          message: data.message,
          emailSentTo: data.recipientEmail || undefined,
        };

        saveCronLog(newLog);
        setCronLogs((prev) => [newLog, ...prev]);
        showNotification(`⚡ Day ${newPost.dayNumber} post generated and scheduled!`);
      } else {
        showNotification(`⚠️ ${data.message || 'Cron execution completed.'}`);
      }
    } catch (err: any) {
      console.error('Manual cron trigger error:', err);
      showNotification(`❌ Error triggering scheduler: ${err?.message}`);
    } finally {
      setIsRunningCron(false);
    }
  };

  // Delete App Profile
  const handleDeleteApp = async (appId: string) => {
    if (!activeApp) return;
    if (confirm(`Are you sure you want to delete "${activeApp.name}"?`)) {
      await deleteAppProfile(appId);
      const stored = await getStoredApps();
      setApps(stored);
      const nextApp = stored.length > 0 ? stored[0] : null;
      setActiveApp(nextApp);
      if (nextApp) {
        setActiveAppId(nextApp.id);
        activeAppRef.current = nextApp.id;
        loadProductCampaign(nextApp);
      } else {
        setActiveAppId('');
        activeAppRef.current = '';
        setPosts([]);
        setSelectedPost(null);
        setStrategy(null);
      }
      showNotification('Product profile deleted.');
    }
  };

  // AI Refine Copy
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

  const handleUpdatePost = (updatedPost: PostContent) => {
    setSelectedPost(updatedPost);
    const updated = posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    setPosts(updated);
    if (activeApp) {
      saveCampaign({
        id: `campaign-${activeApp.id}`,
        appId: activeApp.id,
        name: `${activeApp.name} Campaign`,
        objective: selectedObjective,
        durationDays: 14,
        strategy: strategy || undefined,
        createdAt: new Date().toISOString(),
        posts: updated,
      });
    }
  };

  const copyCronCurl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const curlCommand = settings.cronSecret
      ? `curl -X POST -H "Authorization: Bearer ${settings.cronSecret}" ${origin}/api/cron`
      : `curl -X POST ${origin}/api/cron`;
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Navbar */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoadingInitial ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto my-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Loading your marketing workspace...</p>
          </div>
        ) : !activeApp ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Welcome to MarketAgent</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Add your product or business profile to formulate high-converting social campaigns with AI and manage autonomous post scheduling.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingApp(false);
                  setIsAppModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your Product</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Business Header Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-extrabold text-slate-900">{activeApp.name}</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {activeApp.toneOfVoice.toUpperCase()} TONE
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {activeApp.tagline} • Target: <strong className="text-slate-800">{activeApp.targetAudience}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingApp(true);
                    setIsAppModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate Campaign</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteApp(activeApp.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Top View Mode Switcher: Posts vs Scheduler vs Strategy */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'posts'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Social Posts ({posts.length} Ready)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('scheduler')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'scheduler'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Automated Scheduler</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('strategy')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'strategy'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>Marketing Blueprint</span>
                </button>
              </div>

              {isGeneratingPosts && (
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting posts in background ({posts.length}/7)...</span>
                </div>
              )}
            </div>

            {/* Tab 1: Posts Studio */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {/* Post Switcher */}
                {posts.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                      Select Post to Review & Copy:
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {posts.map((p, idx) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPost(p)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedPost?.id === p.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 font-medium'
                          }`}
                        >
                          <div className="text-xs font-extrabold">Post {idx + 1}</div>
                          <div className="text-[11px] opacity-75">Day {(idx * 2) + 1}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800">Drafting your marketing posts with AI...</p>
                    <p className="text-xs text-slate-500 mt-1">This will only take a moment.</p>
                  </div>
                )}

                {/* Post Review Card */}
                {selectedPost && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedPost.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Day {selectedPost.dayNumber || 1} • Choose platform below and click Copy
                        </p>
                      </div>

                      {/* LinkedIn vs Instagram Tab Switcher */}
                      <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setActivePlatform('linkedin')}
                          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            activePlatform === 'linkedin'
                              ? 'bg-white text-[#0a66c2] shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          LinkedIn Post
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePlatform('instagram')}
                          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            activePlatform === 'instagram'
                              ? 'bg-white text-pink-600 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Instagram Post
                        </button>
                      </div>
                    </div>

                    {activePlatform === 'linkedin' ? (
                      <LinkedInPreviewCard
                        app={activeApp}
                        post={selectedPost}
                        onUpdatePost={handleUpdatePost}
                        onRefineWithAI={handleRefineWithAI}
                        isRefining={isRefining}
                        userEmail={settings.userEmail}
                      />
                    ) : (
                      <InstagramPreviewCard
                        app={activeApp}
                        post={selectedPost}
                        onUpdatePost={handleUpdatePost}
                        onRefineWithAI={handleRefineWithAI}
                        isRefining={isRefining}
                        userEmail={settings.userEmail}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Autonomous Scheduler View */}
            {activeTab === 'scheduler' && (
              <div className="space-y-6">
                {/* Scheduler Control Panel */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Autonomous Timed Event Scheduler</h2>
                        <p className="text-xs text-slate-500">
                          Automatically generates marketing content on a regular schedule without external tools.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Status: Active (Every 2 Days)
                      </span>
                    </div>
                  </div>

                  {/* Trigger Action */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Run Scheduled Event Now
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Test and generate the next post immediately without waiting for the cron timer.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isRunningCron}
                      onClick={handleRunCronNow}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isRunningCron ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Post...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Run Scheduler Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-bold">Endpoint URL</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 font-mono">/api/cron</div>
                      <div className="text-[11px] text-slate-500 mt-1">Accepts GET and POST requests</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-bold">Email Briefings</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
                        {settings.userEmail || 'Not configured'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {settings.userEmail ? 'Active for new posts' : 'Set in Settings modal'}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-bold">External Automation</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">Vercel / Curl / Actions</div>
                      <button
                        type="button"
                        onClick={copyCronCurl}
                        className="text-[11px] font-bold text-indigo-600 hover:underline mt-1 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCurl ? 'Copied curl command' : 'Copy curl trigger'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Execution Log */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                      Recent Scheduler Executions
                    </h3>

                    {cronLogs.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {cronLogs.map((log) => (
                          <div key={log.id} className="p-3.5 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-900">{log.postTitle}</span>
                                <span className="text-slate-400 mx-1.5">•</span>
                                <span className="text-slate-500">Day {log.dayNumber}</span>
                                {log.emailSentTo && (
                                  <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                                    Email sent
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {new Date(log.executedAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                        No scheduled runs recorded yet. Click &quot;Run Scheduler Now&quot; above to trigger your first autonomous event!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Strategy View */}
            {activeTab === 'strategy' && (
              <StrategyOverviewCard
                strategy={strategy || generateMockStrategy(activeApp)}
                posts={posts}
                totalExpected={strategy?.blueprint?.length || 7}
                isGeneratingPosts={isGeneratingPosts}
                onViewPosts={() => setActiveTab('posts')}
              />
            )}
          </>
        )}
      </main>

      {/* Generator Modal */}
      {isGeneratorOpen && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-slate-900 my-auto animate-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Marketing Campaign for {activeApp.name}</h3>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Focus Goal
                </label>
                <select
                  value={selectedObjective}
                  onChange={(e) => setSelectedObjective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Product Launch & User Acquisition">🚀 Announce Product & Acquire Users</option>
                  <option value="Customer Problem & Solution">🎯 Explain Customer Problems & Solutions</option>
                  <option value="Key Feature Deep-Dive">⚡ Showcase Main Features</option>
                  <option value="Founder Story & Journey">📖 Share Behind-the-Scenes Founder Story</option>
                  <option value="Actionable Industry Tips">💡 Share Helpful Industry Tips</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGeneratorOpen(false);
                    startStrategyFirstGeneration(activeApp, selectedObjective);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Campaign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
        onSaveSettings={(s) => {
          setSettings(s);
          saveUserSettings(s);
          showNotification('Settings saved!');
        }}
        onResetAllData={async () => {
          await clearAllStoredData();
          setApps([]);
          setActiveApp(null);
          setPosts([]);
          setSelectedPost(null);
          setStrategy(null);
          setCronLogs([]);
          showNotification('All data cleared!');
        }}
      />
    </div>
  );
}
