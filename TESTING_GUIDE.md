# Quick Start Guide - Testing PDF/PPT Upload Features

## Prerequisites

1. **Backend Dependencies Installed**
   - Navigate to backend directory: `cd backend`
   - Verify officeparser is installed: `npm list officeparser`
   - If not installed: `npm install officeparser`

2. **Environment Variables Set**
   - Create/update `backend/.env` file:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     MONGODB_URI=your_mongodb_connection_string
     PORT=5001
     ```

## Step-by-Step Testing

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
Server running on http://localhost:5001
```

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in X ms
Local: http://localhost:5173/
```

### 3. Test File Upload for Summarization

1. Open browser: `http://localhost:5173`
2. Log in to your student account
3. Navigate to **"Text Summarizer"** from the dashboard
4. Click on **"Upload File"** tab
5. Click the upload area and select a PDF or PowerPoint file
6. Click **"Summarize"**
7. Wait for the AI to process (you'll see an animated loading indicator)
8. Review the generated summary
9. Try clicking **"Copy"** to copy the summary

### 4. Test File Upload for Quiz Generation

1. Navigate to **"Quiz Generator"** from the dashboard
2. Click on **"Upload File"** tab
3. Click the upload area and select a PDF or PowerPoint file
4. Click **"Generate Quiz"**
5. Wait for quiz generation (animated loading indicator)
6. Answer the multiple-choice questions
7. See immediate feedback (green for correct, red for incorrect)
8. View your final score
9. Try **"Try Again"** or **"New Quiz"**

### 5. Test Text Input (Alternative)

Both components also support direct text input:

1. Click **"Type Text"** tab
2. Paste or type content
3. Click **"Use Sample Text"** to see example
4. Click **"Summarize"** or **"Generate Quiz"**

## Troubleshooting

### Backend Issues

**Problem:** "officeparser not found"
```bash
cd backend
npm install officeparser --save
```

**Problem:** "Gemini API key not set"
- Check `backend/.env` file has `GEMINI_API_KEY`
- Verify the key is valid at https://aistudio.google.com/app/apikey

**Problem:** "Failed to extract text from PPT"
- Ensure the PowerPoint file is not password-protected
- Try a different PPT file
- Check backend console for detailed error messages

### Frontend Issues

**Problem:** "401 Unauthorized"
- User must be logged in
- Check if JWT token exists: Open browser DevTools → Application → Local Storage → `auth_token`

**Problem:** "Network Error"
- Verify backend is running on port 5001
- Check if CORS is configured correctly
- Verify `VITE_API_BASE_URL` environment variable

**Problem:** File upload not working
- Check file size (must be < 10MB)
- Verify file type (PDF, PPT, or PPTX only)
- Open browser console (F12) for error messages

## Sample Test Files

Create test files to verify functionality:

### Sample PDF Content
Create a simple PDF with text about any topic (e.g., photosynthesis, history, math concepts)

### Sample PowerPoint Content
Create a PPT with:
- Title slide
- 2-3 content slides with bullet points
- Some text on each slide

## Expected Behavior

### For Summarization:
- ✅ File uploads successfully
- ✅ Loading animation appears
- ✅ Summary is generated within 5-10 seconds
- ✅ Summary is shorter than original content
- ✅ Summary maintains key information
- ✅ Copy button works

### For Quiz Generation:
- ✅ File uploads successfully
- ✅ Loading animation appears
- ✅ 5 questions are generated within 10-15 seconds
- ✅ Questions are relevant to the content
- ✅ Each question has 4 options
- ✅ Immediate feedback on answer selection
- ✅ Progress bar updates as you answer
- ✅ Final score displayed correctly
- ✅ Retry and New Quiz buttons work

## API Endpoints Being Used

```
POST http://localhost:5001/api/pdf/analyze
- Header: Authorization: Bearer <token>
- Body: FormData with 'file' and 'mode' fields
- Response: { summary: "..." } or { questions: [...] }
```

## Success Indicators

Backend console should show:
```
📥 INCOMING REQUEST
Method: POST
Path: /api/pdf/analyze
🔍 Generating document summary...
✅ Summary response: { success: true, ... }
```

or

```
🔍 Generating 5 moderate quiz questions...
✅ Quiz response: { success: true, ... }
```

## Next Steps

Once everything is working:
1. Test with various file types and sizes
2. Try different content topics
3. Test the "Type Text" mode as well
4. Share with students for feedback
5. Monitor backend logs for any errors

## Need Help?

Check the detailed documentation in `PDF_PPT_UPDATE_README.md` for more information about the implementation.

---

**Happy Testing!** 🎉
