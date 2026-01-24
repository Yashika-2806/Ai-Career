@echo off
echo ========================================
echo 🚀 DEPLOYING TO HOSTINGER PRODUCTION
echo ========================================
echo.
echo ✅ GitHub push completed!
echo.
echo 📋 Copy and run this command in your Hostinger SSH terminal:
echo.
echo cd /var/www/Ai-Career ^&^& git pull origin main ^&^& cd frontend ^&^& npm install ^&^& npm run build ^&^& cd ../backend ^&^& npm run build ^&^& pm2 restart ai-backend ^&^& pm2 status
echo.
echo ========================================
echo Or run the deployment script:
echo cd /var/www/Ai-Career ^&^& bash deploy-hostinger.sh
echo ========================================
echo.
echo 🌐 After deployment, visit: https://ai.gladsw.cloud
echo.
pause
