import AIService from '../ai/ai.service.js';
import { RESUME_PROMPTS } from '../ai/prompts.js';
import GitHubService from './github.service';
import LinkedInService from './linkedin.service';
import CodeForcesService from './codeforces.service';
import LeetCodeService from './leetcode.service';

export interface ResumeProfile {
  personal: {
    name: string;
    email: string;
    college: string;
    yearOfGraduation: number;
    branch: string;
  };
  github?: any;
  linkedin?: any;
  codeforces?: any;
  leetcode?: any;
}

export class ResumeService {
  constructor(
    private aiService: AIService,
    private githubService: GitHubService,
    private linkedinService: LinkedInService,
    private codeforcesService: CodeForcesService,
    private leetcodeService: LeetCodeService
  ) {}

  /**
   * Fetch all profile data from connected social platforms
   */
  async fetchAllProfiles(profile: ResumeProfile): Promise<ResumeProfile> {
    const enriched = { ...profile };

    // Fetch GitHub
    if (profile.github?.username) {
      try {
        enriched.github = await this.githubService.getUserProfile(profile.github.username);
      } catch (error) {
        console.error('GitHub fetch error:', error);
      }
    }

    // Fetch LinkedIn
    if (profile.linkedin?.accessToken) {
      try {
        enriched.linkedin = await this.linkedinService.getUserProfile(profile.linkedin.accessToken);
      } catch (error) {
        console.error('LinkedIn fetch error:', error);
      }
    }

    // Fetch CodeForces
    if (profile.codeforces?.handle) {
      try {
        enriched.codeforces = await this.codeforcesService.getUserProfile(profile.codeforces.handle);
      } catch (error) {
        console.error('CodeForces fetch error:', error);
      }
    }

    // Fetch LeetCode
    if (profile.leetcode?.username) {
      try {
        enriched.leetcode = await this.leetcodeService.getUserProfile(profile.leetcode.username);
      } catch (error) {
        console.error('LeetCode fetch error:', error);
      }
    }

    return enriched;
  }

  /**
   * Generate resume using AI from fetched profiles
   */
  async generateResume(profiles: ResumeProfile, targetRole?: string): Promise<{ resume: string; atsScore: number }> {
    try {
      // Generate resume content
      const prompt = RESUME_PROMPTS.generateFromProfiles(profiles);
      const aiResponse = await this.aiService.sendMessage(prompt);

      if (!aiResponse.success) {
        throw new Error(aiResponse.error);
      }

      const resumeContent = aiResponse.response || '';

      // Calculate ATS score
      const atsPrompt = RESUME_PROMPTS.calculateATSScore(resumeContent);
      const atsResponse = await this.aiService.sendMessage(atsPrompt);

      let atsScore = 70; // Default fallback
      if (atsResponse.success && atsResponse.response) {
        // Try multiple regex patterns to extract score
        const scoreMatch = atsResponse.response.match(/Score:\s*(\d+)\s*\/\s*100/i) || 
                           atsResponse.response.match(/(\d+)\s*\/\s*100/i) ||
                           atsResponse.response.match(/Score:\s*(\d+)/i) ||
                           atsResponse.response.match(/ATS\s*Score:\s*(\d+)/i);
        
        if (scoreMatch && scoreMatch[1]) {
          const extractedScore = parseInt(scoreMatch[1]);
          // Validate score is between 0-100
          atsScore = (extractedScore >= 0 && extractedScore <= 100) ? extractedScore : 70;
        }
      }

      return {
        resume: resumeContent,
        atsScore,
      };
    } catch (error: any) {
      throw new Error(`Resume generation failed: ${error.message}`);
    }
  }

  /**
   * Optimize resume for a specific role
   */
  async optimizeForRole(resume: string, targetRole: string): Promise<{ optimizedResume: string; suggestions: string[] }> {
    try {
      const prompt = RESUME_PROMPTS.optimizeForRole(resume, targetRole);
      const response = await this.aiService.sendMessage(prompt);

      if (!response.success) {
        throw new Error(response.error);
      }

      // Parse suggestions from response
      const suggestions = response.response?.split('\n').filter(line => line.trim().startsWith('-')) || [];

      return {
        optimizedResume: response.response || '',
        suggestions: suggestions.map(s => s.replace(/^-\s*/, '')),
      };
    } catch (error: any) {
      throw new Error(`Resume optimization failed: ${error.message}`);
    }
  }

  /**
   * Calculate ATS score
   */
  async calculateATSScore(resume: string): Promise<{ score: number; improvements: string[] }> {
    try {
      const prompt = RESUME_PROMPTS.calculateATSScore(resume);
      const response = await this.aiService.sendMessage(prompt);

      if (!response.success) {
        throw new Error(response.error);
      }

      let score = 70;
      const scoreMatch = response.response?.match(/Score:\s*(\d+)\s*\/\s*100/i) || 
                         response.response?.match(/(\d+)\s*\/\s*100/i) ||
                         response.response?.match(/Score:\s*(\d+)/i);
      if (scoreMatch && scoreMatch[1]) {
        const extractedScore = parseInt(scoreMatch[1]);
        score = (extractedScore >= 0 && extractedScore <= 100) ? extractedScore : 70;
      }

      const improvements = response.response?.split('\n').filter(line => line.trim().startsWith('-')) || [];

      return {
        score,
        improvements: improvements.map(i => i.replace(/^-\s*/, '')),
      };
    } catch (error: any) {
      throw new Error(`ATS calculation failed: ${error.message}`);
    }
  }

  /**
   * Auto-sync profile data periodically
   */
  async autoSyncProfiles(profile: ResumeProfile): Promise<ResumeProfile> {
    return this.fetchAllProfiles(profile);
  }
}

export default ResumeService;
