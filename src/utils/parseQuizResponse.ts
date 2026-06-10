function extractJsonCandidate(rawText: string) {
  const trimmed = rawText.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

export function parseQuizResponse(rawText: string): unknown {
  const jsonText = extractJsonCandidate(rawText);

  if (!jsonText) {
    throw new Error('Quiz response was empty');
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Quiz response was not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}
