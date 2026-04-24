# 🚀 PUSH TO GITHUB & DEPLOY TO VERCEL

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `jawad-studio`
   - **Description:** `AI Creative Studio - Image and Video Generation`
   - **Visibility:** Public (required for Vercel)
3. Click "Create repository"
4. Copy the repository URL (looks like: `https://github.com/YOUR_USERNAME/jawad-studio.git`)

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
cd /home/ubuntu/jawad-studio-web

# Configure git (one time)
git config user.email "your-email@gmail.com"
git config user.name "Your Name"

# Add remote repository
git remote set-url origin https://github.com/YOUR_USERNAME/jawad-studio.git

# Verify remote is set
git remote -v

# Push to GitHub
git push -u origin main
```

**If you get an error**, try:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/jawad-studio.git
git push -u origin main
```

## Step 3: Verify on GitHub

1. Go to `https://github.com/YOUR_USERNAME/jawad-studio`
2. You should see all your files
3. Copy the repository URL for Vercel

## Step 4: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste your repository URL: `https://github.com/YOUR_USERNAME/jawad-studio`
4. Click "Import"
5. Vercel auto-detects settings (no changes needed)
6. Click "Deploy"
7. **Wait 1-2 minutes for deployment**
8. **Your permanent URL:** `https://jawad-studio.vercel.app` ✅

## Your Permanent URLs

After deployment:
- **Production:** `https://jawad-studio.vercel.app` (24/7 live)
- **GitHub:** `https://github.com/YOUR_USERNAME/jawad-studio`
- **Admin Panel:** Login with `jawadjan1t@gmail.com`

## Test Credentials

**Admin Account** (Unlimited):
- Email: `jawadjan1t@gmail.com`
- Password: Any password

**Regular User** (100 daily credits):
- Email: Any email
- Password: Any password

## Troubleshooting

### Git Push Fails
- Make sure repository is PUBLIC
- Check GitHub credentials
- Verify remote URL is correct: `git remote -v`

### Vercel Build Fails
- Check Node version: `node --version` (should be 20.x+)
- Check npm version: `npm --version` (should be 10.x+)
- Check Vercel deployment logs

### App Doesn't Load
- Clear browser cache
- Check browser console for errors
- Verify Replicate API key is valid

## Support

- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com
- Replicate: https://replicate.com

---

**Your app will be live 24/7 on Vercel!** 🌍
