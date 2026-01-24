#!/bin/bash

# Server Diagnostic and Fix Script for Hostinger
# Run this on your VPS to diagnose and fix 502 errors

echo "🔍 AI Career - Server Diagnostic & Fix"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Backend Port
echo "1️⃣  Checking backend port..."
if netstat -tuln | grep -q ":5001"; then
    echo -e "${GREEN}✅ Backend is listening on port 5001${NC}"
else
    echo -e "${RED}❌ Backend NOT listening on port 5001${NC}"
    echo "   Fix: Check PM2 status and logs"
fi
echo ""

# Check 2: PM2 Status
echo "2️⃣  Checking PM2 status..."
pm2 status
echo ""

# Check 3: Backend Health
echo "3️⃣  Testing backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "   Fix: Backend might be crashed or misconfigured"
fi
echo ""

# Check 4: Nginx Configuration
echo "4️⃣  Checking Nginx configuration..."
if [ -f "/etc/nginx/sites-available/ai.gladsw.cloud" ]; then
    echo -e "${GREEN}✅ Nginx config file exists${NC}"
    
    # Check if proxy_pass points to correct port
    if grep -q "proxy_pass http://localhost:5001" /etc/nginx/sites-available/ai.gladsw.cloud; then
        echo -e "${GREEN}✅ Nginx is configured to proxy to port 5001${NC}"
    else
        echo -e "${RED}❌ Nginx proxy_pass might be wrong${NC}"
        echo "   Current config:"
        grep "proxy_pass" /etc/nginx/sites-available/ai.gladsw.cloud
        echo ""
        echo "   Should be: proxy_pass http://localhost:5001;"
    fi
else
    echo -e "${RED}❌ Nginx config file not found${NC}"
    echo "   Expected: /etc/nginx/sites-available/ai.gladsw.cloud"
fi
echo ""

# Check 5: Nginx Syntax
echo "5️⃣  Testing Nginx syntax..."
nginx -t 2>&1 | head -n 5
echo ""

# Check 6: Recent Backend Errors
echo "6️⃣  Recent backend errors (last 10 lines)..."
pm2 logs ai-backend --err --lines 10 --nostream
echo ""

# Check 7: Environment Variables
echo "7️⃣  Checking backend .env file..."
if [ -f "/var/www/Ai-Career/backend/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check PORT
    if grep -q "PORT=5001" /var/www/Ai-Career/backend/.env; then
        echo -e "${GREEN}✅ PORT is set to 5001${NC}"
    else
        echo -e "${YELLOW}⚠️  PORT might not be 5001${NC}"
        grep "PORT=" /var/www/Ai-Career/backend/.env
    fi
    
    # Check GEMINI_API_KEY
    if grep -q "GEMINI_API_KEY=your-" /var/www/Ai-Career/backend/.env; then
        echo -e "${RED}❌ GEMINI_API_KEY not configured (still default)${NC}"
    elif grep -q "GEMINI_API_KEY=" /var/www/Ai-Career/backend/.env; then
        echo -e "${GREEN}✅ GEMINI_API_KEY is configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi
echo ""

# Check 8: Frontend Build
echo "8️⃣  Checking frontend build..."
if [ -d "/var/www/Ai-Career/frontend/dist" ]; then
    echo -e "${GREEN}✅ Frontend dist folder exists${NC}"
    echo "   Files: $(ls -la /var/www/Ai-Career/frontend/dist | wc -l) items"
    
    # Check if logo.svg exists
    if [ -f "/var/www/Ai-Career/frontend/dist/logo.svg" ]; then
        echo -e "${GREEN}✅ logo.svg exists${NC}"
    else
        echo -e "${RED}❌ logo.svg missing${NC}"
    fi
else
    echo -e "${RED}❌ Frontend dist folder not found${NC}"
    echo "   Run: cd /var/www/Ai-Career/frontend && npm run build"
fi
echo ""

# Summary and Fixes
echo "=========================================="
echo "🔧 SUGGESTED FIXES:"
echo "=========================================="
echo ""

echo "If backend is not running on port 5001:"
echo "  1. Check backend/.env file: PORT=5001"
echo "  2. Restart PM2: pm2 restart ai-backend"
echo ""

echo "If Nginx proxy is wrong:"
echo "  1. Copy correct config: cp /var/www/Ai-Career/nginx-config-fix.conf /etc/nginx/sites-available/ai.gladsw.cloud"
echo "  2. Test config: sudo nginx -t"
echo "  3. Reload Nginx: sudo systemctl reload nginx"
echo ""

echo "If Gemini API quota exceeded (429 errors):"
echo "  1. Wait 24 hours for quota reset"
echo "  2. Or get a paid Gemini API key"
echo "  3. Update backend/.env with new key"
echo "  4. Restart: pm2 restart ai-backend"
echo ""

echo "If logo.svg is missing:"
echo "  1. Copy from public: cp /var/www/Ai-Career/public/logo.svg /var/www/Ai-Career/frontend/dist/"
echo "  2. Or rebuild frontend: cd frontend && npm run build"
echo ""

echo "Quick fix command:"
echo "  bash /var/www/Ai-Career/fix-server.sh"
echo ""
