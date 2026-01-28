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

// Subscription & Usage endpoints
router.get('/usage', authMiddleware, async (req: any, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const { PLAN_LIMITS } = await import('../config/planLimits.js');

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    if (user.dailyUsage.date !== today) {
      user.dailyUsage = {
        date: today,
        counts: { resume: 0, dsa: 0, research: 0, interview: 0, roadmap: 0 }
      };
      await user.save();
    }

    res.json({
      success: true,
      tier: user.subscriptionTier,
      usage: user.dailyUsage.counts,
      limits: PLAN_LIMITS[user.subscriptionTier]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

router.post('/upgrade', authMiddleware, async (req: any, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.subscriptionTier = 'premium';
    await user.save();

    res.json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      tier: user.subscriptionTier
    });
  } catch (error) {
    res.status(500).json({ error: 'Upgrade failed' });
  }
});

export default router;
