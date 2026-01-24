#!/bin/bash

# Hostinger Deployment Script for Ai-Career
# Run this script on your Hostinger VPS

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/Ai-Career || { echo "❌ Project directory not found"; exit 1; }

# Pull latest changes from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

# Navigate to backend
cd backend || { echo "❌ Backend directory not found"; exit 1; }

# Install dependencies (only if package.json changed)
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
  echo "📦 Installing backend dependencies..."
  npm install
fi

# Build backend
echo "🔨 Building backend..."
npm run build || { echo "❌ Backend build failed"; exit 1; }

# Restart PM2 process
echo "♻️  Restarting backend with PM2..."
pm2 restart ai-backend || { echo "❌ PM2 restart failed"; exit 1; }

# Show PM2 status
echo "✅ Deployment complete! Backend status:"
pm2 status

echo ""
echo "📊 Recent logs:"
pm2 logs ai-backend --lines 20 --nostream

echo ""
echo "✅ Deployment successful! Your changes are now live."
echo "🌐 Visit: https://ai.gladsw.cloud"
