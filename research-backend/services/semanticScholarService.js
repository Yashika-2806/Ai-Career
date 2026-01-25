const axios = require('axios');

const SEMANTIC_SCHOLAR_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

/**
 * Searches for research papers using Semantic Scholar API
 * @param {string[]} keywords - Array of academic keywords
 * @returns {Promise<Array>} Array of paper objects
 */
async function searchPapers(keywords) {
  try {
    // Join keywords with spaces for the query
    const query = keywords.join(' ');

    const response = await axios.get(`${SEMANTIC_SCHOLAR_BASE_URL}/paper/search`, {
      params: {
        query: query,
        limit: 5,
        fields: 'title,authors,year,abstract,url'
      },
      headers: {
        'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
      }
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from Semantic Scholar API');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error searching papers:', error);
    throw new Error('Failed to search research papers');
  }
}

module.exports = {
  searchPapers
};