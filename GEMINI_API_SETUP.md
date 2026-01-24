# 🔑 Gemini API Setup Guide

## Current Issue
The PDF analysis is failing because the Gemini API key is not properly configured.

## Quick Fix Steps

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key (starts with `AIza...`)

### 2. Update Backend Environment File

Open `backend/.env` and replace the placeholder:

```env
# BEFORE (current - not working)
GEMINI_API_KEY=your-gemini-api-key-here

# AFTER (replace with your actual key)
GEMINI_API_KEY=AIzaSyD...your_actual_key_here...
```

### 3. Restart Backend Server

After updating the `.env` file:

```bash
cd backend
pm2 restart ai-backend
# OR if running locally:
npm run dev
```

### 4. Test PDF Analysis

Upload a PDF and try generating questions. You should see proper results now.

## What Was Fixed

1. ✅ **Gemini Model**: Changed from `gemini-2.5-flash` (doesn't exist) to `gemini-1.5-flash` (correct model)
2. ✅ **PDF Text Extraction**: Improved word spacing and paragraph detection
3. ✅ **Token Limits**: Reduced prompt size from 12K to 8K characters to avoid API limits
4. ✅ **Error Handling**: Added better logging and validation
5. ✅ **Max Output Tokens**: Increased from 2048 to 8192 for longer responses

## Troubleshooting

### Error: "API key not set"
- Make sure you updated `backend/.env` with your actual API key
- Restart the backend server after changing `.env`

### Error: "Rate limit exceeded"
- Gemini free tier has limits (60 requests/minute)
- Wait a minute and try again
- Consider upgrading to paid tier for higher limits

### Error: "Could not extract text from PDF"
- PDF might be image-based (scanned document)
- Try a text-based PDF
- Check if PDF is password-protected

### Still Not Working?
Check backend logs:
```bash
pm2 logs ai-backend --lines 50
```

Look for:
- ✅ "Extracted X characters from Y pages" (good)
- ❌ "API key not set" (need to set key)
- ❌ "Failed to extract text" (PDF issue)

## API Key Security

⚠️ **IMPORTANT**: Never commit your actual API key to Git!

The `.env` file is already in `.gitignore`, but double-check:
```bash
# This should show .env is ignored
git check-ignore backend/.env
```

## Need Help?

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Get API Key](https://makersuite.google.com/app/apikey)
- [Pricing Info](https://ai.google.dev/pricing)
