import { describe, expect, it } from 'vitest';
import { parseGeneratedCourse } from '../src/ai/generateCourse';

const validCourse = {
  name: 'React for Beginners',
  description: 'Learn React from the ground up.',
  outcomes: ['Build components', 'Manage state', 'Handle events'],
  modules: [
    {
      name: 'Module 1: Foundations',
      description: 'Core ideas',
      learning_units: [
        { name: 'What is React', description: 'Intro', learner_journey: 'Understand React', duration: 20 },
        { name: 'JSX', description: 'Syntax', learner_journey: 'Write JSX', duration: 25 },
      ],
    },
  ],
};

describe('parseGeneratedCourse', () => {
  it('parses a clean JSON object', () => {
    const result = parseGeneratedCourse(JSON.stringify(validCourse));
    expect(result.success).toBe(true);
    expect(result.course?.modules).toHaveLength(1);
    expect(result.course?.modules[0].learning_units).toHaveLength(2);
  });

  it('extracts JSON from a fenced code block', () => {
    const wrapped = '```json\n' + JSON.stringify(validCourse) + '\n```';
    const result = parseGeneratedCourse(wrapped);
    expect(result.success).toBe(true);
    expect(result.course?.name).toBe('React for Beginners');
  });

  it('extracts JSON surrounded by commentary', () => {
    const noisy = `Here is your course:\n${JSON.stringify(validCourse)}\nHope that helps!`;
    const result = parseGeneratedCourse(noisy);
    expect(result.success).toBe(true);
  });

  it('coerces string durations to numbers and applies defaults', () => {
    const course = {
      ...validCourse,
      modules: [
        {
          name: 'M1',
          learning_units: [{ name: 'L1', duration: '45' }],
        },
      ],
    };
    const result = parseGeneratedCourse(JSON.stringify(course));
    expect(result.success).toBe(true);
    expect(result.course?.modules[0].learning_units[0].duration).toBe(45);
    expect(result.course?.modules[0].learning_units[0].description).toBe('');
  });

  it('fails on empty input', () => {
    expect(parseGeneratedCourse('').success).toBe(false);
  });

  it('fails on invalid JSON', () => {
    expect(parseGeneratedCourse('not json at all').success).toBe(false);
  });

  it('fails when modules are missing', () => {
    const result = parseGeneratedCourse(JSON.stringify({ name: 'X', modules: [] }));
    expect(result.success).toBe(false);
  });
});
