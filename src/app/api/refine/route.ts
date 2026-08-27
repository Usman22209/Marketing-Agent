import { NextRequest, NextResponse } from 'next/server';
import { callGeminiAPI, cleanJsonOutput } from '@/lib/gemini';
import { PostContent } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post, instruction, apiKey } = body as {
      post: PostContent;
      instruction: string;
      apiKey?: string;
    };

    if (!post) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    const prompt = `
You are a viral social media copy editor.
Take this existing marketing post content and rewrite it according to this specific instruction: "${instruction}"

Original LinkedIn Post:
${post.linkedin.fullFormattedText}

Original Instagram Caption:
${post.instagram.fullFormattedCaption}

Original Instagram Carousel:
${JSON.stringify(post.instagram.carouselSlides)}

Return a JSON object with:
{
  "linkedinHook": "Updated hook sentence",
  "linkedinFull": "Updated full formatted LinkedIn post",
  "instagramCaption": "Updated full formatted Instagram caption",
  "carouselSlides": [
    { "slideNumber": 1, "badge": "HOOK", "headline": "...", "bodyText": "..." },
    { "slideNumber": 2, "badge": "PROBLEM", "headline": "...", "bodyText": "..." },
    { "slideNumber": 3, "badge": "SOLUTION", "headline": "...", "bodyText": "..." },
    { "slideNumber": 4, "badge": "PROOF", "headline": "...", "bodyText": "..." },
    { "slideNumber": 5, "badge": "CTA", "headline": "...", "bodyText": "..." }
  ]
}
`;

    try {
      const raw = await callGeminiAPI(apiKey, prompt);
      const cleaned = cleanJsonOutput(raw);
      const parsed = JSON.parse(cleaned);

      const updatedPost: PostContent = {
        ...post,
        linkedin: {
          ...post.linkedin,
          hook: parsed.linkedinHook || post.linkedin.hook,
          fullFormattedText: parsed.linkedinFull || post.linkedin.fullFormattedText,
        },
        instagram: {
          ...post.instagram,
          caption: parsed.instagramCaption || post.instagram.caption,
          fullFormattedCaption: parsed.instagramCaption || post.instagram.fullFormattedCaption,
          carouselSlides: parsed.carouselSlides || post.instagram.carouselSlides,
        },
      };

      return NextResponse.json({ success: true, post: updatedPost });
    } catch (aiErr) {
      // Local fallback rewrite
      return NextResponse.json({
        success: true,
        post: {
          ...post,
          linkedin: {
            ...post.linkedin,
            hook: `🔥 ${post.linkedin.hook.replace(/^🔥\s*/, '')}`,
            fullFormattedText: `🔥 ${post.linkedin.fullFormattedText}`,
          },
        },
      });
    }
  } catch (error: any) {
    console.error('API /api/refine error:', error);
    return NextResponse.json({ error: error?.message || 'Refine failed' }, { status: 500 });
  }
}
