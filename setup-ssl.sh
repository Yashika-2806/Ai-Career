#!/bin/bash

# Complete SSL Certificate Setup for ai.gladsw.cloud
# Fixes "Connection is not private" error

echo "🔒 Setting up SSL Certificate for ai.gladsw.cloud"
echo "=================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (sudo bash setup-ssl.sh)"
    exit 1
fi

# Install certbot if not present
echo "1️⃣  Checking certbot installation..."
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt update
    apt install certbot python3-certbot-nginx -y
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi
echo ""

# Stop any existing nginx to avoid port conflicts
echo "2️⃣  Preparing Nginx..."
systemctl stop nginx
sleep 2
echo ""

# Create temporary Nginx config for certbot
echo "3️⃣  Creating temporary HTTP config for certificate verification..."
tee /etc/nginx/sites-available/ai.gladsw.cloud > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ai.gladsw.cloud;
    
    root /var/www/Ai-Career/frontend/dist;
    
    location /.well-known/acme-challenge/ {
        root /var/www/Ai-Career/frontend/dist;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ai.gladsw.cloud /etc/nginx/sites-enabled/
nginx -t && systemctl start nginx
echo "✅ Temporary config active"
echo ""

# Get SSL certificate
echo "4️⃣  Obtaining SSL certificate..."
echo "This will ask for your email and agree to terms..."
echo ""

certbot --nginx -d ai.gladsw.cloud --non-interactive --agree-tos --email your-email@example.com --redirect || {
    echo ""
    echo "⚠️  Automated SSL setup failed. Running interactive mode..."
    echo "Please provide your email when asked."
    certbot --nginx -d ai.gladsw.cloud
}

echo ""
echo "✅ SSL Certificate obtained"
echo ""

# Now apply our custom config with SSL
echo "5️⃣  Applying final Nginx config with SSL..."
tee /etc/nginx/sites-available/ai.gladsw.cloud > /dev/null <<'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ai.gladsw.cloud;
    
    location /.well-known/acme-challenge/ {
        root /var/www/Ai-Career/frontend/dist;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ai.gladsw.cloud;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/ai.gladsw.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai.gladsw.cloud/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Root
    root /var/www/Ai-Career/frontend/dist;
    index index.html;

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to PORT 5001 (NOT 5000!)
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
EOF

echo "✅ Final config applied"
echo ""

# Test and reload
echo "6️⃣  Testing and reloading Nginx..."
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx reloaded with SSL"
else
    echo "❌ Nginx config error"
    exit 1
fi
echo ""

# Setup auto-renewal
echo "7️⃣  Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer
echo "✅ Auto-renewal configured"
echo ""

echo "=========================================="
echo "✅ SSL SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "🎉 Your site now has HTTPS:"
echo "   https://ai.gladsw.cloud"
echo ""
echo "Certificate details:"
certbot certificates
echo ""
echo "Certificate will auto-renew before expiry."
echo ""
