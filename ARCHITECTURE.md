# System Architecture - PDF/PPT Processing

## Overall System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          STUDENT BROWSER                            │
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │  TextSummarizer.tsx  │         │  QuizGenerator.tsx   │        │
│  │                      │         │                      │        │
│  │  • File Upload UI    │         │  • File Upload UI    │        │
│  │  • Text Input UI     │         │  • Text Input UI     │        │
│  │  • Display Summary   │         │  • Display Quiz      │        │
│  │  • Copy Function     │         │  • Answer Tracking   │        │
│  └──────────┬───────────┘         └──────────┬───────────┘        │
│             │                                 │                    │
│             └─────────────┬───────────────────┘                    │
│                           │                                        │
│                           │ HTTP POST with FormData                │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                              │
│                      (Express + TypeScript)                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    API Routes Layer                           │ │
│  │                  (pdf.routes.ts)                              │ │
│  │                                                               │ │
│  │  POST /api/pdf/analyze                                        │ │
│  │    • Authentication Middleware (JWT)                          │ │
│  │    • Multer File Upload (10MB limit)                          │ │
│  │    • File Type Validation (PDF, PPT, PPTX)                    │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                         │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                  Controller Layer                             │ │
│  │                (pdf.controller.ts)                            │ │
│  │                                                               │ │
│  │  analyzePDF()                                                 │ │
│  │    ├─→ Receives file buffer & mimetype                        │ │
│  │    ├─→ Calls extractTextFromFile()                            │ │
│  │    └─→ Routes to appropriate handler                          │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                         │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              Text Extraction Layer                            │ │
│  │                                                               │ │
│  │  extractTextFromFile()                                        │ │
│  │    ├─→ Check mimetype                                         │ │
│  │    ├─→ PDF? → extractTextFromPDF() [pdfjs-dist]              │ │
│  │    └─→ PPT? → extractTextFromPPT() [officeparser]            │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                         │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                   AI Service Layer                            │ │
│  │                 (ai.service.ts)                               │ │
│  │                                                               │ │
│  │  AIService.sendMessage()                                      │ │
│  │    ├─→ Formats prompt with extracted text                     │ │
│  │    ├─→ Calls Google Gemini API                                │ │
│  │    ├─→ mode=summary → Generate summary                        │ │
│  │    └─→ mode=quiz → Generate quiz questions                    │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                         │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Google Gemini AI API       │
            │   (gemini-2.5-flash model)   │
            │                              │
            │   • Receives text + prompt   │
            │   • Processes with AI        │
            │   • Returns JSON response    │
            └──────────────┬───────────────┘
                           │
                           ▼
                    Response sent back
                    through the layers
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Student sees result:       │
            │   • Summary of document      │
            │   • or Quiz questions        │
            └──────────────────────────────┘
```

## Detailed Component Breakdown

### 1. Frontend Components

#### TextSummarizer.tsx
```
State Management:
├── mode: 'file' | 'text'
├── selectedFile: File | null
├── inputText: string
├── summary: string
└── isSummarizing: boolean

User Actions:
├── Switch mode (file/text)
├── Upload file (PDF/PPT)
├── Type/paste text
├── Click "Summarize"
└── Copy result

API Call:
POST /api/pdf/analyze
├── FormData: { file, mode: 'summary' }
├── Headers: { Authorization: Bearer <token> }
└── Response: { summary: string }
```

#### QuizGenerator.tsx
```
State Management:
├── mode: 'file' | 'text'
├── selectedFile: File | null
├── content: string
├── questions: Question[]
├── currentQuestion: number
├── selectedAnswer: number | null
├── answers: boolean[]
└── showResult: boolean

User Actions:
├── Switch mode (file/text)
├── Upload file (PDF/PPT)
├── Type/paste text
├── Click "Generate Quiz"
├── Answer questions
├── View results
└── Retry/New quiz

API Call:
POST /api/pdf/analyze
├── FormData: { file, mode: 'quiz', numQuestions: 5 }
├── Headers: { Authorization: Bearer <token> }
└── Response: { questions: Question[] }
```

### 2. Backend Processing Pipeline

```
┌─────────────┐
│ File Upload │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Authentication  │  JWT Token Validation
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ File Validation │  Type, Size, Format Check
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Text Extraction │
└──────┬──────────┘
       │
       ├─→ PDF: pdfjs-dist
       │   ├── Load PDF pages
       │   ├── Extract text content
       │   └── Combine all pages
       │
       └─→ PPT: officeparser
           ├── Parse slide structure
           ├── Extract text from slides
           └── Combine all slides
       │
       ▼
┌─────────────────┐
│ AI Processing   │
└──────┬──────────┘
       │
       ├─→ Summary Mode
       │   ├── Format prompt
       │   ├── Call Gemini API
       │   └── Return summary
       │
       └─→ Quiz Mode
           ├── Format prompt with requirements
           ├── Call Gemini API
           ├── Parse JSON response
           └── Return questions array
       │
       ▼
┌─────────────────┐
│ Response        │  JSON with results
└─────────────────┘
```

### 3. File Type Support Matrix

```
┌──────────┬──────────┬─────────────┬──────────────┬──────────┐
│ Format   │ Extension│ MIME Type   │ Extractor    │ Status   │
├──────────┼──────────┼─────────────┼──────────────┼──────────┤
│ PDF      │ .pdf     │ app/pdf     │ pdfjs-dist   │ ✅ Ready │
│ PPT      │ .ppt     │ app/vnd.ms  │ officeparser │ ✅ Ready │
│ PPTX     │ .pptx    │ app/vnd.xml │ officeparser │ ✅ Ready │
│ DOC      │ .doc     │ app/msword  │ N/A          │ ❌ Future│
│ DOCX     │ .docx    │ app/vnd.xml │ N/A          │ ❌ Future│
└──────────┴──────────┴─────────────┴──────────────┴──────────┘
```

### 4. Data Flow Example

#### Summarization Flow
```
1. Student uploads "Photosynthesis.pdf"
   ↓
2. Frontend validates file (type, size)
   ↓
3. FormData created: { file: File, mode: 'summary' }
   ↓
4. POST to /api/pdf/analyze with JWT token
   ↓
5. Backend authenticates user
   ↓
6. Multer receives file into memory buffer
   ↓
7. extractTextFromPDF() processes buffer
   → Page 1: "Photosynthesis is..."
   → Page 2: "The process involves..."
   → Combined text: 5000 characters
   ↓
8. AI prompt created:
   "Provide a comprehensive summary of: [text]"
   ↓
9. Gemini API processes request
   ↓
10. AI returns 300-word summary
   ↓
11. Backend sends: { summary: "Photosynthesis..." }
   ↓
12. Frontend displays in Summary panel
   ↓
13. Student can copy or reset
```

#### Quiz Generation Flow
```
1. Student uploads "Biology-Chapter3.pptx"
   ↓
2. Frontend validates file
   ↓
3. FormData: { file: File, mode: 'quiz', numQuestions: 5 }
   ↓
4. POST to /api/pdf/analyze
   ↓
5. Backend authenticates
   ↓
6. extractTextFromPPT() processes PowerPoint
   → Slide 1 text
   → Slide 2 text
   → Combined: 3000 characters
   ↓
7. AI prompt created:
   "Generate 5 multiple-choice questions from: [text]
    Format as JSON array..."
   ↓
8. Gemini API generates questions
   ↓
9. Backend parses JSON response
   ↓
10. Returns: { questions: [Q1, Q2, Q3, Q4, Q5] }
   ↓
11. Frontend starts quiz interface
   ↓
12. Student answers questions one by one
   ↓
13. Immediate feedback (correct/incorrect)
   ↓
14. Final score displayed
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Security Measures               │
├─────────────────────────────────────────┤
│ 1. Authentication Required              │
│    • JWT token verification             │
│    • User session validation            │
├─────────────────────────────────────────┤
│ 2. File Upload Security                 │
│    • MIME type checking                 │
│    • File size limits (10MB)            │
│    • Memory-only processing             │
│    • No permanent file storage          │
├─────────────────────────────────────────┤
│ 3. Input Sanitization                   │
│    • File validation before processing  │
│    • Text length limits                 │
│    • Error handling                     │
├─────────────────────────────────────────┤
│ 4. API Protection                       │
│    • CORS configuration                 │
│    • Rate limiting (optional)           │
│    • Request validation                 │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
Error Occurs
    ↓
┌─────────────────────────┐
│   Backend catches       │
│   • File read error     │
│   • Text extract error  │
│   • AI API error        │
└──────────┬──────────────┘
           │
           ├─→ Log error to console
           │
           ├─→ Send error response:
           │   { error: "message", details: "..." }
           │
           └─→ Fallback behavior if applicable
                     │
                     ▼
           ┌──────────────────┐
           │  Frontend receives│
           │  • Show alert     │
           │  • Display message│
           │  • Retry option   │
           └──────────────────┘
```

---

This architecture ensures:
- ✅ Scalable file processing
- ✅ Secure authentication
- ✅ Graceful error handling
- ✅ Fast response times
- ✅ User-friendly experience
