import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

// Auth endpoints
router.post('/register', authLimiter, (req, res) => {
  authController.registerHandler(req, res);
});

router.post('/login', authLimiter, (req, res) => {
  authController.loginHandler(req, res);
});

router.get('/profile', authMiddleware, (req, res) => {
  authController.getProfile(req, res);
});

router.put('/profile', authMiddleware, (req, res) => {
  authController.updateProfile(req, res);
});

router.post('/social-link', authMiddleware, (req, res) => {
  authController.linkSocialProfile(req, res);
});

export default router;
