export interface AppProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  targetAudience: string;
  painPoints: string[];
  keyFeatures: string[];
  toneOfVoice: 'bold' | 'professional' | 'witty' | 'educational' | 'storyteller';
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentPillar = 'pain_solution' | 'feature_spotlight' | 'founder_story' | 'tips_value' | 'social_proof';

export interface AudiencePersona {
  role: string;
  painPoint: string;
  coreDesire: string;
}

export interface ContentPillarPlan {
  pillar: ContentPillar;
  title: string;
  description: string;
  icon?: string;
}

export interface DayPlanBlueprint {
  dayNumber: number;
  pillar: ContentPillar;
  title: string;
  conceptSummary: string;
  hookIdea: string;
}

export interface MarketingStrategyPlan {
  appId: string;
  appName: string;
  brandPositioning: string;
  primaryHook: string;
  personas: AudiencePersona[];
  pillars: ContentPillarPlan[];
  blueprint: DayPlanBlueprint[];
  createdAt: string;
}

export interface CarouselSlide {
  slideNumber: number;
  badge?: string;
  headline: string;
  bodyText: string;
  visualPrompt?: string;
}

export interface PostContent {
  id: string;
  appId: string;
  campaignId?: string;
  title: string;
  pillar: ContentPillar;
  dayNumber: number;
  scheduledFor?: string;
  status: 'draft' | 'ready' | 'scheduled' | 'published';
  
  // LinkedIn
  linkedin: {
    hook: string;
    body: string;
    bulletPoints: string[];
    callToAction: string;
    hashtags: string[];
    fullFormattedText: string;
  };
  
  // Instagram
  instagram: {
    caption: string;
    callToAction: string;
    hashtags: string[];
    carouselSlides: CarouselSlide[];
    visualPrompt: string;
    fullFormattedCaption: string;
  };

  // Graphic data
  graphicBanner: {
    headline: string;
    subheadline: string;
    badge: string;
    ctaButtonText: string;
  };

  // Pre-rendered AI image
  generatedImageUrl?: string;
  aiModelUsed?: string;

  createdAt: string;
}

export interface CampaignRoadmap {
  id: string;
  appId: string;
  name: string;
  objective: string;
  durationDays: number;
  strategy?: MarketingStrategyPlan;
  createdAt: string;
  posts: PostContent[];
}

export interface UserSettings {
  geminiApiKey?: string;
  openAiApiKey?: string;
  groqApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  n8nWebhookUrl?: string;
  userEmail?: string;
}

