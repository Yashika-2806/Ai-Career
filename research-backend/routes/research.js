const express = require('express');
const router = express.Router();
const { extractKeywordsAndDomain, simplifyAbstractAndRelevance } = require('../services/geminiService');
const { searchPapers } = require('../services/semanticScholarService');

/**
 * POST /api/research
 * Recommends research papers based on student's prompt
 */
router.post('/research', async (req, res) => {
  try {
    const { studentPrompt } = req.body;

    if (!studentPrompt || typeof studentPrompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request body. Expected { "studentPrompt": "string" }'
      });
    }

    // Step 1: Extract keywords and domain using Gemini
    const { keywords, domain } = await extractKeywordsAndDomain(studentPrompt);

    // Step 2: Search for papers using Semantic Scholar
    const papers = await searchPapers(keywords);

    // Step 3: Process each paper to get simplified summary and relevance
    const processedPapers = await Promise.all(
      papers.map(async (paper) => {
        try {
          const { summary, relevance } = await simplifyAbstractAndRelevance(
            paper.abstract || 'No abstract available',
            studentPrompt
          );

          return {
            title: paper.title,
            authors: paper.authors ? paper.authors.map(author => author.name) : [],
            year: paper.year || 'Unknown',
            summary: summary,
            paperLink: paper.url || '',
            relevance: relevance
          };
        } catch (error) {
          console.error('Error processing paper:', error);
          // Return paper with default values if processing fails
          return {
            title: paper.title,
            authors: paper.authors ? paper.authors.map(author => author.name) : [],
            year: paper.year || 'Unknown',
            summary: 'Summary not available',
            paperLink: paper.url || '',
            relevance: 'Relevance not available'
          };
        }
      })
    );

    // Step 4: Return the formatted response
    res.json({
      topic: studentPrompt,
      domain: domain,
      papers: processedPapers
    });

  } catch (error) {
    console.error('Error in research endpoint:', error);
    res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
});

module.exports = router;