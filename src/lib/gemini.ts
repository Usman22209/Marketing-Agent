import {
  AppProfile,
  CampaignRoadmap,
  ContentPillar,
  DayPlanBlueprint,
  MarketingStrategyPlan,
  PostContent,
} from '@/types';

// Helper: Sanitize Product Name for Clean Social Hashtags
export function sanitizeBrandHashtag(productName: string): string {
  if (!productName) return '#Product';
  let clean = productName.replace(/\(.*?\)/g, '');
  clean = clean.split(/\s+(?:or|aka|\/|-)\s+/i)[0];
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
  if (!clean || clean.length < 2) {
    clean = 'Product';
  }
  return `#${clean}`;
}

export function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// ─────────────────────────────────────────────────────────────
// 🌟 MULTI-MODEL CASCADING AI ENGINE (Resilient Failover)
// ─────────────────────────────────────────────────────────────
// Models ordered by quality & reasoning depth:
const GEMINI_MODEL_CASCADE = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

export async function callGeminiAPIWithCascade(
  apiKey: string | undefined,
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string; modelUsed: string }> {
  const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('MISSING_KEY');
  }

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\nTask:\n${prompt}` : prompt;

  let lastError: any = null;

  // Try each model in the cascade sequentially with exponential backoff
  for (let i = 0; i < GEMINI_MODEL_CASCADE.length; i++) {
    const modelName = GEMINI_MODEL_CASCADE[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    try {
      // Short delay between retries if not first attempt
      if (i > 0) {
        await new Promise((res) => setTimeout(res, 1000 * i));
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Model ${modelName} failed (${response.status}): ${errorText.substring(0, 100)}... Switching to next model.`);
        lastError = new Error(`Gemini API [${modelName}] Error: ${response.status} - ${errorText}`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        return { text, modelUsed: modelName };
      }
    } catch (err: any) {
      console.warn(`Network/Request error on model ${modelName}:`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models in cascade failed.');
}

// Backward-compatible single helper
export async function callGeminiAPI(apiKey: string | undefined, prompt: string, systemPrompt?: string): Promise<string> {
  const result = await callGeminiAPIWithCascade(apiKey, prompt, systemPrompt);
  return result.text;
}

// ─────────────────────────────────────────────────────────────
// 🎨 AI IMAGE GENERATION (With Resilient Model Failover)
// ─────────────────────────────────────────────────────────────
export async function generateAiImageForPost(
  prompt: string,
  width: number = 1080,
  height: number = 1080
): Promise<string> {
  try {
    const enhancedPrompt = `${prompt}, sleek modern dark tech aesthetic, glowing neon accents, 3d isometric minimalist rendering, clean glassmorphism UI elements, cinematic studio lighting, premium design, 8k resolution, photorealistic, trending on dribbble and behance`;
    const encoded = encodeURIComponent(enhancedPrompt);
    const randomSeed = Math.floor(Math.random() * 9000000) + 1000000;

    // Primary: Flux model on Pollinations
    return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&model=flux`;
  } catch {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1080&fit=crop';
  }
}

// ─────────────────────────────────────────────────────────────
// STEP 1: FAST MARKETING STRATEGY GENERATOR
// ─────────────────────────────────────────────────────────────
export function generateMockStrategy(app: AppProfile): MarketingStrategyPlan {
  return {
    appId: app.id,
    appName: app.name,
    brandPositioning: `${app.name} is the modern operating system for ${app.targetAudience || 'high-growth teams'}, eliminating ${app.painPoints?.[0] || 'manual bottlenecks'} with ${app.keyFeatures?.[0] || 'intelligent AI automation'}.`,
    primaryHook: `Most ${app.targetAudience?.split(',')[0] || 'founders'} waste 15 hours a week on tasks software should solve in 30 seconds. Here is the math:`,
    personas: [
      {
        role: app.targetAudience?.split(',')[0]?.trim() || 'Busy Founder / Operator',
        painPoint: app.painPoints?.[0] || 'Drowning in repetitive manual tasks with zero leverage',
        coreDesire: 'Automate repetitive workflows and reclaim 10+ hours of focused deep work every week',
      },
      {
        role: 'Growth-Focused Team Lead',
        painPoint: 'Inconsistent execution and slow turnaround times causing lost revenue',
        coreDesire: 'Reliable, automated execution that scales without needing to hire more headcount',
      },
      {
        role: 'Efficiency-Driven Modern Buyer',
        painPoint: 'Overpaying for bloated, legacy software with steep learning curves',
        coreDesire: 'A sleek, lightweight platform that delivers tangible ROI on Day 1',
      },
    ],
    pillars: [
      {
        pillar: 'pain_solution',
        title: 'Problem & Hard Truths',
        description: 'Exposing the hidden financial and time cost of manual status-quo workflows.',
        icon: '🎯',
      },
      {
        pillar: 'feature_spotlight',
        title: 'Feature Superpower',
        description: 'Showcasing high-leverage product capabilities with clear before-and-after proof.',
        icon: '⚡',
      },
      {
        pillar: 'tips_value',
        title: 'Actionable Frameworks',
        description: 'Value-first playbooks, checklists, and frameworks that establish industry authority.',
        icon: '💡',
      },
      {
        pillar: 'founder_story',
        title: 'Behind the Build',
        description: 'Authentic founder story detailing the exact frustration that inspired this product.',
        icon: '📖',
      },
    ],
    blueprint: [
      {
        dayNumber: 1,
        pillar: 'pain_solution',
        title: 'The Silent 15-Hour Bottleneck Costing Teams Thousands',
        conceptSummary: 'The math behind manual operations vs. AI leverage.',
        hookIdea: `If your team is still doing manual repetitive work in 2026, you are quietly losing 15+ hours a week:`,
      },
      {
        dayNumber: 3,
        pillar: 'feature_spotlight',
        title: `How ${app.name} Automates Your Work in Under 60 Seconds`,
        conceptSummary: `Deep dive into ${app.keyFeatures?.[0] || 'core automation'} with step-by-step clarity.`,
        hookIdea: `We designed ${app.name} around one non-negotiable rule: Zero wasted clicks. Here is how it works:`,
      },
      {
        dayNumber: 5,
        pillar: 'tips_value',
        title: '3 Costly Mistakes 90% of Teams Make (And the Fix)',
        conceptSummary: 'Actionable 3-part framework to audit and streamline operations.',
        hookIdea: `3 common workflow mistakes costing your business hours every sprint (and how to fix them today):`,
      },
      {
        dayNumber: 7,
        pillar: 'founder_story',
        title: `Why We Built ${app.name}: The Frustration That Started It All`,
        conceptSummary: 'Behind the scenes story of why bloated legacy tools pushed us to build a better way.',
        hookIdea: `6 months ago, I was completely fed up with how slow our workflows were. So we built a solution:`,
      },
      {
        dayNumber: 9,
        pillar: 'pain_solution',
        title: 'The Math: Doing It Manually vs. Using Automated Leverage',
        conceptSummary: 'Cost comparison breakdown showing tangible ROI.',
        hookIdea: `Old way: 12 hours/week and constant context switching. New way with ${app.name}: 2 minutes. Here is the math:`,
      },
      {
        dayNumber: 11,
        pillar: 'tips_value',
        title: 'The 3-Step Framework for 10x Operational Speed',
        conceptSummary: 'Practical checklist readers can implement immediately in their workflow.',
        hookIdea: `A simple 3-step audit we run every month to eliminate bottlenecks:`,
      },
      {
        dayNumber: 13,
        pillar: 'social_proof',
        title: 'What Happens When You Eliminate Manual Drag for 30 Days',
        conceptSummary: 'The compounding impact of automation and direct invitation to try.',
        hookIdea: `What happens when you eliminate 10+ hours of manual drag from your team for 30 days?`,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

export async function generateStrategyWithAI(
  app: AppProfile,
  objective: string = 'Product Launch & User Acquisition',
  apiKey?: string
): Promise<MarketingStrategyPlan> {
  const prompt = `
You are an elite Silicon Valley Chief Marketing Officer and viral SaaS strategist.
Create a high-impact, highly compelling Marketing Strategy Plan for:

Product Name: ${app.name}
Tagline: ${app.tagline}
Description: ${app.description}
Target Audience: ${app.targetAudience}
Pain Points: ${app.painPoints?.join(', ')}
Key Features: ${app.keyFeatures?.join(', ')}
Tone: ${app.toneOfVoice}
Goal: ${objective}

Copywriting Guidelines:
- Brand Positioning must be sharp, confident, and focus on the transformation/leverage the product provides.
- The Primary Hook must be a viral scroll-stopper with a curiosity gap or contrarian observation.
- Personas must have emotional, relatable pain points and tangible desired outcomes.
- Blueprint posts must cover 7 days across the 4 pillars with irresistible headlines.

Return a valid JSON object matching this schema:
{
  "brandPositioning": "A sharp, confident 1-2 sentence brand positioning statement",
  "primaryHook": "A viral, curiosity-inducing one-sentence hook that stops scrolling",
  "personas": [
    { "role": "Specific Buyer Persona Title", "painPoint": "Detailed emotional/operational daily pain", "coreDesire": "Dream transformation outcome" },
    { "role": "Second Buyer Persona", "painPoint": "Specific pain point", "coreDesire": "Desired outcome" },
    { "role": "Third Buyer Persona", "painPoint": "Specific pain point", "coreDesire": "Desired outcome" }
  ],
  "pillars": [
    { "pillar": "pain_solution", "title": "Problem & Hard Truths", "description": "Exposing the cost of inaction", "icon": "🎯" },
    { "pillar": "feature_spotlight", "title": "Feature Deep-Dive", "description": "Showcasing core product leverage", "icon": "⚡" },
    { "pillar": "tips_value", "title": "Actionable Frameworks", "description": "High-value tactical advice", "icon": "💡" },
    { "pillar": "founder_story", "title": "Behind the Build", "description": "Authentic founder perspective", "icon": "📖" }
  ],
  "blueprint": [
    { "dayNumber": 1, "pillar": "pain_solution", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" },
    { "dayNumber": 3, "pillar": "feature_spotlight", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" },
    { "dayNumber": 5, "pillar": "tips_value", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" },
    { "dayNumber": 7, "pillar": "founder_story", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" },
    { "dayNumber": 9, "pillar": "pain_solution", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" },
    { "dayNumber": 11, "pillar": "tips_value", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" },
    { "dayNumber": 13, "pillar": "social_proof", "title": "Post Title", "conceptSummary": "1-line concept", "hookIdea": "Compelling hook line" }
  ]
}
`;

  try {
    const { text } = await callGeminiAPIWithCascade(
      apiKey,
      prompt,
      'You are a master CMO and SaaS brand strategist. Return ONLY valid JSON.'
    );
    const jsonStr = cleanJsonOutput(text);
    const parsed = JSON.parse(jsonStr);

    return {
      appId: app.id,
      appName: app.name,
      brandPositioning: parsed.brandPositioning || `${app.name} helps ${app.targetAudience} scale faster with automated leverage.`,
      primaryHook: parsed.primaryHook || `Most ${app.targetAudience} waste 10+ hours a week. Here is why that stops today:`,
      personas: parsed.personas && parsed.personas.length > 0 ? parsed.personas : generateMockStrategy(app).personas,
      pillars: parsed.pillars && parsed.pillars.length > 0 ? parsed.pillars : generateMockStrategy(app).pillars,
      blueprint: parsed.blueprint && parsed.blueprint.length > 0 ? parsed.blueprint : generateMockStrategy(app).blueprint,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Strategy AI generation failed, using intelligent strategy fallback:', error);
    return generateMockStrategy(app);
  }
}

// ----------------------------------------------------
// STEP 2: HIGH-CONVERTING INDIVIDUAL POST GENERATOR
// ----------------------------------------------------
export function generateMockSinglePost(app: AppProfile, blueprint: DayPlanBlueprint, index: number): PostContent {
  const brandTag = sanitizeBrandHashtag(app.name);
  const hook = blueprint.hookIdea || `Most ${app.targetAudience?.split(',')[0] || 'founders'} lose 15 hours a week to manual tasks. Here is why that stops today:`;
  
  const linkedinFull = `${hook}

The biggest bottleneck holding most teams back isn't lack of talent.

It's spending 60% of their energy on repetitive manual drag:

❌ 5+ hours every sprint doing manual reviews and formatting
❌ Context switching 20 times a day between disconnected tools
❌ Slow turnaround cycles causing frustrated users and churn

Here is how we fixed it:

We designed ${app.name} to solve this with pure leverage:
→ ${app.keyFeatures?.[0] || 'Instant AI Automation'}
→ ${app.keyFeatures?.[1] || '1-Click Multi-Channel Copy'}
→ Zero setup overhead

The result?
What used to take 12 hours a week now happens in 60 seconds.

What is the #1 repetitive task slowing down your workflow right now?

Try ${app.name} free at ${app.websiteUrl || 'link in bio'}!

#SaaS #Productivity #BuildInPublic ${brandTag}`;

  const instaFull = `${hook}

👉 Swipe through for the full 7-step breakdown!

Most teams are losing 10+ hours a week to manual drag. In this guide, we break down:
1. The silent bottleneck costing you time
2. The 3-step automation framework
3. How ${app.name} does the heavy lifting in seconds

📌 Save this post for your next sprint!
💬 What's your biggest workflow bottleneck? Let us know in the comments.

Link in bio to try ${app.name} free!

#Productivity #BuildInPublic #AItools #SaaS ${brandTag}`;

  const visualPrompt = `Minimalist 3D isometric SaaS workflow diagram with glowing indigo circuits and glassmorphism interface for ${app.name}`;
  const preGeneratedImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1080&height=1080&seed=${blueprint.dayNumber * 1000 + 42}&nologo=true&model=flux`;

  return {
    id: `post-${app.id}-${blueprint.dayNumber}`,
    appId: app.id,
    title: blueprint.title,
    pillar: blueprint.pillar,
    dayNumber: blueprint.dayNumber,
    scheduledFor: `Day ${blueprint.dayNumber}`,
    status: 'ready',
    generatedImageUrl: preGeneratedImage,
    aiModelUsed: 'Template Fallback',
    linkedin: {
      hook,
      body: blueprint.conceptSummary,
      bulletPoints: [
        `The silent cost of manual repetitive workflows`,
        `How automated leverage reclaims 10+ hours weekly`,
        `Step-by-step implementation with ${app.name}`,
      ],
      callToAction: `What is the #1 repetitive task eating up your team's week? Drop it below.`,
      hashtags: ['#SaaS', '#Productivity', '#BuildInPublic', brandTag],
      fullFormattedText: linkedinFull,
    },
    instagram: {
      caption: instaFull,
      callToAction: `📌 Save this for later & tap the link in bio to try ${app.name} free!`,
      hashtags: ['#Productivity', '#BuildInPublic', '#AItools', '#SaaS', brandTag],
      carouselSlides: [
        {
          slideNumber: 1,
          badge: 'GROWTH GUIDE',
          headline: blueprint.title,
          bodyText: 'Swipe to see the full 7-step breakdown 👉',
          visualPrompt,
        },
        {
          slideNumber: 2,
          badge: 'THE HIDDEN COST',
          headline: 'The 15-Hour Bottleneck',
          bodyText: app.painPoints?.[0] || 'Manual repetitive work drains hours of deep focus every single week.',
        },
        {
          slideNumber: 3,
          badge: 'THE FRAMEWORK',
          headline: 'The Automation Shift',
          bodyText: `Instead of doing it manually, apply intelligent leverage to handle repetitive tasks automatically.`,
        },
        {
          slideNumber: 4,
          badge: 'THE SUPERPOWER',
          headline: `Enter ${app.name}`,
          bodyText: `${app.keyFeatures?.[0] || 'AI Automation Engine'} streamlines your pipeline in under 60 seconds.`,
        },
        {
          slideNumber: 5,
          badge: 'THE RESULT',
          headline: 'Before vs. After',
          bodyText: 'Before: 12 hours of manual drag. After: Instant execution and 10+ hours reclaimed.',
        },
        {
          slideNumber: 6,
          badge: 'ACTION CHECKLIST',
          headline: '3 Steps for Today',
          bodyText: '1. Audit manual tasks\n2. Set up automated triggers\n3. Reclaim your focus',
        },
        {
          slideNumber: 7,
          badge: 'TAKE ACTION',
          headline: 'Ready to Try It?',
          bodyText: `📌 Save this post | 🔗 Get started at ${app.websiteUrl || 'link in bio'}!`,
        },
      ],
      visualPrompt,
      fullFormattedCaption: instaFull,
    },
    graphicBanner: {
      headline: blueprint.title.length > 40 ? blueprint.title.slice(0, 38) + '...' : blueprint.title,
      subheadline: app.tagline || 'AI-Powered Growth Engine',
      badge: `${app.name.toUpperCase()} • DAY ${blueprint.dayNumber}`,
      ctaButtonText: 'Try Free Today',
    },
    createdAt: new Date().toISOString(),
  };
}

export async function generateSinglePostWithAI(
  app: AppProfile,
  blueprint: DayPlanBlueprint,
  strategy: MarketingStrategyPlan,
  apiKey?: string
): Promise<PostContent> {
  const brandTag = sanitizeBrandHashtag(app.name);

  const prompt = `
You are Justin Welsh, Kieran Drew, and an elite SaaS Chief Marketing Officer.
Write an exceptionally high-converting, scroll-stopping social media post (Day ${blueprint.dayNumber}) for:

Product: ${app.name}
Tagline: ${app.tagline}
Target Audience: ${app.targetAudience}
Post Topic: ${blueprint.title}
Post Concept: ${blueprint.conceptSummary}
Pillar: ${blueprint.pillar}
Tone of Voice: ${app.toneOfVoice}
Brand Tag: ${brandTag}

CRITICAL COPYWRITING INSTRUCTIONS:
1. LINKEDIN POST:
   - Hook: Must be a pattern-interrupt under 140 chars that forces the reader to click "see more".
   - Rhythm: Short 1-2 sentence paragraphs with clean line breaks. High whitespace for maximum dwell time.
   - Body: Use hard contrast (e.g. "The old way vs. The new way", "The mistake vs. The fix", or a math breakdown).
   - Use bullet points with bold sub-labels (e.g. "→ The bottleneck:", "→ The cost:", "→ The fix:").
   - Call to Action: End with an engaging conversation-starting question that compels people to comment, followed by a clean link invitation.
   - 3-4 specific hashtags only.

2. INSTAGRAM POST & CAROUSEL:
   - Carousel Slides: Generate 6 to 7 high-value slides:
     - Slide 1: HOOK (Bold title + curiosity subheadline)
     - Slide 2: THE PROBLEM (The hidden struggle / cost of inaction)
     - Slide 3: THE FRAMEWORK (The core insight or step 1)
     - Slide 4: THE LEVERAGE (How ${app.name} executes it effortlessly)
     - Slide 5: THE RESULT (Measurable before vs. after outcome)
     - Slide 6: ACTION CHECKLIST (3 practical takeaways)
     - Slide 7: SAVE & CTA (📌 "Save this for your next sprint | Link in bio")
   - Visual Prompt: A vivid, modern 3D tech visual prompt suitable for AI image generation (e.g. "Sleek 3D dark glassmorphism dashboard showing workflow automation with glowing neon indigo accents, 8k").

Return ONLY a valid JSON object matching this schema:
{
  "title": "${blueprint.title.replace(/"/g, '')}",
  "linkedinHook": "Punchy first line hook under 140 chars",
  "linkedinBullets": ["Bullet 1 with context", "Bullet 2 with context", "Bullet 3 with context"],
  "linkedinCTA": "Engaging conversation-starting closing question",
  "linkedinFullText": "Complete ready-to-post LinkedIn text with modern spacing, bullet points, question, and ${brandTag}",
  "instagramCaption": "Engaging formatted Instagram caption with line breaks, emojis, save CTA, and ${brandTag}",
  "carouselSlides": [
    { "slideNumber": 1, "badge": "GUIDE", "headline": "Slide 1 Hook", "bodyText": "Swipe to see breakdown 👉" },
    { "slideNumber": 2, "badge": "THE PROBLEM", "headline": "Slide 2 Problem", "bodyText": "Detail the daily struggle" },
    { "slideNumber": 3, "badge": "THE FRAMEWORK", "headline": "Slide 3 Insight", "bodyText": "The core methodology" },
    { "slideNumber": 4, "badge": "THE SUPERPOWER", "headline": "Enter ${app.name}", "bodyText": "How it automates the work" },
    { "slideNumber": 5, "badge": "THE RESULTS", "headline": "Before vs After", "bodyText": "Measurable transformation" },
    { "slideNumber": 6, "badge": "CHECKLIST", "headline": "3 Action Steps", "bodyText": "Actionable takeaways" },
    { "slideNumber": 7, "badge": "TAKE ACTION", "headline": "Ready to Scale?", "bodyText": "📌 Save this post | Link in bio" }
  ],
  "visualPrompt": "Detailed descriptive 3D/tech visual prompt for AI image generation",
  "bannerHeadline": "Short 4-6 word headline for graphic canvas",
  "bannerSub": "Short subtitle"
}
`;

  try {
    const { text, modelUsed } = await callGeminiAPIWithCascade(
      apiKey,
      prompt,
      'You are a master viral copywriter and growth marketer. Return ONLY valid JSON.'
    );
    const jsonStr = cleanJsonOutput(text);
    const parsed = JSON.parse(jsonStr);

    const hook = parsed.linkedinHook || blueprint.hookIdea;
    const bullets = parsed.linkedinBullets || ['Point 1', 'Point 2', 'Point 3'];
    const cta = parsed.linkedinCTA || `What is the biggest bottleneck in your workflow right now? Let me know in the comments.`;
    const visualPrompt = parsed.visualPrompt || `Minimalist 3D isometric SaaS workflow interface with glowing indigo circuits for ${app.name}`;

    // Auto pre-generate the AI visual image
    const preGeneratedImage = await generateAiImageForPost(visualPrompt, 1080, 1080);

    return {
      id: `post-${app.id}-${blueprint.dayNumber}`,
      appId: app.id,
      title: parsed.title || blueprint.title,
      pillar: blueprint.pillar,
      dayNumber: blueprint.dayNumber,
      scheduledFor: `Day ${blueprint.dayNumber}`,
      status: 'ready',
      generatedImageUrl: preGeneratedImage,
      aiModelUsed: modelUsed,
      linkedin: {
        hook,
        body: blueprint.conceptSummary,
        bulletPoints: bullets,
        callToAction: cta,
        hashtags: ['#SaaS', '#Productivity', '#BuildInPublic', brandTag],
        fullFormattedText: parsed.linkedinFullText || `${hook}\n\n${bullets.join('\n')}\n\n${cta}\n\n#SaaS #Productivity ${brandTag}`,
      },
      instagram: {
        caption: parsed.instagramCaption || `${hook}\n\n${bullets.join('\n')}\n\n#Productivity ${brandTag}`,
        callToAction: cta,
        hashtags: ['#Productivity', '#BuildInPublic', '#AItools', '#SaaS', brandTag],
        carouselSlides: parsed.carouselSlides && parsed.carouselSlides.length > 0 ? parsed.carouselSlides : [
          { slideNumber: 1, badge: 'GUIDE', headline: blueprint.title, bodyText: 'Swipe to see 👉' },
          { slideNumber: 2, badge: 'PROBLEM', headline: 'The Challenge', bodyText: app.painPoints?.[0] || '' },
          { slideNumber: 3, badge: 'SOLUTION', headline: `Enter ${app.name}`, bodyText: blueprint.conceptSummary },
          { slideNumber: 4, badge: 'BENEFIT', headline: 'The Result', bodyText: 'Save 10+ hours a week.' },
          { slideNumber: 5, badge: 'ACTION', headline: 'Try It Today', bodyText: `Link at ${app.websiteUrl || 'bio'}` },
        ],
        visualPrompt,
        fullFormattedCaption: parsed.instagramCaption || `${hook}\n\n${bullets.join('\n')}\n\n#Productivity ${brandTag}`,
      },
      graphicBanner: {
        headline: parsed.bannerHeadline || blueprint.title,
        subheadline: parsed.bannerSub || app.tagline,
        badge: `${app.name.toUpperCase()} • DAY ${blueprint.dayNumber}`,
        ctaButtonText: 'Learn More',
      },
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Post AI generation failed for Day ${blueprint.dayNumber}, using intelligent mock:`, error);
    return generateMockSinglePost(app, blueprint, 0);
  }
}

// ----------------------------------------------------
// FULL MOCK CAMPAIGN BUILDER
// ----------------------------------------------------
export function generateMockCampaign(app: AppProfile, durationDays: number = 14): CampaignRoadmap {
  const strategy = generateMockStrategy(app);
  const posts: PostContent[] = strategy.blueprint.map((bp, idx) =>
    generateMockSinglePost(app, bp, idx)
  );

  return {
    id: `campaign-${app.id}`,
    appId: app.id,
    name: `${app.name} - ${durationDays}-Day Growth Campaign`,
    objective: 'App Launch & User Acquisition',
    durationDays,
    strategy,
    createdAt: new Date().toISOString(),
    posts,
  };
}

// ----------------------------------------------------
// FULL CAMPAIGN BUILDER (Strategy + Posts via Gemini)
// ----------------------------------------------------
export async function generateCampaignWithAI(
  app: AppProfile,
  objective: string = 'Product Launch & User Acquisition',
  durationDays: number = 14,
  apiKey?: string
): Promise<CampaignRoadmap> {
  try {
    const strategy = await generateStrategyWithAI(app, objective, apiKey);

    const posts: PostContent[] = [];
    for (let i = 0; i < strategy.blueprint.length; i++) {
      const bp = strategy.blueprint[i];
      const post = await generateSinglePostWithAI(app, bp, strategy, apiKey);
      posts.push(post);
    }

    return {
      id: `campaign-${app.id}`,
      appId: app.id,
      name: `${app.name} - ${durationDays}-Day Growth Campaign`,
      objective,
      durationDays,
      strategy,
      createdAt: new Date().toISOString(),
      posts,
    };
  } catch (error) {
    console.warn('Full AI campaign generation failed, falling back to mock:', error);
    return generateMockCampaign(app, durationDays);
  }
}
