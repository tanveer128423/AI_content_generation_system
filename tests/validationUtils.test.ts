import { describe, it, expect } from 'vitest';
import {
  validateCourse,
  validateModule,
  validateLearningUnit,
  validateQuestionConfig,
  validateQuestion,
  isValidUrl
} from '../src/utils/validationUtils';

describe('Validation Utils', () => {
  describe('validateCourse', () => {
    it('should validate a correct course', () => {
      const course = {
        name: 'Web Development',
        outcomes: ['Build websites', 'Learn React'],
        hld: 'A comprehensive course on web development'
      };
      const result = validateCourse(course);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when course name is missing', () => {
      const course = {
        name: '',
        outcomes: ['Learn React'],
        hld: 'Description'
      };
      const result = validateCourse(course);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Course name is required');
    });

    it('should fail when outcomes are empty', () => {
      const course = {
        name: 'Web Dev',
        outcomes: [],
        hld: 'Description'
      };
      const result = validateCourse(course);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one course outcome is required');
    });
  });

  describe('validateModule', () => {
    it('should validate a correct module', () => {
      const module = {
        name: 'React Basics',
        description: 'Introduction to React'
      };
      const result = validateModule(module);
      expect(result.valid).toBe(true);
    });

    it('should fail when name or description is missing', () => {
      const module = {
        name: '',
        description: ''
      };
      const result = validateModule(module);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateQuestionConfig', () => {
    it('should validate correct question configuration', () => {
      const config = {
        total_questions: 5,
        easy: 2,
        medium: 2,
        hard: 1
      };
      const result = validateQuestionConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should fail when distribution does not match total', () => {
      const config = {
        total_questions: 10,
        easy: 2,
        medium: 2,
        hard: 2
      };
      const result = validateQuestionConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must equal total questions');
    });

    it('should fail with negative values', () => {
      const config = {
        total_questions: 5,
        easy: -1,
        medium: 2,
        hard: 5
      };
      const result = validateQuestionConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateQuestion', () => {
    it('should validate a correct question', () => {
      const question = {
        question: 'What is React?',
        options: ['A library', 'A framework', 'A language', 'A tool'],
        correct_answer: 0,
        explanation: 'React is a JavaScript library for building user interfaces',
        difficulty: 'easy'
      };
      const result = validateQuestion(question);
      expect(result.valid).toBe(true);
    });

    it('should fail when options count is not 4', () => {
      const question = {
        question: 'What is React?',
        options: ['A library', 'A framework'],
        correct_answer: 0,
        explanation: 'React is a library',
        difficulty: 'easy'
      };
      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Exactly 4 options are required');
    });

    it('should fail with invalid difficulty', () => {
      const question = {
        question: 'What is React?',
        options: ['A', 'B', 'C', 'D'],
        correct_answer: 0,
        explanation: 'Explanation',
        difficulty: 'extreme'
      };
      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
});
