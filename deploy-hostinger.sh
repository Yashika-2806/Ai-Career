#!/bin/bash

# Hostinger Deployment Script for Ai-Career
# Run this script on your Hostinger VPS

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/Ai-Career || { echo "❌ Project directory not found"; exit 1; }

# Run diagnostics first
if [ -f "diagnose-server.sh" ]; then
  echo "🔍 Running diagnostics..."
  bash diagnose-server.sh
  echo ""
  read -p "Continue with deployment? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

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

# Copy logo to dist if exists
if [ -f "public/logo.svg" ] && [ -d "frontend/dist" ]; then
  echo "📋 Copying logo.svg to dist..."
  cp public/logo.svg frontend/dist/
fi

# Navigate to backend
cd backend || { echo "❌ Backend directory not found"; exit 1; }

# Ensure PORT is set correctly in .env
if [ -f ".env" ]; then
  if ! grep -q "^PORT=5001" .env; then
    echo "⚙️  Setting PORT=5001 in .env..."
    if grep -q "^PORT=" .env; then
      sed -i 's/^PORT=.*/PORT=5001/' .env
    else
      echo "PORT=5001" >> .env
    fi
  fi
fi

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
echo "🔍 Testing backend health..."
sleep 2
curl -s http://localhost:5001/health | jq '.' || echo "⚠️  Backend not responding"

echo ""
echo "✅ Deployment successful! Your changes are now live."
echo "🌐 Visit: https://ai.gladsw.cloud"
echo ""
echo "If you get 502 errors, run: bash fix-server.sh"
