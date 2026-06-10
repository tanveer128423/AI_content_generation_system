import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { QuizQuestion } from '../../types';
import DifficultyBadge from './DifficultyBadge';
import QuizOption from './QuizOption';
import QuizExplanation from './QuizExplanation';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
}

const optionLetters = ['1', '2', '3', '4'];

export default function QuizCard({ question, index, total }: QuizCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const correctIndex = Math.max(0, Math.min(3, Number(question.correct_answer) || 0));
  const options = Array.from({ length: 4 }, (_, optionIndex) => question.options?.[optionIndex] || `Option ${optionIndex + 1}`);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        bgcolor: 'rgba(255,255,255,0.96)',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden',
        transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
        '&:hover': {
          boxShadow: '0 14px 34px rgba(15, 23, 42, 0.07)',
          borderColor: 'rgba(15, 23, 42, 0.12)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                borderRadius: 6,
                border: '1px solid rgba(15, 23, 42, 0.12)',
                paddingX: 1.5,
                paddingY: 0.5,
                backgroundColor: 'white',
                display: 'inline-flex',
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                mb: 3
              }}
            >
              Question {index + 1} of {total}
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2.5
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    lineHeight: 1.6,
                    color: 'text.primary',
                    letterSpacing: '-0.01em',
                    wordSpacing: 'normal',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    mb: 2,
                    mt: 1
                  }}
                >
                  {question.question}
                </Typography>
              </Box>
              <Box sx={{ flexShrink: 0, pt: 1 }}>
                <DifficultyBadge difficulty={question.difficulty} />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.06)' }} />

          <Stack spacing={2}>
            {options.map((option, optionIndex) => (
              <QuizOption
                key={`${question.id || index}-${optionIndex}`}
                letter={optionLetters[optionIndex]}
                text={option}
                correct={optionIndex === correctIndex}
              />
            ))}
          </Stack>

          <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.06)' }} />

          <QuizExplanation
            explanation={question.explanation}
            open={showExplanation}
            onToggle={() => setShowExplanation(prev => !prev)}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
