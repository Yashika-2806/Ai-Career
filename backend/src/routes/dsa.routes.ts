import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';
import { dsaController } from '../controllers/dsa.controller.js';
import { checkUsageLimit } from '../middlewares/usageGuard.js';

const router = Router();

router.get('/sheet/:sheetName', authMiddleware, (req, res) => {
  dsaController.getSheet(req, res);
});

router.post('/track', authMiddleware, (req, res) => {
  dsaController.trackProblem(req, res);
});

router.post('/approach', authMiddleware, (req, res) => {
  dsaController.addApproach(req, res);
});

router.post('/feedback', authMiddleware, checkUsageLimit('dsa'), aiLimiter, (req, res) => {
  dsaController.getAIFeedback(req, res);
});

router.get('/progress', authMiddleware, (req, res) => {
  dsaController.getProgress(req, res);
});

router.get('/suggestions', authMiddleware, (req, res) => {
  dsaController.getSuggestedProblems(req, res);
});

export default router;
