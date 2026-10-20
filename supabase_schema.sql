-- ==============================================================================
-- 🚀 AUTONOMOUS MARKETING AGENT - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It will create tables for Apps, Campaigns, and Individual Social Posts with full RLS.
-- ==============================================================================

-- 1. APPS TABLE (Stores product profiles)
CREATE TABLE IF NOT EXISTS public.apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    website_url TEXT,
    target_audience TEXT,
    pain_points JSONB DEFAULT '[]'::jsonb,
    key_features JSONB DEFAULT '[]'::jsonb,
    tone_of_voice TEXT DEFAULT 'bold',
    primary_color TEXT DEFAULT '#6366f1',
    accent_color TEXT DEFAULT '#ec4899',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPAIGNS TABLE (Stores 14-day marketing roadmap & strategy plans)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES public.apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT DEFAULT 'Product Launch & User Acquisition',
    duration_days INTEGER DEFAULT 14,
    strategy JSONB DEFAULT '{}'::jsonb,
    posts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POSTS TABLE (Stores individual social posts & AI visuals)
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES public.apps(id) ON DELETE CASCADE,
    campaign_id TEXT,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    pillar TEXT,
    scheduled_for TEXT,
    status TEXT DEFAULT 'ready',
    image_url TEXT,
    ai_model TEXT,
    linkedin_data JSONB DEFAULT '{}'::jsonb,
    instagram_data JSONB DEFAULT '{}'::jsonb,
    graphic_banner JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES FOR FAST QUERYING ───
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.apps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_app_id ON public.campaigns(app_id);
CREATE INDEX IF NOT EXISTS idx_posts_app_id ON public.posts(app_id);
CREATE INDEX IF NOT EXISTS idx_posts_day_number ON public.posts(day_number);

-- ─── ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS ───
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous key read/write for local dashboard operations
DROP POLICY IF EXISTS "Public full access on apps" ON public.apps;
CREATE POLICY "Public full access on apps" ON public.apps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on campaigns" ON public.campaigns;
CREATE POLICY "Public full access on campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on posts" ON public.posts;
CREATE POLICY "Public full access on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
