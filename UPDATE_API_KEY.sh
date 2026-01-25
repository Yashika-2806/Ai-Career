#!/bin/bash
# Quick script to update API key on Hostinger

cd /var/www/Ai-Career/backend

# Update the API key in .env
sed -i 's/GEMINI_API_KEY=.*/GEMINI_API_KEY=AIzaSyA3QDXsqDmUH_Max6re9rVrP6hDd42JkpA/' .env

echo "✅ API key updated in .env file"

# Restart the backend
pm2 restart ai-backend

echo "✅ Backend restarted with new API key"
pm2 logs ai-backend --lines 20
