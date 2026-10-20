'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AppProfile, PostContent } from '@/types';
import {
  Download,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Maximize2,
  Check,
  Copy,
  Wand2,
} from 'lucide-react';

interface BrandedGraphicCanvasProps {
  app: AppProfile;
  post: PostContent;
  slideIndex?: number;
}

export const BrandedGraphicCanvas: React.FC<BrandedGraphicCanvasProps> = ({
  app,
  post,
  slideIndex = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait'>('square');
  const [viewMode, setViewMode] = useState<'canvas' | 'ai-image'>('ai-image');

  // AI Image State - initialized from pre-rendered image
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(post.generatedImageUrl || null);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Sync when post changes
  useEffect(() => {
    if (post.generatedImageUrl) {
      setAiImageUrl(post.generatedImageUrl);
    } else if (!aiImageUrl && !isGeneratingAiImage) {
      handleGenerateAiArt();
    }
  }, [post.id, post.generatedImageUrl]);

  const activeSlide = post.instagram?.carouselSlides?.[slideIndex];
  const headline = activeSlide?.headline || post.graphicBanner?.headline || post.title || app.name;
  const subtext = activeSlide?.bodyText || post.graphicBanner?.subheadline || app.tagline;
  const badge = activeSlide?.badge || post.graphicBanner?.badge || `${app.name.toUpperCase()}`;
  const visualPrompt = activeSlide?.visualPrompt || post.instagram?.visualPrompt || `Vibrant commercial visual for ${app.name}`;

  // ─── CANVAS DRAWING ENGINE ───
  const drawGraphic = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = aspectRatio === 'square' ? 1080 : 1350;
    canvas.width = width;
    canvas.height = height;

    const primaryColor = app.primaryColor || '#4f46e5';
    const accentColor = app.accentColor || '#06b6d4';

    // 1. Dark Modern Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a0f1d');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Dual Brand Glow Orbs
    const glow1 = ctx.createRadialGradient(width - 120, 140, 20, width - 120, 140, 520);
    glow1.addColorStop(0, primaryColor + '66');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(140, height - 160, 20, 140, height - 160, 480);
    glow2.addColorStop(0, accentColor + '44');
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Dot Matrix Grid Texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const dotSpacing = 40;
    for (let x = 40; x < width; x += dotSpacing) {
      for (let y = 40; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Glassmorphism Card Container
    const cardX = 70;
    const cardY = 80;
    const cardW = width - 140;
    const cardH = height - 160;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();
    ctx.restore();

    // 5. Pill Badge
    const badgeText = `⚡ ${badge.toUpperCase()}`;
    ctx.font = 'bold 24px Plus Jakarta Sans, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 48;
    const badgeH = 50;
    const badgeX = cardX + 50;
    const badgeY = cardY + 50;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, badgeX + 24, badgeY + 34);
    ctx.restore();

    // 6. Multi-Line Headline with Dynamic Scaling
    ctx.font = 'bold 54px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#ffffff';
    const maxWidth = cardW - 100;
    const words = headline.split(' ');
    let line = '';
    let lineY = cardY + 180;
    const lineHeight = 70;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, cardX + 50, lineY);
        line = words[n] + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, cardX + 50, lineY);

    // 7. Subtext / Insight Box (Glass callout)
    const calloutY = lineY + 40;
    const calloutH = aspectRatio === 'square' ? 180 : 280;
    const calloutW = cardW - 100;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX + 50, calloutY, calloutW, calloutH, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Accent line on callout
    ctx.beginPath();
    ctx.roundRect(cardX + 50, calloutY, 8, calloutH, 4);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.restore();

    // Subtext inside callout
    ctx.font = '30px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    const subWords = subtext.split(' ');
    let subLine = '';
    let subY = calloutY + 55;
    const subLineHeight = 44;

    for (let n = 0; n < subWords.length; n++) {
      const testLine = subLine + subWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > calloutW - 50 && n > 0) {
        ctx.fillText(subLine, cardX + 80, subY);
        subLine = subWords[n] + ' ';
        subY += subLineHeight;
      } else {
        subLine = testLine;
      }
    }
    ctx.fillText(subLine, cardX + 80, subY);

    // 8. Footer (Watermark & Website Domain)
    const footerY = cardY + cardH - 65;

    // Brand Name
    ctx.font = 'bold 26px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(`🚀 ${app.name}`, cardX + 50, footerY);

    // Website Domain
    ctx.font = '500 24px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const cleanUrl = (app.websiteUrl || 'yourproduct.com').replace(/^https?:\/\//, '');
    const urlW = ctx.measureText(cleanUrl).width;
    ctx.fillText(cleanUrl, cardX + cardW - urlW - 50, footerY);
  };

  useEffect(() => {
    if (viewMode === 'canvas') {
      drawGraphic();
    }
  }, [app, post, slideIndex, aspectRatio, viewMode]);

  // ─── DOWNLOAD HANDLER ───
  const handleDownload = () => {
    setDownloading(true);

    if (viewMode === 'ai-image' && aiImageUrl) {
      const link = document.createElement('a');
      link.download = `${app.name.toLowerCase()}-ai-visual-${post.dayNumber}.png`;
      link.href = aiImageUrl;
      link.target = '_blank';
      link.click();
      setTimeout(() => setDownloading(false), 800);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${app.name.toLowerCase()}-post-graphic-day${post.dayNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setTimeout(() => setDownloading(false), 800);
  };

  // ─── AI IMAGE GENERATION HANDLER ───
  const handleGenerateAiArt = async () => {
    setIsGeneratingAiImage(true);
    try {
      const width = 1080;
      const height = aspectRatio === 'square' ? 1080 : 1350;

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: visualPrompt,
          width,
          height,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setAiImageUrl(data.imageUrl);
        setViewMode('ai-image');
      } else {
        throw new Error(data.error || 'Failed AI image generation');
      }
    } catch (err) {
      console.error('AI image generation failed', err);
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-3.5">
      {/* Aspect Ratio & Mode Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
        {/* View Mode: AI Visual vs Typography Card */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (!aiImageUrl) {
                handleGenerateAiArt();
              } else {
                setViewMode('ai-image');
              }
            }}
            disabled={isGeneratingAiImage}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'ai-image'
                ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
            }`}
          >
            {isGeneratingAiImage ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Generated Visual</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('canvas')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'canvas'
                ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Typography Card</span>
          </button>
        </div>

        {/* Ratio Selector */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setAspectRatio('square')}
            className={`px-2 py-1 rounded text-[11px] font-bold ${
              aspectRatio === 'square' ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            1:1
          </button>
          <button
            type="button"
            onClick={() => setAspectRatio('portrait')}
            className={`px-2 py-1 rounded text-[11px] font-bold ${
              aspectRatio === 'portrait' ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            4:5
          </button>
        </div>
      </div>

      {/* Visual Canvas Box */}
      <div
        className={`w-full max-w-[340px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-950 transition-all ${
          aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]'
        }`}
      >
        {viewMode === 'canvas' ? (
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        ) : (
          <div className="relative w-full h-full bg-slate-900 flex items-center justify-center group">
            {aiImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aiImageUrl}
                alt="AI Generated Marketing Visual"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                <span>Generating AI visual...</span>
              </div>
            )}

            {/* Overlay Regenerate Button on Hover */}
            {aiImageUrl && (
              <button
                type="button"
                onClick={handleGenerateAiArt}
                disabled={isGeneratingAiImage}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Regenerate with different seed"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingAiImage ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Image Prompt Disclosure Box */}
      <div className="w-full max-w-[340px] p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-left space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI Visual Prompt
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(visualPrompt);
              setCopiedPrompt(true);
              setTimeout(() => setCopiedPrompt(false), 2000);
            }}
            className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy prompt to clipboard"
          >
            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-[11.5px] text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200/80 select-text">
          &ldquo;{visualPrompt}&rdquo;
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading || isGeneratingAiImage}
        className="w-full max-w-[340px] flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer active:scale-98"
      >
        <Download className="w-4 h-4" />
        <span>
          {downloading
            ? 'Downloading...'
            : viewMode === 'ai-image'
              ? '⬇️ Download AI Visual (8K PNG)'
              : '⬇️ Download Branded Card (PNG)'}
        </span>
      </button>
    </div>
  );
};
