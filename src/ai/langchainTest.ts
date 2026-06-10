/**
 * ISOLATED LANGCHAIN INTEGRATION TEST
 * 
 * This file serves as a dedicated verification layer for LangChain + Gemini integration.
 * It uses the same stable Gemini 1.5 Flash configuration as the main pipeline.
 * 
 * KEY FEATURES:
 * ============
 * 
 * 1. MODERN LANGCHAIN SYNTAX
 *    - Uses `model:` property (not deprecated `modelName`)
 *    - Compatible with @langchain/google-genai v0.1.0+
 * 
 * 2. CLEAN LIFECYCLE LOGGING
 *    - 🚀 Starting generation
 *    - 🤖 Initializing model
 *    - ✅ Generation success
 *    - ⚠️ Fallback triggered
 *    - ❌ Model/API errors
 * 
 * USAGE:
 * ======
 * Import and call testLangchain() from any component:
 *   import { testLangchain } from '@/ai/langchainTest'
 *   await testLangchain()
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { logger, formatError, parseModelResponse } from './pipelineUtils';
import { MODEL_CONFIG } from './modelConfig';
import { getStoredGeminiApiKey } from './geminiApiKey';
import type { ModelResponse } from './types';

/**
 * Tests LangChain integration with the stable Gemini 1.5 Flash configuration.
 * 
 * This function:
 * - Validates API key presence
 * - Initializes ChatGoogleGenerativeAI with the stable model configuration
 * - Invokes the model with a simple test prompt
 * - Provides concise logging for debugging
 * 
 * @returns Promise that resolves when test completes
 */
export const testLangchain = async (): Promise<void> => {
  const startTime = performance.now();
  
  try {
    const apiKey = getStoredGeminiApiKey();
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    logger.lifecycle('Starting generation');

    logger.model('Initializing model');

    const model = new ChatGoogleGenerativeAI({
      model: MODEL_CONFIG.model,
      apiKey,
      temperature: MODEL_CONFIG.temperature,
      maxRetries: 0
    });

    const testPrompt = 'Explain Java variables simply';
    const response = await model.invoke(testPrompt) as unknown;
    const responseText = parseModelResponse(response as ModelResponse | string);

    const elapsed = (performance.now() - startTime).toFixed(2);

    logger.success('Generation success');
    logger.success(`response length: ${responseText.length} chars — ${elapsed}ms`);

    const preview = responseText.substring(0, 200).replace(/\n/g, '\n   ');
    logger.lifecycle(`preview:\n   ${preview}`);
  } catch (error) {
    const formatted = formatError(error);
    logger.error(`Model/API errors: ${formatted.message}`);
    throw error;
  }
};
