/**
 * Stable Gemini model configuration used across the app.
 * Keep this centralized so model changes only happen in one place.
 */

export const MODEL_CONFIG = {
  model: 'gemini-2.5-flash-lite',
  temperature: 0.7
} as const;