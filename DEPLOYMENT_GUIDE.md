# 🚀 DEPLOYMENT SETUP GUIDE

## ✅ FIXES IMPLEMENTED

All critical API connection issues have been fixed. Here's what was changed:

### 1. Frontend Environment Files Created
- ✅ `frontend/.env.production` - Production API URL configuration
- ✅ `frontend/.env.local` - Local development configuration

### 2. API Client Fixed
- ✅ `frontend/src/services/api.ts` - Now uses `VITE_API_URL` environment variable
- ✅ Changed from hardcoded `/api` to `import.meta.env.VITE_API_URL || '/api'`

### 3. Direct Fetch Calls Fixed  
- ✅ `frontend/src/pages/PDFStudy.tsx` - All 3 fetch calls now use environment variable
- ✅ Added `API_BASE` constant in each function

### 4. Backend CORS Updated
- ✅ `backend/src/server.ts` - Now accepts array of origins
- ✅ `backend/.env` - Updated with production configuration instructions

---

## 📋 NEXT STEPS FOR DEPLOYMENT

### Step 1: Configure Your VPS IP/Domain

**Option A: Using VPS IP Address**
```powershell
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\AI\frontend"
notepad .env.production
```
Change this line:
```
VITE_API_URL=http://YOUR_VPS_IP:5000
```
To:
```
VITE_API_URL=http://123.456.789.012:5000
```
(Replace with your actual VPS IP)

**Option B: Using Domain Name (Recommended)**
```
VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Configure Backend Environment

```powershell
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\AI\backend"
notepad .env
```

**CRITICAL: Update these values:**
1. `FRONTEND_URL=https://your-vercel-app.vercel.app` (after Vercel deployment)
2. Verify `MONGODB_URI` is correct
3. Verify `GEMINI_API_KEY` is valid
4. Ensure `JWT_SECRET` is secure (already set)

### Step 3: Deploy to Vercel

```powershell
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\AI\frontend"
npm run build
```

**If build succeeds:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. **CRITICAL:** Add environment variable in Vercel:
   - Key: `VITE_API_URL`
   - Value: `http://YOUR_VPS_IP:5000` (same as .env.production)
4. Deploy

### Step 4: Update Backend with Vercel URL

**After Vercel deployment:**
1. Copy your Vercel URL (e.g., `https://my-app-abc123.vercel.app`)
2. SSH into your VPS
3. Update backend `.env`:
```bash
nano ~/backend/.env
```
4. Change:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```
5. Restart PM2:
```bash
pm2 restart all
pm2 save
```

### Step 5: Test the Connection

**Open Vercel URL in browser:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Try to login/register
4. Check the request URL - should show: `http://YOUR_VPS_IP:5000/api/auth/login`
5. Verify response is 200 (not 404 or CORS error)

---

## 🔍 TROUBLESHOOTING

### Error: "Network Error" or "Failed to fetch"

**Check:**
1. Is your VPS running? `pm2 status`
2. Is port 5000 accessible? `curl http://YOUR_VPS_IP:5000/health`
3. Firewall blocking? Open port 5000 on VPS

### Error: "CORS policy blocked"

**Fix:**
1. Verify `FRONTEND_URL` in backend `.env` matches your Vercel URL exactly
2. Restart PM2: `pm2 restart all`
3. Check CORS config in `backend/src/server.ts` includes your URL

### Error: "404 Not Found"

**Check:**
1. `VITE_API_URL` in Vercel environment variables is correct
2. Redeploy frontend after adding env variable
3. Clear browser cache

### Build Errors

**If `npm run build` fails:**
```powershell
# Clean install
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

---

## 🎯 VERIFICATION CHECKLIST

Before going live:
- [ ] VPS backend is running (port 5000)
- [ ] `backend/.env` has correct `FRONTEND_URL` (Vercel URL)
- [ ] `frontend/.env.production` has correct `VITE_API_URL` (VPS IP/domain)
- [ ] Vercel environment variable `VITE_API_URL` is set
- [ ] PM2 is running: `pm2 status`
- [ ] Health check works: `http://YOUR_VPS_IP:5000/health`
- [ ] CORS allows Vercel domain
- [ ] Frontend build succeeds: `npm run build`
- [ ] API calls show correct URL in Network tab
- [ ] No CORS errors in browser console
- [ ] Login/Register works end-to-end

---

## 🚨 SECURITY REMINDERS

- ✅ `.env` files are in `.gitignore` (verified)
- ⚠️ Never commit `.env` files to Git
- ⚠️ Change `JWT_SECRET` before production
- ⚠️ Use HTTPS for production (not HTTP)
- ⚠️ Keep `GEMINI_API_KEY` secret

---

## 🎊 SUCCESS INDICATORS

**You'll know everything is working when:**
1. ✅ Vercel deployment succeeds
2. ✅ Network tab shows requests to `http://YOUR_VPS_IP:5000/...`
3. ✅ API responses are 200 status
4. ✅ No CORS errors in console
5. ✅ Users can login/register
6. ✅ All features work (DSA, Resume, etc.)

---

## 📞 QUICK COMMANDS

### Frontend Build & Test
```powershell
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\AI\frontend"
npm run build          # Build for production
npm run preview        # Test production build locally
```

### Backend Restart (On VPS via SSH)
```bash
pm2 restart all
pm2 logs              # View logs
pm2 status            # Check status
```

### Git Push Changes
```powershell
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\AI"
git add .
git commit -m "fix: API connection for production deployment"
git push origin main
```

---

**Total implementation time:** ~5 minutes to configure, 15 minutes to deploy

All code changes are complete and ready for deployment! 🎉
