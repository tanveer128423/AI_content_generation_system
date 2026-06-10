import { MODEL_CONFIG } from './modelConfig';

export interface GeminiApiKeyValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateGeminiApiKey(apiKey: string): Promise<GeminiApiKeyValidationResult> {
  const trimmedKey = apiKey.trim();

  if (!trimmedKey) {
    return { valid: false, error: 'Enter a Gemini API key.' };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_CONFIG.model}:generateContent?key=${encodeURIComponent(trimmedKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Reply with OK.' }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 8,
            temperature: 0
          }
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      let message = `Gemini API returned ${response.status}`;

      try {
        const errorBody = await response.json();
        const apiMessage = errorBody?.error?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
          message = apiMessage.trim();
        }
      } catch {
        // Keep the HTTP status fallback.
      }

      return { valid: false, error: message };
    }

    return { valid: true };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'Validation timed out. Please try again.'
      : error instanceof Error
        ? error.message
        : 'Unable to validate the Gemini API key.';

    return { valid: false, error: message };
  } finally {
    window.clearTimeout(timeoutId);
  }
}