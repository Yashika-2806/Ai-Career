#!/bin/bash

# Hostinger Deployment Script for Ai-Career
# Run this script on your Hostinger VPS

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/Ai-Career || { echo "❌ Project directory not found"; exit 1; }

# Pull latest changes from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

# Check if frontend folder exists and has its own build
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  echo "📦 Building frontend..."
  cd frontend
  npm install
  npm run build || { echo "⚠️  Frontend build failed, continuing..."; }
  cd ..
else
  echo "📦 Building root frontend..."
  npm install
  npm run build || { echo "⚠️  Root build failed, continuing..."; }
fi

# Navigate to backend
cd backend || { echo "❌ Backend directory not found"; exit 1; }

# Install dependencies (only if package.json changed)
if git diff HEAD@{1} HEAD --name-only | grep -q "backend/package.json"; then
  echo "📦 Installing backend dependencies..."
  npm install
fi

# Clean and rebuild backend
echo "🔨 Cleaning and building backend..."
rm -rf dist
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
