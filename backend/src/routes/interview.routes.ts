import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';
import { interviewController, mentorController } from '../controllers/interview.controller.js';
import { checkUsageLimit } from '../middlewares/usageGuard.js';

const router = Router();

// Interview routes
router.post('/start', authMiddleware, checkUsageLimit('interview'), aiLimiter, (req, res) => {
  interviewController.startInterview(req, res);
});

router.post('/submit-answer', authMiddleware, checkUsageLimit('interview'), aiLimiter, (req, res) => {
  interviewController.submitAnswer(req, res);
});

router.get('/history', authMiddleware, (req, res) => {
  interviewController.getHistory(req, res);
});

// Mentor routes
router.post('/mentor/response', authMiddleware, checkUsageLimit('interview'), aiLimiter, (req, res) => {
  mentorController.getMentorResponse(req, res);
});

router.get('/mentor/insights', authMiddleware, (req, res) => {
  mentorController.getInsights(req, res);
});

export default router;
