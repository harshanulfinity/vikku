# 🤖 OpenAI API Setup - IMPORTANT

## ⚠️ Current Issue

The OpenAI features (Cost Estimator, ROI Calculator, etc.) require **backend serverless functions** which only work in production (Vercel), not in local development with Vite.

---

## 🔧 Quick Fix Options

### Option 1: Deploy to Vercel (Recommended)

The AI features will work automatically once deployed:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted

# Redeploy
vercel --prod
```

### Option 2: Test Locally with Vercel Dev

```bash
# Install Vercel CLI
npm i -g vercel

# Run local serverless environment
vercel dev

# This runs on http://localhost:3000
# AI features will work here!
```

### Option 3: Temporarily Disable AI Features

If you don't need AI features right now, you can skip them and use the rest of the app.

---

## 🚀 Production Setup

### 1. Add Environment Variables in Vercel

Go to your Vercel project settings:
- **Settings** → **Environment Variables**
- Add these:

```
OPENAI_API_KEY=your_openai_api_key_here
RESEND_API_KEY=re_4o9ZwCaE_82XUcx8Bp41qCmLfwzZ8nDbS
RAZORPAY_KEY_SECRET=fQyoXQRralFMVXYByaFsLGSW
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Test AI Features

Visit your production URL and test:
- Cost Estimator: `/dashboard/cost-estimator`
- ROI Calculator: `/dashboard/roi-calculator`
- Timeline Calculator: `/dashboard/timeline-calculator`
- Tech Recommender: `/dashboard/tech-recommender`

---

## 📁 Backend API Endpoints

These files handle OpenAI calls securely:

- `/api/openai-estimate.js` - Cost estimation
- `/api/openai-roi.js` - ROI calculation  
- `/api/openai-timeline.js` - Timeline calculation
- `/api/openai-stack.js` - Tech stack recommendation
- `/api/openai-plan.js` - Project planning

**Security:** API keys are NEVER exposed to the frontend!

---

## 🐛 Troubleshooting

### "Failed to generate cost estimate"

**Cause:** Running on Vite dev server (`npm run dev`)  
**Fix:** Use `vercel dev` or deploy to Vercel

### "Empty response from server"

**Cause:** API endpoint not found or OpenAI key missing  
**Fix:** 
1. Check Vercel environment variables
2. Redeploy after adding env vars

### "API key not configured"

**Cause:** `OPENAI_API_KEY` not set in Vercel  
**Fix:** Add it in Vercel dashboard → Settings → Environment Variables

---

## 💡 Why This Approach?

### ❌ Old Way (Insecure)
```javascript
// API key exposed in browser!
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 🚨 INSECURE
})
```

### ✅ New Way (Secure)
```javascript
// Frontend calls backend API
const response = await fetch('/api/openai-estimate', {
  method: 'POST',
  body: JSON.stringify({ requirements })
})

// Backend handles OpenAI (API key never exposed)
```

**Benefits:**
- ✅ API key never exposed to browser
- ✅ No one can steal your key
- ✅ Production-ready security
- ✅ Rate limiting possible
- ✅ Cost control

---

## 🎯 Recommended Workflow

### For Development
```bash
# Option A: Use Vercel Dev (AI features work)
vercel dev

# Option B: Use Vite Dev (AI features disabled, faster)
npm run dev
```

### For Production
```bash
# Deploy to Vercel
vercel --prod

# AI features work automatically!
```

---

## 📊 Current Status

- ✅ Backend API endpoints created
- ✅ Frontend updated to use backend APIs
- ✅ Security fixed (no exposed API keys)
- ⚠️ Requires Vercel deployment to work
- ⚠️ Won't work on `npm run dev` (Vite only)

---

## 🚀 Next Steps

1. **Deploy to Vercel:** `vercel --prod`
2. **Add environment variables** in Vercel dashboard
3. **Test AI features** on production URL
4. **Use `vercel dev`** for local testing with AI features

---

**Questions?** Check Vercel docs: https://vercel.com/docs/functions/serverless-functions
