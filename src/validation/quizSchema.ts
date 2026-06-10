import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string(),

  difficulty: z.enum([
    'easy',
    'medium',
    'hard'
  ]),

  question: z.string().min(1),

  options: z
    .array(z.string().min(1))
    .length(4),

  correct_answer: z
    .number()
    .min(0)
    .max(3),

  explanation: z.string().min(1)
});

export const quizSchema = z.object({
  questions: z.array(questionSchema).length(5)
});
