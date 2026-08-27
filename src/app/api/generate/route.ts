import { NextRequest, NextResponse } from 'next/server';
import { generateCampaignWithAI, generateSinglePostWithAI } from '@/lib/gemini';
import { AppProfile, DayPlanBlueprint, MarketingStrategyPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { app, objective, durationDays, apiKey, singlePost, blueprint, strategy } = body as {
      app: AppProfile;
      objective?: string;
      durationDays?: number;
      apiKey?: string;
      singlePost?: boolean;
      blueprint?: DayPlanBlueprint;
      strategy?: MarketingStrategyPlan;
    };

    if (!app || !app.name) {
      return NextResponse.json({ error: 'App profile is required' }, { status: 400 });
    }

    if (singlePost && blueprint && strategy) {
      const post = await generateSinglePostWithAI(app, blueprint, strategy, apiKey);
      return NextResponse.json({ success: true, post });
    }

    const campaign = await generateCampaignWithAI(
      app,
      objective || 'Product Launch & User Acquisition',
      durationDays || 14,
      apiKey
    );

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('API /api/generate error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate campaign' }, { status: 500 });
  }
}

