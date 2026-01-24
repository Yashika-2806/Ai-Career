import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import AIConversation from '../models/AIConversation.js';
import AIService from '../ai/ai.service.js';
import { INTERVIEW_PROMPTS, GLOBAL_MENTOR_PROMPTS } from '../ai/prompts.js';

const aiService = new AIService(process.env.GEMINI_API_KEY || '');

export const interviewController = {
  /**
   * Start mock interview
   */
  startInterview: async (req: AuthRequest, res: Response) => {
    try {
      const { jobRole, interviewType, company, companyName } = req.body; // 'technical' or 'hr'

      const conversation = new AIConversation({
        userId: req.userId,
        context: 'interview',
        messages: [],
        metadata: {
          jobRole,
          interviewType,
          company,
          companyName,
        },
      });

      await conversation.save();

      // Generate first question
      const backgroundContext = `College Student applying for ${jobRole}${companyName ? ` at ${companyName}` : ''}`;
      let prompt = '';

      if (interviewType === 'technical') {
        prompt = INTERVIEW_PROMPTS.generateTechnicalQuestion(backgroundContext, jobRole, company, companyName);
      } else {
        prompt = INTERVIEW_PROMPTS.generateHRQuestion(jobRole, backgroundContext, company, companyName);
      }

      const response = await aiService.sendMessage(prompt, `interview_${conversation._id}`);

      conversation.messages.push({
        role: 'assistant',
        content: response.response || '',
        timestamp: new Date(),
      });

      await conversation.save();

      res.status(201).json({
        conversationId: conversation._id,
        question: response.response,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to start interview' });
    }
  },

  /**
   * Submit answer and get feedback
   */
  submitAnswer: async (req: AuthRequest, res: Response) => {
    try {
      const { conversationId, answer, suspiciousActivities, tabSwitches } = req.body;

      const conversation = await AIConversation.findById(conversationId);
      if (!conversation || conversation.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      conversation.messages.push({
        role: 'user',
        content: answer,
        timestamp: new Date(),
      });

      // Get the last question
      const lastQuestion = conversation.messages
        .filter(m => m.role === 'assistant')
        .slice(-1)[0]?.content || 'Previous question';

      // Generate evaluation
      const prompt = INTERVIEW_PROMPTS.evaluateAnswer(
        lastQuestion,
        answer,
        'Optimal approach',
        suspiciousActivities,
        tabSwitches
      );

      const evaluationResponse = await aiService.sendMessage(prompt, `interview_${conversationId}`);

      conversation.messages.push({
        role: 'assistant',
        content: evaluationResponse.response || '',
        timestamp: new Date(),
      });

      // Store proctoring data in metadata
      if (suspiciousActivities || tabSwitches) {
        conversation.metadata = {
          ...conversation.metadata,
          proctoringData: {
            suspiciousActivities: suspiciousActivities || 0,
            tabSwitches: tabSwitches || 0,
            timestamp: new Date(),
          },
        };
      }

      await conversation.save();

      res.json({
        feedback: evaluationResponse.response,
        score: 3.5, // Can be parsed from AI response
        nextQuestion: 'Would you like another question?',
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  },

  /**
   * Get interview history
   */
  getHistory: async (req: AuthRequest, res: Response) => {
    try {
      const conversations = await AIConversation.find({
        userId: req.userId,
        context: 'interview',
      }).sort({ createdAt: -1 });

      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  },
};

export const mentorController = {
  /**
   * Get contextual AI mentor response
   */
  getMentorResponse: async (req: AuthRequest, res: Response) => {
    try {
      const { currentPage, userQuestion, conversationId } = req.body;

      // Get or create conversation
      let conversation = conversationId
        ? await AIConversation.findById(conversationId)
        : new AIConversation({
            userId: req.userId,
            context: 'global',
            messages: [],
            metadata: { currentPage },
          });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Generate contextual response
      const userContext = `College student on ${currentPage} page`;
      const userHistory = 'Previous learnings and progress';

      const prompt = GLOBAL_MENTOR_PROMPTS.contextAwareResponse(
        userContext,
        currentPage,
        userHistory,
        userQuestion
      );

      const response = await aiService.sendMessage(prompt, `mentor_${conversation._id}`);

      conversation.messages.push({
        role: 'user',
        content: userQuestion,
        timestamp: new Date(),
      });

      conversation.messages.push({
        role: 'assistant',
        content: response.response || '',
        timestamp: new Date(),
      });

      await conversation.save();

      res.json({
        response: response.response,
        conversationId: conversation._id,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to get mentor response' });
    }
  },

  /**
   * Get personalized insights
   */
  getInsights: async (req: AuthRequest, res: Response) => {
    try {
      const userData = 'User profile and achievements';
      const progressMetrics = 'DSA progress, Resume status, etc';

      const prompt = GLOBAL_MENTOR_PROMPTS.generateInsights(userData, progressMetrics);
      const response = await aiService.sendMessage(prompt);

      res.json({
        insights: response.response,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  },
};
