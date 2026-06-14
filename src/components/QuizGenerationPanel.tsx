import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import type { QuizQuestion } from '../types';
import QuizCard from './quiz/QuizCard';

interface QuizGenerationPanelProps {
  questions: QuizQuestion[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string;
  hasGeneratedContent: boolean;
  onGenerateQuiz: () => void;
}

function QuizLoadingState() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: 2.5, border: '1px solid #ECECEE', bgcolor: '#FFFFFF' }}>
      <CircularProgress size={22} />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Creating your quiz…
      </Typography>
    </Stack>
  );
}

export default function QuizGenerationPanel({ questions, status, error, hasGeneratedContent, onGenerateQuiz }: QuizGenerationPanelProps) {
  const showLoading = status === 'loading';
  const showError = status === 'error' && Boolean(error);
  const hasQuestions = questions.length > 0;

  if (showLoading) {
    return <QuizLoadingState />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {hasQuestions
              ? `${questions.length} questions built from this lesson.`
              : 'Build a set of questions straight from this lesson.'}
          </Typography>
          <Button
            variant={hasQuestions ? 'outlined' : 'contained'}
            onClick={onGenerateQuiz}
            disabled={!hasGeneratedContent}
            startIcon={hasQuestions ? <RefreshIcon /> : <QuizOutlinedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            {hasQuestions ? 'Regenerate quiz' : 'Generate quiz'}
          </Button>
        </Stack>

        {showError && (
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!hasGeneratedContent && (
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            Generate the lesson content above first — the quiz is built from it.
          </Alert>
        )}

        {hasGeneratedContent && !hasQuestions && !showError && (
          <Box sx={{ p: 2.5, borderRadius: 2.5, textAlign: 'center', bgcolor: 'rgba(15,23,42,0.015)', border: '1px dashed rgba(15, 23, 42, 0.16)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No quiz yet. Click “Generate quiz” to create questions from this lesson.
            </Typography>
          </Box>
        )}

        {hasQuestions && (
          <Stack spacing={2}>
            {questions.map((question, index) => (
              <QuizCard key={question.id || `${index}`} question={question} index={index} total={questions.length} />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
