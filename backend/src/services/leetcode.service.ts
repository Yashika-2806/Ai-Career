import axios from 'axios';

export interface LeetCodeProfile {
  username: string;
  realName: string;
  solvedProblems: number;
  totalProblems: number;
  solveRate: number;
  rating?: number;
  badge?: string;
}

export class LeetCodeService {
  private baseUrl = 'https://leetcode.com/graphql';

  /**
   * Fetch LeetCode user profile using GraphQL
   */
  async getUserProfile(username: string): Promise<LeetCodeProfile> {
    try {
      const query = `
        query {
          userPublicProfile(username: "${username}") {
            username
            realName
            githubUrl
            twitterUrl
            linkedinUrl
            websiteUrl
            categoryDiscussCount {
              count
            }
            socialAccounts {
              service
              link
            }
            submissionCalendar
            badges {
              id
              displayName
              name
              medal {
                colors
                name
              }
              creationDate
            }
            problemsSolvedBeatsStats {
              solves
              beats
            }
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser {
              userName
              profile {
                ranking
              }
              submissionCalendar
              tagProblemCounts {
                advanced {
                  tagName
                  problemsSolved
                }
                intermediate {
                  tagName
                  problemsSolved
                }
                fundamental {
                  tagName
                  problemsSolved
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(this.baseUrl, { query });
      const profile = response.data.data.userPublicProfile;

      const solvedCount = profile.allQuestionsCount?.reduce((sum: number, q: any) => sum + q.count, 0) || 0;
      const totalCount = profile.allQuestionsCount?.reduce((sum: number, q: any) => sum + q.count, 0) || 0;

      return {
        username: profile.username,
        realName: profile.realName || profile.username,
        solvedProblems: solvedCount,
        totalProblems: totalCount || 3000, // Approximate total
        solveRate: totalCount > 0 ? (solvedCount / totalCount) * 100 : 0,
        rating: profile.matchedUser?.profile?.ranking || 0,
        badge: profile.badges?.[0]?.displayName || 'Novice',
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch LeetCode profile: ${error.message}`);
    }
  }

  /**
   * Get solved problems by category
   */
  async getSolvedByCategory(username: string): Promise<any> {
    try {
      const query = `
        query {
          matchedUser(username: "${username}") {
            tagProblemCounts {
              advanced {
                tagName
                problemsSolved
              }
              intermediate {
                tagName
                problemsSolved
              }
              fundamental {
                tagName
                problemsSolved
              }
            }
          }
        }
      `;

      const response = await axios.post(this.baseUrl, { query });
      const counts = response.data.data.matchedUser?.tagProblemCounts || {};

      return {
        advanced: counts.advanced || [],
        intermediate: counts.intermediate || [],
        fundamental: counts.fundamental || [],
      };
    } catch (error: any) {
      console.error('Failed to fetch category stats:', error.message);
      return {};
    }
  }
}

export default LeetCodeService;
