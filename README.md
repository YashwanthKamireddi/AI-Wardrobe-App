# Celura - Luxury AI-Powered Wardrobe

<div align="center">
  <img src="client/public/celura-logo.png" alt="Celura Logo" width="120" height="120" />

  **Celura** — Your Personal Style Curator

  *Established 2026*
</div>

---

## Brand Overview

**Celura** is a luxury AI-powered wardrobe management application designed to organize closets and provide intelligent outfit recommendations tailored to your unique style and occasions.

### Brand Identity

| Attribute | Value |
|-----------|-------|
| **Brand Name** | Celura |
| **Tagline** | Luxury AI-Powered Wardrobe |
| **Established** | 2026 |
| **Primary Color** | Deep Burgundy — `hsl(337, 73%, 26%)` |
| **Accent Color** | Brushed Gold — `hsl(38, 75%, 55%)` |

---

## Features

### 🎨 Wardrobe Management
Organize your entire wardrobe with high-quality photos, categories, colors, and seasons. Every piece catalogued with luxury in mind.

### 🤖 AI-Powered Recommendations
Intelligent outfit suggestions based on weather, mood, and occasion. Celura learns your style preferences over time.

### ☀️ Weather-Aware Styling
Real-time weather integration ensures you're always dressed appropriately while maintaining your signature look.

### 💫 Style Inspiration
Browse curated fashion inspiration and discover new ways to style your existing pieces.

### 📱 Responsive Design
Seamless experience across all devices — from desktop to mobile.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:5000** to experience Celura.

---

## Configuration

### AI Features
For intelligent outfit recommendations:
1. Obtain an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it when prompted in the application settings

### Weather Integration
Weather features work automatically using your location (with permission).

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **AI** | OpenAI GPT for recommendations |
| **Database** | Supabase PostgreSQL |
| **Styling** | Tailwind CSS with luxury design system |

---

## Color Palette

```css
/* Celura Brand Colors */
--primary: hsl(337, 73%, 26%);      /* Deep Burgundy Enamel */
--accent: hsl(38, 75%, 55%);        /* Brushed Gold */
--background: hsl(30, 30%, 98%);    /* Warm Cream */
--foreground: hsl(337, 50%, 15%);   /* Rich Dark */
```

---

## Deployment

### Deploy to Vercel

Celura can be deployed as a full-stack application on Vercel:

#### 1. Push to GitHub
```bash
git add .
git commit -m "feat: Celura luxury wardrobe app"
git push origin main
```

#### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `AI-Wardrobe-App` repository
4. Configure the project:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

#### 3. Environment Variables
Add these in Vercel's project settings:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `SESSION_SECRET` | Random secure string (32+ chars) |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key (optional, free tier) |
| `NODE_ENV` | `production` |

#### 4. Deploy
Click **Deploy** — Vercel will build and deploy automatically.

### Get API Keys

| Service | URL | Notes |
|---------|-----|-------|
| **Supabase** | [supabase.com](https://supabase.com) | Free tier available |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | For AI recommendations |
| **OpenWeatherMap** | [openweathermap.org/api](https://openweathermap.org/api) | Free tier: 1000 calls/day |

---

<div align="center">

  **© 2026 Celura. Crafted with elegance.**

  *Luxury AI-Powered Wardrobe Management*

</div>
