import { Box, Divider, Stack, Typography } from '@mui/material';
import type { QuizQuestion } from '../../types';
import DifficultyBadge from './DifficultyBadge';
import QuizOption from './QuizOption';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
}

export default function QuizCard({ question, index, total }: QuizCardProps) {
  const correctIndex = Math.max(0, Math.min(3, Number(question.correct_answer) || 0));
  const options = Array.from({ length: 4 }, (_, optionIndex) => question.options?.[optionIndex] || `Option ${optionIndex + 1}`);

  return (
    <Box
      sx={{
        border: '1px solid #ECECEE',
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        p: { xs: 2.5, md: 3 },
      }}
    >
      <Stack spacing={2}>
        {/* Header: progression + difficulty */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.68rem' }}>
            Question {index + 1} of {total}
          </Typography>
          <DifficultyBadge difficulty={question.difficulty} />
        </Stack>

        {/* Question */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.05rem', md: '1.15rem' },
            lineHeight: 1.5,
            color: '#111827',
            letterSpacing: '-0.01em',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {question.question}
        </Typography>

        {/* Options — flat, marker + text */}
        <Stack spacing={0.25}>
          {options.map((option, optionIndex) => (
            <QuizOption key={`${question.id || index}-${optionIndex}`} text={option} correct={optionIndex === correctIndex} />
          ))}
        </Stack>

        {/* Explanation — integrated, not hidden */}
        {question.explanation?.trim() && (
          <>
            <Divider sx={{ borderColor: '#ECECEE' }} />
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.68rem' }}>
                Explanation
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: '0.95rem', lineHeight: 1.75, color: '#374151' }}>
                {question.explanation}
              </Typography>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
