import axios from 'axios';

/**
 * Semantic Scholar API Service
 * Fetches research papers using the Semantic Scholar API
 */

interface Author {
  authorId?: string;
  name: string;
}

interface Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: Author[];
  year: number | null;
  url: string;
  citationCount?: number;
  venue?: string;
}

interface SemanticScholarResponse {
  total: number;
  offset: number;
  next?: number;
  data: Paper[];
}

export class SemanticScholarService {
  private apiKey: string;
  private baseUrl: string = 'https://api.semanticscholar.org/graph/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      console.warn('⚠️  SEMANTIC_SCHOLAR_API_KEY is not set. API requests may be rate-limited.');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for papers using keywords
   * @param keywords - Array of search keywords
   * @param limit - Maximum number of papers to return (default: 5)
   */
  async searchPapers(keywords: string[], limit: number = 5): Promise<Paper[]> {
    try {
      // Construct query from keywords
      const query = keywords.join(' ');

      // Set up request headers
      const headers: any = {
        'Accept': 'application/json',
      };

      // Add API key to headers if available
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      // Make request to Semantic Scholar API
      const response = await axios.get<SemanticScholarResponse>(
        `${this.baseUrl}/paper/search`,
        {
          params: {
            query,
            limit,
            fields: 'title,authors,year,abstract,url,citationCount,venue',
          },
          headers,
          timeout: 15000, // 15 second timeout
        }
      );

      // Filter papers with abstracts
      const papers = response.data.data.filter(paper => paper.abstract && paper.abstract.trim() !== '');

      console.log(`✅ Found ${papers.length} papers from Semantic Scholar for query: "${query}"`);
      
      return papers;
    } catch (error: any) {
      console.error('❌ Semantic Scholar API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      // Handle specific error cases
      if (error.response?.status === 429) {
        throw new Error('Semantic Scholar API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 403) {
        throw new Error('Invalid Semantic Scholar API key.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request to Semantic Scholar API timed out.');
      }

      throw new Error('Failed to fetch papers from Semantic Scholar API.');
    }
  }

  /**
   * Get paper by ID
   * @param paperId - Semantic Scholar paper ID
   */
  async getPaperById(paperId: string): Promise<Paper | null> {
    try {
      const headers: any = {
        'Accept': 'application/json',
      };

      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await axios.get<Paper>(
        `${this.baseUrl}/paper/${paperId}`,
        {
          params: {
            fields: 'title,authors,year,abstract,url,citationCount,venue',
          },
          headers,
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch paper by ID:', error.message);
      return null;
    }
  }

  /**
   * Search papers by author
   * @param authorName - Name of the author
   * @param limit - Maximum number of papers to return
   */
  async searchPapersByAuthor(authorName: string, limit: number = 5): Promise<Paper[]> {
    try {
      const headers: any = {
        'Accept': 'application/json',
      };

      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await axios.get<SemanticScholarResponse>(
        `${this.baseUrl}/paper/search`,
        {
          params: {
            query: `author:${authorName}`,
            limit,
            fields: 'title,authors,year,abstract,url,citationCount,venue',
          },
          headers,
          timeout: 15000,
        }
      );

      return response.data.data.filter(paper => paper.abstract);
    } catch (error: any) {
      console.error('❌ Failed to search papers by author:', error.message);
      throw new Error('Failed to search papers by author.');
    }
  }

  /**
   * Get trending papers in a field
   * @param field - Research field (e.g., "machine learning", "computer vision")
   * @param limit - Maximum number of papers to return
   */
  async getTrendingPapers(field: string, limit: number = 5): Promise<Paper[]> {
    try {
      const headers: any = {
        'Accept': 'application/json',
      };

      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      // Search recent papers (last 2 years) sorted by citation count
      const currentYear = new Date().getFullYear();
      const response = await axios.get<SemanticScholarResponse>(
        `${this.baseUrl}/paper/search`,
        {
          params: {
            query: field,
            limit,
            year: `${currentYear - 2}-${currentYear}`,
            fields: 'title,authors,year,abstract,url,citationCount,venue',
          },
          headers,
          timeout: 15000,
        }
      );

      // Sort by citation count
      const papers = response.data.data
        .filter(paper => paper.abstract)
        .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));

      return papers;
    } catch (error: any) {
      console.error('❌ Failed to get trending papers:', error.message);
      throw new Error('Failed to get trending papers.');
    }
  }
}

export default SemanticScholarService;
console.log('📚 Semantic Scholar Service loaded');
