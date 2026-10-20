'use client';

import React, { useState, useEffect } from 'react';
import { AppProfile } from '@/types';
import { X, Sparkles, Wand2 } from 'lucide-react';

interface AppFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: AppProfile) => void;
  initialApp?: AppProfile | null;
}

const COLOR_PRESETS = ['#4f46e5', '#2563eb', '#0284c7', '#059669', '#d97706', '#dc2626', '#db2777', '#7c3aed'];

const SAMPLE_PRESET: Partial<AppProfile> = {
  name: 'Pulse AI',
  tagline: 'Turn Customer Feedback into High-Converting Roadmaps',
  description: 'Pulse AI analyzes support tickets and user reviews to surface the top features users are asking for.',
  targetAudience: 'SaaS Founders, Product Managers & Growth Teams',
  painPoints: [
    'Spending 10+ hours a week reading through scattered support tickets',
    'Building features nobody uses due to inaccurate feedback tracking',
    'Slow product iteration cycles losing ground to competitors',
  ],
  keyFeatures: [
    'AI Feedback Clustering',
    '1-Click Feature Priority Scoring',
    'Automated Public Changelog Generator',
  ],
  toneOfVoice: 'bold',
  primaryColor: '#4f46e5',
  accentColor: '#06b6d4',
};

export const AppFormModal: React.FC<AppFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialApp,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState<AppProfile['toneOfVoice']>('bold');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  useEffect(() => {
    if (initialApp) {
      setName(initialApp.name || '');
      setTagline(initialApp.tagline || '');
      setDescription(initialApp.description || '');
      setTargetAudience(initialApp.targetAudience || '');
      setToneOfVoice(initialApp.toneOfVoice || 'bold');
      setPrimaryColor(initialApp.primaryColor || '#4f46e5');
    } else {
      setName('');
      setTagline('');
      setDescription('');
      setTargetAudience('');
      setToneOfVoice('bold');
      setPrimaryColor('#4f46e5');
    }
  }, [initialApp, isOpen]);

  if (!isOpen) return null;

  const handleAutofillExample = () => {
    setName(SAMPLE_PRESET.name || '');
    setTagline(SAMPLE_PRESET.tagline || '');
    setDescription(SAMPLE_PRESET.description || '');
    setTargetAudience(SAMPLE_PRESET.targetAudience || '');
    setToneOfVoice(SAMPLE_PRESET.toneOfVoice || 'bold');
    setPrimaryColor(SAMPLE_PRESET.primaryColor || '#4f46e5');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedApp: AppProfile = {
      id: initialApp?.id || `app-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'Modern Product & Innovation',
      description: description.trim() || 'A high-impact tool built to save you time and solve key bottlenecks.',
      websiteUrl: initialApp?.websiteUrl || '',
      targetAudience: targetAudience.trim() || 'High-growth founders and digital innovators',
      painPoints: initialApp?.painPoints && initialApp.painPoints.length > 0
        ? initialApp.painPoints
        : ['Manual, tedious tasks taking up too much time', 'Slow workflow execution', 'Complicated alternatives'],
      keyFeatures: initialApp?.keyFeatures && initialApp.keyFeatures.length > 0
        ? initialApp.keyFeatures
        : ['Smart AI Automation', 'Clean & Intuitive Interface', 'Instant Results'],
      toneOfVoice,
      primaryColor,
      accentColor: initialApp?.accentColor || '#ec4899',
      createdAt: initialApp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 text-slate-900 my-auto animate-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {initialApp ? 'Edit Product Details' : 'Add Your Product'}
              </h3>
              <p className="text-xs text-slate-500">Provide basic info to generate marketing campaigns</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autofill Example Helper */}
        {!initialApp && (
          <div className="mt-3 flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-600">Want to see how it works instantly?</span>
            <button
              type="button"
              onClick={handleAutofillExample}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-white text-indigo-600 border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Fill Example</span>
            </button>
          </div>
        )}

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product / Brand Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pulse AI"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              One-Sentence Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Turn Customer Feedback into High-Converting Roadmaps"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              What does it do? (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Pulse AI analyzes support tickets to spot top features users want."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Audience (Who is it for?)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. SaaS Founders, Product Managers, Freelancers"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tone of Voice
              </label>
              <select
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
              >
                <option value="bold">Bold & Direct</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty & Energetic</option>
                <option value="educational">Educational & Value</option>
                <option value="storyteller">Storyteller</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPrimaryColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      primaryColor === color ? 'scale-120 ring-2 ring-offset-2 ring-slate-900' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
            >
              {initialApp ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
