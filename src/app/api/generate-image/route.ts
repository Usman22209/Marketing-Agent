import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, width = 1080, height = 1080, seed } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhance prompt for SaaS / tech marketing aesthetic
    const enhancedPrompt = `${prompt}, sleek modern dark tech aesthetic, glowing neon accents, 3d isometric minimalist rendering, clean glassmorphism UI elements, cinematic studio lighting, premium design, 8k resolution, photorealistic, trending on dribbble and behance`;

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const randomSeed = seed || Math.floor(Math.random() * 1000000);
    
    // Pollinations AI provides instant, free, keyless 8k Flux/Turbo image generation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&model=flux`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate image' }, { status: 500 });
  }
}
