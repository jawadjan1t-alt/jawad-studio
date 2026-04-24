#!/bin/bash

# JAWAD STUDIO - QUICK FIX FOR 404 ERROR
# This script pushes all files to GitHub

echo "🚀 JAWAD STUDIO - GITHUB PUSH SCRIPT"
echo "===================================="
echo ""

# Step 1: Ask for GitHub credentials
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your GitHub email: " GITHUB_EMAIL

# Step 2: Configure git
echo ""
echo "📝 Configuring git..."
git config user.email "$GITHUB_EMAIL"
git config user.name "$GITHUB_USERNAME"
echo "✅ Git configured"

# Step 3: Set remote
echo ""
echo "🔗 Setting GitHub remote..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USERNAME/jawad-studio.git
echo "✅ Remote set to: https://github.com/$GITHUB_USERNAME/jawad-studio.git"

# Step 4: Verify remote
echo ""
echo "🔍 Verifying remote..."
git remote -v

# Step 5: Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
echo "This may ask for your GitHub password or personal access token"
echo ""

# Try pushing to master first, then main
if git push -u origin master 2>/dev/null; then
    echo "✅ Successfully pushed to master branch"
elif git push -u origin main 2>/dev/null; then
    echo "✅ Successfully pushed to main branch"
else
    echo "❌ Push failed. Please check:"
    echo "   1. GitHub username is correct"
    echo "   2. Repository 'jawad-studio' exists and is PUBLIC"
    echo "   3. You have push permissions"
    echo ""
    echo "Try manual push:"
    echo "   git push -u origin master"
fi

echo ""
echo "===================================="
echo "🎉 DONE!"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/$GITHUB_USERNAME/jawad-studio"
echo "2. Verify all files are there"
echo "3. Vercel will auto-redeploy"
echo "4. Check: https://jawad-studio.vercel.app"
echo ""
