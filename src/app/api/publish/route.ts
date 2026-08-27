import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform, // 'facebook' | 'instagram' | 'both' | 'n8n'
      post,
      imageUrl,
      metaAccessToken,
      facebookPageId,
      instagramAccountId,
      n8nWebhookUrl,
    } = body;

    // ─── OPTION A: DISPATCH TO N8N AUTOMATION WORKFLOW ───
    if (platform === 'n8n' || n8nWebhookUrl) {
      if (!n8nWebhookUrl) {
        return NextResponse.json({ error: 'n8n Webhook URL is required' }, { status: 400 });
      }

      const n8nRes = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'publish_post',
          post,
          imageUrl,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!n8nRes.ok) {
        const errText = await n8nRes.text();
        throw new Error(`n8n webhook error: ${n8nRes.status} - ${errText}`);
      }

      return NextResponse.json({ success: true, message: 'Dispatched to n8n workflow for publishing!' });
    }

    // ─── OPTION B: DIRECT META GRAPH API PUBLISHING ───
    const token = metaAccessToken || process.env.META_PAGE_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'Meta Page Access Token is required for direct publishing. Alternatively, use n8n webhook.' },
        { status: 400 }
      );
    }

    const results: Record<string, any> = {};

    // 1. Publish to Facebook Page
    if (platform === 'facebook' || platform === 'both') {
      const pageId = facebookPageId || process.env.FACEBOOK_PAGE_ID;
      if (!pageId) {
        throw new Error('Facebook Page ID is required.');
      }

      const fbCaption = post?.linkedin?.fullFormattedText || post?.title || 'New Product Update';
      const fbUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;

      const fbRes = await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
          caption: fbCaption,
          access_token: token,
        }),
      });

      const fbData = await fbRes.json();
      if (!fbRes.ok) {
        throw new Error(`Facebook API Error: ${fbData.error?.message || JSON.stringify(fbData)}`);
      }
      results.facebook = fbData;
    }

    // 2. Publish to Instagram Professional Account
    if (platform === 'instagram' || platform === 'both') {
      const igId = instagramAccountId || process.env.INSTAGRAM_ACCOUNT_ID;
      if (!igId) {
        throw new Error('Instagram Account ID is required.');
      }

      const igCaption = `${post?.instagram?.caption || post?.title}\n\n${post?.instagram?.hashtags?.join(' ') || ''}`;
      const imgToUse = imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';

      // Step 1: Create Container
      const createUrl = `https://graph.facebook.com/v19.0/${igId}/media?image_url=${encodeURIComponent(imgToUse)}&caption=${encodeURIComponent(igCaption)}&access_token=${token}`;
      const createRes = await fetch(createUrl, { method: 'POST' });
      const createData = await createRes.json();

      if (!createRes.ok || !createData.id) {
        throw new Error(`Instagram Container Creation Error: ${createData.error?.message || JSON.stringify(createData)}`);
      }

      const creationId = createData.id;

      // Step 2: Publish Container Live
      const publishUrl = `https://graph.facebook.com/v19.0/${igId}/media_publish?creation_id=${creationId}&access_token=${token}`;
      const publishRes = await fetch(publishUrl, { method: 'POST' });
      const publishData = await publishRes.json();

      if (!publishRes.ok) {
        throw new Error(`Instagram Publish Error: ${publishData.error?.message || JSON.stringify(publishData)}`);
      }

      results.instagram = publishData;
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to auto-publish post' }, { status: 500 });
  }
}
