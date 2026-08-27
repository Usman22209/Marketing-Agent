import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, payload } = body;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'n8n Webhook URL is required' }, { status: 400 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload || { event: 'marketing_campaign_triggered', timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `n8n webhook error: ${response.status} - ${errText}` }, { status: response.status });
    }

    const data = await response.text();
    return NextResponse.json({ success: true, response: data });
  } catch (error: any) {
    console.error('n8n trigger error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to dispatch to n8n webhook' }, { status: 500 });
  }
}
