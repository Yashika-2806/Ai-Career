import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AIService } from '../ai/ai.service';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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

export const pdfController = {
  /**
   * Analyze PDF and generate content based on mode
   */
  analyzePDF: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const { mode, numQuestions = '5', difficulty = 'moderate' } = req.body;
      const pdfBuffer = req.file.buffer;
      const questionCount = parseInt(numQuestions) || 5;

      // Extract text from PDF
      const pdfText = await extractTextFromPDF(pdfBuffer);

      if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json({ error: 'Could not extract text from PDF' });
      }

      let result: any = {};

      // Generate content based on mode
      if (mode === 'chat') {
        // Generate a summary for chat mode
        console.log('🔍 Generating PDF summary...');
        const summaryResponse = await aiService.sendMessage(
          `Provide a comprehensive yet concise summary (3-4 sentences) of this document. Format it beautifully with proper structure:\n\n${pdfText.substring(0, 5000)}`
        );
        console.log('✅ Summary response:', { success: summaryResponse.success, hasResponse: !!summaryResponse.response, error: summaryResponse.error });
        const summary = summaryResponse.success ? summaryResponse.response : 'Document uploaded successfully.';
        result = {
          summary,
          pdfText: pdfText.substring(0, 10000), // Store for chat context
        };
      } else if (mode === 'quiz') {
        // Generate quiz questions
        console.log(`🔍 Generating ${questionCount} ${difficulty} quiz questions...`);
        const quizPrompt = `Based on this document, generate ${questionCount} multiple-choice questions at ${difficulty} difficulty level.

Requirements:
- ${difficulty === 'easy' ? 'Focus on basic facts and definitions' : difficulty === 'moderate' ? 'Test understanding and application' : 'Require deep analysis and critical thinking'}
- Each question must have exactly 4 options
- Only one correct answer
- Include clear explanation for each answer

Format ONLY as valid JSON array (no markdown, no extra text):
[{"question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0, "explanation": "..."}]

Document:
${pdfText.substring(0, 6000)}`;
        
        const quizResponse = await aiService.sendMessage(quizPrompt);
        console.log('✅ Quiz response:', { success: quizResponse.success, hasResponse: !!quizResponse.response, error: quizResponse.error });
        const quizText = quizResponse.success ? quizResponse.response : '';
        
        // Parse JSON from response
        try {
          const jsonMatch = quizText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            result = { questions };
          } else {
            // Fallback if JSON parsing fails
            result = {
              questions: [
                {
                  question: "What is the main topic of this document?",
                  options: ["Topic A", "Topic B", "Topic C", "Topic D"],
                  correctAnswer: 0,
                  explanation: "Based on the document content."
                }
              ]
            };
          }
        } catch (parseError) {
          console.error('Quiz JSON parse error:', parseError);
          result = {
            questions: [
              {
                question: "What is the main topic of this document?",
                options: ["Topic A", "Topic B", "Topic C", "Topic D"],
                correctAnswer: 0,
                explanation: "Based on the document content."
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
${pdfText.substring(0, 6000)}`;
        
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

      // Store PDF text in session/database for chat mode (simplified here)
      if (mode === 'chat') {
        // In production, store in Redis or database with user session
        (req as any).session = {
          ...(req as any).session,
          pdfContext: pdfText.substring(0, 10000),
        };
      }

      res.json(result);
    } catch (error: any) {
      console.error('PDF analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze PDF',
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
