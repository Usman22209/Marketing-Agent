import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, post, app, imageUrl, n8nWebhookUrl } = body;
    const recipientEmail = toEmail || process.env.USER_GMAIL || process.env.NEXT_PUBLIC_USER_GMAIL || 'netnetlify@gmail.com';

    const appName = app?.name || 'Your Product';
    const dayNumber = post?.dayNumber || 1;
    const postTitle = post?.title || 'Day 1 Launch Post';
    const linkedinText = post?.linkedin?.fullFormattedText || post?.linkedin?.body || '';
    const instaCaption = post?.instagram?.caption || '';
    const visual = imageUrl || post?.generatedImageUrl || '';

    const subject = `🚀 [${appName}] Day ${dayNumber} Social Marketing Post is Ready!`;

    const targetWebhookUrl = n8nWebhookUrl || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    let n8nStatus: { success: boolean; status?: number; message?: string } | null = null;

    // ─── OPTION 1: DISPATCH TO N8N AUTOMATION (IF CONFIGURED) ───
    if (targetWebhookUrl) {
      console.log(`[Email Dispatch] Triggering n8n Webhook: ${targetWebhookUrl} for ${recipientEmail}`);
      try {
        const payload = {
          event: 'send_email_briefing',
          app_id: app?.id,
          appId: app?.id,
          userEmail: recipientEmail,
          toEmail: recipientEmail,
          recipientEmail,
          appName,
          dayNumber,
          postTitle,
          title: postTitle,
          pillar: post?.pillar || 'Product Launch',
          linkedinPost: linkedinText,
          linkedinText,
          instagramCaption: instaCaption,
          instaCaption,
          imageUrl: visual,
          targetAudience: app?.targetAudience || '',
          keyFeature: app?.keyFeatures?.[0] || '',
          timestamp: new Date().toISOString(),
        };

        let n8nRes = await fetch(targetWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // If production webhook returns 404, try test webhook URL if applicable
        if (n8nRes.status === 404 && targetWebhookUrl.includes('/webhook/')) {
          const testUrl = targetWebhookUrl.replace('/webhook/', '/webhook-test/');
          console.log(`[Email Dispatch] Production webhook 404, trying test webhook URL: ${testUrl}`);
          n8nRes = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        const resText = await n8nRes.text();
        console.log(`[Email Dispatch] n8n Webhook Response (${n8nRes.status}):`, resText);

        if (n8nRes.ok) {
          n8nStatus = { success: true, status: n8nRes.status, message: 'Dispatched to n8n workflow successfully!' };
        } else {
          n8nStatus = {
            success: false,
            status: n8nRes.status,
            message: n8nRes.status === 404
              ? 'n8n Webhook returned 404. Make sure your workflow is toggled to "Active" in the top-right of n8n cloud.'
              : `n8n Webhook returned status ${n8nRes.status}: ${resText}`,
          };
        }
      } catch (e: any) {
        console.error('[Email Dispatch] n8n Webhook fetch failed:', e);
        n8nStatus = { success: false, message: `n8n connection failed: ${e?.message}` };
      }
    }

    // ─── OPTION 2: RESEND API (IF KEY AVAILABLE) ───
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && recipientEmail) {
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #4f46e5; padding: 24px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${appName} • Day ${dayNumber} Post Ready!</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Autonomous AI Marketing Briefing</p>
          </div>

          <div style="padding: 24px;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">${postTitle}</h2>
            
            ${visual ? `
              <div style="margin: 16px 0; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <img src="${visual}" alt="AI Visual" style="width: 100%; height: auto; display: block;" />
              </div>
            ` : ''}

            <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #1e293b;">📘 LinkedIn Post (Ready to Post)</h3>
              <div style="font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-line;">${linkedinText}</div>
            </div>

            <div style="margin-top: 20px; padding: 16px; background: #fdf2f8; border-radius: 12px; border: 1px solid #fbcfe8;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #831843;">📸 Instagram Caption</h3>
              <div style="font-size: 13px; line-height: 1.6; color: #475569; white-space: pre-line;">${instaCaption}</div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <p style="font-size: 12px; color: #64748b;">Generated by your Autonomous Marketing Agent</p>
            </div>
          </div>
        </div>
      `;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `${appName} Marketing <marketing@resend.dev>`,
            to: [recipientEmail],
            subject,
            html: htmlBody,
          }),
        });

        if (res.ok) {
          return NextResponse.json({
            success: true,
            deliveredDirectly: true,
            message: `Day ${dayNumber} briefing successfully sent to ${recipientEmail}!`,
            n8nStatus,
          });
        }
      } catch (err) {
        console.warn('Resend direct delivery notice:', err);
      }
    }

    // ─── OPTION 3: 1-CLICK GMAIL CLIENT PRE-FILLED LINK ───
    const mailtoBody = encodeURIComponent(
      `Here is your Day ${dayNumber} Social Post for ${appName}!\n\n` +
      `📌 TOPIC: ${postTitle}\n\n` +
      `----------------------------------------\n` +
      `📘 LINKEDIN POST:\n\n${linkedinText}\n\n` +
      `----------------------------------------\n` +
      `📸 INSTAGRAM CAPTION:\n\n${instaCaption}\n\n` +
      `----------------------------------------\n` +
      `🖼️ AI IMAGE URL:\n${visual}\n`
    );

    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${mailtoBody}`;
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${mailtoBody}`;

    return NextResponse.json({
      success: true,
      deliveredDirectly: n8nStatus?.success || false,
      message: n8nStatus?.success
        ? `Day ${dayNumber} post dispatched to n8n workflow for ${recipientEmail}!`
        : `Day ${dayNumber} briefing prepared for ${recipientEmail}!`,
      n8nStatus,
      gmailWebUrl,
      mailtoUrl,
      subject,
      preview: {
        toEmail: recipientEmail,
        subject,
        postTitle,
      },
    });
  } catch (error: any) {
    console.error('[Email Dispatch] Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to dispatch email briefing' }, { status: 500 });
  }
}
