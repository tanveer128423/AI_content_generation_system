import { Chip } from '@mui/material';
import type { QuizQuestion } from '../../types';

const difficultyStyles: Record<QuizQuestion['difficulty'], { label: string; color: 'success' | 'warning' | 'error'; bg: string; border: string }> = {
  easy: {
    label: 'Easy',
    color: 'success',
    bg: 'rgba(16, 185, 129, 0.10)',
    border: 'rgba(16, 185, 129, 0.22)'
  },
  medium: {
    label: 'Medium',
    color: 'warning',
    bg: 'rgba(245, 158, 11, 0.10)',
    border: 'rgba(245, 158, 11, 0.24)'
  },
  hard: {
    label: 'Hard',
    color: 'error',
    bg: 'rgba(239, 68, 68, 0.10)',
    border: 'rgba(239, 68, 68, 0.24)'
  }
};

export default function DifficultyBadge({ difficulty }: { difficulty: QuizQuestion['difficulty'] }) {
  const style = difficultyStyles[difficulty];

  return (
    <Chip
      label={style.label}
      size="small"
      color={style.color}
      sx={{
        fontWeight: 400,
        borderRadius: 999,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        color: `${style.color}.dark`,
        height: 28,
        px: 0.75
      }}
    />
  );
}
