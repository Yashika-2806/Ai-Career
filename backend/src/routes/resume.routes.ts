import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { resumeLimiter } from '../middlewares/rateLimiter.js';
import { resumeController } from '../controllers/resume.controller.js';
import { checkUsageLimit } from '../middlewares/usageGuard.js';

const router = Router();

router.post('/generate', authMiddleware, checkUsageLimit('resume'), resumeLimiter, (req, res) => {
  resumeController.generateResume(req, res);
});

router.get('/versions', authMiddleware, (req, res) => {
  resumeController.getVersions(req, res);
});

router.get('/version/:versionNumber', authMiddleware, (req, res) => {
  resumeController.getVersion(req, res);
});

router.post('/optimize', authMiddleware, checkUsageLimit('resume'), (req, res) => {
  resumeController.optimizeForRole(req, res);
});

router.post('/ats-score', authMiddleware, checkUsageLimit('resume'), (req, res) => {
  resumeController.calculateATSScore(req, res);
});

router.post('/sync', authMiddleware, (req, res) => {
  resumeController.syncProfiles(req, res);
});

export default router;
