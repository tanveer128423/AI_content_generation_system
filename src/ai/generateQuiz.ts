import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { compileTemplate } from '../utils/handlebarsCompiler';
import { buildFullPrompt, parseModelResponse, formatError, logger } from './pipelineUtils';
import { MODEL_CONFIG } from './modelConfig';
import { getStoredGeminiApiKey } from './geminiApiKey';
import { parseQuizResponse } from '../utils/parseQuizResponse';
import { quizSchema } from '../validation/quizSchema';
import type { QuizGenerationInput, QuizGenerationResult, TemplateData, PromptSet } from './types';
const GENERIC_QUIZ_ERROR_MESSAGE = 'Unable to generate a valid quiz. Please try again.';
const REQUIRED_QUESTION_COUNT = 5;

type NormalizedQuizQuestion = QuizGenerationResult['questions'][number];

function toTrimmedString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  return '';
}

function toCorrectAnswerIndex(value: unknown): number | null {
  const candidate = typeof value === 'string'
    ? Number(value.trim())
    : typeof value === 'number'
      ? value
      : NaN;
  return Number.isInteger(candidate) && candidate >= 0 && candidate <= 3 ? candidate : null;
}

function normalizeQuestion(question: unknown, index: number): NormalizedQuizQuestion | null {
  if (!question || typeof question !== 'object') {
    return null;
  }

  const candidate = question as Record<string, unknown>;
  const difficulty = toTrimmedString(candidate.difficulty).toLowerCase();
  const questionText = toTrimmedString(candidate.question);
  const explanation = toTrimmedString(candidate.explanation);
  const options = Array.isArray(candidate.options)
    ? candidate.options.map(toTrimmedString).filter(option => option.length > 0)
    : [];
  const correctAnswer = toCorrectAnswerIndex(candidate.correct_answer ?? candidate.correctAnswer);

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return null;
  }

  if (!questionText || !explanation || options.length !== 4 || correctAnswer === null) {
    return null;
  }

  return {
    id: toTrimmedString(candidate.id) || `q-${index + 1}`,
    difficulty: difficulty as NormalizedQuizQuestion['difficulty'],
    question: questionText,
    options,
    correct_answer: correctAnswer,
    explanation
  };
}

export function normalizeQuizPayload(parsedQuiz: unknown): { questions: NormalizedQuizQuestion[] } {
  if (!parsedQuiz || typeof parsedQuiz !== 'object') {
    throw new Error(GENERIC_QUIZ_ERROR_MESSAGE);
  }

  const questions = (parsedQuiz as Record<string, unknown>).questions;

  if (!Array.isArray(questions)) {
    throw new Error(GENERIC_QUIZ_ERROR_MESSAGE);
  }

  const normalizedQuestions = questions
    .slice(0, REQUIRED_QUESTION_COUNT)
    .map(normalizeQuestion)
    .filter((question): question is NormalizedQuizQuestion => Boolean(question));

  if (normalizedQuestions.length < REQUIRED_QUESTION_COUNT) {
    throw new Error(GENERIC_QUIZ_ERROR_MESSAGE);
  }

  return {
    questions: normalizedQuestions
  };
}

const DEFAULT_QUIZ_CONFIG = {
  total_questions: 5,
  easy: 2,
  medium: 2,
  hard: 1
};

function buildQuizTemplateData(input: QuizGenerationInput): { data: TemplateData; prompts: PromptSet } {
  const course = input.course || { name: '', description: '', outcomes: [] };
  const module = input.module || { name: '', description: '' };
  const learningUnit = (input.learningUnit || {}) as Record<string, any>;
  const generatedContent = String(learningUnit.generated_content ?? '').trim();
  const questionConfig = learningUnit.questions?.config || learningUnit.questions || {};

  return {
    data: {
      course,
      module,
      learningUnit: {
        ...learningUnit,
        generated_content: generatedContent,
        questions: {
          ...questionConfig,
          config: {
            total_questions: Number(questionConfig.total_questions ?? questionConfig.config?.total_questions ?? DEFAULT_QUIZ_CONFIG.total_questions),
            easy: Number(questionConfig.easy ?? questionConfig.config?.easy ?? DEFAULT_QUIZ_CONFIG.easy),
            medium: Number(questionConfig.medium ?? questionConfig.config?.medium ?? DEFAULT_QUIZ_CONFIG.medium),
            hard: Number(questionConfig.hard ?? questionConfig.config?.hard ?? DEFAULT_QUIZ_CONFIG.hard)
          }
        }
      },
      courseName: course.name,
      duration: learningUnit.duration ?? '',
      description: learningUnit.description ?? '',
      generatedContent,
      learnerJourney: learningUnit.learner_journey ?? '',
      additionalGuidance: learningUnit.additional_guidance ?? ''
    },
    prompts: input.prompts || {}
  };
}

export async function generateLearningUnitQuiz(input: QuizGenerationInput): Promise<QuizGenerationResult> {
  logger.lifecycle('Starting quiz generation');
  const apiKey = getStoredGeminiApiKey();

  if (!apiKey) {
    const error = new Error('Missing Gemini API Key');
    logger.error(error.message);
    throw error;
  }

  const { data, prompts } = buildQuizTemplateData(input);

  // Final distribution available in `data.learningUnit.questions.config`

  try {
    const compiledSystemPrompt = (prompts?.quiz?.systemPrompt && compileTemplate(prompts.quiz.systemPrompt, data as TemplateData)) || prompts?.quiz?.systemPrompt || '';
    const compiledUserPrompt = (prompts?.quiz?.userPrompt && compileTemplate(prompts.quiz.userPrompt, data as TemplateData)) || '';
    const fullPrompt = buildFullPrompt({ system: compiledSystemPrompt, user: compiledUserPrompt });

    logger.lifecycle(`Compiled quiz system prompt: ${compiledSystemPrompt.substring(0, 200)}...`);
    logger.lifecycle(`Compiled quiz user prompt: ${compiledUserPrompt.substring(0, 200)}...`);

    const model = new ChatGoogleGenerativeAI({
      model: MODEL_CONFIG.model,
      apiKey,
      temperature: 0.2,
      maxRetries: 0
    });

    logger.model(`Sending quiz request to ${MODEL_CONFIG.model}...`);
    // Final compiled prompt prepared (truncated available in `fullPrompt`)

    const response = await model.invoke(fullPrompt);
    const rawContent = parseModelResponse(response);

    let parsedQuiz: unknown;
    try {
      parsedQuiz = parseQuizResponse(rawContent);
    } catch (error) {
      logger.warn('Quiz response parsing failed before normalization', error);
      throw new Error(GENERIC_QUIZ_ERROR_MESSAGE);
    }
    const parsedQuizRecord = parsedQuiz as { questions?: unknown[] } | null;

    // Parsed quiz response available in `parsedQuiz`

    const normalizedQuiz = normalizeQuizPayload(parsedQuiz);
    const parsed = quizSchema.safeParse(normalizedQuiz);

    // Validation result available in `parsed`

    if (!parsed.success) {
      console.error('Quiz validation failed', parsed.error);
      throw new Error(GENERIC_QUIZ_ERROR_MESSAGE);
    }

    logger.success(`Quiz generation success (${parsed.data.questions.length} questions)`);
    return { success: true, questions: parsed.data.questions, model: MODEL_CONFIG.model };
  } catch (err) {
    const formatted = formatError(err);
    logger.error(`Quiz generation error: ${formatted.message}`);
    if (formatted.stack) logger.error(`Stack: ${formatted.stack}`);

    return { success: false, questions: [], error: formatted.message, model: MODEL_CONFIG.model };
  }
}
