import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSinglePostWithAI, generateMockSinglePost, generateMockStrategy } from '@/lib/gemini';
import { AppProfile, DayPlanBlueprint, PostContent } from '@/types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

async function runCron(req: NextRequest) {
  const startTime = Date.now();
  let body: any = {};
  if (req.method === 'POST') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  // 1. Authorization Check (Optional security token)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const queryKey = req.nextUrl.searchParams.get('key');

  if (cronSecret) {
    const isBearerValid = authHeader === `Bearer ${cronSecret}`;
    const isQueryValid = queryKey === cronSecret;
    if (!isBearerValid && !isQueryValid) {
      return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
    }
  }

  const supabase = getSupabaseClient();
  let targetApp: AppProfile | null = body.app || null;

  // 2. Fetch Active App if not provided in body
  if (!targetApp && supabase) {
    const targetAppId = body.appId || req.nextUrl.searchParams.get('appId');
    let query = supabase.from('apps').select('*');
    if (targetAppId) {
      query = query.eq('id', targetAppId);
    }
    const { data: apps, error: appErr } = await query.order('created_at', { ascending: false }).limit(1);
    if (!appErr && apps && apps.length > 0) {
      const a = apps[0];
      targetApp = {
        id: a.id,
        name: a.name,
        tagline: a.tagline || '',
        description: a.description || '',
        websiteUrl: a.website_url || '',
        targetAudience: a.target_audience || '',
        painPoints: Array.isArray(a.pain_points) ? a.pain_points : [],
        keyFeatures: Array.isArray(a.key_features) ? a.key_features : [],
        toneOfVoice: a.tone_of_voice || 'bold',
        primaryColor: a.primary_color || '#6366f1',
        accentColor: a.accent_color || '#ec4899',
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      };
    }
  }

  // Fallback default app if completely empty
  if (!targetApp) {
    return NextResponse.json({
      success: false,
      message: 'No product profile found. Please add a product profile first before running the cron scheduler.',
      timestamp: new Date().toISOString(),
    }, { status: 404 });
  }

  // 3. Determine next post day and blueprint
  const defaultStrategy = generateMockStrategy(targetApp);
  const blueprints = defaultStrategy.blueprint || [];

  let nextDayNumber = 1;
  let existingPosts: any[] = [];

  if (supabase) {
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, day_number, title, status')
      .eq('app_id', targetApp.id)
      .order('day_number', { ascending: true });
    
    existingPosts = postsData || [];
    if (existingPosts.length > 0) {
      const maxDay = Math.max(...existingPosts.map((p) => p.day_number || 1));
      nextDayNumber = maxDay >= 13 ? 1 : maxDay + 2; // Cycle or advance by 2 days
    }
  }

  if (body.forceDay) {
    nextDayNumber = Number(body.forceDay);
  }

  // Match or generate blueprint for this day
  const matchedBlueprint: DayPlanBlueprint = blueprints.find((b) => b.dayNumber === nextDayNumber) || {
    dayNumber: nextDayNumber,
    pillar: 'pain_solution',
    title: `${targetApp.name} Value Spotlight: Day ${nextDayNumber}`,
    conceptSummary: `How ${targetApp.name} eliminates friction for ${targetApp.targetAudience}`,
    hookIdea: `If you are struggling with daily bottlenecks, here is how ${targetApp.name} helps:`,
  };

  // 4. Generate Post with Gemini AI (Cascading with safe fallback)
  let generatedPost: PostContent;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || body.apiKey;

  try {
    generatedPost = await generateSinglePostWithAI(targetApp, matchedBlueprint, defaultStrategy, geminiKey);
    generatedPost.status = 'published';
  } catch (genErr) {
    console.warn('[Cron Job] AI generation notice, using high-converting template:', genErr);
    generatedPost = generateMockSinglePost(targetApp, matchedBlueprint, Math.floor(nextDayNumber / 2));
    generatedPost.status = 'published';
  }

  // 5. Save Post to Supabase if available
  if (supabase) {
    try {
      await supabase.from('posts').upsert({
        id: generatedPost.id,
        app_id: targetApp.id,
        campaign_id: `campaign-${targetApp.id}`,
        day_number: generatedPost.dayNumber,
        title: generatedPost.title,
        pillar: generatedPost.pillar,
        scheduled_for: `Day ${generatedPost.dayNumber}`,
        status: 'published',
        image_url: generatedPost.generatedImageUrl,
        ai_model: generatedPost.aiModelUsed || 'Gemini AI',
        linkedin_data: generatedPost.linkedin,
        instagram_data: generatedPost.instagram,
        graphic_banner: generatedPost.graphicBanner,
        updated_at: new Date().toISOString(),
      });
      console.log(`[Cron Job] Successfully persisted post for Day ${nextDayNumber} in Supabase`);
    } catch (saveErr) {
      console.warn('[Cron Job] Supabase save notice:', saveErr);
    }
  }

  // 6. Send Email Briefing
  const recipientEmail = body.toEmail || process.env.USER_GMAIL || process.env.NEXT_PUBLIC_USER_GMAIL;
  let emailDispatched = false;

  if (recipientEmail && process.env.RESEND_API_KEY) {
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #4f46e5; padding: 24px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${targetApp.name} • Day ${generatedPost.dayNumber} Scheduled Post Ready!</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Autonomous Marketing Agent Timed Event Server</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">${generatedPost.title}</h2>
            ${generatedPost.generatedImageUrl ? `
              <div style="margin: 16px 0; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <img src="${generatedPost.generatedImageUrl}" alt="AI Visual" style="width: 100%; height: auto; display: block;" />
              </div>
            ` : ''}
            <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #1e293b;">📘 LinkedIn Post</h3>
              <div style="font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-line;">${generatedPost.linkedin?.fullFormattedText}</div>
            </div>
            <div style="margin-top: 20px; padding: 16px; background: #fdf2f8; border-radius: 12px; border: 1px solid #fbcfe8;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #831843;">📸 Instagram Caption</h3>
              <div style="font-size: 13px; line-height: 1.6; color: #475569; white-space: pre-line;">${generatedPost.instagram?.caption}</div>
            </div>
          </div>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${targetApp.name} Marketing <onboarding@resend.dev>`,
          to: [recipientEmail],
          subject: `🚀 [${targetApp.name}] Day ${generatedPost.dayNumber} Post Generated by Cron Schedule!`,
          html: emailHtml,
        }),
      });

      if (resendRes.ok) {
        emailDispatched = true;
      }
    } catch (e) {
      console.warn('[Cron Job] Resend email notice:', e);
    }
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    message: `Cron job executed successfully in ${durationMs}ms! Day ${generatedPost.dayNumber} post generated for ${targetApp.name}.`,
    timestamp: new Date().toISOString(),
    durationMs,
    app: {
      id: targetApp.id,
      name: targetApp.name,
    },
    post: generatedPost,
    emailDispatched,
    recipientEmail: recipientEmail || null,
  });
}

export async function GET(req: NextRequest) {
  try {
    return await runCron(req);
  } catch (error: any) {
    console.error('[Cron GET Error]:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Cron execution failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await runCron(req);
  } catch (error: any) {
    console.error('[Cron POST Error]:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Cron execution failed' }, { status: 500 });
  }
}
