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
// 🌟 DYNAMIC ACTIVE MODEL DISCOVERY & CASCADING AI ENGINE
// ─────────────────────────────────────────────────────────────
// Hardcoded reliable modern models as baseline fallback
const DEFAULT_CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-flash-latest',
  'gemini-pro-latest',
];

let cachedAvailableModels: string[] | null = null;
let lastModelFetchTime = 0;

/**
 * Dynamically queries Google AI Studio for all active models supported by the user's API key.
 * This completely prevents 404 errors from retired models!
 */
export async function getLiveAvailableModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedAvailableModels && cachedAvailableModels.length > 0 && now - lastModelFetchTime < 600000) {
    return cachedAvailableModels;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        const validModels = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''))
          // Prioritize Flash and lightweight models for free tier quota (15 RPM)
          .sort((a: string, b: string) => {
            const aIsFlash = a.includes('flash');
            const bIsFlash = b.includes('flash');
            if (aIsFlash && !bIsFlash) return -1;
            if (!aIsFlash && bIsFlash) return 1;
            return 0;
          });

        if (validModels.length > 0) {
          cachedAvailableModels = validModels;
          lastModelFetchTime = now;
          return validModels;
        }
      }
    }
  } catch (err) {
    console.warn('Could not dynamically query Gemini models list, using default candidate list', err);
  }

  return DEFAULT_CANDIDATE_MODELS;
}

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

  // Dynamically discover what models are active and available for this key
  const availableModels = await getLiveAvailableModels(key);
  let lastError: any = null;

  // Try available models sequentially
  for (let i = 0; i < availableModels.length; i++) {
    const modelName = availableModels[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    try {
      if (i > 0) {
        await new Promise((res) => setTimeout(res, 800));
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
        lastError = new Error(`Gemini API [${modelName}] Error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        return { text, modelUsed: modelName };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models in cascade failed.');
}

// Helper with persistent retry loop
export async function callGeminiWithPersistentRetry(
  apiKey: string | undefined,
  prompt: string,
  systemPrompt?: string,
  maxAttempts: number = 4
): Promise<{ text: string; modelUsed: string }> {
  let attempt = 0;
  let lastErr: any = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      return await callGeminiAPIWithCascade(apiKey, prompt, systemPrompt);
    } catch (err) {
      lastErr = err;
      console.warn(`[AI Engine] Attempt ${attempt}/${maxAttempts} failed. Retrying...`, err);
      await new Promise((res) => setTimeout(res, attempt * 1500));
    }
  }

  throw lastErr || new Error(`Failed to generate after ${maxAttempts} attempts.`);
}

export async function callGeminiAPI(apiKey: string | undefined, prompt: string, systemPrompt?: string): Promise<string> {
  const result = await callGeminiWithPersistentRetry(apiKey, prompt, systemPrompt);
  return result.text;
}

// ─────────────────────────────────────────────────────────────
// 🎨 AI IMAGE GENERATION (Tailored Flux 8K Visuals)
// ─────────────────────────────────────────────────────────────
export async function generateAiImageForPost(
  prompt: string,
  width: number = 1080,
  height: number = 1080
): Promise<string> {
  try {
    const enhancedPrompt = `${prompt}, commercial advertising photography, masterpiece, photorealistic, highly detailed, 8k resolution, cinematic studio lighting, vibrant colors, clean aesthetic, award winning`;
    const encoded = encodeURIComponent(enhancedPrompt);
    const randomSeed = Math.floor(Math.random() * 9000000) + 1000000;

    return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&model=flux`;
  } catch {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1080&fit=crop';
  }
}

// ─────────────────────────────────────────────────────────────
// STEP 1: STRATEGY GENERATOR
// ─────────────────────────────────────────────────────────────
export function generateMockStrategy(app: AppProfile): MarketingStrategyPlan {
  return {
    appId: app.id,
    appName: app.name,
    brandPositioning: `${app.name} is the modern solution for ${app.targetAudience || 'high-growth teams'}, solving ${app.painPoints?.[0] || 'manual bottlenecks'} with ${app.keyFeatures?.[0] || 'intelligent automation'}.`,
    primaryHook: `Most ${app.targetAudience?.split(',')[0] || 'people'} waste hours every week on outdated workflows. Here is the modern way:`,
    personas: [
      {
        role: app.targetAudience?.split(',')[0]?.trim() || 'Core User',
        painPoint: app.painPoints?.[0] || 'Frustrated with slow manual tasks',
        coreDesire: 'Save time and achieve seamless results effortlessly',
      },
      {
        role: 'Growth-Focused Leader',
        painPoint: 'Inconsistent execution and lack of leverage',
        coreDesire: 'Reliable, dependable execution that scales',
      },
      {
        role: 'Modern Efficiency Buyer',
        painPoint: 'Overpaying for bloated alternatives',
        coreDesire: 'A simple, intuitive platform that works immediately',
      },
    ],
    pillars: [
      {
        pillar: 'pain_solution',
        title: 'Problem & Hard Truths',
        description: 'Exposing the hidden costs of outdated status-quo workflows.',
        icon: '🎯',
      },
      {
        pillar: 'feature_spotlight',
        title: 'Feature Superpower',
        description: 'Showcasing high-leverage product capabilities with clear proof.',
        icon: '⚡',
      },
      {
        pillar: 'tips_value',
        title: 'Actionable Frameworks',
        description: 'Value-first playbooks, checklists, and frameworks that establish authority.',
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
        title: `The Hidden Cost of ${app.name ? app.painPoints?.[0] || 'Outdated Methods' : 'Manual Work'}`,
        conceptSummary: 'Why traditional approaches cost people time and energy.',
        hookIdea: `If you are still struggling with ${app.painPoints?.[0] || 'manual work'}, here is the truth:`,
      },
      {
        dayNumber: 3,
        pillar: 'feature_spotlight',
        title: `How ${app.name} Solves Your Biggest Friction in Seconds`,
        conceptSummary: `Deep dive into ${app.keyFeatures?.[0] || 'core superpower'}.`,
        hookIdea: `We built ${app.name} to solve one huge problem:`,
      },
      {
        dayNumber: 5,
        pillar: 'tips_value',
        title: '3 Common Mistakes People Make (And How to Fix Them)',
        conceptSummary: 'Actionable 3-part framework to get better results.',
        hookIdea: `3 common mistakes costing you time and money (and how to fix them today):`,
      },
      {
        dayNumber: 7,
        pillar: 'founder_story',
        title: `Why We Built ${app.name}: The Frustration That Started It All`,
        conceptSummary: 'Behind the scenes story of why we created this product.',
        hookIdea: `6 months ago, I was completely fed up with how difficult this was. So we built a solution:`,
      },
      {
        dayNumber: 9,
        pillar: 'pain_solution',
        title: 'The Math: Doing It the Old Way vs. The Modern Way',
        conceptSummary: 'Comparison breakdown showing tangible benefits.',
        hookIdea: `Old way vs. New way with ${app.name}: Here is the breakdown:`,
      },
      {
        dayNumber: 11,
        pillar: 'tips_value',
        title: 'The 3-Step Framework for Rapid Results',
        conceptSummary: 'Practical checklist readers can implement immediately.',
        hookIdea: `A simple 3-step system you can use today to upgrade your results:`,
      },
      {
        dayNumber: 13,
        pillar: 'social_proof',
        title: 'What Happens When You Upgrade Your Routine for 30 Days',
        conceptSummary: 'The compounding impact and direct invitation to try.',
        hookIdea: `What happens when you eliminate friction for 30 days?`,
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
You are an elite Chief Marketing Officer and viral content strategist.
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
- Brand Positioning must be sharp, confident, and focus on the transformation the product provides.
- The Primary Hook must be a viral scroll-stopper with a curiosity gap or contrarian observation tailored to ${app.name}.
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
    const { text } = await callGeminiWithPersistentRetry(
      apiKey,
      prompt,
      'You are a master CMO and brand strategist. Return ONLY valid JSON.',
      4
    );
    const jsonStr = cleanJsonOutput(text);
    const parsed = JSON.parse(jsonStr);

    return {
      appId: app.id,
      appName: app.name,
      brandPositioning: parsed.brandPositioning || `${app.name} helps ${app.targetAudience} achieve better results effortlessly.`,
      primaryHook: parsed.primaryHook || `Most ${app.targetAudience} waste time and energy. Here is why that stops today:`,
      personas: parsed.personas && parsed.personas.length > 0 ? parsed.personas : generateMockStrategy(app).personas,
      pillars: parsed.pillars && parsed.pillars.length > 0 ? parsed.pillars : generateMockStrategy(app).pillars,
      blueprint: parsed.blueprint && parsed.blueprint.length > 0 ? parsed.blueprint : generateMockStrategy(app).blueprint,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Strategy AI generation failed after retries:', error);
    return generateMockStrategy(app);
  }
}

// ----------------------------------------------------
// STEP 2: HIGH-CONVERTING INDIVIDUAL POST GENERATOR
// ----------------------------------------------------
export function generateMockSinglePost(app: AppProfile, blueprint: DayPlanBlueprint, index: number): PostContent {
  const brandTag = sanitizeBrandHashtag(app.name);
  const hook = blueprint.hookIdea || `Most ${app.targetAudience?.split(',')[0] || 'people'} struggle with ${app.painPoints?.[0] || 'friction'}. Here is the fix:`;
  
  const linkedinFull = `${hook}

The biggest bottleneck holding people back isn't lack of effort.

It's using outdated, manual workflows that drain energy:

❌ Spending hours on tedious, repetitive steps
❌ Unnecessary friction and decision fatigue
❌ Slow results that leave you frustrated

Here is the modern solution:

${app.name} is designed to give you pure leverage:
→ ${app.keyFeatures?.[0] || 'Instant AI Automation'}
→ ${app.keyFeatures?.[1] || 'Seamless User Experience'}
→ Zero friction setup

What is your biggest daily bottleneck right now? Drop it in the comments below!

Try ${app.name} at ${app.websiteUrl || 'link in bio'}!

#Growth #Innovation #BuildInPublic ${brandTag}`;

  const instaFull = `${hook}

👉 Swipe through for the full breakdown!

Here is what we cover in this guide:
1. The hidden struggle holding most people back
2. The 3-step actionable framework
3. How ${app.name} makes it effortless

📌 Save this post for later!
💬 What is your biggest daily challenge? Let us know below.

Link in bio to get started with ${app.name}!

#Growth #Tips #Innovation ${brandTag}`;

  const visualPrompt = `A visually stunning, high quality photograph representing ${blueprint.title} for ${app.name}, clean modern composition, professional lighting`;
  const preGeneratedImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt + ', masterpiece, photorealistic, 8k, professional photography')}?width=1080&height=1080&seed=${blueprint.dayNumber * 1000 + 42}&nologo=true&model=flux`;

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
        `The hidden cost of outdated manual workflows`,
        `How modern leverage saves hours of time and energy`,
        `Step-by-step implementation with ${app.name}`,
      ],
      callToAction: `What is the biggest bottleneck in your routine right now? Drop it below.`,
      hashtags: ['#Growth', '#Innovation', '#BuildInPublic', brandTag],
      fullFormattedText: linkedinFull,
    },
    instagram: {
      caption: instaFull,
      callToAction: `📌 Save this for later & tap the link in bio to try ${app.name}!`,
      hashtags: ['#Growth', '#Tips', '#Innovation', brandTag],
      carouselSlides: [
        {
          slideNumber: 1,
          badge: 'GUIDE',
          headline: blueprint.title,
          bodyText: 'Swipe to see the full breakdown 👉',
          visualPrompt,
        },
        {
          slideNumber: 2,
          badge: 'THE HIDDEN COST',
          headline: 'The Real Friction',
          bodyText: app.painPoints?.[0] || 'Outdated workflows drain hours of energy every single week.',
        },
        {
          slideNumber: 3,
          badge: 'THE FRAMEWORK',
          headline: 'The Modern Shift',
          bodyText: `Instead of doing it the hard way, apply intelligent leverage to simplify the process.`,
        },
        {
          slideNumber: 4,
          badge: 'THE SUPERPOWER',
          headline: `Enter ${app.name}`,
          bodyText: `${app.keyFeatures?.[0] || 'Smart Automation'} handles the heavy lifting in seconds.`,
        },
        {
          slideNumber: 5,
          badge: 'THE RESULT',
          headline: 'Before vs. After',
          bodyText: 'Before: Hours of friction. After: Effortless execution and reclaimed time.',
        },
        {
          slideNumber: 6,
          badge: 'ACTION CHECKLIST',
          headline: '3 Action Steps',
          bodyText: '1. Identify the bottleneck\n2. Automate repetitive steps\n3. Enjoy the results',
        },
        {
          slideNumber: 7,
          badge: 'TAKE ACTION',
          headline: 'Ready to Upgrade?',
          bodyText: `📌 Save this post | 🔗 Get started at ${app.websiteUrl || 'link in bio'}!`,
        },
      ],
      visualPrompt,
      fullFormattedCaption: instaFull,
    },
    graphicBanner: {
      headline: blueprint.title.length > 40 ? blueprint.title.slice(0, 38) + '...' : blueprint.title,
      subheadline: app.tagline || 'Growth Engine',
      badge: `${app.name.toUpperCase()} • DAY ${blueprint.dayNumber}`,
      ctaButtonText: 'Learn More',
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
You are an elite viral copywriter and growth marketer writing for:
Product: ${app.name}
Tagline: ${app.tagline}
Description: ${app.description}
Target Audience: ${app.targetAudience}
Post Topic: ${blueprint.title}
Post Concept: ${blueprint.conceptSummary}
Pillar: ${blueprint.pillar}
Tone of Voice: ${app.toneOfVoice}
Brand Tag: ${brandTag}

CRITICAL COPYWRITING INSTRUCTIONS:
1. LINKEDIN POST:
   - Hook: Must be a punchy pattern-interrupt under 140 chars tailored to ${app.name} that forces the reader to click "see more".
   - Rhythm: Short 1-2 sentence paragraphs with clean line breaks. High whitespace.
   - Body: Use hard contrast or a tangible breakdown (e.g. "The old way vs. The new way").
   - Bullet points with bold sub-labels (e.g. "→ The bottleneck:", "→ The cost:", "→ The fix:").
   - Call to Action: End with an engaging conversation-starting question that compels people to comment, followed by a clean link invitation.
   - 3-4 specific hashtags.

2. INSTAGRAM POST & CAROUSEL:
   - Carousel Slides: Generate 6 to 7 high-value slides:
     - Slide 1: HOOK (Bold title + curiosity subheadline)
     - Slide 2: THE PROBLEM (The hidden struggle / cost of inaction)
     - Slide 3: THE FRAMEWORK (The core insight or step 1)
     - Slide 4: THE LEVERAGE (How ${app.name} executes it effortlessly)
     - Slide 5: THE RESULT (Measurable before vs. after outcome)
     - Slide 6: ACTION CHECKLIST (3 practical takeaways)
     - Slide 7: SAVE & CTA (📌 "Save this for your next sprint | Link in bio")

3. AI IMAGE VISUAL PROMPT:
   - Provide a vivid, contextually relevant, photographic or 3D visual description for AI image generation specifically tailored to ${app.name}'s niche (e.g. for food/meal planning: "A vibrant flatlay of fresh organic healthy meal prep containers with avocado and microgreens, clean marble kitchen counter, studio lighting", for SaaS: "Sleek modern 3D glassmorphism interface with ambient lighting").
   - Do NOT include text or letters in the visual prompt description.

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
  "visualPrompt": "Vivid photographic or 3D prompt tailored to ${app.name} niche for AI image generation without text",
  "bannerHeadline": "Short 4-6 word headline for graphic canvas",
  "bannerSub": "Short subtitle"
}
`;

  try {
    const { text, modelUsed } = await callGeminiWithPersistentRetry(
      apiKey,
      prompt,
      'You are a master viral copywriter and growth marketer. Return ONLY valid JSON.',
      4
    );
    const jsonStr = cleanJsonOutput(text);
    const parsed = JSON.parse(jsonStr);

    const hook = parsed.linkedinHook || blueprint.hookIdea;
    const bullets = parsed.linkedinBullets || ['Point 1', 'Point 2', 'Point 3'];
    const cta = parsed.linkedinCTA || `What is the biggest bottleneck in your workflow right now? Let me know in the comments.`;
    const visualPrompt = parsed.visualPrompt || `High quality commercial photography visual representing ${blueprint.title} for ${app.name}`;

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
        hashtags: ['#Growth', '#Innovation', '#BuildInPublic', brandTag],
        fullFormattedText: parsed.linkedinFullText || `${hook}\n\n${bullets.join('\n')}\n\n${cta}\n\n#Growth ${brandTag}`,
      },
      instagram: {
        caption: parsed.instagramCaption || `${hook}\n\n${bullets.join('\n')}\n\n#Growth ${brandTag}`,
        callToAction: cta,
        hashtags: ['#Growth', '#Tips', '#Innovation', brandTag],
        carouselSlides: parsed.carouselSlides && parsed.carouselSlides.length > 0 ? parsed.carouselSlides : [
          { slideNumber: 1, badge: 'GUIDE', headline: blueprint.title, bodyText: 'Swipe to see 👉' },
          { slideNumber: 2, badge: 'PROBLEM', headline: 'The Challenge', bodyText: app.painPoints?.[0] || '' },
          { slideNumber: 3, badge: 'SOLUTION', headline: `Enter ${app.name}`, bodyText: blueprint.conceptSummary },
          { slideNumber: 4, badge: 'BENEFIT', headline: 'The Result', bodyText: 'Save hours of time.' },
          { slideNumber: 5, badge: 'ACTION', headline: 'Try It Today', bodyText: `Link at ${app.websiteUrl || 'bio'}` },
        ],
        visualPrompt,
        fullFormattedCaption: parsed.instagramCaption || `${hook}\n\n${bullets.join('\n')}\n\n#Growth ${brandTag}`,
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
    console.error(`Post AI generation failed for Day ${blueprint.dayNumber} after persistent retries:`, error);
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
    console.error('Full AI campaign generation failed after retries:', error);
    return generateMockCampaign(app, durationDays);
  }
}
