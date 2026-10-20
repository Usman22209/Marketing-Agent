'use client';

import React, { useState } from 'react';
import { AppProfile, PostContent } from '@/types';
import { Copy, Check, Edit3, Sparkles, Mail, Send, Loader2 } from 'lucide-react';
import { BrandedGraphicCanvas } from './BrandedGraphicCanvas';

interface LinkedInPreviewCardProps {
  app: AppProfile;
  post: PostContent;
  onUpdatePost: (updatedPost: PostContent) => void;
  onRefineWithAI?: (instruction: string) => Promise<void>;
  isRefining?: boolean;
  userEmail?: string;
}

export const LinkedInPreviewCard: React.FC<LinkedInPreviewCardProps> = ({
  app,
  post,
  onUpdatePost,
  onRefineWithAI,
  isRefining = false,
  userEmail = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.linkedin.fullFormattedText);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedText : post.linkedin.fullFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveEdit = () => {
    onUpdatePost({
      ...post,
      linkedin: {
        ...post.linkedin,
        fullFormattedText: editedText,
      },
    });
    setIsEditing(false);
  };

  const handleSendToGmail = async () => {
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: userEmail,
          post,
          app,
          imageUrl: post.generatedImageUrl,
        }),
      });

      const data = await res.json();
      if (data.gmailWebUrl) {
        window.open(data.gmailWebUrl, '_blank');
      }
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (err) {
      console.error('Failed to send to Gmail', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column: Post Text */}
      <div className="md:col-span-7 space-y-4">
        {/* Big Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">LinkedIn Post Text</h3>
            <p className="text-xs text-slate-500">Ready to copy and paste to your LinkedIn</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendToGmail}
              disabled={isSendingEmail}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Open or send post briefing in Gmail"
            >
              {isSendingEmail ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : emailSent ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Mail className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>{emailSent ? 'Opened in Gmail!' : '📧 Send to Gmail'}</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              {isEditing ? 'Cancel' : 'Edit Text'}
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all shadow-sm active:scale-95 ${
                copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : '📋 Copy Post Text'}</span>
            </button>
          </div>
        </div>

        {/* Text Container */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                rows={12}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-slate-50 border border-indigo-500 rounded-xl p-3 text-sm text-slate-900 focus:outline-none leading-relaxed font-sans"
              />
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="text-sm sm:text-base leading-relaxed text-slate-800 font-sans whitespace-pre-line select-text">
              {post.linkedin.fullFormattedText}
            </div>
          )}
        </div>

        {/* AI Rewrite Options */}
        {onRefineWithAI && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="shrink-0">Rewrite with AI:</span>
            <button
              disabled={isRefining}
              onClick={() => onRefineWithAI('Make this post shorter and easier to read')}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 disabled:opacity-50 transition-colors"
            >
              Make Shorter
            </button>
            <button
              disabled={isRefining}
              onClick={() => onRefineWithAI('Make the first line hook much more catchy and exciting')}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 disabled:opacity-50 transition-colors"
            >
              Catchier Hook
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Picture & Download */}
      <div className="md:col-span-5 space-y-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
          <div className="w-full text-left font-bold text-slate-900 text-base mb-3">
            Post Picture
          </div>
          <BrandedGraphicCanvas app={app} post={post} />
        </div>
      </div>
    </div>
  );
};
