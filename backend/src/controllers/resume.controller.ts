import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Resume from '../models/Resume';
import User from '../models/User';
import AIService from '../ai/ai.service';
import ResumeService from '../services/resume.service';
import GitHubService from '../services/github.service';
import LinkedInService from '../services/linkedin.service';
import CodeForcesService from '../services/codeforces.service';
import LeetCodeService from '../services/leetcode.service';

const aiService = new AIService(process.env.GEMINI_API_KEY || '');
const githubService = new GitHubService();
const linkedinService = new LinkedInService();
const codeforcesService = new CodeForcesService();
const leetcodeService = new LeetCodeService();
const resumeService = new ResumeService(aiService, githubService, linkedinService, codeforcesService, leetcodeService);

export const resumeController = {
  /**
   * Generate resume from social profiles
   */
  generateResume: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profiles = {
        personal: {
          name: user.name,
          email: user.email,
          college: user.college,
          yearOfGraduation: user.yearOfGraduation,
          branch: user.branch,
        },
        github: user.socialProfiles.github,
        linkedin: user.socialProfiles.linkedin,
        codeforces: user.socialProfiles.codeforces,
        leetcode: user.socialProfiles.leetcode,
      };

      // Fetch all profiles
      const enrichedProfiles = await resumeService.fetchAllProfiles(profiles);

      // Generate resume
      const { resume: resumeContent, atsScore } = await resumeService.generateResume(enrichedProfiles);

      // Save resume version
      let resumeDoc = await Resume.findOne({ userId: req.userId });
      if (!resumeDoc) {
        resumeDoc = new Resume({
          userId: req.userId,
          versions: [],
          currentVersion: 1,
        });
      }

      (resumeDoc.versions as any).push({
        versionNumber: (resumeDoc.versions.length || 0) + 1,
        title: `Resume v${(resumeDoc.versions.length || 0) + 1}`,
        content: resumeContent,
        atsScore,
        generatedAt: new Date(),
      } as any);

      resumeDoc.currentVersion = resumeDoc.versions.length;
      resumeDoc.lastSyncedAt = new Date();
      await resumeDoc.save();

      res.json({
        versionNumber: resumeDoc.currentVersion,
        content: resumeContent,
        atsScore,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Resume generation failed', details: error.message });
    }
  },

  /**
   * Get resume versions
   */
  getVersions: async (req: AuthRequest, res: Response) => {
    try {
      const resume = await Resume.findOne({ userId: req.userId });
      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      res.json({
        versions: resume.versions.map(v => ({
          versionNumber: v.versionNumber,
          title: v.title,
          atsScore: v.atsScore,
          generatedAt: v.generatedAt,
        })),
        currentVersion: resume.currentVersion,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch versions' });
    }
  },

  /**
   * Get specific resume version
   */
  getVersion: async (req: AuthRequest, res: Response) => {
    try {
      const { versionNumber } = req.params;
      const resume = await Resume.findOne({ userId: req.userId });

      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      const version = resume.versions.find(v => v.versionNumber === parseInt(versionNumber));
      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch version' });
    }
  },

  /**
   * Optimize resume for role
   */
  optimizeForRole: async (req: AuthRequest, res: Response) => {
    try {
      const { versionNumber, targetRole } = req.body;

      const resume = await Resume.findOne({ userId: req.userId });
      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      const version = resume.versions.find(v => v.versionNumber === versionNumber);
      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const { optimizedResume, suggestions } = await resumeService.optimizeForRole(version.content, targetRole);

      res.json({
        optimizedContent: optimizedResume,
        suggestions,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Optimization failed', details: error.message });
    }
  },

  /**
   * Calculate ATS score
   */
  calculateATSScore: async (req: AuthRequest, res: Response) => {
    try {
      const { versionNumber } = req.body;

      const resume = await Resume.findOne({ userId: req.userId });
      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      const version = resume.versions.find(v => v.versionNumber === versionNumber);
      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const { score, improvements } = await resumeService.calculateATSScore(version.content);

      res.json({
        score,
        improvements,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'ATS calculation failed' });
    }
  },

  /**
   * Sync social profiles
   */
  syncProfiles: async (req: AuthRequest, res: Response) => {
    try {
      const { github, leetcode, codeforces, linkedin, hackerrank, geeksforgeeks, codechef } = req.body;
      
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Initialize socialProfiles if it doesn't exist
      if (!user.socialProfiles) {
        user.socialProfiles = {};
      }

      // Update user's social profiles and fetch data from APIs
      const results: Record<string, any> = {};
      const fetchedData: Record<string, any> = {};

      // Fetch GitHub profile data
      if (github) {
        try {
          if (!user.socialProfiles.github) {
            user.socialProfiles.github = {
              username: github,
              synced: false
            };
          }
          user.socialProfiles.github.username = github;
          
          const githubData = await githubService.getUserProfile(github);
          fetchedData.github = {
            username: githubData.username,
            name: githubData.name,
            bio: githubData.bio,
            publicRepos: githubData.publicRepos,
            followers: githubData.followers,
            topRepos: githubData.repositories.slice(0, 5).map(r => ({
              name: r.name,
              stars: r.stars,
              language: r.language
            }))
          };
          
          user.socialProfiles.github.synced = true;
          results.github = true;
        } catch (error: any) {
          console.error('GitHub fetch error:', error.message);
          results.github = false;
          fetchedData.github = { error: error.message };
        }
      }

      // Fetch LeetCode profile data
      if (leetcode) {
        try {
          if (!user.socialProfiles.leetcode) {
            user.socialProfiles.leetcode = {
              username: leetcode,
              rating: 0,
              synced: false
            };
          }
          user.socialProfiles.leetcode.username = leetcode;
          
          const leetcodeData = await leetcodeService.getUserProfile(leetcode);
          fetchedData.leetcode = {
            username: leetcodeData.username,
            solvedProblems: leetcodeData.solvedProblems,
            totalProblems: leetcodeData.totalProblems,
            rating: leetcodeData.rating,
            badge: leetcodeData.badge
          };
          
          user.socialProfiles.leetcode.synced = true;
          results.leetcode = true;
        } catch (error: any) {
          console.error('LeetCode fetch error:', error.message);
          results.leetcode = false;
          fetchedData.leetcode = { error: error.message };
        }
      }

      // Fetch Codeforces profile data
      if (codeforces) {
        try {
          if (!user.socialProfiles.codeforces) {
            user.socialProfiles.codeforces = {
              handle: codeforces,
              rating: 0,
              synced: false
            };
          }
          user.socialProfiles.codeforces.handle = codeforces;
          
          const codeforcesData = await codeforcesService.getUserProfile(codeforces);
          fetchedData.codeforces = {
            handle: codeforcesData.handle,
            rating: codeforcesData.rating,
            maxRating: codeforcesData.maxRating,
            rank: codeforcesData.rank,
            solvedProblems: codeforcesData.solvedProblems
          };
          
          user.socialProfiles.codeforces.synced = true;
          results.codeforces = true;
        } catch (error: any) {
          console.error('Codeforces fetch error:', error.message);
          results.codeforces = false;
          fetchedData.codeforces = { error: error.message };
        }
      }

      // Handle LinkedIn (requires OAuth token)
      if (linkedin) {
        if (!user.socialProfiles.linkedin) {
          user.socialProfiles.linkedin = {
            profileId: linkedin,
            synced: false
          };
        }
        user.socialProfiles.linkedin.profileId = linkedin;
        user.socialProfiles.linkedin.synced = true;
        results.linkedin = true;
        fetchedData.linkedin = {
          message: 'LinkedIn profile linked (OAuth required for full data)'
        };
      }

      // Note: HackerRank, GeeksforGeeks, CodeChef APIs require authentication
      // For now, just store the usernames
      if (hackerrank) {
        results.hackerrank = true;
        fetchedData.hackerrank = { username: hackerrank, message: 'Profile linked' };
      }
      if (geeksforgeeks) {
        results.geeksforgeeks = true;
        fetchedData.geeksforgeeks = { username: geeksforgeeks, message: 'Profile linked' };
      }
      if (codechef) {
        results.codechef = true;
        fetchedData.codechef = { username: codechef, message: 'Profile linked' };
      }

      user.updatedAt = new Date();
      await user.save();

      res.json({
        message: 'Profiles synced successfully',
        synced: results,
        data: fetchedData,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error('Sync profiles error:', error);
      res.status(500).json({ error: 'Sync failed', details: error.message });
    }
  },
};
