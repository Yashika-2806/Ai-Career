@echo off
REM Quick Deployment Script for Windows
REM Run this from your local machine

echo 🚀 Deploying to Hostinger...
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: Run this from the Ai-Career root directory
    exit /b 1
)

echo 📝 Adding all changes...
git add -A

echo.
set /p commit_msg="Enter commit message: "

echo.
echo 💾 Committing changes...
git commit -m "%commit_msg%"

echo.
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo 📋 Next steps - Run these commands on Hostinger VPS:
echo    ssh your-user@your-hostinger-ip
echo    cd /var/www/Ai-Career
echo    bash deploy-hostinger.sh
echo.
echo Or run this in one line:
echo    ssh your-user@your-hostinger-ip "cd /var/www/Ai-Career && bash deploy-hostinger.sh"
echo.

pause
