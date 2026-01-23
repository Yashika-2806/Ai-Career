import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { aiLimiter } from '../middlewares/rateLimiter';
import { roadmapController } from '../controllers/roadmap.controller';

const router = Router();

router.post('/generate', authMiddleware, aiLimiter, (req, res) => {
  roadmapController.generateRoadmap(req, res);
});

router.get('/', authMiddleware, (req, res) => {
  roadmapController.getRoadmap(req, res);
});

router.post('/update-milestone', authMiddleware, (req, res) => {
  roadmapController.updateMilestone(req, res);
});

router.post('/:roadmapId/adapt', authMiddleware, aiLimiter, (req, res) => {
  roadmapController.adaptRoadmap(req, res);
});

router.delete('/:roadmapId', authMiddleware, (req, res) => {
  roadmapController.deleteRoadmap(req, res);
});

export default router;
