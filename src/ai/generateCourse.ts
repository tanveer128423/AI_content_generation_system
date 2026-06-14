import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { parseModelResponse, formatError, logger } from './pipelineUtils';
import { MODEL_CONFIG } from './modelConfig';
import { getStoredGeminiApiKey } from './geminiApiKey';

export interface CourseGenerationOptions {
  /** The free-form topic prompt, e.g. "Create a complete course on React.js". */
  topic: string;
  /** Target audience, e.g. "Beginners". */
  audience?: string;
  /** Approximate total duration in hours. */
  durationHours?: number;
  /** Whether to weave in hands-on projects. */
  includeProjects?: boolean;
  /** Whether to flag lessons for quizzes. */
  includeQuizzes?: boolean;
}

export interface GeneratedLearningUnit {
  name: string;
  description: string;
  learner_journey: string;
  duration: number;
}

export interface GeneratedModule {
  name: string;
  description: string;
  learning_units: GeneratedLearningUnit[];
}

export interface GeneratedCourse {
  name: string;
  description: string;
  outcomes: string[];
  modules: GeneratedModule[];
}

export interface CourseGenerationResult {
  success: boolean;
  course?: GeneratedCourse;
  error?: string;
  model?: string;
}

const learningUnitSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  learner_journey: z.string().default(''),
  duration: z.coerce.number().positive().max(600).default(30)
});

const moduleSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  learning_units: z.array(learningUnitSchema).min(1)
});

const courseSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  outcomes: z.array(z.string()).default([]),
  modules: z.array(moduleSchema).min(1)
});

function extractJsonCandidate(rawText: string): string {
  const trimmed = rawText.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

/**
 * Pure helper: extract the JSON object from a raw model response and validate it
 * against the course schema. Exposed for unit testing (no network involved).
 */
export function parseGeneratedCourse(rawText: string): CourseGenerationResult {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'The model returned an empty response. Please try again.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonCandidate(rawText));
  } catch {
    return { success: false, error: 'Could not read the generated course. Please try again.' };
  }

  const validated = courseSchema.safeParse(parsed);
  if (!validated.success) {
    return { success: false, error: 'The generated course was incomplete. Please try again.' };
  }

  return { success: true, course: validated.data };
}

function buildPrompt(options: CourseGenerationOptions): string {
  const audience = options.audience?.trim() || 'a general audience';
  const hours = options.durationHours && options.durationHours > 0 ? options.durationHours : 6;

  // Scale the structure to the requested duration so longer courses get more depth.
  const moduleCount = Math.min(12, Math.max(3, Math.round(hours / 1.5)));
  const lessonsPerModule = Math.min(6, Math.max(3, Math.round((hours * 4) / moduleCount)));

  const extras: string[] = [];
  if (options.includeProjects) {
    extras.push('Include at least one hands-on, project-based learning unit per module where it makes sense. Make project lessons clearly named (e.g. "Project: Build ...").');
  }
  if (options.includeQuizzes) {
    extras.push('Design lessons so each one can be assessed with a short quiz afterwards.');
  }

  return [
    'You are an expert instructional designer and curriculum architect.',
    'Design a complete, well-sequenced course outline based on the request below.',
    '',
    `REQUEST: ${options.topic.trim()}`,
    `TARGET AUDIENCE: ${audience}`,
    `TOTAL DURATION: about ${hours} hours`,
    '',
    'STRUCTURE REQUIREMENTS:',
    `- Produce around ${moduleCount} modules, ordered from foundational to advanced.`,
    `- Each module should contain about ${lessonsPerModule} focused learning units (lessons).`,
    '- Lessons must progress logically and avoid repetition.',
    '- Each lesson "duration" is an integer number of minutes (typically 15-60).',
    '- "learner_journey" describes, in 1-2 sentences, what the learner can do after the lesson.',
    '- "outcomes" are 4-6 concrete skills the learner gains from the whole course.',
    ...extras.map(e => `- ${e}`),
    '',
    'OUTPUT FORMAT:',
    'Respond with ONLY valid minified JSON (no markdown, no commentary) matching exactly this shape:',
    '{',
    '  "name": string,',
    '  "description": string,',
    '  "outcomes": string[],',
    '  "modules": [',
    '    {',
    '      "name": string,',
    '      "description": string,',
    '      "learning_units": [',
    '        { "name": string, "description": string, "learner_journey": string, "duration": number }',
    '      ]',
    '    }',
    '  ]',
    '}'
  ].join('\n');
}

/**
 * Generate a complete, structured course outline (modules + lessons) from a single
 * natural-language prompt. This powers the prompt-first creation experience.
 */
export async function generateCourseStructure(
  options: CourseGenerationOptions
): Promise<CourseGenerationResult> {
  logger.lifecycle('Starting course structure generation');

  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    const error = new Error('Missing Gemini API Key');
    logger.error(error.message);
    return { success: false, error: error.message };
  }

  if (!options.topic || !options.topic.trim()) {
    return { success: false, error: 'Please describe the course you want to create.' };
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: MODEL_CONFIG.model,
      apiKey,
      temperature: 0.6,
      maxRetries: 1
    });

    const prompt = buildPrompt(options);
    logger.model(`Sending course request to ${MODEL_CONFIG.model}...`);

    const response = await model.invoke(prompt);
    const rawContent = parseModelResponse(response);

    if (!rawContent || !rawContent.trim()) {
      return { success: false, error: 'The model returned an empty response. Please try again.' };
    }

    const result = parseGeneratedCourse(rawContent);
    if (!result.success || !result.course) {
      logger.error(result.error || 'Course validation failed');
      return { ...result, model: MODEL_CONFIG.model };
    }

    logger.success(
      `Course generated (${result.course.modules.length} modules, ` +
        `${result.course.modules.reduce((sum, m) => sum + m.learning_units.length, 0)} lessons)`
    );

    return { ...result, model: MODEL_CONFIG.model };
  } catch (err) {
    const formatted = formatError(err);
    logger.error(`Course generation error: ${formatted.message}`);
    return { success: false, error: formatted.message, model: MODEL_CONFIG.model };
  }
}
