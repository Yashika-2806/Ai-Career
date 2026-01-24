import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { AIService } from '../ai/ai.service.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import officeParser from 'officeparser';

// Initialize AI service with validation
let aiService: AIService;
try {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.error('🚨 WARNING: GEMINI_API_KEY is not set or using placeholder!');
    console.error('📝 Please set your API key in backend/.env');
    console.error('🔗 Get key from: https://makersuite.google.com/app/apikey');
  } else {
    console.log('✅ Gemini API Key loaded:', apiKey.substring(0, 10) + '...');
  }
  aiService = new AIService(apiKey);
} catch (error) {
  console.error('❌ Failed to initialize AI service:', error);
  throw error;
}

// Extract text from PDF using pdfjs-dist
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    let previousY = -1;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Better text extraction with proper spacing
      const textItems = textContent.items as any[];
      let pageText = '';
      
      for (let j = 0; j < textItems.length; j++) {
        const item = textItems[j];
        if (!item.str) continue;
        
        // Add newline if Y position changed significantly (new line)
        if (previousY >= 0 && Math.abs(item.transform[5] - previousY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          // Add space between words on same line
          pageText += ' ';
        }
        
        pageText += item.str.trim();
        previousY = item.transform[5];
      }
      
      fullText += pageText + '\n\n';
    }
    
    // Clean up multiple spaces and newlines
    fullText = fullText.replace(/ +/g, ' ').replace(/\n\n+/g, '\n\n').trim();
    
    console.log(`✅ Extracted ${fullText.length} characters from ${pdf.numPages} pages`);
    return fullText;
  } catch (error: any) {
    console.error('❌ PDF text extraction error:', error.message);
    throw new Error('Failed to extract text from PDF. File might be corrupted or password-protected.');
  }
}

// Extract text from PPT/PPTX using officeparser
async function extractTextFromPPT(buffer: Buffer): Promise<string> {
  try {
    const result = await officeParser.parseOffice(buffer);
    return result.toString();
  } catch (error) {
    console.error('PPT text extraction error:', error);
    throw new Error('Failed to extract text from PowerPoint file');
  }
}

// Universal text extraction function
async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    return extractTextFromPDF(buffer);
  } else if (
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return extractTextFromPPT(buffer);
  } else {
    throw new Error('Unsupported file type');
  }
}

export const pdfController = {
  /**
   * Analyze PDF/PPT and generate content based on mode
   */
  analyzePDF: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { mode, numQuestions = '5', difficulty = 'moderate' } = req.body;
      const fileBuffer = req.file.buffer;
      const mimetype = req.file.mimetype;
      const questionCount = parseInt(numQuestions) || 5;

      // Extract text from PDF or PPT
      const extractedText = await extractTextFromFile(fileBuffer, mimetype);

      console.log(`📄 Text extraction result: ${extractedText.length} characters`);
      console.log(`📝 First 200 characters: ${extractedText.substring(0, 200)}...`);

      if (!extractedText || extractedText.trim().length === 0) {
        console.error('❌ Empty text extracted from file');
        return res.status(400).json({ error: 'Could not extract text from file. The PDF might be image-based or empty.' });
      }
      
      if (extractedText.length < 100) {
        console.error('⚠️ Very short text extracted, might be insufficient');
        return res.status(400).json({ error: 'Extracted text is too short. Please upload a document with more content.' });
      }

      let result: any = {};

      // Generate content based on mode
      if (mode === 'summary') {
        // Generate a summary
        console.log('🔍 Generating document summary...');
        const summaryResponse = await aiService.sendMessage(
          `Provide a comprehensive yet concise summary of this document. Organize it with clear sections and bullet points for better readability:\n\n${extractedText.substring(0, 8000)}`
        );
        console.log('✅ Summary response:', { success: summaryResponse.success, hasResponse: !!summaryResponse.response, error: summaryResponse.error });
        const summary = summaryResponse.success ? summaryResponse.response : 'Document uploaded successfully.';
        result = {
          summary,
          extractedText: extractedText.substring(0, 10000), // Store for reference
        };
      } else if (mode === 'quiz') {
        // Generate quiz questions
        console.log(`🔍 Generating ${questionCount} ${difficulty} quiz questions from document...`);
        console.log(`📄 Document text length: ${extractedText.length} characters`);
        
        // Extract content smartly to avoid token limits
        const textPreview = extractedText.substring(0, 8000);
        
        // Identify key topics and facts
        const paragraphs = textPreview.split('\n\n').filter(p => p.trim().length > 50).slice(0, 8);
        const keyTopics = paragraphs.map(p => p.substring(0, 150).trim()).join('\n');

        const quizPrompt = `Create ${questionCount} quiz questions from this document.

DOCUMENT:
${textPreview}

KEY TOPICS:
${keyTopics}

REQUIREMENTS:
- Questions MUST use SPECIFIC facts/details from the document
- Difficulty: ${difficulty}
- Each question has 4 options with 1 correct answer
- Include explanation referencing the document

CRITICAL: Return ONLY valid JSON array. No markdown, no code blocks.

FORMAT:
[{"question":"What does the document state about [topic]?","options":["Correct from doc","Wrong but plausible","Wrong option","Wrong option"],"correctAnswer":0,"explanation":"The document states..."}]

Generate ${questionCount} questions:`;

        console.log('📝 Sending quiz prompt to AI (prompt length:', quizPrompt.length, 'chars)...');
        console.log('🔑 API Key status:', process.env.GEMINI_API_KEY ? 'SET (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'NOT SET');
        console.log('📋 Prompt preview:', quizPrompt.substring(0, 300) + '...');
        
        const quizResponse = await aiService.sendMessage(quizPrompt);
        console.log('✅ Quiz response received:', { 
          success: quizResponse.success, 
          responseLength: quizResponse.response?.length || 0,
          error: quizResponse.error,
          responsePreview: quizResponse.response?.substring(0, 200)
        });
        
        const quizText = quizResponse.success ? quizResponse.response : '';
        
        // Parse JSON from response with robust error handling
        try {
          console.log('🔍 Raw AI response preview:', quizText.substring(0, 200));
          
          // Step 1: Remove markdown and clean
          let cleanedText = quizText
            .replace(/```json\s*/gi, '')
            .replace(/```javascript\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
          
          // Step 2: Try multiple extraction methods
          let jsonString = '';
          
          // Method 1: Direct array match
          let match = cleanedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (match) {
            jsonString = match[0];
          } else {
            // Method 2: Find first [ to last ]
            const firstBracket = cleanedText.indexOf('[');
            const lastBracket = cleanedText.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              jsonString = cleanedText.substring(firstBracket, lastBracket + 1);
            }
          }
          
          if (!jsonString) {
            throw new Error('Could not extract JSON array from response');
          }
          
          console.log('📋 Extracted JSON preview:', jsonString.substring(0, 200));
          
          // Step 3: Fix common JSON errors
          jsonString = jsonString
            .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Quote unquoted keys
            .replace(/:\s*'([^']*)'/g, ':"$1"')  // Single to double quotes in values
            .replace(/\n/g, ' ')  // Remove newlines
            .replace(/\r/g, '')   // Remove carriage returns
            .replace(/\t/g, ' '); // Replace tabs
          
          // Step 4: Parse
          const questions = JSON.parse(jsonString);
          
          // Step 5: Validate
          if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Parsed result is not a valid array');
          }
          
          const validQuestions = questions.filter(q => 
            q.question && 
            typeof q.question === 'string' &&
            q.question.length > 10 &&
            Array.isArray(q.options) && 
            q.options.length === 4 &&
            q.options.every((opt: any) => typeof opt === 'string' && opt.length > 0) &&
            typeof q.correctAnswer === 'number' &&
            q.correctAnswer >= 0 && 
            q.correctAnswer <= 3 &&
            q.explanation &&
            typeof q.explanation === 'string'
          );
          
          if (validQuestions.length === 0) {
            throw new Error('No valid questions after filtering');
          }
          
          console.log(`✅ Successfully parsed ${validQuestions.length} valid questions`);
          result = { questions: validQuestions };
          
        } catch (parseError: any) {
          console.error('❌ Quiz parsing failed:', parseError.message);
          console.log('📄 Full AI response:', quizText);
          console.log('🔍 AI Response success status:', quizResponse.success);
          console.log('⚠️ AI Error if any:', quizResponse.error);
          
          // If AI completely failed, show better error
          if (!quizResponse.success || !quizText) {
            console.error('🚨 AI SERVICE FAILED - Using emergency fallback');
            return res.status(500).json({ 
              error: `AI service failed: ${quizResponse.error || 'Unknown error'}. Please check API key and try again.`,
              details: 'The AI could not generate questions. This usually means the API key is invalid or rate limited.'
            });
          }
          
          // Enhanced fallback with better quality
          console.log('⚠️ Using enhanced fallback question generation...');
          
          // Extract key sentences from document
          const meaningfulSentences = extractedText
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 30 && s.length < 200)
            .slice(0, 20);
          
          const fallbackQuestions = [];
          for (let i = 0; i < Math.min(questionCount, meaningfulSentences.length, 5); i++) {
            const sentence = meaningfulSentences[i];
            fallbackQuestions.push({
              question: `According to the document, which statement accurately reflects the content discussed?`,
              options: [
                sentence.substring(0, 120) + (sentence.length > 120 ? '...' : ''),
                "This information is not mentioned in the document",
                "The document discusses a completely different topic",
                "This content contradicts what is stated in the document"
              ],
              correctAnswer: 0,
              explanation: `This statement is directly extracted from the document content and accurately represents information discussed in the material.`
            });
          }
          
          if (fallbackQuestions.length === 0) {
            fallbackQuestions.push({
              question: "What type of information does this document primarily contain?",
              options: [
                "Educational or technical content with specific information",
                "Random unrelated data with no coherent structure",
                "Empty pages with no content",
                "Encrypted or unreadable content"
              ],
              correctAnswer: 0,
              explanation: "The document contains structured educational or informational content that can be studied and understood."
            });
          }
          
          result = { questions: fallbackQuestions };
        }
      } else if (mode === 'theory') {
        // Generate theory/written questions
        console.log(`🔍 Generating ${questionCount} ${difficulty} theory questions from document...`);
        
        const textPreview = extractedText.substring(0, 7000);
        const paragraphs = textPreview.split('\n\n').filter(p => p.trim().length > 50).slice(0, 6);
        const keyTopics = paragraphs.map(p => p.substring(0, 150).trim()).join('\n');

        const theoryPrompt = `Create ${questionCount} written answer questions from this document.

DOCUMENT:
${textPreview}

KEY TOPICS:
${keyTopics}

REQUIREMENTS:
- Questions for detailed written answers (not MCQ)
- Test deep understanding of concepts
- Difficulty: ${difficulty}
- Include model answer with key points

Return ONLY valid JSON array:
[{"question":"Explain...","points":10,"expectedLength":"2-3 paragraphs","solution":"Complete answer...","keyPoints":["Point 1","Point 2"]}]

Generate ${questionCount} theory questions:`;

        const theoryResponse = await aiService.sendMessage(theoryPrompt);
        const theoryText = theoryResponse.success ? theoryResponse.response : '';
        
        try {
          let cleanedText = theoryText
            .replace(/```json\s*/gi, '')
            .replace(/```javascript\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
          
          let jsonString = '';
          let match = cleanedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (match) {
            jsonString = match[0];
          } else {
            const firstBracket = cleanedText.indexOf('[');
            const lastBracket = cleanedText.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
              jsonString = cleanedText.substring(firstBracket, lastBracket + 1);
            }
          }
          
          if (!jsonString) throw new Error('Could not extract JSON');
          
          jsonString = jsonString
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
            .replace(/:\s*'([^']*)'/g, ':"$1"');
          
          const theoryQuestions = JSON.parse(jsonString);
          
          const validTheoryQuestions = theoryQuestions.filter((q: any) => 
            q.question && 
            typeof q.question === 'string' &&
            q.question.length > 20 &&
            q.solution &&
            typeof q.solution === 'string' &&
            q.solution.length > 50
          );
          
          if (validTheoryQuestions.length === 0) throw new Error('No valid theory questions');
          
          console.log(`✅ Successfully parsed ${validTheoryQuestions.length} theory questions`);
          result = { theoryQuestions: validTheoryQuestions };
          
        } catch (error) {
          console.error('❌ Theory question parsing failed');
          
          // Fallback theory questions
          const topics = extractedText.split(/[.!?]+/).filter(s => s.trim().length > 40).slice(0, 10);
          const fallbackTheory = [];
          
          for (let i = 0; i < Math.min(questionCount, 3); i++) {
            fallbackTheory.push({
              question: `Explain the key concepts discussed in the document. Provide a detailed analysis with examples.`,
              points: 10,
              expectedLength: "3-4 paragraphs",
              solution: `Based on the document content:\n\n${topics.slice(0, 3).join('. ')}\n\nThe document covers these important aspects in detail, providing comprehensive information about the subject matter. A complete answer should address each key point with supporting details and examples from the material.`,
              keyPoints: [
                "Identify main concepts from the document",
                "Explain relationships between key ideas",
                "Provide specific examples or evidence",
                "Demonstrate deep understanding of the material"
              ]
            });
          }
          
          result = { theoryQuestions: fallbackTheory };
        }
      } else if (mode === 'questions') {
        // Generate study questions
        console.log(`🔍 Generating ${questionCount} ${difficulty} study questions...`);
        const questionsPrompt = `Based on this document, generate ${questionCount} comprehensive study questions at ${difficulty} difficulty level.

Requirements:
- ${difficulty === 'easy' ? 'Test basic comprehension and recall' : difficulty === 'moderate' ? 'Require analysis and understanding' : 'Demand critical thinking and synthesis'}
- Each question should be thought-provoking
- Include helpful hints for each question

Format ONLY as valid JSON array (no markdown, no extra text):
[{"question": "...", "hint": "..."}]

Document:
${extractedText.substring(0, 6000)}`;
        
        const questionsResponse = await aiService.sendMessage(questionsPrompt);
        console.log('✅ Questions response:', { success: questionsResponse.success, hasResponse: !!questionsResponse.response, error: questionsResponse.error });
        const questionsText = questionsResponse.success ? questionsResponse.response : '';
        
        try {
          const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            result = { questions };
          } else {
            result = {
              questions: [
                {
                  question: "Explain the main concepts covered in this document.",
                  hint: "Consider the key themes and arguments presented."
                }
              ]
            };
          }
        } catch (parseError) {
          result = {
            questions: [
              {
                question: "Explain the main concepts covered in this document.",
                hint: "Consider the key themes and arguments presented."
              }
            ]
          };
        }
      }

      res.json(result);
    } catch (error: any) {
      console.error('File analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze file',
        details: error.message,
      });
    }
  },

  /**
   * Chat with PDF - answer questions based on PDF content
   */
  chatWithPDF: async (req: AuthRequest, res: Response) => {
    try {
      const { message, pdfContext, conversationId } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get PDF context (in production, retrieve from session/database)
      const context = pdfContext || (req as any).session?.pdfContext || '';

      if (!context) {
        return res.status(400).json({ error: 'No PDF context found. Please upload a PDF first.' });
      }

      // Generate response based on PDF context
      const prompt = `You are a helpful AI assistant analyzing a document. Answer the user's question based on this document content. If the answer is not in the document, say so.

Document Context:
${context}

User Question: ${message}

Answer:`;

      console.log('🔍 Sending chat message to AI...');
      // Use conversation ID from frontend to maintain chat history
      const convId = conversationId || `pdf_${req.user?._id || 'anonymous'}_${Date.now()}`;
      const aiResponse = await aiService.sendMessage(prompt, convId);
      console.log('✅ Chat response:', { success: aiResponse.success, hasResponse: !!aiResponse.response, error: aiResponse.error });
      const response = aiResponse.success ? aiResponse.response : 'Sorry, I could not generate a response.';

      res.json({ response });
    } catch (error: any) {
      console.error('PDF chat error:', error);
      res.status(500).json({
        error: 'Failed to generate response',
        details: error.message,
      });
    }
  },

  /**
   * Test API endpoint to verify Gemini is working
   */
  testAPI: async (req: AuthRequest, res: Response) => {
    try {
      console.log('🧪 Testing Gemini API...');
      console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 'NOT SET');
      
      const testPrompt = 'Say "Hello! Gemini API is working perfectly!" if you can read this.';
      const response = await aiService.sendMessage(testPrompt);
      
      if (response.success) {
        console.log('✅ API Test PASSED');
        res.json({
          success: true,
          message: 'Gemini API is working!',
          response: response.response,
          model: response.metadata?.model
        });
      } else {
        console.log('❌ API Test FAILED');
        res.status(500).json({
          success: false,
          error: response.error,
          message: 'Gemini API test failed. Check your API key.',
          apiKeySet: !!process.env.GEMINI_API_KEY
        });
      }
    } catch (error: any) {
      console.error('❌ API Test Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        apiKeySet: !!process.env.GEMINI_API_KEY
      });
    }
  },
};
