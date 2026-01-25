import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import ResearchProject from '../models/Research.js';
import AIService from '../ai/ai.service.js';
import { RESEARCH_PROMPTS } from '../ai/prompts.js';
import SemanticScholarService from '../services/semanticScholar.service.js';

const aiService = new AIService(process.env.GEMINI_API_KEY || '');
const scholarService = new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY || '');

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

  /**
   * Recommend research papers based on student's prompt
   * This is the main endpoint for the new paper recommendation feature
   */
  recommendPapers: async (req: AuthRequest, res: Response) => {
    try {
      const { studentPrompt } = req.body;

      if (!studentPrompt || typeof studentPrompt !== 'string' || studentPrompt.trim() === '') {
        return res.status(400).json({ error: 'studentPrompt is required' });
      }

      console.log(`📝 Processing research paper request: "${studentPrompt}"`);

      // Step 1: Use Gemini to extract keywords from student prompt
      const keywordPrompt = RESEARCH_PROMPTS.extractKeywords(studentPrompt);
      const keywordResponse = await aiService.sendMessage(keywordPrompt);

      if (!keywordResponse.success || !keywordResponse.response) {
        return res.status(500).json({ error: 'Failed to extract keywords from prompt' });
      }

      // Parse JSON response from Gemini
      let keywordData;
      try {
        // Remove markdown code blocks if present
        let cleanedResponse = keywordResponse.response.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        keywordData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini keyword response:', keywordResponse.response);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }

      const { keywords, domain, topic } = keywordData;

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(500).json({ error: 'No keywords extracted from prompt' });
      }

      console.log(`🔑 Extracted keywords: ${keywords.join(', ')}`);
      console.log(`📚 Domain: ${domain}`);

      // Step 2: Search Semantic Scholar for papers
      const papers = await scholarService.searchPapers(keywords, 5);

      if (!papers || papers.length === 0) {
        return res.json({
          topic: topic || studentPrompt,
          domain: domain || 'General Research',
          papers: [],
          message: 'No papers found for this topic. Try different keywords or a broader search.'
        });
      }

      // Step 3: For each paper, use Gemini to simplify abstract and explain relevance
      const enrichedPapers = await Promise.all(
        papers.map(async (paper) => {
          try {
            // Simplify abstract
            const simplifyPrompt = RESEARCH_PROMPTS.simplifyAbstract(
              paper.title,
              paper.abstract || '',
              studentPrompt
            );
            const simplifyResponse = await aiService.sendMessage(simplifyPrompt);

            // Explain relevance
            const relevancePrompt = RESEARCH_PROMPTS.explainRelevance(
              paper.title,
              paper.abstract || '',
              studentPrompt
            );
            const relevanceResponse = await aiService.sendMessage(relevancePrompt);

            return {
              title: paper.title,
              authors: paper.authors.map(a => a.name),
              year: paper.year || 'N/A',
              summary: simplifyResponse.success ? simplifyResponse.response : paper.abstract?.substring(0, 200) + '...',
              paperLink: paper.url,
              relevance: relevanceResponse.success ? relevanceResponse.response : 'Related to your research topic',
              citationCount: paper.citationCount || 0,
              venue: paper.venue || 'Unknown'
            };
          } catch (error) {
            console.error(`⚠️  Error processing paper "${paper.title}":`, error);
            // Return paper with minimal processing if AI fails
            return {
              title: paper.title,
              authors: paper.authors.map(a => a.name),
              year: paper.year || 'N/A',
              summary: paper.abstract?.substring(0, 200) + '...' || 'Abstract not available',
              paperLink: paper.url,
              relevance: 'Related to your research topic',
              citationCount: paper.citationCount || 0,
              venue: paper.venue || 'Unknown'
            };
          }
        })
      );

      console.log(`✅ Successfully processed ${enrichedPapers.length} papers`);

      // Step 4: Return structured response
      res.json({
        topic: topic || studentPrompt,
        domain: domain || 'General Research',
        keywords,
        papers: enrichedPapers,
        totalFound: enrichedPapers.length
      });

    } catch (error: any) {
      console.error('❌ Paper recommendation error:', error);
      res.status(500).json({ 
        error: 'Failed to recommend papers',
        details: error.message 
      });
    }
  },
};
