import axios from 'axios';

export interface GitHubProfile {
  username: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  repositories: GitHubRepo[];
}

export interface GitHubRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  commits?: number;
  pullRequests?: number;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';

  /**
   * Fetch GitHub user profile
   */
  async getUserProfile(username: string, accessToken?: string): Promise<GitHubProfile> {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      // Get user info
      const userRes = await axios.get(`${this.baseUrl}/users/${username}`, { headers });
      const user = userRes.data;

      // Get repositories
      const reposRes = await axios.get(`${this.baseUrl}/users/${username}/repos?per_page=100&sort=stars`, { headers });
      const repos = reposRes.data.map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
      }));

      return {
        username: user.login,
        name: user.name,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        repositories: repos,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
    }
  }

  /**
   * Get repositories with commit history
   */
  async getRepositoriesWithCommits(username: string, accessToken?: string): Promise<GitHubRepo[]> {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const reposRes = await axios.get(`${this.baseUrl}/users/${username}/repos?per_page=50&sort=updated`, { headers });
      
      const enrichedRepos = await Promise.all(
        reposRes.data.map(async (repo: any) => {
          try {
            const commitsRes = await axios.get(
              `${this.baseUrl}/repos/${username}/${repo.name}/commits?per_page=1`,
              { headers }
            );
            return {
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              stars: repo.stargazers_count,
              language: repo.language,
              commits: parseInt(commitsRes.headers['link']?.match(/page=(\d+)>; rel="last"/)?.[1] || '0'),
            };
          } catch {
            return {
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              stars: repo.stargazers_count,
              language: repo.language,
              commits: 0,
            };
          }
        })
      );

      return enrichedRepos;
    } catch (error: any) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  /**
   * Get pull requests summary
   */
  async getUserPullRequests(username: string, accessToken?: string): Promise<number> {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const res = await axios.get(
        `${this.baseUrl}/search/issues?q=author:${username}+type:pr&per_page=1`,
        { headers }
      );

      return res.data.total_count;
    } catch (error: any) {
      console.error('Failed to fetch PRs:', error.message);
      return 0;
    }
  }
}

export default GitHubService;
