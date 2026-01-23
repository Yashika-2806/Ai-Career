import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { pdfController } from '../controllers/pdf.controller';
import multer from 'multer';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// PDF analysis endpoint
router.post('/analyze', authMiddleware, upload.single('pdf'), (req, res) => {
  pdfController.analyzePDF(req, res);
});

// Chat with PDF
router.post('/chat', authMiddleware, (req, res) => {
  pdfController.chatWithPDF(req, res);
});

export default router;
