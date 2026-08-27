-- =========================================================
-- AI AGENT MARKETING PLATFORM - SUPABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor (supabase.com)
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Apps / Products Table
create table if not exists public.apps (
    id text primary key,
    name text not null,
    tagline text,
    description text,
    website_url text,
    target_audience text,
    pain_points jsonb default '[]'::jsonb,
    key_features jsonb default '[]'::jsonb,
    tone_of_voice text default 'bold',
    primary_color text default '#6366f1',
    accent_color text default '#ec4899',
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Campaigns Table
create table if not exists public.campaigns (
    id text primary key,
    app_id text references public.apps(id) on delete cascade,
    name text not null,
    objective text,
    duration_days integer default 14,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Scheduled / Generated Posts Table
create table if not exists public.posts (
    id text primary key,
    app_id text references public.apps(id) on delete cascade,
    campaign_id text references public.campaigns(id) on delete cascade,
    title text not null,
    pillar text not null,
    day_number integer,
    scheduled_for text,
    status text default 'scheduled', -- 'draft', 'scheduled', 'ready', 'published'
    linkedin jsonb not null,
    instagram jsonb not null,
    graphic_banner jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.apps enable row level security;
alter table public.campaigns enable row level security;
alter table public.posts enable row level security;

-- Simple public access policies for free MVP usage
create policy "Allow all actions on apps" on public.apps for all using (true) with check (true);
create policy "Allow all actions on campaigns" on public.campaigns for all using (true) with check (true);
create policy "Allow all actions on posts" on public.posts for all using (true) with check (true);
