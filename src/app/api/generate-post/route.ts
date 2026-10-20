import { NextRequest, NextResponse } from 'next/server';
import { generateSinglePostWithAI } from '@/lib/gemini';
import { AppProfile, DayPlanBlueprint, MarketingStrategyPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { app, blueprint, strategy, apiKey } = body as {
      app: AppProfile;
      blueprint: DayPlanBlueprint;
      strategy: MarketingStrategyPlan;
      apiKey?: string;
    };

    if (!app || !blueprint) {
      return NextResponse.json({ error: 'App and blueprint are required' }, { status: 400 });
    }

    const post = await generateSinglePostWithAI(
      app,
      blueprint,
      strategy,
      apiKey
    );

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('API /api/generate-post error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate post' }, { status: 500 });
  }
}
