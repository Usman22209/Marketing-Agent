import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { app, campaign, posts, customSupabaseUrl, customAnonKey } = body;

    const supabaseUrl = customSupabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = customAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Supabase Server Sync] Missing Supabase URL or Anon Key');
      return NextResponse.json(
        { success: false, error: 'Supabase URL or Anon Key is missing in .env.local' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log(`[Supabase Server Sync] Connected to: ${supabaseUrl}`);

    // 1. Sync App
    if (app) {
      console.log(`[Supabase Server Sync] Upserting App: ${app.name} (${app.id})`);
      const { error: appErr } = await supabase.from('apps').upsert({
        id: app.id,
        name: app.name,
        tagline: app.tagline || '',
        description: app.description || '',
        website_url: app.websiteUrl || '',
        target_audience: app.targetAudience || '',
        pain_points: app.painPoints || [],
        key_features: app.keyFeatures || [],
        tone_of_voice: app.toneOfVoice || 'bold',
        primary_color: app.primaryColor || '#6366f1',
        accent_color: app.accentColor || '#ec4899',
        logo_url: app.logoUrl || null,
        updated_at: new Date().toISOString(),
      });

      if (appErr) {
        console.error('[Supabase Server Sync] App upsert error:', appErr);
        return NextResponse.json({ success: false, step: 'app', error: appErr.message, details: appErr }, { status: 500 });
      }
    }

    // 2. Sync Campaign
    if (campaign) {
      console.log(`[Supabase Server Sync] Upserting Campaign: ${campaign.name} (${campaign.id}) for App: ${campaign.appId}`);
      const { error: campErr } = await supabase.from('campaigns').upsert({
        id: campaign.id,
        app_id: campaign.appId,
        name: campaign.name,
        objective: campaign.objective || 'Product Launch & User Acquisition',
        duration_days: campaign.durationDays || 14,
      });

      if (campErr) {
        console.error('[Supabase Server Sync] Campaign upsert error:', campErr);
        return NextResponse.json({ success: false, step: 'campaign', error: campErr.message, details: campErr }, { status: 500 });
      }
    }

    // 3. Sync Posts
    const postsToSync = posts || campaign?.posts || [];
    let syncedPostsCount = 0;

    if (postsToSync.length > 0) {
      console.log(`[Supabase Server Sync] Upserting ${postsToSync.length} Posts for Campaign: ${campaign?.id || postsToSync[0].campaign_id}`);
      const postRows = postsToSync.map((p: any) => ({
        id: p.id,
        app_id: p.appId || p.app_id || app?.id,
        campaign_id: campaign?.id || p.campaign_id || `campaign-${p.appId || app?.id}`,
        title: p.title || 'Untitled Post',
        pillar: p.pillar || 'pain_solution',
        day_number: p.dayNumber || p.day_number || 1,
        scheduled_for: p.scheduledFor || p.scheduled_for || `Day ${p.dayNumber || 1}`,
        status: p.status || 'ready',
        linkedin: p.linkedin || {},
        instagram: {
          ...(p.instagram || {}),
          generatedImageUrl: p.generatedImageUrl || p.instagram?.generatedImageUrl || '',
        },
        graphic_banner: p.graphicBanner || p.graphic_banner || {},
        updated_at: new Date().toISOString(),
      }));

      const { error: postErr } = await supabase.from('posts').upsert(postRows);
      if (postErr) {
        console.error('[Supabase Server Sync] Posts upsert error:', postErr);
        return NextResponse.json({ success: false, step: 'posts', error: postErr.message, details: postErr }, { status: 500 });
      }

      syncedPostsCount = postRows.length;
      console.log(`[Supabase Server Sync] ✅ Successfully upserted ${syncedPostsCount} posts!`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced app, campaign, and ${syncedPostsCount} posts to Supabase!`,
      syncedPosts: syncedPostsCount,
    });
  } catch (err: any) {
    console.error('[Supabase Server Sync] Unexpected error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server sync failed' }, { status: 500 });
  }
}
