import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { AIService } from '../ai/ai.service.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import officeParser from 'officeparser';

// Initialize AI service
const aiService = new AIService(process.env.GEMINI_API_KEY || '');

// Extract text from PDF using pdfjs-dist
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Failed to extract text from PDF');
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

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'Could not extract text from file' });
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
        
        // Create questions with specific examples from document
        const textPreview = extractedText.substring(0, 8000);
        const sentences = textPreview.split(/[.!?]+/).filter(s => s.trim().length > 30).slice(0, 15);
        const keyFacts = sentences.slice(0, 5).map(s => s.trim()).join('. ');

        const quizPrompt = `Create ${questionCount} quiz questions from this document.

DOCUMENT TEXT:
${textPreview}

KEY FACTS IDENTIFIED:
${keyFacts}

IMPORTANT INSTRUCTIONS:
1. Create questions about SPECIFIC information from the document above
2. Each question must reference actual content (names, numbers, facts, concepts mentioned in the text)
3. Make 3 wrong options plausible but incorrect
4. Difficulty: ${difficulty}

RETURN FORMAT: Valid JSON array ONLY. No markdown, no code blocks, no extra text.

Example format:
[{"question":"Based on the document, what is X?","options":["Correct fact from doc","Wrong but plausible","Another wrong","Also wrong"],"correctAnswer":0,"explanation":"This is stated in the document"}]

Now generate ${questionCount} questions following this EXACT JSON format:`;

        console.log('📝 Sending quiz prompt to AI...');
        
        const quizResponse = await aiService.sendMessage(quizPrompt);
        console.log('✅ Quiz response received:', { 
          success: quizResponse.success, 
          responseLength: quizResponse.response?.length || 0,
          error: quizResponse.error 
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
            q.correctAnswer <= 3
          );
          
          if (validQuestions.length === 0) {
            throw new Error('No valid questions after filtering');
          }
          
          console.log(`✅ Successfully parsed ${validQuestions.length} valid questions`);
          result = { questions: validQuestions };
          
        } catch (parseError: any) {
          console.error('❌ Quiz parsing failed:', parseError.message);
          console.log('Full AI response:', quizText.substring(0, 1000));
          
          // Enhanced fallback: Extract meaningful content from document
          console.log('⚠️ Using enhanced fallback question generation...');
          const sentences = extractedText.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10);
          const fallbackQuestions = sentences.slice(0, Math.min(questionCount, 3)).map((sentence, idx) => ({
            question: `According to the document, which statement is correct about the content discussed?`,
            options: [
              sentence.trim().substring(0, 100),
              "This information is not mentioned in the document",
              "The document discusses a different topic",
              "The content is not related to this subject"
            ],
            correctAnswer: 0,
            explanation: "This information is directly from the document content."
          }));
          
          result = {
            questions: fallbackQuestions.length > 0 ? fallbackQuestions : [
              {
                question: "What information does this document primarily contain?",
                options: [
                  "Educational or informational content",
                  "Random unrelated data",
                  "Empty pages",
                  "Encrypted content"
                ],
                correctAnswer: 0,
                explanation: "The document contains specific information that can be studied."
              }
            ]
          };
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
};
