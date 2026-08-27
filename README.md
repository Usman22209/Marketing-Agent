# 🚀 AI Marketing Agent Platform (Free MVP)

An autonomous AI marketing department for SaaS, web apps, and digital products. Create brand profiles once, generate 14-day / 30-day multi-channel marketing campaigns, review in live pixel-accurate social mockups, and export with 1-click text copying and high-res branded graphic downloads.

---

## ✨ Key Features

1. **🏢 Multi-App Hub:** Onboard products with taglines, target audience, pain points, features, tone of voice, and brand color palettes.
2. **🧠 Multi-Agent Campaign Generator:**
   - Powered by Google Gemini (`gemini-1.5-flash` / `gemini-2.5-flash`) with zero-config smart fallback templates.
   - Generates 14-day schedules (1 post every 2 days across 5 content pillars: Pain Point Agitation, Feature Spotlight, Founder Story, Actionable Tips, Social Proof).
3. **👀 Pixel-Accurate Live Social Studio:**
   - **LinkedIn Card:** High-converting hooks, skimmable bullet points, CTA, character counter, and AI quick-rewrite tools.
   - **Instagram Card:** 5-slide carousel simulator with slide switcher, caption expander, and hashtag organizer.
4. **🎨 Dynamic Branded Graphic Canvas:**
   - Client-side HTML5 Canvas generator that automatically paints custom 1080x1080 social promo cards using your brand colors, headline, and badges. 1-Click PNG download.
5. **🛡️ 100% Account Safety:**
   - Zero risk of social media shadowbans or API blocks. Posts are reviewed via human-in-the-loop and copied in 1 click.
6. **🤖 n8n Workflow Automation (Every 2 Days):**
   - Importable workflow (`n8n/autopilot_marketing_gmail.json`) running on a 2-day cron schedule with Gemini AI + Gmail notification node.
7. **🗄️ Hybrid Database:**
   - Connects to Supabase with provided SQL schema (`supabase/schema.sql`), with automatic local storage fallback for instant testing.

---

## 🛠️ Quick Start

### 1. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Configuration (100% Free)

### Step 1: Free Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. Paste it into `.env.local` or directly into the **Settings modal** inside the web app:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
   ```

### Step 2: Free Supabase Database (Optional)
1. Create a free project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** in Supabase and run the script in `supabase/schema.sql`.
3. Copy your project URL and anon public key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
*(Note: If skipped, all data is automatically stored in your browser's local storage).*

### Step 3: n8n Automation & Gmail Notifications (Optional)
1. Open your [n8n Cloud](https://n8n.io/) or self-hosted n8n instance.
2. Go to **Workflows ➔ Import from File** and select `n8n/autopilot_marketing_gmail.json`.
3. Set your Gmail OAuth credentials and activate the workflow.
4. Add your n8n Webhook URL to the Settings in the web dashboard.
