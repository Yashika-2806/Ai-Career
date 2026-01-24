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
        
        const quizPrompt = `You are an expert educator creating quiz questions for students.

IMPORTANT: Create questions ONLY from the actual content below. DO NOT use generic questions.

Document Content:
${extractedText.substring(0, 8000)}

Task: Generate exactly ${questionCount} multiple-choice questions based on the SPECIFIC information in this document.

Difficulty Level: ${difficulty}
- ${difficulty === 'easy' ? 'Focus on basic facts, definitions, and key points mentioned in the document' : difficulty === 'moderate' ? 'Test understanding and application of concepts from the document' : 'Require deep analysis and synthesis of information from the document'}

Requirements for EACH question:
1. Question must reference SPECIFIC information from the document (names, dates, concepts, facts)
2. All 4 options must be plausible but only ONE is correct based on the document
3. Wrong options should be related to the topic but clearly incorrect
4. Include a brief explanation citing the document

Output Format (STRICT JSON, no markdown, no code blocks):
[
  {
    "question": "Specific question from document content?",
    "options": ["Correct answer from doc", "Plausible wrong option 1", "Plausible wrong option 2", "Plausible wrong option 3"],
    "correctAnswer": 0,
    "explanation": "Brief explanation referencing the document"
  }
]

Generate ${questionCount} questions NOW:`;
        
        const quizResponse = await aiService.sendMessage(quizPrompt);
        console.log('✅ Quiz response received:', { 
          success: quizResponse.success, 
          responseLength: quizResponse.response?.length || 0,
          error: quizResponse.error 
        });
        
        const quizText = quizResponse.success ? quizResponse.response : '';
        
        // Parse JSON from response with better error handling
        try {
          // Remove markdown code blocks if present
          let cleanedText = quizText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          
          // Extract JSON array
          const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            
            // Validate questions
            if (Array.isArray(questions) && questions.length > 0) {
              console.log(`✅ Successfully parsed ${questions.length} questions`);
              result = { questions };
            } else {
              throw new Error('No valid questions in array');
            }
          } else {
            console.error('❌ No JSON array found in AI response');
            throw new Error('Invalid response format');
          }
        } catch (parseError) {
          console.error('❌ Quiz JSON parse error:', parseError);
          console.log('Raw AI response (first 500 chars):', quizText.substring(0, 500));
          
          // Better fallback: Create questions from extracted text
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
