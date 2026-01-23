import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { aiLimiter } from '../middlewares/rateLimiter';
import { researchController } from '../controllers/research.controller';

const router = Router();

router.post('/create', authMiddleware, (req, res) => {
  researchController.createProject(req, res);
});

router.get('/', authMiddleware, (req, res) => {
  researchController.getProjects(req, res);
});

router.get('/:projectId', authMiddleware, (req, res) => {
  researchController.getProject(req, res);
});

router.put('/:projectId', authMiddleware, (req, res) => {
  researchController.updateProject(req, res);
});

router.post('/:projectId/summarize', authMiddleware, aiLimiter, (req, res) => {
  researchController.summarizePaper(req, res);
});

router.post('/:projectId/related-works', authMiddleware, aiLimiter, (req, res) => {
  researchController.findRelatedWorks(req, res);
});

router.post('/:projectId/methodology', authMiddleware, aiLimiter, (req, res) => {
  researchController.generateMethodology(req, res);
});

router.get('/:projectId/export/:format', authMiddleware, (req, res) => {
  researchController.exportPaper(req, res);
});

export default router;
