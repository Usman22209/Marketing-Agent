'use client';

import React, { useState } from 'react';
import { AppProfile } from '@/types';
import {
  X,
  Sparkles,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Code2,
  Copy,
  FileCode,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AppFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: AppProfile) => void;
  initialApp?: AppProfile | null;
}

// ─── SAMPLE JSON TEMPLATE ───
const SAMPLE_JSON_TEMPLATE = `{
  "name": "Pulse AI",
  "tagline": "Turn Customer Feedback into High-Converting Product Roadmaps",
  "description": "Pulse AI analyzes support tickets, reviews, and community feedback to spot the top features users want.",
  "websiteUrl": "https://pulseai.app",
  "targetAudience": "SaaS Founders, Product Managers & Growth Leads",
  "painPoints": [
    "Spending 10+ hours a week reading scattered customer tickets",
    "Building features nobody uses due to inaccurate feedback tracking",
    "Slow iteration cycles losing ground to competitors"
  ],
  "keyFeatures": [
    "AI Feedback Sentiment Clustering",
    "1-Click Feature Priority Scoring",
    "Automated Public Changelog Generator"
  ],
  "toneOfVoice": "bold",
  "primaryColor": "#4f46e5",
  "accentColor": "#06b6d4"
}`;

// ─── QUICK PRESETS FOR INSTANT AUTOFILL / TESTING ───
const EXAMPLE_PRESETS = [
  {
    label: '🚀 AI SaaS Tool',
    name: 'Pulse AI',
    tagline: 'Turn Customer Feedback into High-Converting Product Roadmaps',
    description: 'Pulse AI analyzes support tickets, user reviews, and Discord feedback to spot the top 3 features your users are begging for.',
    websiteUrl: 'https://pulseai.app',
    targetAudience: 'SaaS Founders, Product Managers & Growth Leads',
    painPoints: [
      'Spending 10+ hours a week reading through scattered customer tickets',
      'Building features nobody uses because of inaccurate feedback tracking',
      'Slow product iteration cycles losing ground to competitors',
    ],
    keyFeatures: [
      'AI Feedback Sentiment Clustering',
      '1-Click Feature Priority Scoring',
      'Automated Public Changelog Generator',
    ],
    toneOfVoice: 'bold' as const,
    primaryColor: '#4f46e5',
    accentColor: '#06b6d4',
  },
  {
    label: '💻 Developer Assistant',
    name: 'DevFlow AI',
    tagline: 'Autonomous AI Code Review & Sprint Assistant for GitHub',
    description: 'DevFlow AI connects to your GitHub repositories, analyzes PRs in seconds, spots edge-case bugs, and drafts clean release notes.',
    websiteUrl: 'https://devflow.ai',
    targetAudience: 'Software Engineers, Tech Leads & Startup CTOs',
    painPoints: [
      'Spending 5+ hours every sprint reviewing long pull requests',
      'Subtle regression bugs slipping into production',
      'Writing manual release notes and changelogs',
    ],
    keyFeatures: [
      'Instant AI PR Review with inline feedback',
      'Automatic Test Generation for edge cases',
      'One-click GitHub Action integration',
    ],
    toneOfVoice: 'bold' as const,
    primaryColor: '#6366f1',
    accentColor: '#ec4899',
  },
  {
    label: '✨ Creator Studio',
    name: 'VividStudio',
    tagline: 'Repurpose Long Podcasts & Videos into 10 Viral Shorts in 60s',
    description: 'VividStudio uses AI to find the best hooks in your long-form video, add animated captions, and reformat for TikTok and Reels.',
    websiteUrl: 'https://vividstudio.co',
    targetAudience: 'Content Creators, Podcasters & Agency Owners',
    painPoints: [
      'Hours spent manually editing vertical video clips',
      'Inconsistent posting schedules killing organic channel reach',
      'Expensive video editors charging $100+ per short',
    ],
    keyFeatures: [
      'AI Virality Hook Detector',
      'Auto Animated Subtitles & B-Roll',
      '1-Click Multi-Platform Export',
    ],
    toneOfVoice: 'witty' as const,
    primaryColor: '#ec4899',
    accentColor: '#f59e0b',
  },
];

// ─── CLICKABLE SUGGESTION CHIPS ───
const SUGGESTED_PAIN_POINTS = [
  'Spending 10+ hours a week on manual tasks',
  'Low conversion rates & high user churn',
  'Expensive bloated enterprise software',
  'Inconsistent social media & marketing output',
  'Too complex for non-technical team members',
  'Slow turnaround times blocking growth',
];

const SUGGESTED_FEATURES = [
  'AI Fast Automation Engine',
  '1-Click Multi-Channel Copy & Scheduling',
  'Real-Time Analytics Dashboard',
  'Branded Graphic & Video Generator',
  'Instant 1-Click Cloud Integration',
  'Automated Email & Slack Alerts',
];

const SUGGESTED_AUDIENCES = [
  'Startup Founders & Indie Hackers',
  'Software Engineers & Tech Leads',
  'Growth Marketers & Content Creators',
  'Freelancers, Agencies & Solopreneurs',
  'B2B Operations & Sales Teams',
];

// ─── TONE OF VOICE CARDS ───
const TONE_OPTIONS: { id: AppProfile['toneOfVoice']; emoji: string; title: string; subtitle: string }[] = [
  { id: 'bold', emoji: '🔥', title: 'Bold & Direct', subtitle: 'Punchy hooks that challenge industry norms' },
  { id: 'professional', emoji: '💼', title: 'Professional', subtitle: 'Polished authority for B2B & enterprise' },
  { id: 'witty', emoji: '✨', title: 'Casual & Relatable', subtitle: 'Engaging, friendly founder voice for creators' },
  { id: 'educational', emoji: '📚', title: 'Actionable Advice', subtitle: 'Step-by-step value, frameworks & tips' },
  { id: 'storyteller', emoji: '📖', title: 'Founder Story', subtitle: 'Authentic behind-the-scenes building journey' },
];

// ─── COLOR PALETTE PRESETS ───
const PALETTE_PRESETS = [
  { name: 'Indigo Modern', primary: '#4f46e5', accent: '#06b6d4' },
  { name: 'Electric Violet', primary: '#7c3aed', accent: '#ec4899' },
  { name: 'Emerald Growth', primary: '#059669', accent: '#10b981' },
  { name: 'Sunset Coral', primary: '#e11d48', accent: '#f59e0b' },
  { name: 'Cyberpunk Navy', primary: '#0f172a', accent: '#6366f1' },
];

export const AppFormModal: React.FC<AppFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialApp,
}) => {
  // Mode: 'wizard' vs 'json'
  const [inputMode, setInputMode] = useState<'wizard' | 'json'>('wizard');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState(initialApp?.name || '');
  const [tagline, setTagline] = useState(initialApp?.tagline || '');
  const [description, setDescription] = useState(initialApp?.description || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialApp?.websiteUrl || '');
  const [targetAudience, setTargetAudience] = useState(initialApp?.targetAudience || '');
  const [toneOfVoice, setToneOfVoice] = useState<AppProfile['toneOfVoice']>(initialApp?.toneOfVoice || 'bold');
  const [primaryColor, setPrimaryColor] = useState(initialApp?.primaryColor || '#4f46e5');
  const [accentColor, setAccentColor] = useState(initialApp?.accentColor || '#06b6d4');

  const [painPoints, setPainPoints] = useState<string[]>(
    initialApp?.painPoints || ['Spending 10+ hours a week on manual tasks', 'Low conversion rates & slow growth']
  );
  const [newPainPoint, setNewPainPoint] = useState('');

  const [keyFeatures, setKeyFeatures] = useState<string[]>(
    initialApp?.keyFeatures || ['AI Fast Automation Engine', '1-Click Multi-Channel Copy']
  );
  const [newFeature, setNewFeature] = useState('');

  // JSON Input State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof EXAMPLE_PRESETS[0]) => {
    setName(preset.name);
    setTagline(preset.tagline);
    setDescription(preset.description);
    setWebsiteUrl(preset.websiteUrl);
    setTargetAudience(preset.targetAudience);
    setPainPoints(preset.painPoints);
    setKeyFeatures(preset.keyFeatures);
    setToneOfVoice(preset.toneOfVoice);
    setPrimaryColor(preset.primaryColor);
    setAccentColor(preset.accentColor);
  };

  const handleAddPainPoint = (text?: string) => {
    const val = (text || newPainPoint).trim();
    if (val && !painPoints.includes(val)) {
      setPainPoints([...painPoints, val]);
      if (!text) setNewPainPoint('');
    }
  };

  const handleRemovePainPoint = (idx: number) => {
    setPainPoints(painPoints.filter((_, i) => i !== idx));
  };

  const handleAddFeature = (text?: string) => {
    const val = (text || newFeature).trim();
    if (val && !keyFeatures.includes(val)) {
      setKeyFeatures([...keyFeatures, val]);
      if (!text) setNewFeature('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== idx));
  };

  // ─── JSON IMPORT LOGIC ───
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_JSON_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleApplyJSON = (andSubmit: boolean = false) => {
    setJsonError(null);
    if (!jsonInput.trim()) {
      setJsonError('Please paste your JSON structure into the box.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Missing required field: "name" (string)');
      }

      const parsedApp: AppProfile = {
        id: initialApp?.id || `app-${Date.now()}`,
        name: parsed.name.trim(),
        tagline: parsed.tagline?.trim() || 'AI-Powered Growth Engine',
        description: parsed.description?.trim() || `${parsed.name} helps users automate tasks and scale faster.`,
        websiteUrl: parsed.websiteUrl?.trim() || 'https://yourproduct.com',
        targetAudience: parsed.targetAudience?.trim() || 'Founders, Creators & Software Engineers',
        painPoints: Array.isArray(parsed.painPoints) && parsed.painPoints.length > 0
          ? parsed.painPoints
          : ['Manual repetitive tasks and wasted hours'],
        keyFeatures: Array.isArray(parsed.keyFeatures) && parsed.keyFeatures.length > 0
          ? parsed.keyFeatures
          : ['AI Fast Automation', '1-Click Multi-Channel Copy'],
        toneOfVoice: (['bold', 'professional', 'witty', 'educational', 'storyteller'].includes(parsed.toneOfVoice)
          ? parsed.toneOfVoice
          : 'bold') as AppProfile['toneOfVoice'],
        primaryColor: parsed.primaryColor || '#4f46e5',
        accentColor: parsed.accentColor || '#06b6d4',
        createdAt: initialApp?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Populate form state
      setName(parsedApp.name);
      setTagline(parsedApp.tagline);
      setDescription(parsedApp.description);
      setWebsiteUrl(parsedApp.websiteUrl);
      setTargetAudience(parsedApp.targetAudience);
      setPainPoints(parsedApp.painPoints);
      setKeyFeatures(parsedApp.keyFeatures);
      setToneOfVoice(parsedApp.toneOfVoice);
      setPrimaryColor(parsedApp.primaryColor);
      setAccentColor(parsedApp.accentColor);

      if (andSubmit) {
        onSave(parsedApp);
        onClose();
      } else {
        setInputMode('wizard');
        setCurrentStep(1);
      }
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err?.message || 'Please check syntax'}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'json') {
      handleApplyJSON(true);
      return;
    }

    if (!name.trim()) {
      setCurrentStep(1);
      return;
    }

    const newApp: AppProfile = {
      id: initialApp?.id || `app-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'AI-Powered Growth Engine',
      description: description.trim() || `${name.trim()} helps users automate tasks and scale faster.`,
      websiteUrl: websiteUrl.trim() || 'https://yourproduct.com',
      targetAudience: targetAudience.trim() || 'Founders, Creators & Software Engineers',
      painPoints: painPoints.length > 0 ? painPoints : ['Manual repetitive work and wasted hours'],
      keyFeatures: keyFeatures.length > 0 ? keyFeatures : ['AI Fast Automation', '1-Click Multi-Channel Copy'],
      toneOfVoice,
      primaryColor,
      accentColor,
      createdAt: initialApp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl my-6 text-slate-900 font-sans overflow-hidden flex flex-col max-h-[90vh] animate-in">
        {/* ─── MODAL HEADER WITH MODE TOGGLE ─── */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {initialApp ? 'Edit Product Profile' : 'Add Your Product'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {inputMode === 'wizard' ? `Step ${currentStep} of 3 • Guided Setup` : '⚡ Instant JSON Import Mode'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setInputMode('wizard')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'wizard'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Guided Form
              </button>
              <button
                type="button"
                onClick={() => setInputMode('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'json'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── STEP PROGRESS TABS (Only in Wizard Mode) ─── */}
        {inputMode === 'wizard' && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            {[
              { step: 1, title: '1. Basics', desc: 'Name & Pitch' },
              { step: 2, title: '2. Audience & Features', desc: 'Pain Points & Superpowers' },
              { step: 3, title: '3. Tone & Brand', desc: 'Voice & Colors' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step as any)}
                className={`flex-1 flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                  currentStep === s.step
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200 font-extrabold'
                    : currentStep > s.step
                      ? 'text-emerald-700 font-bold hover:bg-white/60'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${
                    currentStep === s.step
                      ? 'bg-indigo-600 text-white'
                      : currentStep > s.step
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs leading-none">{s.title}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ─── MODAL BODY ─── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ═══════════════════════════════════════════ */}
          {/* MODE: JSON IMPORT                           */}
          {/* ═══════════════════════════════════════════ */}
          {inputMode === 'json' && (
            <div className="space-y-4 animate-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    Paste Product JSON
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste your structured product details below to import instantly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  {copiedTemplate ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied Template!' : 'Copy Sample Template'}</span>
                </button>
              </div>

              {/* JSON Editor Textarea */}
              <div className="relative">
                <textarea
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError(null);
                  }}
                  placeholder={`{\n  "name": "Your Product",\n  "tagline": "One-sentence pitch",\n  "targetAudience": "Founders, Developers",\n  "painPoints": ["Manual repetitive tasks"],\n  "keyFeatures": ["AI Automation"],\n  "toneOfVoice": "bold",\n  "primaryColor": "#4f46e5",\n  "accentColor": "#06b6d4"\n}`}
                  className="w-full bg-slate-900 text-indigo-100 font-mono text-xs p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                  spellCheck={false}
                />
              </div>

              {/* Error Message */}
              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{jsonError}</span>
                </div>
              )}

              {/* Required Schema Reference Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-extrabold text-slate-800">
                  📋 JSON Schema Structure Reference:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-600 font-mono">
                  <div>• <strong className="text-slate-900">name</strong> (string, required)</div>
                  <div>• <strong className="text-slate-900">tagline</strong> (string)</div>
                  <div>• <strong className="text-slate-900">description</strong> (string)</div>
                  <div>• <strong className="text-slate-900">websiteUrl</strong> (string)</div>
                  <div>• <strong className="text-slate-900">targetAudience</strong> (string)</div>
                  <div>• <strong className="text-slate-900">toneOfVoice</strong> (&quot;bold&quot; | &quot;professional&quot; | &quot;witty&quot; | &quot;educational&quot; | &quot;storyteller&quot;)</div>
                  <div>• <strong className="text-slate-900">painPoints</strong> (string[])</div>
                  <div>• <strong className="text-slate-900">keyFeatures</strong> (string[])</div>
                  <div>• <strong className="text-slate-900">primaryColor</strong> (hex string, e.g. #4f46e5)</div>
                  <div>• <strong className="text-slate-900">accentColor</strong> (hex string, e.g. #06b6d4)</div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* MODE: WIZARD STEP 1 - BASICS                */}
          {/* ═══════════════════════════════════════════ */}
          {inputMode === 'wizard' && currentStep === 1 && (
            <div className="space-y-4 animate-in">
              {/* Quick Preset Buttons */}
              {!initialApp && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                      Try an Example Preset (1-Click Auto-Fill):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 text-xs font-bold transition-all shadow-2xs active:scale-95"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Product / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pulse AI, DevFlow"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Website or App URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourproduct.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  One-Sentence Pitch / Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Turn Customer Feedback into High-Converting Product Roadmaps"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Short Product Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what your product does and how it saves your customers time or money."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* MODE: WIZARD STEP 2 - AUDIENCE & FEATURES   */}
          {/* ═══════════════════════════════════════════ */}
          {inputMode === 'wizard' && currentStep === 2 && (
            <div className="space-y-5 animate-in">
              {/* Target Audience */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  Who is your target audience?
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. SaaS Founders, Product Managers & Growth Leads"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                {/* Audience Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Suggestions:</span>
                  {SUGGESTED_AUDIENCES.map((aud, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTargetAudience(aud)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-medium text-slate-600 transition-colors"
                    >
                      + {aud}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Pain Points */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    Customer Pain Points (What frustrates them daily?)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Add 2-4 items</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPainPoint}
                    onChange={(e) => setNewPainPoint(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPainPoint())}
                    placeholder="Type a pain point and press Enter..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPainPoint()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Pain Points Tags */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                  {painPoints.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-2xs"
                    >
                      <span>❌ {p}</span>
                      <button type="button" onClick={() => handleRemovePainPoint(idx)}>
                        <X className="w-3.5 h-3.5 hover:text-rose-900" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Pain Points Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Add:</span>
                  {SUGGESTED_PAIN_POINTS.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPainPoint(sp)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-[11px] font-medium text-slate-600 transition-colors"
                    >
                      + {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    Key Features & Superpowers (How you solve it)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Add 2-4 items</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Type a feature and press Enter..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFeature()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Features Tags */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                  {keyFeatures.map((f, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs"
                    >
                      <span>⚡ {f}</span>
                      <button type="button" onClick={() => handleRemoveFeature(idx)}>
                        <X className="w-3.5 h-3.5 hover:text-emerald-900" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Feature Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Add:</span>
                  {SUGGESTED_FEATURES.map((sf, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddFeature(sf)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-medium text-slate-600 transition-colors"
                    >
                      + {sf}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* MODE: WIZARD STEP 3 - TONE & BRANDING       */}
          {/* ═══════════════════════════════════════════ */}
          {inputMode === 'wizard' && currentStep === 3 && (
            <div className="space-y-5 animate-in">
              {/* Visual Tone Selector Cards */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Choose Your Tone of Voice
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TONE_OPTIONS.map((opt) => {
                    const isSelected = toneOfVoice === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setToneOfVoice(opt.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl shrink-0 mt-0.5">{opt.emoji}</div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">{opt.title}</div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{opt.subtitle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brand Colors & Palette Presets */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    Brand Color Palette (Used in generated graphics)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">1080x1080 canvas styling</span>
                </div>

                {/* 1-Click Palette Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PALETTE_PRESETS.map((pal, idx) => {
                    const isSelected = primaryColor === pal.primary && accentColor === pal.accent;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(pal.primary);
                          setAccentColor(pal.accent);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex -space-x-1 shrink-0">
                          <div
                            className="w-4 h-4 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: pal.accent }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 truncate">{pal.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0 bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Primary Color</div>
                      <div className="text-[11px] text-slate-500 font-mono font-bold">{primaryColor}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0 bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Accent Color</div>
                      <div className="text-[11px] text-slate-500 font-mono font-bold">{accentColor}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* ─── MODAL FOOTER ─── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {inputMode === 'json' ? (
            <>
              <button
                type="button"
                onClick={() => setInputMode('wizard')}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors"
              >
                Switch to Guided Form
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyJSON(false)}
                  className="px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
                >
                  Load into Form
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyJSON(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Import & Formulate Strategy</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}

              <div className="flex items-center gap-2">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim()) {
                        alert('Please enter a product name first.');
                        return;
                      }
                      setCurrentStep((currentStep + 1) as any);
                    }}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{initialApp ? 'Save Changes' : 'Create & Formulate Strategy'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
