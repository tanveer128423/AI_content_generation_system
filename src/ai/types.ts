/**
 * Shared types for AI pipeline
 */

/** Prompts provided for generation (nested structure) */
export interface PromptSet {
  content?: {
    systemPrompt?: string;
    userPrompt?: string;
  };
  quiz?: {
    systemPrompt?: string;
    userPrompt?: string;
  };
}

/** Input used for generating a learning unit */
export interface LearningUnitInput {
  course?: {
    name: string;
    description?: string;
    outcomes?: string[];
  };
  module?: {
    name: string;
    description?: string;
  };
  learningUnit?: {
    name: string;
    description?: string;
    duration?: number | string;
    learner_journey?: string;
    additional_guidance?: string;
    artifacts?: Array<{
      artifact_type?: string;
      link?: string;
    }>;
  };
  /* Legacy flat structure for backward compatibility */
  courseName?: string;
  description?: string;
  duration?: number | string;
  artifacts?: Array<{ artifact_type?: string; link?: string } | string>;
  additionalGuidance?: string;
  prompts?: PromptSet;
}

export interface QuizGenerationInput {
  course?: {
    name: string;
    description?: string;
    outcomes?: string[];
  };
  module?: {
    name: string;
    description?: string;
  };
  learningUnit?: {
    name: string;
    description?: string;
    duration?: number | string;
    learner_journey?: string;
    additional_guidance?: string;
    generated_content?: string;
    questions?: {
      total_questions?: number;
      easy?: number;
      medium?: number;
      hard?: number;
      config?: {
        total_questions?: number;
        easy?: number;
        medium?: number;
        hard?: number;
      };
    };
    artifacts?: Array<{
      artifact_type?: string;
      link?: string;
    }>;
  };
  prompts?: QuizPromptSet;
}

export interface QuizGenerationResult {
  success: boolean;
  questions: Array<{
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  }>;
  error?: string;
  model?: string;
}

/** Model response shape (flexible) */
export interface ModelResponse {
  content?: string | Record<string, unknown> | unknown;
  text?: string;
  [key: string]: unknown;
}

/** Result returned by generation functions */
export interface GenerationResult {
  success: boolean;
  content: string;
  fallback?: boolean;
  error?: string;
  model?: string;
}

/** Lightweight logger interface used by the pipeline */
export interface PipelineLogger {
  lifecycle: (msg: string, ...args: unknown[]) => void;
  model: (msg: string, ...args: unknown[]) => void;
  success: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
}

export type TemplateData = Record<string, unknown>;
