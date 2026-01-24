# 🚨 502 Bad Gateway Fix Guide

## Problem Summary
- **502 Bad Gateway** when accessing `/api/auth/login`
- **404 Not Found** for `logo.svg`
- Backend running on port 5001 but Nginx might be misconfigured
- Gemini API quota exceeded (429 errors)

## Root Causes Identified

### 1. Nginx Configuration Issue
Nginx is likely proxying to the wrong port or not configured at all for the domain.

### 2. Missing Logo File
The `logo.svg` file wasn't in the build output.

### 3. API Quota Exceeded
Your Gemini API free tier quota (20 requests/day) is exhausted.

## 🔧 Quick Fix Steps

### Step 1: Deploy Fixed Code
```bash
# On your Windows PC - Run deploy.bat
cd c:\Users\Rudra\OneDrive\Desktop\"MY ai"\Ai-Career
deploy.bat
```

### Step 2: SSH to Server and Run Auto-Fix
```bash
# SSH to your Hostinger VPS
ssh root@ai.gladsw.cloud

# Navigate to project
cd /var/www/Ai-Career

# Pull latest changes (includes fix scripts)
git pull origin main

# Run the auto-fix script
bash fix-server.sh
```

## 📋 What fix-server.sh Does

1. ✅ Sets `PORT=5001` in backend/.env
2. ✅ Updates Nginx config to proxy to correct port
3. ✅ Copies logo.svg to dist folder
4. ✅ Rebuilds backend
5. ✅ Restarts PM2 process
6. ✅ Tests backend health

## 🔍 Manual Diagnostic (if needed)

```bash
# Check what's wrong
bash diagnose-server.sh
```

## 🔑 Fix Gemini API Quota

Your logs show:
```
You exceeded your current quota, please check your plan and billing details.
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
limit: 20, model: gemini-2.5-flash
Please retry in 24.301881235s
```

**Solutions:**

### Option A: Wait for Reset (Free)
- Free tier quota resets every 24 hours
- Wait until tomorrow and try again

### Option B: Get Paid API Key (Recommended)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key with billing enabled
3. Update on server:
   ```bash
   ssh root@ai.gladsw.cloud
   cd /var/www/Ai-Career/backend
   nano .env
   # Update: GEMINI_API_KEY=your-new-paid-key
   pm2 restart ai-backend
   ```

### Option C: Use Different Model (Temporary)
Edit `backend/src/ai/ai.service.ts` to use `gemini-pro` instead of `gemini-2.5-flash` (has higher quota).

## 🧪 Testing After Fix

```bash
# Test backend directly
curl http://localhost:5001/health

# Test through Nginx
curl https://ai.gladsw.cloud/health

# Check PM2 status
pm2 status
pm2 logs ai-backend --lines 20

# Check if logo loads
curl -I https://ai.gladsw.cloud/logo.svg
```

## 📁 Files Created/Updated

1. ✅ `public/logo.svg` - New logo file
2. ✅ `nginx-config-fix.conf` - Correct Nginx configuration
3. ✅ `fix-server.sh` - Auto-fix script
4. ✅ `diagnose-server.sh` - Diagnostic script
5. ✅ `deploy-hostinger.sh` - Updated with PORT fix

## 🚀 Deploy Command (All-in-One)

```bash
# On Windows - Push code
deploy.bat

# On Server - Fix and deploy
ssh root@ai.gladsw.cloud "cd /var/www/Ai-Career && git pull && bash fix-server.sh"
```

## ⚠️ Important Notes

1. **Gemini API Key**: Make sure your production `.env` has a valid API key
2. **Nginx Config**: The fix-server.sh will update Nginx automatically
3. **Port 5001**: Backend must run on 5001 (not 5000)
4. **Logo.svg**: Will be copied to dist folder automatically

## 🆘 Still Not Working?

Run diagnostics and check each component:

```bash
# Full diagnostic
bash diagnose-server.sh

# Check if backend is actually listening
netstat -tuln | grep 5001

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check backend logs
pm2 logs ai-backend --lines 50
```

## 📞 Common Errors & Solutions

### Error: "Connection refused"
- Backend is not running
- Solution: `pm2 restart ai-backend`

### Error: "502 Bad Gateway"
- Nginx can't reach backend
- Solution: Check PORT=5001 in .env, run fix-server.sh

### Error: "404 Not Found"
- Frontend not built or Nginx misconfigured
- Solution: Rebuild frontend or fix Nginx config

### Error: "429 Too Many Requests"
- API quota exceeded
- Solution: Wait 24 hours or get paid API key
