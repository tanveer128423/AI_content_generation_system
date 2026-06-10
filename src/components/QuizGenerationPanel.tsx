import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
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
    <Box sx={{ maxWidth: 1180, mx: 'auto', width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.80)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          <CircularProgress size={44} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              Generating Quiz...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compiling the quiz prompt and running the Gemini/LangChain pipeline.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
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
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 1180 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.84)',
            border: '3px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <Stack spacing={2.25} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.08)' }}>
                  <QuizOutlinedIcon color="primary" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Quiz Generation
                  </Typography>
                  
                </Box>
              </Stack>
            </Box>

            <Button
              variant="contained"
              onClick={onGenerateQuiz}
              startIcon={<RefreshIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', width: 190, height: 44, fontSize: '0.95rem' }}
            >
              {hasQuestions ? 'Regenerate Quiz' : 'Generate Quiz'}
            </Button>
          </Stack>
        </Paper>

        {showError && (
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!hasGeneratedContent && (
          <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
            Generate the learning unit content first. The quiz workflow uses the markdown produced in the Preview tab.
          </Alert>
        )}

        {!hasQuestions && !showError && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.72)',
              border: '1px dashed rgba(15, 23, 42, 0.10)'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No quiz has been generated yet.
            </Typography>
          </Paper>
        )}

        {hasQuestions && (
          <Stack spacing={2.5}>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              
            </Box>

            <Stack spacing={2.5}>
              {questions.map((question, index) => (
                <QuizCard key={question.id || `${index}`} question={question} index={index} total={questions.length} />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
