# 🔑 JAWAD STUDIO - API KEYS SETUP GUIDE

## 📋 OVERVIEW

Your app uses **Replicate API** for:
- ✅ Image Generation (FLUX Schnell model)
- ✅ Text-to-Video (Luma Ray model)
- ✅ Image-to-Video (Stable Video Diffusion model)

**One API key** powers all three features!

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1: Get Your Replicate API Key

1. Go to: https://replicate.com/signin
2. Sign up or login with email
3. Go to: https://replicate.com/account/api-tokens
4. Click **"Create token"**
5. Copy the token (starts with `r8_`)
6. **SAVE IT SAFELY** - You'll need it in next steps

**Example token format:**
```
r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl
```

---

### STEP 2: Add API Key to Vercel Environment Variables

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Click your **"jawad-studio"** project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar
5. Click **"Add New"** button
6. Fill in:
   - **Name:** `REPLICATE_API_KEY`
   - **Value:** Paste your token (r8_...)
   - **Environments:** Select all (Production, Preview, Development)
7. Click **"Save"**
8. Click **"Redeploy"** to apply changes

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add REPLICATE_API_KEY

# When prompted, paste your token:
# r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl

# Redeploy
vercel --prod
```

---

### STEP 3: Update Your App Code

Your app currently has the API key hardcoded. We need to update it to use the environment variable.

**Current Code (Line 7 in src/App.tsx):**
```typescript
const REPLICATE_API_KEY = 'r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl';
```

**Should be changed to:**
```typescript
const REPLICATE_API_KEY = process.env.REACT_APP_REPLICATE_API_KEY || 'r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl';
```

**Note:** For Vercel, we need to use `REACT_APP_` prefix for environment variables in React apps.

---

### STEP 4: Update Vercel Environment Variable Name

Since we're using React, we need to use the `REACT_APP_` prefix:

1. Go to Vercel Dashboard
2. Go to Settings → Environment Variables
3. **Delete** the old `REPLICATE_API_KEY` variable
4. **Add New** with:
   - **Name:** `REACT_APP_REPLICATE_API_KEY`
   - **Value:** Your Replicate token
   - **Environments:** All
5. Click **Save**

---

### STEP 5: Update App Code

Update `src/App.tsx` line 7:

```typescript
// OLD (hardcoded):
const REPLICATE_API_KEY = 'r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl';

// NEW (from environment):
const REPLICATE_API_KEY = process.env.REACT_APP_REPLICATE_API_KEY || 'r8_2LS2Z4XfOxWDXyqHKEfUvqU7aQXvKKdHMKSXl';
```

---

### STEP 6: Rebuild and Deploy

```bash
# Build locally to test
npm run build

# Commit changes
git add src/App.tsx
git commit -m "feat: Use environment variable for Replicate API key"

# Push to GitHub
git push origin main

# Vercel automatically redeploys!
```

---

## 📊 API MODELS USED

| Feature | Model | Cost |
|---------|-------|------|
| Image Generation | `black-forest-labs/flux-schnell` | Free |
| Text-to-Video | `luma/ray` | Paid (depends on Replicate) |
| Image-to-Video | `stability-ai/stable-video-diffusion` | Paid (depends on Replicate) |

---

## 🧪 TEST YOUR SETUP

After deploying:

1. Go to https://jawad-studio.vercel.app
2. Login with `jawadjan1t@gmail.com` (any password)
3. Try **Image Generation** (should work immediately)
4. Try **Text-to-Video** (should work)
5. Try **Image-to-Video** (should work)

---

## ❌ TROUBLESHOOTING

### "API Error" or "Invalid API Key"

**Solution:**
1. Check Replicate token is correct (starts with `r8_`)
2. Verify environment variable name is `REACT_APP_REPLICATE_API_KEY`
3. Check Vercel deployment completed (green checkmark)
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh the page

### "401 Unauthorized"

**Solution:**
1. Go to https://replicate.com/account/api-tokens
2. Check if token is still active
3. If expired, create a new token
4. Update in Vercel environment variables
5. Redeploy

### "Generation taking too long"

**Solution:**
1. This is normal for video generation (can take 2-5 minutes)
2. Check Replicate status at https://status.replicate.com
3. Try again later if service is down

---

## 📱 VERCEL ENVIRONMENT VARIABLES CHECKLIST

- [ ] Replicate account created at https://replicate.com
- [ ] API token generated and copied
- [ ] Environment variable added to Vercel (`REACT_APP_REPLICATE_API_KEY`)
- [ ] App code updated to use environment variable
- [ ] Changes pushed to GitHub
- [ ] Vercel deployment completed (green checkmark)
- [ ] Image generation tested ✅
- [ ] Video generation tested ✅

---

## 🔒 SECURITY BEST PRACTICES

✅ **DO:**
- Store API keys in Vercel environment variables
- Never commit API keys to GitHub
- Use different tokens for development/production
- Rotate tokens regularly

❌ **DON'T:**
- Hardcode API keys in source code
- Share API keys in chat or email
- Commit `.env` files to Git
- Use same token for multiple projects

---

## 📞 SUPPORT

If you need help:
1. Check Replicate docs: https://replicate.com/docs
2. Check Vercel docs: https://vercel.com/docs
3. Check your app logs in Vercel dashboard

---

**Your app is ready to generate images and videos!** 🚀
