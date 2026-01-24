#!/bin/bash

# Auto-Fix Script for Hostinger Server
# Run this to automatically fix common 502 issues

echo "🔧 Auto-fixing server issues..."
echo ""

# Fix 1: Ensure backend .env has correct PORT
echo "1️⃣  Setting PORT=5001 in backend/.env..."
cd /var/www/Ai-Career/backend || exit 1
if [ -f ".env" ]; then
    # Update PORT if it exists, or add it
    if grep -q "^PORT=" .env; then
        sed -i 's/^PORT=.*/PORT=5001/' .env
    else
        echo "PORT=5001" >> .env
    fi
    echo "✅ PORT set to 5001"
else
    echo "❌ .env file not found"
fi
echo ""

# Fix 2: Update Nginx config
echo "2️⃣  Updating Nginx configuration..."
if [ -f "/var/www/Ai-Career/nginx-config-fix.conf" ]; then
    sudo cp /var/www/Ai-Career/nginx-config-fix.conf /etc/nginx/sites-available/ai.gladsw.cloud
    sudo ln -sf /etc/nginx/sites-available/ai.gladsw.cloud /etc/nginx/sites-enabled/
    echo "✅ Nginx config updated"
    
    # Test nginx config
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo "✅ Nginx config is valid"
        sudo systemctl reload nginx
        echo "✅ Nginx reloaded"
    else
        echo "❌ Nginx config has errors"
        sudo nginx -t
    fi
else
    echo "⚠️  nginx-config-fix.conf not found, skipping"
fi
echo ""

# Fix 3: Copy logo.svg to dist
echo "3️⃣  Copying logo.svg..."
if [ -f "/var/www/Ai-Career/public/logo.svg" ]; then
    mkdir -p /var/www/Ai-Career/frontend/dist
    cp /var/www/Ai-Career/public/logo.svg /var/www/Ai-Career/frontend/dist/
    echo "✅ logo.svg copied to dist"
else
    echo "⚠️  logo.svg not found in public/"
fi
echo ""

# Fix 4: Rebuild backend
echo "4️⃣  Rebuilding backend..."
cd /var/www/Ai-Career/backend || exit 1
npm run build
echo "✅ Backend rebuilt"
echo ""

# Fix 5: Restart PM2
echo "5️⃣  Restarting backend with PM2..."
pm2 restart ai-backend
sleep 3
pm2 status
echo ""

# Fix 6: Test backend health
echo "6️⃣  Testing backend health..."
sleep 2
curl -s http://localhost:5001/health | jq '.' || echo "Backend not responding yet"
echo ""

# Fix 7: Test through Nginx
echo "7️⃣  Testing through Nginx..."
curl -s -I https://ai.gladsw.cloud/health | head -n 1
echo ""

echo "=========================================="
echo "✅ AUTO-FIX COMPLETE"
echo "=========================================="
echo ""
echo "Check status:"
echo "  pm2 logs ai-backend --lines 20"
echo ""
echo "If still getting 502:"
echo "  1. Check if Gemini API key is valid (not quota exceeded)"
echo "  2. Check PM2 logs: pm2 logs ai-backend"
echo "  3. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
