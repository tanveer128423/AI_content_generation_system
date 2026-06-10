import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { compileTemplate } from '../utils/handlebarsCompiler';
import { buildFullPrompt, parseModelResponse, buildFallback, logger, formatError } from './pipelineUtils';
import { MODEL_CONFIG } from './modelConfig';
import { getStoredGeminiApiKey } from './geminiApiKey';
import type { LearningUnitInput, GenerationResult, TemplateData, PromptSet } from './types';

// Small helper: prepare input data used across the pipeline
function prepareData(input: LearningUnitInput | undefined) {
  const {
    course,
    module,
    learningUnit,
    courseName,
    description,
    duration,
    artifacts,
    additionalGuidance,
    prompts = {}
  } = input || {};

  // Use nested structure if provided, otherwise fall back to legacy flat structure
  const courseData = course || {
    name: courseName || '',
    description: '',
    outcomes: []
  };

  const moduleData = module || {
    name: '',
    description: ''
  };

  const luArtifacts = learningUnit?.artifacts || artifacts || [];
  const safeArtifacts = Array.isArray(luArtifacts)
    ? luArtifacts.map(a => {
        if (typeof a === 'string') return { artifact_type: a, link: '' };
        return { artifact_type: a?.artifact_type || '', link: a?.link || '' };
      })
    : [];

  const learningUnitData = learningUnit || {
    name: '',
    description: description || '',
    duration: duration || '',
    learner_journey: '',
    additional_guidance: additionalGuidance || '',
    artifacts: safeArtifacts
  };

  const data: TemplateData = {
    course: courseData,
    module: moduleData,
    learningUnit: learningUnitData,
    /* Legacy flat structure for compatibility */
    courseName: courseData.name,
    description: learningUnitData.description,
    duration: learningUnitData.duration,
    artifacts: safeArtifacts,
    artifactsText: safeArtifacts.map(a => `${a.artifact_type}${a.link ? ': ' + a.link : ''}`).join(', '),
    additionalGuidance: learningUnitData.additional_guidance
  };

  return { data, prompts: prompts as PromptSet };
}

// Core exported function that runs the generation pipeline
/**
 * Generate learning unit markdown content with stable Gemini 1.5 Flash support.
 * Falls back to the local markdown generator if the model errors or returns empty output.
 *
 * @param input Learning unit input and prompt set
 * @returns GenerationResult with content and fallback status
 */
export const generateLearningUnitContent = async (input: LearningUnitInput): Promise<GenerationResult> => {
  logger.lifecycle('Starting generation');
  const apiKey = getStoredGeminiApiKey();

  if (!apiKey) {
    const err = new Error('Missing Gemini API Key');
    logger.error(err.message);
    throw err;
  }

  const { data, prompts } = prepareData(input);

  try {
    // Compile system prompt (use nested content prompts)
    const compiledSystemPrompt = (prompts?.content?.systemPrompt && compileTemplate(prompts.content.systemPrompt, data as TemplateData)) || prompts?.content?.systemPrompt || '';

    // Compile user prompt with Handlebars to keep template logic separate
    const compiledUserPrompt = (prompts?.content?.userPrompt && compileTemplate(prompts.content.userPrompt, data as TemplateData)) || '';

    const fullPrompt = buildFullPrompt({ system: compiledSystemPrompt, user: compiledUserPrompt });
    logger.lifecycle(`Compiled System Prompt: ${compiledSystemPrompt.substring(0, 200)}...`);
    logger.lifecycle(`Compiled User Prompt: ${compiledUserPrompt.substring(0, 200)}...`);
    logger.lifecycle(`Full prompt prepared (${fullPrompt.length} chars)`);

    logger.model('Initializing Gemini model');
    const model = new ChatGoogleGenerativeAI({
      model: MODEL_CONFIG.model,
      apiKey,
      temperature: MODEL_CONFIG.temperature,
      maxRetries: 0
    });

    logger.model(`Sending request to ${MODEL_CONFIG.model}...`);
    const response = await model.invoke(fullPrompt);
    const content = parseModelResponse(response);

    if (!content || !content.trim()) {
      logger.error('Model returned empty content');
      return { success: false, content: '', error: 'Model returned empty content', model: MODEL_CONFIG.model };
    }

    logger.success(`Generation success (${content.length} chars)`);
    return { success: true, content, model: MODEL_CONFIG.model };
  } catch (err) {
    const formatted = formatError(err);
    logger.error(`Model/API error: ${formatted.message}`);
    if (formatted.stack) logger.error(`Stack: ${formatted.stack}`);

    return { success: false, content: '', error: formatted.message, model: MODEL_CONFIG.model };
  }
};