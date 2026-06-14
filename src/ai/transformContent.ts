import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { parseModelResponse, formatError, logger } from './pipelineUtils';
import { MODEL_CONFIG } from './modelConfig';
import { getStoredGeminiApiKey } from './geminiApiKey';

export interface TransformContext {
  courseName?: string;
  moduleName?: string;
  lessonName?: string;
}

export interface TransformContentInput {
  /** The current lesson markdown to revise. */
  content: string;
  /** The natural-language instruction, e.g. "Add two concrete examples". */
  instruction: string;
  context?: TransformContext;
}

export interface TransformContentResult {
  success: boolean;
  content: string;
  error?: string;
  model?: string;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*([\s\S]*?)```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

/**
 * Apply a natural-language editing instruction to an existing lesson and return
 * the full revised markdown. This powers the Copilot verbs (Improve, Add examples,
 * Make advanced, Add project, Summarize) and in-document slash commands.
 *
 * Additive capability — it does not alter the existing generation contracts.
 */
export async function transformLessonContent(
  input: TransformContentInput
): Promise<TransformContentResult> {
  logger.lifecycle('Starting content transform');

  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    return { success: false, content: '', error: 'Missing Gemini API Key' };
  }

  const base = (input.content || '').trim();
  if (!base) {
    return { success: false, content: '', error: 'There is no lesson content to edit yet.' };
  }
  if (!input.instruction || !input.instruction.trim()) {
    return { success: false, content: '', error: 'No instruction was provided.' };
  }

  const ctx = input.context || {};
  const contextLines = [
    ctx.courseName ? `Course: ${ctx.courseName}` : '',
    ctx.moduleName ? `Module: ${ctx.moduleName}` : '',
    ctx.lessonName ? `Lesson: ${ctx.lessonName}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = [
    'You are an expert instructional editor revising a single lesson.',
    contextLines ? `CONTEXT:\n${contextLines}` : '',
    '',
    'INSTRUCTION:',
    input.instruction.trim(),
    '',
    'CURRENT LESSON (Markdown):',
    '"""',
    base,
    '"""',
    '',
    'RULES:',
    '- Apply the instruction while preserving the parts that should not change.',
    '- Keep the result as a single, coherent, well-structured Markdown lesson.',
    '- Do not add commentary, preamble, or explanations.',
    '- Return ONLY the full updated lesson in Markdown.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const model = new ChatGoogleGenerativeAI({
      model: MODEL_CONFIG.model,
      apiKey,
      temperature: 0.6,
      maxRetries: 1,
    });

    logger.model(`Sending transform request to ${MODEL_CONFIG.model}...`);
    const response = await model.invoke(prompt);
    const raw = parseModelResponse(response);

    const next = stripCodeFences(raw);
    if (!next) {
      return { success: false, content: '', error: 'The model returned an empty response. Please try again.' };
    }

    logger.success(`Transform success (${next.length} chars)`);
    return { success: true, content: next, model: MODEL_CONFIG.model };
  } catch (err) {
    const formatted = formatError(err);
    logger.error(`Transform error: ${formatted.message}`);
    return { success: false, content: '', error: formatted.message, model: MODEL_CONFIG.model };
  }
}
