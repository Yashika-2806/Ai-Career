const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Extracts academic keywords and research domain from student's prompt
 * @param {string} prompt - The student's research idea or topic
 * @returns {Promise<{keywords: string[], domain: string}>}
 */
async function extractKeywordsAndDomain(prompt) {
  const promptText = `
    Analyze the following student research prompt and extract:
    1. 5-7 academic keywords that best represent the research topic
    2. The primary research domain (e.g., Computer Science, Biology, Physics, etc.)

    Return ONLY a JSON object with this exact structure:
    {
      "keywords": ["keyword1", "keyword2", ...],
      "domain": "domain_name"
    }

    Student prompt: "${prompt}"
  `;

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = JSON.parse(text.trim());
    return parsed;
  } catch (error) {
    console.error('Error extracting keywords and domain:', error);
    throw new Error('Failed to extract keywords and domain from prompt');
  }
}

/**
 * Simplifies a research paper abstract and explains its relevance to the student's topic
 * @param {string} abstract - The paper's abstract
 * @param {string} topic - The student's research topic
 * @returns {Promise<{summary: string, relevance: string}>}
 */
async function simplifyAbstractAndRelevance(abstract, topic) {
  const promptText = `
    Given the research paper abstract and the student's topic, provide:
    1. A simplified summary of the abstract in 2-3 lines, written in student-friendly language
    2. A brief explanation (1-2 lines) of how this paper is relevant to the student's research topic

    Return ONLY a JSON object with this exact structure:
    {
      "summary": "simplified summary text",
      "relevance": "relevance explanation"
    }

    Student topic: "${topic}"
    Paper abstract: "${abstract}"
  `;

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = JSON.parse(text.trim());
    return parsed;
  } catch (error) {
    console.error('Error simplifying abstract:', error);
    throw new Error('Failed to simplify abstract and explain relevance');
  }
}

module.exports = {
  extractKeywordsAndDomain,
  simplifyAbstractAndRelevance
};