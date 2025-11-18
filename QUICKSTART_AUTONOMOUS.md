# 🚀 Quick Start Guide - Autonomous Deployment

## For Users Who Want to Deploy Immediately

### Option 1: Cloudflare Pages (Recommended - FREE)

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Clone and build
git clone https://github.com/Radilovk/airis.git
cd airis
npm install
npm run build

# 3. Deploy to Cloudflare Pages
wrangler login
wrangler pages deploy dist --project-name=airis
```

**Your app will be live at:** `https://airis.pages.dev`

### Option 2: Netlify (Also FREE)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
npm install
npm run build

# 3. Deploy
netlify login
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages (Already Configured)

1. Fork this repository
2. Go to Settings → Pages
3. Select "GitHub Actions" as source
4. Wait 2-3 minutes

**Your app will be at:** `https://<your-username>.github.io/airis/`

## Configuring AI (Required)

After deployment, open your app and:

1. Click **"Настройки" (Settings)**
2. Enable **"Използвай собствен API ключ"**
3. Choose your AI provider:

### For Cloudflare Workers AI (FREE - Recommended)
- **Provider**: Cloudflare Workers AI
- **Model**: `@cf/meta/llama-3.1-8b-instruct`
- **API Token**: Get from [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
  - Click "Create Token"
  - Use "Edit Cloudflare Workers" template
- **Account ID**: Found at Workers & Pages → Overview

### For OpenAI
- **Provider**: OpenAI
- **Model**: `gpt-4o-mini` (cheapest, ~$0.002/analysis)
- **API Key**: Get from [platform.openai.com](https://platform.openai.com/api-keys)

### For Google Gemini (FREE tier available)
- **Provider**: Google Gemini
- **Model**: `gemini-1.5-flash`
- **API Key**: Get from [ai.google.dev](https://ai.google.dev)

## Testing

1. Click "Започни Анализ" (Start Analysis)
2. Fill in the questionnaire
3. Upload iris images (left and right)
4. Wait for AI analysis (~30-60 seconds)
5. View your detailed report!

## Costs

| Provider | Model | Cost per Analysis |
|----------|-------|-------------------|
| Cloudflare | Llama 3.1 8B | **FREE** (10k/day) |
| Gemini | 1.5 Flash | **FREE** (1.5k/day) |
| OpenAI | GPT-4o-mini | ~$0.002 |
| OpenAI | GPT-4o | ~$0.02-0.03 |

## Need Help?

- 📖 Full Guide: [AUTONOMOUS_DEPLOYMENT.md](./AUTONOMOUS_DEPLOYMENT.md)
- 🇧🇬 Bulgarian Answer: [ANSWER_AUTONOMOUS_BG.md](./ANSWER_AUTONOMOUS_BG.md)
- 💬 Issues: [GitHub Issues](https://github.com/Radilovk/airis/issues)

## Quick Links

- [Get Cloudflare API Token](https://dash.cloudflare.com/profile/api-tokens)
- [Get OpenAI API Key](https://platform.openai.com/api-keys)
- [Get Google Gemini API Key](https://ai.google.dev)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

---

**Total Setup Time: 5-10 minutes**  
**Cost: FREE with Cloudflare or Gemini**  
**No backend server needed!**
