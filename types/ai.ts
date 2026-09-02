/**
 * AI Service Interfaces
 * Isolates the AI model and provider behind a clean service contract.
 * Default intended model: Gemini 3.7 Flash, with configurable provider switching.
 */

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'mock';

export interface AIServiceConfig {
  provider: AIProvider;
  modelName: string; // e.g. 'gemini-3.7-flash', 'claude-3-5-haiku'
  apiKey?: string;
  temperature?: number;
}

export interface StepExplanation {
  whatHappened: string;  // 1 concise sentence describing the physical operation
  whyItHappened: string; // Algorithmic rationale linking variables to logic
  whatComesNext: string; // Prediction/lookahead guiding the student
}

export interface TutorMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  algorithmicPattern: string;
  explanation: string;
}
