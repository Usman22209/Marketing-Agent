'use client';

import React, { useState } from 'react';
import { AppProfile, PostContent } from '@/types';
import { Copy, Check, ChevronLeft, ChevronRight, Sparkles, Edit3, Mail, Loader2 } from 'lucide-react';
import { BrandedGraphicCanvas } from './BrandedGraphicCanvas';

interface InstagramPreviewCardProps {
  app: AppProfile;
  post: PostContent;
  onUpdatePost: (updatedPost: PostContent) => void;
  onRefineWithAI?: (instruction: string) => Promise<void>;
  isRefining?: boolean;
  userEmail?: string;
}

export const InstagramPreviewCard: React.FC<InstagramPreviewCardProps> = ({
  app,
  post,
  onUpdatePost,
  onRefineWithAI,
  isRefining = false,
  userEmail = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.instagram.caption);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const slides = post.instagram?.carouselSlides || [];
  const totalSlides = slides.length > 0 ? slides.length : 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedCaption : post.instagram.fullFormattedCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveEdit = () => {
    onUpdatePost({
      ...post,
      instagram: {
        ...post.instagram,
        caption: editedCaption,
        fullFormattedCaption: editedCaption,
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

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column: Instagram Caption */}
      <div className="md:col-span-7 space-y-4">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Instagram Caption</h3>
            <p className="text-xs text-slate-500">Ready to copy and paste to Instagram</p>
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
              onClick={() => {
                if (isEditing) {
                  setEditedCaption(post.instagram.caption);
                }
                setIsEditing(!isEditing);
              }}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              {isEditing ? 'Cancel' : 'Edit Caption'}
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all shadow-sm active:scale-95 ${
                copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : '📋 Copy Caption'}</span>
            </button>
          </div>
        </div>

        {/* Caption Text Box */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                rows={10}
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
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
            <>
              <div className="text-sm sm:text-base leading-relaxed text-slate-800 font-sans whitespace-pre-line select-text">
                {post.instagram.caption}
              </div>

              {post.instagram.hashtags.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-semibold text-indigo-600">
                  {post.instagram.hashtags.map((tag, idx) => (
                    <span key={idx}>{tag}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Rewrite Options */}
        {onRefineWithAI && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="shrink-0">Rewrite with AI:</span>
            <button
              disabled={isRefining}
              onClick={() => onRefineWithAI('Make this Instagram caption shorter with friendly emojis')}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 disabled:opacity-50 transition-colors"
            >
              Add Emojis
            </button>
            <button
              disabled={isRefining}
              onClick={() => onRefineWithAI('Make the caption more engaging with a stronger call to action')}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 disabled:opacity-50 transition-colors"
            >
              Stronger CTA
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Carousel Slide & Picture */}
      <div className="md:col-span-5 space-y-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between font-bold text-slate-900 text-base mb-3">
            <span>Slide {activeSlide + 1} of {totalSlides}</span>
            {totalSlides > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4 inline" /> Prev
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Next <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            )}
          </div>

          {/* Slide dots */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-1.5 mb-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeSlide
                      ? 'bg-indigo-600 w-4'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}

          <BrandedGraphicCanvas app={app} post={post} slideIndex={activeSlide} />
        </div>
      </div>
    </div>
  );
};
