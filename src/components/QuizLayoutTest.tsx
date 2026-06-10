import { Box, Stack, Paper, Typography } from '@mui/material';
import type { QuizQuestion } from '../types';
import QuizCard from './quiz/QuizCard';

// Sample questions with very long text to test layout
const testQuestions: QuizQuestion[] = [
  {
    id: '1',
    difficulty: 'medium',
    question: 'Explain the difference between REST API and GraphQL architectures, including their respective trade-offs, performance characteristics, caching strategies, and use cases in modern web applications.',
    options: [
      'REST uses HTTP methods like GET, POST, PUT, DELETE while GraphQL uses a single endpoint with query language',
      'GraphQL is faster than REST in all scenarios',
      'REST is better for all types of applications',
      'There is no real difference between them'
    ],
    correct_answer: 0,
    explanation: 'REST and GraphQL are different architectural approaches. REST uses multiple endpoints with HTTP methods, while GraphQL uses a single endpoint with a query language. Each has trade-offs in terms of flexibility, caching, complexity, and performance depending on the use case.'
  },
  {
    id: '2',
    difficulty: 'hard',
    question: 'When implementing a microservices architecture with containerized services deployed across multiple Kubernetes clusters, what are the key considerations for ensuring data consistency, handling distributed transactions, implementing service discovery, managing secrets and configurations, and monitoring observability across the entire ecosystem?',
    options: [
      'Use a single database for all services to ensure ACID properties',
      'Implement eventual consistency with event-driven architecture, use service meshes like Istio, API gateways, circuit breakers, distributed tracing, and centralized logging',
      'Deploy all services on a single server',
      'Data consistency is not important in microservices'
    ],
    correct_answer: 1,
    explanation: 'Microservices architecture requires eventual consistency, event-driven patterns, service discovery mechanisms, and comprehensive monitoring. Solutions include service meshes, API gateways, distributed tracing, and observability tools.'
  },
  {
    id: '3',
    difficulty: 'easy',
    question: 'This is a short question',
    options: [
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4'
    ],
    correct_answer: 0,
    explanation: 'This is a short explanation.'
  }
];

export default function QuizLayoutTest() {
  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Stack spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Quiz Layout Test
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page tests the long question text wrapping and layout fixes.
          </Typography>
        </Paper>

        <Stack spacing={2.5}>
          {testQuestions.map((question, index) => (
            <QuizCard
              key={question.id}
              question={question}
              index={index}
              total={testQuestions.length}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
