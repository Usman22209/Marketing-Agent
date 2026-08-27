import { NextRequest, NextResponse } from 'next/server';
import { generateStrategyWithAI } from '@/lib/gemini';
import { AppProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { app, objective, apiKey } = body as {
      app: AppProfile;
      objective: string;
      apiKey?: string;
    };

    if (!app || !app.name) {
      return NextResponse.json({ error: 'App profile is required' }, { status: 400 });
    }

    const strategy = await generateStrategyWithAI(
      app,
      objective || 'Product Launch & User Acquisition',
      apiKey
    );

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    console.error('API /api/generate-strategy error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate strategy' }, { status: 500 });
  }
}
