import { describe, expect, it } from 'vitest';
import { normalizeQuizPayload } from '../src/ai/generateQuiz';
import { parseQuizResponse } from '../src/utils/parseQuizResponse';
import { quizSchema } from '../src/validation/quizSchema';

function buildQuestion(index: number) {
  return {
    id: `q-${index}`,
    difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
    question: `Question ${index + 1}`,
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 0,
    explanation: `Explanation ${index + 1}`
  };
}

describe('quiz validation', () => {
  it('parses wrapped JSON quiz responses', () => {
    const inner = `{"questions":[${Array.from({ length: 5 }, (_, index) => JSON.stringify(buildQuestion(index))).join(',')} ]}`;
    const wrappedResponse = '```json\n' + inner + '\n```';

    const parsed = parseQuizResponse(wrappedResponse);
    const result = quizSchema.safeParse(parsed);

    expect(result.success).toBe(true);
  });

  it('trims extra quiz questions down to five before validation', () => {
    const parsed = parseQuizResponse(JSON.stringify({
      questions: Array.from({ length: 6 }, (_, index) => buildQuestion(index))
    }));

    const normalized = normalizeQuizPayload(parsed);
    const result = quizSchema.safeParse(normalized);

    expect(normalized.questions).toHaveLength(5);
    expect(result.success).toBe(true);
  });
});