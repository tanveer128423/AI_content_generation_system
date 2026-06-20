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

// Repair the most common malformations LLMs produce in JSON output so that a
// single stray comma or smart quote doesn't fail an otherwise-valid quiz.
function repairJsonCandidate(jsonText: string): string {
  return jsonText
    // Remove trailing commas before a closing } or ]
    .replace(/,\s*([}\]])/g, '$1')
    // Normalize smart quotes that occasionally slip into keys/strings
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

export function parseQuizResponse(rawText: string): unknown {
  const jsonText = extractJsonCandidate(rawText);

  if (!jsonText) {
    throw new Error('Quiz response was empty');
  }

  try {
    return JSON.parse(jsonText);
  } catch {
    // Retry once with light repairs before giving up.
    try {
      return JSON.parse(repairJsonCandidate(jsonText));
    } catch (error) {
      throw new Error(`Quiz response was not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
