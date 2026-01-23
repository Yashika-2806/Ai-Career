import axios from 'axios';

export interface CodeForcesProfile {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  solvedProblems: number;
  attemptedProblems: number;
  submissions: number;
}

export class CodeForcesService {
  private baseUrl = 'https://codeforces.com/api';

  /**
   * Fetch CodeForces user profile and stats
   */
  async getUserProfile(handle: string): Promise<CodeForcesProfile> {
    try {
      const userRes = await axios.get(`${this.baseUrl}/user.info?handles=${handle}`);
      const user = userRes.data.result[0];

      // Get submission count
      const submissionsRes = await axios.get(`${this.baseUrl}/user.status?handle=${handle}&from=1&count=1`);
      const submissions = submissionsRes.data.result.length || 0;

      return {
        handle: user.handle,
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'Unrated',
        maxRank: user.maxRank || 'Unrated',
        solvedProblems: user.problemsSolved?.length || 0,
        attemptedProblems: submissions,
        submissions: submissions,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch CodeForces profile: ${error.message}`);
    }
  }

  /**
   * Get solved problems by topic
   */
  async getSolvedProblems(handle: string): Promise<any[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/user.status?handle=${handle}&from=1&count=10000`);
      
      const solved = new Set();
      const attempted = new Map();

      res.data.result.forEach((submission: any) => {
        const problemKey = `${submission.problem.contestId}:${submission.problem.index}`;
        if (submission.verdict === 'OK') {
          solved.add(problemKey);
        }
        if (!attempted.has(problemKey)) {
          attempted.set(problemKey, {
            name: submission.problem.name,
            rating: submission.problem.rating,
            tags: submission.problem.tags,
            verdict: submission.verdict,
          });
        }
      });

      return Array.from(attempted.values()).map(prob => ({
        ...prob,
        solved: solved.has(`${prob.name}`) ? true : false,
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch solved problems: ${error.message}`);
    }
  }

  /**
   * Get recent contests participated
   */
  async getRecentContests(handle: string): Promise<any[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/user.ratedListByTime?handle=${handle}`);
      
      return res.data.result.slice(0, 10).map((contest: any) => ({
        name: contest.name,
        newRating: contest.newRating,
        oldRating: contest.oldRating,
        ratingChange: contest.newRating - contest.oldRating,
        timestamp: contest.ratingUpdateTimeSeconds,
      }));
    } catch (error: any) {
      console.error('Failed to fetch contests:', error.message);
      return [];
    }
  }
}

export default CodeForcesService;
