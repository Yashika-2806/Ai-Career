import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import DSAProgress from '../models/DSAProgress.js';
import AIService from '../ai/ai.service.js';
import { DSA_PROMPTS } from '../ai/prompts.js';
import { DSA_SHEETS } from '../data/dsa-sheets.js';

const aiService = new AIService(process.env.GEMINI_API_KEY || '');

export const dsaController = {
  /**
   * Get all problems from a sheet
   */
  getSheet: async (req: AuthRequest, res: Response) => {
    try {
      const { sheetName } = req.params;

      const sheet = DSA_SHEETS[sheetName as keyof typeof DSA_SHEETS];
      if (!sheet) {
        return res.status(404).json({ error: 'Sheet not found' });
      }

      // Get user's progress for this sheet
      const userId = req.userId;
      const progressRecords = await DSAProgress.find({ userId, sheetName });
      
      // Create a map of solved problems
      const solvedMap = new Map(
        progressRecords.map(p => [p.questionId, p.solved])
      );

      // Add solved status to each problem
      const problemsWithProgress = sheet.problems.map(problem => ({
        ...problem,
        solved: solvedMap.get(problem.id) || false
      }));

      // Get unique topics
      const topics = [...new Set(sheet.problems.map(p => p.topic))];

      // Calculate statistics
      const totalProblems = sheet.problems.length;
      const solvedCount = problemsWithProgress.filter(p => p.solved).length;
      const easyCount = sheet.problems.filter(p => p.difficulty === 'Easy').length;
      const mediumCount = sheet.problems.filter(p => p.difficulty === 'Medium').length;
      const hardCount = sheet.problems.filter(p => p.difficulty === 'Hard').length;

      res.json({
        name: sheet.name,
        description: sheet.description,
        totalProblems: sheet.totalProblems,
        problems: problemsWithProgress,
        topics,
        stats: {
          total: totalProblems,
          solved: solvedCount,
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
          progress: totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0
        }
      });
    } catch (error: any) {
      console.error('Error fetching sheet:', error);
      res.status(500).json({ error: 'Failed to fetch sheet' });
    }
  },

  /**
   * Track problem solution
   */
  trackProblem: async (req: AuthRequest, res: Response) => {
    try {
      const { questionId, sheetName, questionTitle, difficulty, solved } = req.body;

      const progress = await DSAProgress.findOneAndUpdate(
        { userId: req.userId, questionId, sheetName },
        {
          questionId,
          sheetName,
          questionTitle,
          difficulty,
          solved,
          lastModified: new Date(),
        },
        { upsert: true, new: true }
      );

      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to track problem' });
    }
  },

  /**
   * Add approach to problem
   */
  addApproach: async (req: AuthRequest, res: Response) => {
    try {
      const { questionId, sheetName, approach, timeComplexity, spaceComplexity, language } = req.body;

      let progress = await DSAProgress.findOne({ userId: req.userId, questionId, sheetName });

      if (!progress) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      progress.approaches.push({
        approach,
        timeComplexity,
        spaceComplexity,
        language,
        timestamp: new Date(),
      });

      progress.solved = true;
      await progress.save();

      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add approach' });
    }
  },

  /**
   * Get AI feedback on approach
   */
  getAIFeedback: async (req: AuthRequest, res: Response) => {
    try {
      const { question, userApproach, constraints } = req.body;

      const prompt = DSA_PROMPTS.analyzeApproach(question, userApproach, constraints);
      const feedback = await aiService.sendMessage(prompt, `dsa_${req.userId}`);

      if (!feedback.success) {
        return res.status(500).json({ error: feedback.error });
      }

      res.json({
        feedback: feedback.response,
        conversationId: `dsa_${req.userId}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to get AI feedback' });
    }
  },

  /**
   * Get user's DSA progress
   */
  getProgress: async (req: AuthRequest, res: Response) => {
    try {
      const { sheetName } = req.query;

      let query = { userId: req.userId };
      if (sheetName) {
        query = { ...query, sheetName: sheetName as string } as any;
      }

      const progress = await DSAProgress.find(query);
      const solvedCount = progress.filter(p => p.solved).length;
      const totalCount = progress.length;

      res.json({
        total: totalCount,
        solved: solvedCount,
        progress: (solvedCount / totalCount) * 100 || 0,
        problems: progress,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  },

  /**
   * Get suggested problems based on weak areas
   */
  getSuggestedProblems: async (req: AuthRequest, res: Response) => {
    try {
      const progress = await DSAProgress.find({ userId: req.userId, solved: false });

      // Analyze weak areas
      const categories: Record<string, number> = {};
      progress.forEach(p => {
        // In production, would map question to category
        categories[p.difficulty] = (categories[p.difficulty] || 0) + 1;
      });

      res.json({
        weakAreas: categories,
        suggestedFocus: Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([area]) => area),
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  },
};
