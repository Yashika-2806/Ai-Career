import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure env is loaded
dotenv.config();

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    timestamp?: Date;
  };
}

interface ConversationHistory {
  role: 'user' | 'model';
  parts: string[];
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private conversationHistory: Map<string, ConversationHistory[]> = new Map();

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash - stable fast model (no -latest suffix for v1beta)
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      }
    });
  }

  /**
   * Send a message to Gemini AI with optional conversation history
   */
  async sendMessage(
    prompt: string,
    conversationId?: string,
    language: 'en' | 'hi' = 'en'
  ): Promise<AIResponse> {
    try {
      // Add language instruction
      const enhancedPrompt = language === 'hi'
        ? `${prompt}\n\n(Please respond in Hindi if possible, or English with Hindi explanations)`
        : prompt;

      // If no conversation ID, just generate content directly
      if (!conversationId) {
        const result = await this.model.generateContent(enhancedPrompt);
        const responseText = result.response.text();
        
        return {
          success: true,
          response: responseText,
          metadata: {
            model: 'gemini-1.5-flash',
            timestamp: new Date(),
          }
        };
      }

      // Load conversation history if provided
      let history: ConversationHistory[] = this.conversationHistory.get(conversationId) || [];

      // Start or continue chat with proper history format
      const chat = this.model.startChat({
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts[0] }]
        })),
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(enhancedPrompt);
      const responseText = result.response.text();

      // Save conversation history
      const updatedHistory: ConversationHistory[] = [
        ...history,
        { role: 'user' as const, parts: [enhancedPrompt] },
        { role: 'model' as const, parts: [responseText] }
      ];
      this.conversationHistory.set(conversationId, updatedHistory);

      return {
        success: true,
        response: responseText,
        metadata: {
          model: 'gemini-1.5-flash',
          timestamp: new Date(),
        }
      };
    } catch (error: any) {
      console.error('❌ AI Service Error:', {
        message: error.message,
        stack: error.stack?.substring(0, 500),
        code: error.code,
        status: error.status,
        details: error.details,
      });
      
      // Specific error messages
      let errorMessage = error.message || 'Failed to generate response';
      if (error.message?.includes('API key')) {
        errorMessage = 'Invalid or missing API key. Please check GEMINI_API_KEY in .env';
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request to AI service. Check your input.';
      }
      
      return {
        success: false,
        error: errorMessage,
        metadata: {
          model: 'gemini-1.5-flash',
          timestamp: new Date(),
        }
      };
    }
  }

  /**
   * Stream a response for real-time feedback
   */
  async streamMessage(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    try {
      const response = await this.model.generateContentStream(prompt);
      let fullResponse = '';

      for await (const chunk of response.stream) {
        const text = chunk.text();
        fullResponse += text;
        onChunk(text);
      }

      return {
        success: true,
        response: fullResponse,
        metadata: {
          model: 'gemini-1.5-flash',
          timestamp: new Date(),
        }
      };
    } catch (error: any) {
      console.error('Stream Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to stream response',
      };
    }
  }

  /**
   * Batch process multiple prompts
   */
  async batchProcess(prompts: string[]): Promise<AIResponse[]> {
    const responses = await Promise.all(
      prompts.map(prompt => this.sendMessage(prompt))
    );
    return responses;
  }

  /**
   * Get conversation history
   */
  getHistory(conversationId: string): ConversationHistory[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Clear conversation history
   */
  clearHistory(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }

  /**
   * Clear all histories
   */
  clearAllHistories(): void {
    this.conversationHistory.clear();
  }

  /**
   * Get all conversation IDs
   */
  getAllConversationIds(): string[] {
    return Array.from(this.conversationHistory.keys());
  }

  /**
   * Get conversation count
   */
  getConversationCount(): number {
    return this.conversationHistory.size;
  }
}

export default AIService;
console.log("🔥 AI SERVICE LOADED - MODEL: gemini-1.5-flash");
