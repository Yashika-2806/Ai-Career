import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { pdfController } from '../controllers/pdf.controller.js';
import multer from 'multer';

const router = Router();

// Configure multer for file upload (PDF and PPT)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and PowerPoint files are allowed'));
    }
  },
});

// File analysis endpoint (PDF/PPT)
router.post('/analyze', authMiddleware, upload.single('file'), (req, res) => {
  pdfController.analyzePDF(req, res);
});

// Chat with document - TEMPORARILY DISABLED
// router.post('/chat', authMiddleware, (req, res) => {
//   pdfController.chatWithPDF(req, res);
// });

// Test API endpoint - check if Gemini is working
router.get('/test-api', authMiddleware, (req, res) => {
  pdfController.testAPI(req, res);
});

export default router;
