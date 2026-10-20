# 🚀 AI Marketing Agent Platform

An autonomous AI marketing department for SaaS, web apps, and digital products. Create brand profiles once, generate multi-channel marketing campaigns, review in live pixel-accurate social mockups, and run automated cron timed events with zero external tools or complex webhooks.

---

## ✨ Key Features

1. **🏢 Multi-App Hub:** Onboard products with name, tagline, description, target audience, tone of voice, and brand colors.
2. **🧠 AI Campaign Generator:**
   - Powered by Google Gemini (`gemini-2.0-flash` / `gemini-2.5-flash`) with reliable fallback templates.
   - Generates schedules across key content pillars: Problem & Hard Truths, Feature Spotlight, Founder Story, Actionable Frameworks, and Social Proof.
3. **⏱️ Integrated Autonomous Cron Scheduler:**
   - Self-contained `/api/cron` timed event server endpoint.
   - 1-Click **"Run Scheduler Now"** button on the dashboard for instant testing.
   - Compatible with Vercel Cron, GitHub Actions, system Task Scheduler, or standard `curl`.
   - Sends post briefings directly to your notification email.
4. **👀 Pixel-Accurate Live Social Studio:**
   - **LinkedIn Card:** High-converting hooks, skimmable bullet points, CTA, character counter, and 1-click text copy.
   - **Instagram Card:** Carousel slide viewer, caption expander, and hashtag organizer.
5. **🎨 Dynamic Branded Graphic Canvas:**
   - Client-side canvas generator that automatically paints custom 1080x1080 social promo cards. 1-Click PNG download.
6. **🗄️ Hybrid Database:**
   - Connects to Supabase with provided SQL schema (`supabase_schema.sql`), with automatic browser storage fallback for instant offline testing.

---

## 🛠️ Quick Start

### 1. Install & Run Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⏱️ Autonomous Cron Job / Timed Event Server

The app includes a dedicated API endpoint:
```
POST /api/cron
GET  /api/cron
```

### Manual Trigger:
Click the **"⚡ Run Scheduler Now"** button in the **Automated Scheduler** tab on your dashboard.

### Automated Scheduling Options:
* **Vercel Cron:** Add to `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron",
        "schedule": "0 9 */2 * *"
      }
    ]
  }
  ```
* **Command Line / Curl:**
  ```bash
  curl -X POST http://localhost:3000/api/cron
  ```
* **With Security Token (`CRON_SECRET`):**
  ```bash
  curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron
  ```

---

## 🔑 Configuration

### Free Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. Paste it into `.env.local` or the **Settings modal** in the web app:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

### Free Supabase Database (Optional)
1. Create a free project at [supabase.com](https://supabase.com/).
2. Run `supabase_schema.sql` in the Supabase SQL Editor.
3. Copy your project URL and anon public key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
*(Note: If skipped, all data is automatically saved in your browser's local storage).*
