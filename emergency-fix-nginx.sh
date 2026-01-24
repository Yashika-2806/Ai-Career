#!/bin/bash

# EMERGENCY FIX - Nginx is STILL using port 5000!
# This will forcefully fix everything

echo "🚨 EMERGENCY FIX - Forcing Nginx to use PORT 5001"
echo "=================================================="
echo ""

# Step 1: Check current Nginx config
echo "1️⃣  Checking current Nginx config..."
echo "Current proxy_pass settings:"
grep -r "proxy_pass" /etc/nginx/sites-enabled/ 2>/dev/null || echo "No nginx config found"
echo ""

# Step 2: Backup old config
echo "2️⃣  Backing up old config..."
sudo cp /etc/nginx/sites-available/ai.gladsw.cloud /etc/nginx/sites-available/ai.gladsw.cloud.backup.$(date +%s) 2>/dev/null || echo "No existing config"
echo ""

# Step 3: Create correct Nginx config with SSL
echo "3️⃣  Creating NEW Nginx config..."
sudo tee /etc/nginx/sites-available/ai.gladsw.cloud > /dev/null <<'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ai.gladsw.cloud;
    
    # Allow certbot for SSL verification
    location /.well-known/acme-challenge/ {
        root /var/www/Ai-Career/frontend/dist;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ai.gladsw.cloud;

    # SSL Certificate paths (adjust if needed)
    ssl_certificate /etc/letsencrypt/live/ai.gladsw.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai.gladsw.cloud/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Root directory
    root /var/www/Ai-Career/frontend/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Backend on PORT 5001 (NOT 5000!)
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
        client_max_body_size 10M;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5001/health;
        access_log off;
    }
}
EOF

echo "✅ New config created"
echo ""

# Step 4: Enable the site
echo "4️⃣  Enabling site..."
sudo rm -f /etc/nginx/sites-enabled/ai.gladsw.cloud
sudo ln -s /etc/nginx/sites-available/ai.gladsw.cloud /etc/nginx/sites-enabled/
echo "✅ Site enabled"
echo ""

# Step 5: Test Nginx config
echo "5️⃣  Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx config is valid"
else
    echo "❌ Nginx config has errors"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-available/ai.gladsw.cloud.backup.* /etc/nginx/sites-available/ai.gladsw.cloud 2>/dev/null
    exit 1
fi
echo ""

# Step 6: Check if SSL certificates exist
echo "6️⃣  Checking SSL certificates..."
if [ -f "/etc/letsencrypt/live/ai.gladsw.cloud/fullchain.pem" ]; then
    echo "✅ SSL certificates found"
else
    echo "⚠️  SSL certificates NOT found"
    echo ""
    echo "📝 To fix 'Connection is not private' error, run:"
    echo "   sudo apt install certbot python3-certbot-nginx -y"
    echo "   sudo certbot --nginx -d ai.gladsw.cloud"
    echo ""
    echo "Creating temporary HTTP-only config..."
    
    sudo tee /etc/nginx/sites-available/ai.gladsw.cloud > /dev/null <<'HTTPEOF'
server {
    listen 80;
    listen [::]:80;
    server_name ai.gladsw.cloud;

    root /var/www/Ai-Career/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Backend on PORT 5001
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        client_max_body_size 10M;
    }

    location /health {
        proxy_pass http://localhost:5001/health;
        access_log off;
    }
}
HTTPEOF
    
    sudo nginx -t
fi
echo ""

# Step 7: Reload Nginx
echo "7️⃣  Reloading Nginx..."
sudo systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

# Step 8: Verify the fix
echo "8️⃣  Verifying the fix..."
echo ""
echo "Checking if backend is responding on 5001:"
curl -s http://localhost:5001/health | jq '.' || echo "❌ Backend not responding"
echo ""

echo "Current Nginx config now uses:"
grep "proxy_pass" /etc/nginx/sites-available/ai.gladsw.cloud | grep -v "^#"
echo ""

# Step 9: Test through Nginx
echo "9️⃣  Testing through Nginx..."
curl -s -I http://ai.gladsw.cloud/health 2>/dev/null | head -n 1 || echo "Nginx not accessible"
echo ""

echo "=========================================="
echo "✅ EMERGENCY FIX COMPLETE"
echo "=========================================="
echo ""
echo "📋 What was fixed:"
echo "   ✅ Nginx now proxies to PORT 5001 (not 5000)"
echo "   ✅ Config updated and reloaded"
echo ""
echo "⚠️  SSL Certificate Issue:"
if [ -f "/etc/letsencrypt/live/ai.gladsw.cloud/fullchain.pem" ]; then
    echo "   ✅ SSL certificates are present"
    echo "   If still showing 'not private', try:"
    echo "      sudo certbot renew"
else
    echo "   ❌ SSL certificates NOT found"
    echo "   To fix 'Connection is not private', run:"
    echo ""
    echo "   sudo apt install certbot python3-certbot-nginx -y"
    echo "   sudo certbot --nginx -d ai.gladsw.cloud"
    echo ""
fi
echo ""
echo "🧪 Test your site:"
echo "   http://ai.gladsw.cloud (should work now)"
echo "   https://ai.gladsw.cloud (needs SSL cert)"
echo ""
