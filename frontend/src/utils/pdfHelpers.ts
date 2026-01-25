/**
 * PDF Chat Utilities
 * Helper functions for PDF document analysis and chat operations
 */

export interface PDFMetadata {
  fileName: string;
  fileSize: number;
  textLength?: number;
  uploadedAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Store PDF context in session storage for persistence across page refreshes
 */
export const storePDFContext = (context: string, metadata: PDFMetadata): void => {
  try {
    sessionStorage.setItem('pdf_context', context);
    sessionStorage.setItem('pdf_metadata', JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to store PDF context:', error);
  }
};

/**
 * Retrieve stored PDF context
 */
export const retrievePDFContext = (): { context: string; metadata: PDFMetadata | null } => {
  try {
    const context = sessionStorage.getItem('pdf_context') || '';
    const metadataStr = sessionStorage.getItem('pdf_metadata');
    const metadata = metadataStr ? JSON.parse(metadataStr) : null;
    return { context, metadata };
  } catch (error) {
    console.error('Failed to retrieve PDF context:', error);
    return { context: '', metadata: null };
  }
};

/**
 * Clear stored PDF context
 */
export const clearPDFContext = (): void => {
  try {
    sessionStorage.removeItem('pdf_context');
    sessionStorage.removeItem('pdf_metadata');
  } catch (error) {
    console.error('Failed to clear PDF context:', error);
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate PDF file
 */
export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Please upload a PDF file' };
  }
  
  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

/**
 * Extract key sentences from text for preview
 */
export const extractKeySentences = (text: string, count: number = 3): string[] => {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200);
  
  return sentences.slice(0, count);
};

/**
 * Generate unique conversation ID
 */
export const generateConversationId = (prefix: string = 'pdf'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate quiz score
 */
export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  grade: string;
  feedback: string;
}

export const calculateQuizScore = (
  userAnswers: { [key: number]: number },
  correctAnswers: number[]
): QuizResult => {
  const score = correctAnswers.reduce((acc, correct, idx) => {
    return userAnswers[idx] === correct ? acc + 1 : acc;
  }, 0);
  
  const total = correctAnswers.length;
  const percentage = (score / total) * 100;
  
  let grade = 'F';
  let feedback = '📚 Keep studying! Practice makes perfect.';
  
  if (percentage >= 90) {
    grade = 'A+';
    feedback = '🎉 Outstanding! You have excellent understanding!';
  } else if (percentage >= 80) {
    grade = 'A';
    feedback = '🌟 Excellent work! You know this material well!';
  } else if (percentage >= 70) {
    grade = 'B';
    feedback = '👍 Good job! You have a solid grasp of the content.';
  } else if (percentage >= 60) {
    grade = 'C';
    feedback = '💪 Not bad! Review the material to improve.';
  } else if (percentage >= 50) {
    grade = 'D';
    feedback = '📖 Keep learning! Focus on the key concepts.';
  }
  
  return { score, total, percentage, grade, feedback };
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

/**
 * Sanitize and truncate text for display
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
