import { AppProfile, CampaignRoadmap, PostContent, UserSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  APPS: 'marketing_agent_apps',
  ACTIVE_APP_ID: 'marketing_agent_active_app_id',
  CAMPAIGNS: 'marketing_agent_campaigns',
  POSTS: 'marketing_agent_posts',
  SETTINGS: 'marketing_agent_settings',
};

// Initial starter demo app
export const DEFAULT_DEMO_APP: AppProfile = {
  id: 'demo-app-1',
  name: 'DevFlow AI',
  tagline: 'Autonomous AI Code Review & Sprint Assistant for GitHub',
  description: 'DevFlow AI connects to your GitHub repositories, analyzes PRs in seconds, spots edge-case bugs before production, and drafts clean release notes.',
  websiteUrl: 'https://devflow.ai',
  targetAudience: 'Software Engineers, Tech Leads, and Startup CTOs',
  painPoints: [
    'Spending 5+ hours every sprint reviewing long pull requests',
    'Subtle regression bugs slipping into production',
    'Writing manual release notes and changelogs',
  ],
  keyFeatures: [
    'Instant AI PR Review with inline architectural feedback',
    'Automatic Test Generation for uncovered edge cases',
    'One-click GitHub Action integration',
  ],
  toneOfVoice: 'bold',
  primaryColor: '#6366f1',
  accentColor: '#ec4899',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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

// App operations
export async function getStoredApps(): Promise<AppProfile[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('apps').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          tagline: d.tagline,
          description: d.description,
          websiteUrl: d.website_url,
          targetAudience: d.target_audience,
          painPoints: d.pain_points || [],
          keyFeatures: d.key_features || [],
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
  return localApps;
}

export async function saveAppProfile(app: AppProfile): Promise<AppProfile> {
  // Always update local cache
  const existing = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
  const index = existing.findIndex((a) => a.id === app.id);
  const updatedApps = index >= 0
    ? existing.map((a) => (a.id === app.id ? app : a))
    : [app, ...existing];
  
  setLocal(STORAGE_KEYS.APPS, updatedApps);
  setLocal(STORAGE_KEYS.ACTIVE_APP_ID, app.id);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('apps').upsert({
        id: app.id,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        website_url: app.websiteUrl,
        target_audience: app.targetAudience,
        pain_points: app.painPoints,
        key_features: app.keyFeatures,
        tone_of_voice: app.toneOfVoice,
        primary_color: app.primaryColor,
        accent_color: app.accentColor,
        logo_url: app.logoUrl,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not sync app to Supabase', e);
    }
  }

  return app;
}

export async function deleteAppProfile(appId: string): Promise<void> {
  const existing = getLocal<AppProfile[]>(STORAGE_KEYS.APPS, []);
  const filtered = existing.filter((a) => a.id !== appId);
  setLocal(STORAGE_KEYS.APPS, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('apps').delete().eq('id', appId);
    } catch (e) {
      console.warn('Supabase delete failed', e);
    }
  }
}

// Campaign & Post operations
export function getStoredCampaigns(appId: string): CampaignRoadmap[] {
  const allCampaigns = getLocal<CampaignRoadmap[]>(STORAGE_KEYS.CAMPAIGNS, []);
  return allCampaigns.filter((c) => c.appId === appId);
}

export function saveCampaign(campaign: CampaignRoadmap): void {
  const allCampaigns = getLocal<CampaignRoadmap[]>(STORAGE_KEYS.CAMPAIGNS, []);
  const index = allCampaigns.findIndex((c) => c.id === campaign.id);
  const updated = index >= 0
    ? allCampaigns.map((c) => (c.id === campaign.id ? campaign : c))
    : [campaign, ...allCampaigns];
  setLocal(STORAGE_KEYS.CAMPAIGNS, updated);
}

export function getActiveAppId(): string {
  return getLocal<string>(STORAGE_KEYS.ACTIVE_APP_ID, '');
}

export function setActiveAppId(appId: string): void {
  setLocal(STORAGE_KEYS.ACTIVE_APP_ID, appId);
}

// Settings
export function getUserSettings(): UserSettings {
  return getLocal<UserSettings>(STORAGE_KEYS.SETTINGS, {
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    n8nWebhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '',
    userEmail: '',
  });
}

export function saveUserSettings(settings: UserSettings): void {
  setLocal(STORAGE_KEYS.SETTINGS, settings);
}

// Reset / Clear All Data
export async function clearAllStoredData(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Explicitly set empty values so no fallback kicks in
    setLocal(STORAGE_KEYS.APPS, []);
    setLocal(STORAGE_KEYS.ACTIVE_APP_ID, '');
    setLocal(STORAGE_KEYS.CAMPAIGNS, []);
    setLocal(STORAGE_KEYS.POSTS, []);

    localStorage.removeItem(STORAGE_KEYS.APPS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_APP_ID);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);

    // Also wipe Supabase apps if connected so it doesn't re-fetch on reload
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('apps').delete().neq('id', 'non-existent-id');
      } catch (err) {
        console.warn('Could not clear Supabase apps', err);
      }
    }
  } catch (e) {
    console.error('Error clearing data', e);
  }
}
