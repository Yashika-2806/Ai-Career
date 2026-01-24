# 🚀 VERCEL DEPLOYMENT INSTRUCTIONS

## ✅ Files Created & Pushed
All necessary configuration files have been created and pushed to GitHub:
- ✅ `vercel.json` - Vercel build configuration
- ✅ `.vercelignore` - Exclude backend and unnecessary files
- ✅ `package.json` - Updated root build scripts
- ✅ `frontend/.env.production` - Production API URL template
- ✅ `frontend/src/vite-env.d.ts` - TypeScript environment types

---

## 📋 VERCEL DASHBOARD SETTINGS

### Step 1: Import Project
1. Go to https://vercel.com/new
2. Import your repository: `Yashika-2806/Ai-Career`
3. Select branch: `main`

### Step 2: Configure Build Settings (CRITICAL)

**Framework Preset:** Other (or leave as detected)

**Root Directory:** `.` (root) - vercel.json will handle the rest

**Build Command:**
```
npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```
npm install --prefix frontend
```

### Step 3: Environment Variables (REQUIRED)

Add this environment variable in Vercel:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `http://YOUR_VPS_IP:5000` | Production |

**To add:**
1. Go to Project Settings → Environment Variables
2. Click "Add"
3. Name: `VITE_API_URL`
4. Value: `http://YOUR_VPS_IP:5000` (replace with your actual VPS IP)
5. Check "Production"
6. Click "Save"

---

## 🔧 ALTERNATIVE: Use Vercel CLI (Faster)

If you prefer command line deployment:

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\AI"

# First time deployment
vercel

# Follow prompts:
# - Link to existing project: No
# - Project name: ai-career (or your choice)
# - Directory: ./ (current directory)
# - Override settings: No (vercel.json will be used)

# After first deployment, set environment variable
vercel env add VITE_API_URL production
# Enter: http://YOUR_VPS_IP:5000

# Deploy to production
vercel --prod
```

---

## 🎯 VERIFICATION CHECKLIST

After deployment completes:

### 1. Check Build Logs
- ✅ Build should show: "Running cd frontend && npm install && npm run build"
- ✅ Output directory: frontend/dist
- ✅ Build should complete without errors
- ✅ No "vite: command not found" errors

### 2. Test Deployment
Open your Vercel URL (e.g., `https://ai-career.vercel.app`)

**Browser DevTools (F12) → Console:**
- ✅ No errors about missing files
- ✅ App loads successfully

**Browser DevTools → Network Tab:**
- ✅ Try to login/register
- ✅ Verify API calls go to: `http://YOUR_VPS_IP:5000/api/...`
- ✅ Check for CORS errors (shouldn't be any after backend update)

### 3. Backend CORS Update (CRITICAL)

**After getting your Vercel URL, update backend:**

SSH into your VPS:
```bash
cd ~/backend
nano .env
```

Update this line:
```env
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

Restart backend:
```bash
pm2 restart all
pm2 save
pm2 logs
```

---

## 🐛 TROUBLESHOOTING

### Error: "vite: command not found"
**Solution:** Already fixed! vercel.json now runs:
```
cd frontend && npm install && npm run build
```

### Error: "Cannot find module '@vitejs/plugin-react-swc'"
**Solution:** The `npm install --prefix frontend` command installs all frontend dependencies.

### Error: "CORS policy blocked"
**Solution:**
1. Make sure `FRONTEND_URL` in backend `.env` matches your Vercel URL exactly
2. Restart PM2: `pm2 restart all`
3. Check backend logs: `pm2 logs`

### Error: "Network request failed" or API calls fail
**Solution:**
1. Verify `VITE_API_URL` is set in Vercel environment variables
2. Redeploy after adding env variable
3. Check browser Network tab - should call your VPS IP, not Vercel domain

### Build succeeds but app shows blank page
**Solution:**
1. Check browser console for errors
2. Verify `frontend/dist` contains index.html and assets
3. Clear browser cache and hard reload (Ctrl+Shift+R)

---

## 📊 EXPECTED DEPLOYMENT RESULT

**Successful deployment logs should show:**
```
✓ Running "cd frontend && npm install && npm run build"
✓ Building frontend
✓ vite v5.4.21 building for production...
✓ 2063 modules transformed.
✓ dist/index.html
✓ dist/assets/index-*.js
✓ Built in 11.08s
✓ Deployment Complete
```

**Your app will be available at:**
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-xyz.vercel.app` (for PR branches)

---

## 🎉 SUCCESS CRITERIA

You'll know everything is working when:
1. ✅ Vercel deployment completes successfully
2. ✅ App loads at your Vercel URL
3. ✅ Login/Register works
4. ✅ API calls reach your VPS backend
5. ✅ No CORS errors in console
6. ✅ All features work (DSA, Resume, Roadmap, etc.)

---

## 🔄 REDEPLOYING AFTER CHANGES

Every time you push to GitHub:
```powershell
git add .
git commit -m "your changes"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Run the build
3. Deploy to production
4. Update your live URL

No manual intervention needed! 🚀

---

## 📞 QUICK REFERENCE

**Your Repositories:**
- GitHub: https://github.com/Yashika-2806/Ai-Career
- Vercel: https://vercel.com/dashboard

**Important Files:**
- Backend Config: `backend/.env` (update FRONTEND_URL)
- Frontend Config: `frontend/.env.production` (update VITE_API_URL)
- Build Config: `vercel.json` (already configured)

**Key Commands:**
```bash
# VPS Backend
pm2 restart all
pm2 logs
pm2 status

# Local Frontend
npm run build
npm run preview

# Git
git push origin main
```

---

**Current Status:** ✅ All files configured and pushed to GitHub
**Next Step:** Deploy on Vercel dashboard or use `vercel --prod` command
