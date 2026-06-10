/**
 * Pipeline utilities for AI generation
 *
 * Provides logging, prompt building, response parsing, and fallback generation.
 * Designed to keep the core generation pipeline easy to test and extend.
 */

import type { PromptSet, PipelineLogger, ModelResponse, TemplateData } from './types';

export type PromptParts = {
  system?: string;
  user?: string;
};

export const logger = {
  lifecycle: (msg?: string, ...args: any[]) => console.log('🚀', msg, ...args),
  model: (msg?: string, ...args: any[]) => console.log('🤖', msg, ...args),
  success: (msg?: string, ...args: any[]) => console.log('✅', msg, ...args),
  warn: (msg?: string, ...args: any[]) => console.warn('⚠️', msg, ...args),
  error: (msg?: string, ...args: any[]) => console.error('❌', msg, ...args)
};

/** Build the final prompt from parts and return it. */
export function buildFullPrompt(parts: PromptParts): string {
  const { system = '', user = '' } = parts || {};
  return [system, user].filter(Boolean).join('\n\n');
}

/** Parse a model response to a string content. */
export function parseModelResponse(response: unknown): string {
  if (!response) {
    console.warn('⚠️ PARSE_RESPONSE - Response is null/undefined');
    return '';
  }

  if (typeof response === 'string') {
    return response as string;
  }

  const candidate = response as any;

  // Try LangChain AIMessage.content
  if (typeof candidate.content === 'string') {
    return candidate.content;
  }

  // Try LangChain message with text field
  if (typeof candidate.text === 'string') {
    return candidate.text;
  }

  // Try response.content as object with parts (Google GenAI SDK)
  if (candidate.content && typeof candidate.content === 'object') {
    if (Array.isArray(candidate.content.parts)) {
      const textPart = candidate.content.parts.find((p: any) => p.text);
      if (textPart && typeof textPart.text === 'string') {
        return textPart.text;
      }
    }
    // Try direct content object
    if (candidate.content.parts) {
      const allText = candidate.content.parts
        .filter((p: any) => typeof p === 'string')
        .join('\n');
      if (allText) {
        return allText;
      }
    }
  }

  // Fallback to string conversion
  try {
    const stringified = JSON.stringify(response);
    return stringified;
  } catch (e) {
    const strResult = String(response);
    return strResult;
  }
}

/** Format an Error into a concise object for logging and returns message. */
export function formatError(err: unknown): { message: string; stack?: string } {
  console.error('🔴 ERROR_OBJECT:', err);
  if (err instanceof Error) {
    console.error('📋 ERROR_MESSAGE:', err.message);
    console.error('📋 ERROR_STACK:', err.stack);
    return { message: err.message, stack: err.stack || '' };
  }
  return { message: String(err), stack: '' };
}

/** Fallback content generator used when the model fails or returns empty output.
 * Keeps a consistent markdown structure for downstream rendering.
 */
export function buildFallback(data: TemplateData): string {
  const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];
  const artifactsList = artifacts.length ? artifacts.map(a => `- ${String(a)}`).join('\n') : '- No artifacts added';

  return `# ${String(data?.courseName || 'Learning Unit')}\n\n## Duration\n${String(data?.duration || 'N/A')} minutes\n\n## Description\n${String(data?.description || 'No description provided')}\n\n## Introduction\nThis lesson introduces the topic in a simple and structured way.\n\n## Core Concepts\n- Basic understanding\n- Key definitions\n- Real-world relevance\n\n## Example\n\n\`\`\`java\nint a = 10;\nint b = 20;\nSystem.out.println(a + b);\n\`\`\`\n\n## Learning Flow\n- Introduction\n- Concepts\n- Example\n- Practice\n- Summary\n\n## Artifacts\n${artifactsList}\n\n## Additional Guidance\n${String(data?.additionalGuidance || 'No guidance provided')}\n\n## Summary\nThis lesson builds foundational understanding and prepares for the next topic.\n`;
}

export default {
  logger,
  buildFullPrompt,
  parseModelResponse,
  formatError,
  buildFallback
};
