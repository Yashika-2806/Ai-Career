@echo off
echo ========================================
echo 🚀 GIT PUSH TO GITHUB
echo ========================================
echo.

REM Check git status
echo 📋 Current git status:
git status
echo.

REM Add all changes
echo 📦 Adding all changes...
git add .
echo.

REM Show what will be committed
echo 📝 Changes to be committed:
git status --short
echo.

REM Commit with message
echo 💾 Committing changes...
git commit -m "✨ Fix PDF chat architecture - All features working" -m "Backend improvements: - Return full extractedText in all modes - Add comprehensive metadata - Enhanced error messages - Better JSON parsing. Frontend improvements: - Session storage persistence - Mode switching without re-upload - 12 new utility functions - Custom CSS with 3D animations - Fixed ARIA and CSS warnings. Documentation: - PDF_CHAT_GUIDE.md - PDF_QUICK_START.md - PDF_ARCHITECTURE_REVIEW.md"
echo.

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo ✅ GITHUB PUSH COMPLETE!
echo ========================================
echo.
echo 📋 Next step: Deploy to Hostinger
echo.
echo Copy and paste this command in Hostinger SSH:
echo.
echo cd /var/www/Ai-Career ^&^& git pull origin main ^&^& cd frontend ^&^& npm install ^&^& npm run build ^&^& cd ../backend ^&^& npm run build ^&^& pm2 restart ai-backend ^&^& pm2 status
echo.
echo OR run the deployment script:
echo bash deploy-hostinger.sh
echo.
echo ========================================
echo 🌐 After deployment, visit: https://ai.gladsw.cloud
echo ========================================
echo.
pause
