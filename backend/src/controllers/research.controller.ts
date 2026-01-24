import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import ResearchProject from '../models/Research.js';
import AIService from '../ai/ai.service.js';
import { RESEARCH_PROMPTS } from '../ai/prompts.js';

const aiService = new AIService(process.env.GEMINI_API_KEY || '');

export const researchController = {
  /**
   * Create research project
   */
  createProject: async (req: AuthRequest, res: Response) => {
    try {
      const { title, abstract, problemStatement } = req.body;

      const project = new ResearchProject({
        userId: req.userId,
        title,
        abstract,
        problemStatement,
        status: 'draft',
      });

      await project.save();
      res.status(201).json(project);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  },

  /**
   * Get all projects
   */
  getProjects: async (req: AuthRequest, res: Response) => {
    try {
      const projects = await ResearchProject.find({ userId: req.userId }).sort({ createdAt: -1 });
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  },

  /**
   * Get project by ID
   */
  getProject: async (req: AuthRequest, res: Response) => {
    try {
      const project = await ResearchProject.findById(req.params.projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  },

  /**
   * Update project
   */
  updateProject: async (req: AuthRequest, res: Response) => {
    try {
      const { title, abstract, problemStatement, methodology, status } = req.body;

      const project = await ResearchProject.findByIdAndUpdate(
        req.params.projectId,
        { title, abstract, problemStatement, methodology, status, updatedAt: new Date() },
        { new: true }
      );

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  },

  /**
   * Generate paper summary using AI
   */
  summarizePaper: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const prompt = RESEARCH_PROMPTS.summarizePaper(
        project.title,
        project.abstract,
        project.methodology
      );

      const response = await aiService.sendMessage(prompt, `research_${projectId}`);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      project.aiSummary = response.response;
      await project.save();

      res.json({ summary: response.response });
    } catch (error: any) {
      res.status(500).json({ error: 'Summarization failed' });
    }
  },

  /**
   * Find related works
   */
  findRelatedWorks: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const prompt = RESEARCH_PROMPTS.findRelatedWorks(project.title, project.problemStatement);
      const response = await aiService.sendMessage(prompt, `research_${projectId}`);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      // Parse and save related works
      const relatedWorks = response.response?.split('\n').filter(line => line.trim()) || [];
      project.relatedWorks = relatedWorks;
      await project.save();

      res.json({ relatedWorks });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to find related works' });
    }
  },

  /**
   * Generate methodology
   */
  generateMethodology: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const { constraints } = req.body;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const prompt = RESEARCH_PROMPTS.generateMethodology(project.problemStatement, constraints);
      const response = await aiService.sendMessage(prompt, `research_${projectId}`);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      project.methodology = response.response || '';
      await project.save();

      res.json({ methodology: response.response });
    } catch (error: any) {
      res.status(500).json({ error: 'Methodology generation failed' });
    }
  },

  /**
   * Export paper
   */
  exportPaper: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, format } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Simple export templates
      let content = '';

      if (format === 'ieee') {
        content = `[1] "${project.title}", 2024. Problem: ${project.problemStatement}`;
      } else if (format === 'springer') {
        content = `Title: "${project.title}" (2024).\nAbstract: ${project.abstract}`;
      } else if (format === 'bibtex') {
        content = `@article{ref2024,\n  title="${project.title}",\n  year="2024"\n}`;
      }

      project.exportFormats = {
        ...(project.exportFormats || {}),
        [format]: content,
      };
      await project.save();

      res.json({ export: content, format });
    } catch (error: any) {
      res.status(500).json({ error: 'Export failed' });
    }
  },

  /**
   * Delete research project
   */
  deleteProject: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      await ResearchProject.findByIdAndDelete(projectId);
      res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  },

  /**
   * Update project status
   */
  updateStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const { status } = req.body;

      const validStatuses = ['draft', 'in-progress', 'completed', 'submitted', 'published'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      project.status = status;
      project.updatedAt = new Date();
      await project.save();

      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  },

  /**
   * Generate literature review
   */
  generateLiteratureReview: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const prompt = RESEARCH_PROMPTS.generateLiteratureReview(
        project.title,
        project.problemStatement,
        project.relatedWorks || []
      );

      const response = await aiService.sendMessage(prompt, `research_${projectId}`);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      res.json({ literatureReview: response.response });
    } catch (error: any) {
      res.status(500).json({ error: 'Literature review generation failed' });
    }
  },

  /**
   * Generate abstract
   */
  generateAbstract: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const prompt = RESEARCH_PROMPTS.generateAbstract(
        project.title,
        project.problemStatement,
        project.methodology || ''
      );

      const response = await aiService.sendMessage(prompt, `research_${projectId}`);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      project.abstract = response.response || '';
      await project.save();

      res.json({ abstract: response.response });
    } catch (error: any) {
      res.status(500).json({ error: 'Abstract generation failed' });
    }
  },

  /**
   * Generate introduction
   */
  generateIntroduction: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await ResearchProject.findById(projectId);

      if (!project || project.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const prompt = RESEARCH_PROMPTS.generateIntroduction(
        project.title,
        project.problemStatement,
        project.abstract
      );

      const response = await aiService.sendMessage(prompt, `research_${projectId}`);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      res.json({ introduction: response.response });
    } catch (error: any) {
      res.status(500).json({ error: 'Introduction generation failed' });
    }
  },
};
