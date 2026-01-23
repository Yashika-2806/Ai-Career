import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { aiLimiter } from '../middlewares/rateLimiter';
import { interviewController, mentorController } from '../controllers/interview.controller';

const router = Router();

// Interview routes
router.post('/start', authMiddleware, aiLimiter, (req, res) => {
  interviewController.startInterview(req, res);
});

router.post('/submit-answer', authMiddleware, aiLimiter, (req, res) => {
  interviewController.submitAnswer(req, res);
});

router.get('/history', authMiddleware, (req, res) => {
  interviewController.getHistory(req, res);
});

// Mentor routes
router.post('/mentor/response', authMiddleware, aiLimiter, (req, res) => {
  mentorController.getMentorResponse(req, res);
});

router.get('/mentor/insights', authMiddleware, (req, res) => {
  mentorController.getInsights(req, res);
});

export default router;
