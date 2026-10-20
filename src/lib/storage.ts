import { AppProfile, CampaignRoadmap, CronExecutionLog, PostContent, UserSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  APPS: 'marketing_agent_apps',
  ACTIVE_APP_ID: 'marketing_agent_active_app_id',
  CAMPAIGNS: 'marketing_agent_campaigns',
  POSTS: 'marketing_agent_posts',
  SETTINGS: 'marketing_agent_settings',
  CRON_LOGS: 'marketing_agent_cron_logs',
};

// Local storage helpers
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

// ─────────────────────────────────────────────────────────────
// 📱 APP PROFILE OPERATIONS
// ─────────────────────────────────────────────────────────────
export async function getStoredApps(): Promise<AppProfile[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .neq('id', 'demo-app-1')
        .neq('name', 'DevFlow AI')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          tagline: d.tagline,
          description: d.description,
          websiteUrl: d.website_url,
          targetAudience: d.target_audience,
          painPoints: Array.isArray(d.pain_points) ? d.pain_points : (typeof d.pain_points === 'string' ? JSON.parse(d.pain_points) : []),
          keyFeatures: Array.isArray(d.key_features) ? d.key_features : (typeof d.key_features === 'string' ? JSON.parse(d.key_features) : []),
          toneOfVoice: d.tone_of_voice || 'bold',
          primaryColor: d.primary_color || '#6366f1',
          accentColor: d.accent_color || '#ec4899',
          logoUrl: d.logo_url,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local storage fallback', err);
    }
  }

  const localApps = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
  const cleanApps = localApps.filter((a) => a.id !== 'demo-app-1' && a.name !== 'DevFlow AI');
  if (cleanApps.length !== localApps.length) {
    setLocal(STORAGE_KEYS.APPS, cleanApps);
    const activeId = getActiveAppId();
    if (activeId === 'demo-app-1') {
      setActiveAppId(cleanApps.length > 0 ? cleanApps[0].id : '');
    }
  }
  return cleanApps;
}

export async function saveAppProfile(app: AppProfile): Promise<AppProfile> {
  // 1. Update local cache
  const existing = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
  const index = existing.findIndex((a) => a.id === app.id);
  const updatedApps = index >= 0
    ? existing.map((a) => (a.id === app.id ? app : a))
    : [app, ...existing];
  
  setLocal(STORAGE_KEYS.APPS, updatedApps);
  setLocal(STORAGE_KEYS.ACTIVE_APP_ID, app.id);

  // 2. Server-side Supabase Sync
  try {
    const res = await fetch('/api/supabase-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app }),
    });
    const result = await res.json();
    if (result.success) {
      console.log('%c[Supabase Sync] ✅ App Saved to Supabase:', 'color: #10b981; font-weight: bold;', app.name);
    } else {
      console.warn('[Supabase Sync] App save notice:', result.error);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Offline/Local mode:', err);
  }

  return app;
}

export async function deleteAppProfile(appId: string): Promise<void> {
  const existing = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
  const filtered = existing.filter((a) => a.id !== appId);
  setLocal(STORAGE_KEYS.APPS, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('posts').delete().eq('app_id', appId);
      await supabase.from('campaigns').delete().eq('app_id', appId);
      await supabase.from('apps').delete().eq('id', appId);
      console.log('%c[Supabase Sync] 🗑️ Deleted app from Supabase:', 'color: #f43f5e;', appId);
    } catch (e) {
      console.warn('Supabase delete failed', e);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 🚀 CAMPAIGN & POST OPERATIONS
// ─────────────────────────────────────────────────────────────
export function getStoredCampaigns(appId: string): CampaignRoadmap[] {
  const allCampaigns = getLocal<CampaignRoadmap[]>(STORAGE_KEYS.CAMPAIGNS, []);
  const matching = allCampaigns.filter((c) => c.appId === appId);
  return matching.sort((a, b) => (b.posts?.length || 0) - (a.posts?.length || 0));
}

export async function fetchCampaignsFromSupabase(appId: string): Promise<CampaignRoadmap[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: campaignData, error: cErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (cErr) {
        console.warn('[Supabase Sync] Campaigns query notice:', cErr.message);
      }

      const { data: postsData, error: pErr } = await supabase
        .from('posts')
        .select('*')
        .eq('app_id', appId)
        .order('day_number', { ascending: true });

      if (pErr) {
        console.warn('[Supabase Sync] Posts query notice:', pErr.message);
      }

      if (campaignData && campaignData.length > 0) {
        const remotePosts: PostContent[] = (postsData || []).map((p) => ({
          id: p.id,
          appId: p.app_id,
          dayNumber: p.day_number,
          title: p.title,
          pillar: p.pillar,
          scheduledFor: p.scheduled_for || `Day ${p.day_number}`,
          status: p.status || 'scheduled',
          generatedImageUrl: p.instagram?.generatedImageUrl || '',
          aiModelUsed: 'Gemini AI',
          linkedin: p.linkedin || {},
          instagram: p.instagram || {},
          graphicBanner: p.graphic_banner || {},
          createdAt: p.created_at,
        }));

        const remoteCampaigns: CampaignRoadmap[] = campaignData.map((c) => ({
          id: c.id,
          appId: c.app_id,
          name: c.name,
          objective: c.objective || 'Product Launch & User Acquisition',
          durationDays: c.duration_days || 14,
          createdAt: c.created_at,
          posts: remotePosts.filter((p) => p.appId === c.app_id),
        }));

        console.log(`%c[Supabase Sync] 📥 Loaded from Supabase: ${remoteCampaigns.length} campaigns, ${remotePosts.length} posts`, 'color: #3b82f6;');

        // Merge into local cache
        const allLocal = getLocal<CampaignRoadmap[]>(STORAGE_KEYS.CAMPAIGNS, []);
        const filtered = allLocal.filter((c) => c.appId !== appId);
        setLocal(STORAGE_KEYS.CAMPAIGNS, [...remoteCampaigns, ...filtered]);

        return remoteCampaigns;
      }
    } catch (e) {
      console.warn('Supabase fetch campaigns failed', e);
    }
  }

  return getStoredCampaigns(appId);
}

export async function saveCampaign(campaign: CampaignRoadmap): Promise<void> {
  // 1. Update local cache immediately
  const allCampaigns = getLocal<CampaignRoadmap[]>(STORAGE_KEYS.CAMPAIGNS, []);
  const index = allCampaigns.findIndex((c) => c.appId === campaign.appId || c.id === campaign.id);
  const updated = index >= 0
    ? allCampaigns.map((c, i) => (i === index ? campaign : c))
    : [campaign, ...allCampaigns];
  setLocal(STORAGE_KEYS.CAMPAIGNS, updated);

  // 2. Server-side Supabase Sync (Apps + Campaigns + Posts)
  try {
    const apps = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
    const matchingApp = apps.find((a) => a.id === campaign.appId);

    const res = await fetch('/api/supabase-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app: matchingApp,
        campaign,
        posts: campaign.posts,
      }),
    });

    const result = await res.json();
    if (result.success) {
      console.log(`%c[Supabase Sync] ✅ Saved ${campaign.posts?.length || 0} posts to Supabase for ${campaign.name}`, 'background: #059669; color: white; padding: 2px 6px; border-radius: 4px;');
    } else {
      console.error('[Supabase Sync] ❌ Error syncing campaign/posts:', result.error, result.details);
    }
  } catch (err) {
    console.error('[Supabase Sync] Network error during campaign save:', err);
  }
}

/**
 * Pushes all existing local apps, campaigns, and posts directly to Supabase with detailed console logs.
 */
export async function syncLocalDataToSupabase(): Promise<{ success: boolean; syncedCampaigns: number; syncedPosts: number; error?: string }> {
  try {
    const apps = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
    const campaigns = getLocal<CampaignRoadmap[]>(STORAGE_KEYS.CAMPAIGNS, []);

    console.log(`%c[Supabase Sync] 🚀 Starting sync for ${apps.length} apps and ${campaigns.length} campaigns...`, 'background: #4f46e5; color: white; padding: 2px 6px; border-radius: 4px;');

    let totalSyncedPosts = 0;

    for (const campaign of campaigns) {
      const matchingApp = apps.find((a) => a.id === campaign.appId);

      const res = await fetch('/api/supabase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: matchingApp,
          campaign,
          posts: campaign.posts,
        }),
      });

      const data = await res.json();
      if (data.success) {
        totalSyncedPosts += data.syncedPosts || 0;
        console.log(`%c[Supabase Sync] ✅ Successfully synced: ${campaign.name} (${data.syncedPosts} posts)`, 'color: #10b981; font-weight: bold;');
      } else {
        console.error(`%c[Supabase Sync] ❌ Failed syncing ${campaign.name}:`, 'color: #ef4444;', data.error, data.details);
        return { success: false, syncedCampaigns: 0, syncedPosts: 0, error: `${data.step || 'Sync'}: ${data.error}` };
      }
    }

    return {
      success: true,
      syncedCampaigns: campaigns.length,
      syncedPosts: totalSyncedPosts,
    };
  } catch (err: any) {
    console.error('[Supabase Sync] ❌ syncLocalDataToSupabase exception:', err);
    return { success: false, syncedCampaigns: 0, syncedPosts: 0, error: err?.message };
  }
}

export function getActiveAppId(): string {
  return getLocal<string>(STORAGE_KEYS.ACTIVE_APP_ID, '');
}

export function setActiveAppId(appId: string): void {
  setLocal(STORAGE_KEYS.ACTIVE_APP_ID, appId);
}

// ─────────────────────────────────────────────────────────────
// ⚙️ SETTINGS OPERATIONS
// ─────────────────────────────────────────────────────────────
export function getUserSettings(): UserSettings {
  return getLocal<UserSettings>(STORAGE_KEYS.SETTINGS, {
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    userEmail: process.env.NEXT_PUBLIC_USER_GMAIL || process.env.USER_GMAIL || '',
    cronIntervalDays: 2,
    cronSecret: '',
  });
}

export function saveUserSettings(settings: UserSettings): void {
  setLocal(STORAGE_KEYS.SETTINGS, settings);
}

// ─────────────────────────────────────────────────────────────
// ⏱️ CRON / TIMED EVENT LOGS
// ─────────────────────────────────────────────────────────────
export function getStoredCronLogs(): CronExecutionLog[] {
  return getLocal<CronExecutionLog[]>(STORAGE_KEYS.CRON_LOGS, []);
}

export function saveCronLog(log: CronExecutionLog): void {
  const existing = getStoredCronLogs();
  // Keep last 30 logs
  const updated = [log, ...existing].slice(0, 30);
  setLocal(STORAGE_KEYS.CRON_LOGS, updated);
}

// ─────────────────────────────────────────────────────────────
// 🗑️ RESET / CLEAR ALL DATA
// ─────────────────────────────────────────────────────────────
export async function clearAllStoredData(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Explicitly wipe local storage keys
    setLocal(STORAGE_KEYS.APPS, []);
    setLocal(STORAGE_KEYS.ACTIVE_APP_ID, '');
    setLocal(STORAGE_KEYS.CAMPAIGNS, []);
    setLocal(STORAGE_KEYS.POSTS, []);
    setLocal(STORAGE_KEYS.CRON_LOGS, []);

    localStorage.removeItem(STORAGE_KEYS.APPS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_APP_ID);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.CRON_LOGS);

    // Wipe remote Supabase tables if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('posts').delete().neq('id', 'non-existent-id');
        await supabase.from('campaigns').delete().neq('id', 'non-existent-id');
        await supabase.from('apps').delete().neq('id', 'non-existent-id');
        console.log('%c[Supabase Sync] 🗑️ Wiped all Supabase tables', 'color: #f43f5e;');
      } catch (err) {
        console.warn('Could not clear Supabase tables', err);
      }
    }
  } catch (e) {
    console.error('Error clearing data', e);
  }
}
