# 🚀 GitHub & Hostinger Deployment Guide

## 📋 Quick Commands Summary

### Step 1: Git Push (Run on Windows/Local)
```powershell
# Add all changes
git add .

# Commit with descriptive message
git commit -m "✨ Fix PDF chat architecture - All features working

- Fixed PDF context storage across all modes
- Added session persistence with sessionStorage
- Implemented mode switching without re-upload
- Enhanced error handling with helpful messages
- Added comprehensive utilities (pdfHelpers.ts)
- Created custom styles with 3D animations
- Fixed ARIA attributes and CSS warnings
- Added file metadata display
- Improved AI service with new methods
- Created comprehensive documentation

Backend improvements:
- Return full extractedText in all modes
- Add metadata to all responses
- Better error messages with troubleshooting

Frontend improvements:
- Session storage for PDF context
- Change Mode buttons for easy switching
- File validation and size formatting
- 12 new utility functions
- Professional CSS with animations

Documentation:
- PDF_CHAT_GUIDE.md (comprehensive)
- PDF_QUICK_START.md (testing)
- PDF_ARCHITECTURE_REVIEW.md (complete review)"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Hostinger (Run on VPS via SSH)

**Option A - Quick Deploy (One Command):**
```bash
cd /var/www/Ai-Career && git pull origin main && cd frontend && npm install && npm run build && cd ../backend && npm run build && pm2 restart ai-backend && pm2 status
```

**Option B - Full Deploy (Using Script):**
```bash
cd /var/www/Ai-Career && bash deploy-hostinger.sh
```

---

## 📝 Detailed Step-by-Step Guide

### Part 1: Push to GitHub (Windows)

#### 1.1 Check Git Status
```powershell
# Navigate to project directory
cd "C:\Users\Rudra\OneDrive\Desktop\MY ai\Ai-Career"

# Check what files changed
git status
```

#### 1.2 Review Changes
```powershell
# See what changed in specific files
git diff backend/src/controllers/pdf.controller.ts
git diff frontend/src/pages/PDFStudy.tsx

# Or see all changes summary
git diff --stat
```

#### 1.3 Stage All Changes
```powershell
# Add all modified and new files
git add .

# Or add specific files/directories
git add backend/src/controllers/pdf.controller.ts
git add backend/src/ai/ai.service.ts
git add frontend/src/pages/PDFStudy.tsx
git add frontend/src/utils/pdfHelpers.ts
git add frontend/src/styles/pdf-study.css
git add PDF_CHAT_GUIDE.md
git add PDF_QUICK_START.md
git add PDF_ARCHITECTURE_REVIEW.md
```

#### 1.4 Commit Changes
```powershell
# Short commit message
git commit -m "Fix PDF chat architecture - All features working"

# Or detailed commit message (recommended)
git commit -m "✨ Fix PDF chat architecture - All features working" -m "
Backend:
- Return full extractedText in all modes
- Add comprehensive metadata
- Enhanced error messages
- Better JSON parsing

Frontend:
- Session storage persistence
- Mode switching without re-upload
- 12 new utility functions
- Custom CSS with 3D animations
- Fixed ARIA and CSS warnings

Documentation:
- 3 comprehensive guides added
- Testing checklist included
"
```

#### 1.5 Push to GitHub
```powershell
# Push to main branch
git push origin main

# If you need to force push (use carefully!)
git push origin main --force

# If you have a different branch
git push origin your-branch-name
```

#### 1.6 Verify Push
```powershell
# Check remote status
git remote -v

# View recent commits
git log --oneline -5

# Check if everything is pushed
git status
```

---

### Part 2: Deploy to Hostinger (Linux VPS)

#### 2.1 Connect to Hostinger via SSH
```powershell
# From Windows PowerShell or CMD
ssh your-username@your-server-ip

# Example:
ssh root@154.56.xx.xx
# Or
ssh u123456789@yourdomain.com
```

#### 2.2 Navigate to Project Directory
```bash
cd /var/www/Ai-Career

# Verify you're in the right place
pwd
ls -la
```

#### 2.3 Option A - Quick Deploy (Recommended)

**Single Command Deployment:**
```bash
cd /var/www/Ai-Career && git pull origin main && cd frontend && npm install && npm run build && cd ../backend && npm run build && pm2 restart ai-backend && pm2 status
```

**What this does:**
1. Navigate to project directory
2. Pull latest code from GitHub
3. Build frontend
4. Build backend
5. Restart backend server with PM2
6. Show server status

#### 2.4 Option B - Using Deployment Script

**Run the deployment script:**
```bash
cd /var/www/Ai-Career
bash deploy-hostinger.sh
```

**Or make it executable and run:**
```bash
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

#### 2.5 Option C - Manual Step-by-Step

**1. Pull Latest Code:**
```bash
cd /var/www/Ai-Career
git pull origin main
```

**2. Build Frontend:**
```bash
cd frontend
npm install
npm run build
cd ..
```

**3. Build Backend:**
```bash
cd backend
npm install
npm run build
```

**4. Restart Backend:**
```bash
pm2 restart ai-backend
pm2 status
pm2 logs ai-backend --lines 20
```

#### 2.6 Verify Deployment

**Check Backend Status:**
```bash
# PM2 status
pm2 status

# View logs
pm2 logs ai-backend --lines 50

# Test health endpoint
curl http://localhost:5001/health
```

**Check Frontend:**
```bash
# Check if build exists
ls -la frontend/dist/

# Check nginx status
sudo systemctl status nginx

# Test frontend
curl http://localhost
```

---

## 🔧 Troubleshooting

### Problem: Git push fails with "Authentication failed"
```powershell
# Set up GitHub credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use Personal Access Token for authentication
# Generate token at: https://github.com/settings/tokens
# Use token as password when prompted
```

### Problem: "Permission denied" on SSH
```bash
# Check SSH key
ssh-add -l

# Or use password authentication
ssh -o PreferredAuthentications=password your-user@your-server
```

### Problem: Git pull fails with "merge conflict"
```bash
# View conflicts
git status

# Keep remote version (discard local changes)
git reset --hard origin/main

# Or keep local changes
git stash
git pull origin main
git stash pop
```

### Problem: PM2 restart fails
```bash
# Stop and start fresh
pm2 stop ai-backend
pm2 delete ai-backend

# Start again
cd /var/www/Ai-Career/backend
pm2 start dist/server.js --name ai-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Problem: Build fails
```bash
# Clear node_modules and reinstall
cd /var/www/Ai-Career/backend
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for errors
npm run build 2>&1 | tee build.log
```

### Problem: 502 Bad Gateway
```bash
# Run the fix script
cd /var/www/Ai-Career
bash fix-server.sh

# Or manually restart services
pm2 restart ai-backend
sudo systemctl restart nginx
```

### Problem: Frontend not updating
```bash
# Clear nginx cache
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx

# Hard refresh browser
# Press Ctrl + Shift + R (Windows)
# Or Cmd + Shift + R (Mac)
```

---

## 📊 Deployment Checklist

### Before Pushing to GitHub ✅
- [ ] Test all features locally
- [ ] Check for console errors
- [ ] Verify API key is NOT committed
- [ ] Review git diff
- [ ] Update version in package.json
- [ ] Test build locally: `npm run build`

### After Pushing to GitHub ✅
- [ ] Verify commits on GitHub web
- [ ] Check GitHub Actions (if configured)
- [ ] Review changed files on GitHub

### Hostinger Deployment ✅
- [ ] Connect via SSH successfully
- [ ] Navigate to project directory
- [ ] Pull latest code: `git pull`
- [ ] Build frontend: `npm run build`
- [ ] Build backend: `npm run build`
- [ ] Restart PM2: `pm2 restart ai-backend`
- [ ] Check PM2 status: `pm2 status`
- [ ] View logs: `pm2 logs`
- [ ] Test health endpoint
- [ ] Visit website and test features

### Post-Deployment Testing ✅
- [ ] Homepage loads correctly
- [ ] Login/Authentication works
- [ ] Upload PDF and test chat
- [ ] Generate quiz and test
- [ ] Generate theory questions
- [ ] Test mode switching
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 🚀 Quick Reference Card

### Git Commands
```bash
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Push to GitHub
git pull origin main          # Pull from GitHub
git log --oneline -5          # View recent commits
```

### Hostinger Commands
```bash
ssh user@server               # Connect to VPS
cd /var/www/Ai-Career        # Navigate to project
git pull origin main          # Pull latest code
pm2 restart ai-backend       # Restart backend
pm2 status                   # Check status
pm2 logs ai-backend          # View logs
sudo systemctl restart nginx # Restart nginx
```

### Verification Commands
```bash
# Backend health
curl http://localhost:5001/health

# Frontend build
ls -la frontend/dist/

# PM2 processes
pm2 list

# Nginx status
sudo systemctl status nginx

# Disk space
df -h

# Memory usage
free -h
```

---

## 📞 Need Help?

### Logs Location
```bash
# PM2 logs
pm2 logs ai-backend

# PM2 error logs
pm2 logs ai-backend --err

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -xe
```

### Common Hostinger Paths
```
Project: /var/www/Ai-Career
Frontend: /var/www/Ai-Career/frontend
Backend: /var/www/Ai-Career/backend
Nginx config: /etc/nginx/sites-available/
SSL certs: /etc/letsencrypt/live/
```

---

## 🎉 Success!

After deployment, your updates will be live at:
**🌐 https://ai.gladsw.cloud**

All PDF chat features are now working:
- ✅ Chat with PDF
- ✅ Interactive Quiz
- ✅ Theory Questions
- ✅ Mode Switching
- ✅ Session Persistence

**Happy deploying! 🚀**
