import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Fade,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useContent } from '../context/ContentContext';
import { useApiKeyGate } from '../context/ApiKeyGate';
import { generateCourseStructure, type GeneratedCourse } from '../ai/generateCourse';
import { SAMPLE_COURSE } from '../data/sampleCourse';

const AI_GRADIENT = 'linear-gradient(120deg, #5B5BD6 0%, #7C5CFF 55%, #22B8CF 130%)';

const EXAMPLE_PROMPTS = [
  'React for Beginners',
  'System Design Interviews',
  'Personal Finance',
  'Machine Learning',
  'Python for Data Analysis',
  'Public Speaking',
];

const AUDIENCE_OPTIONS = ['Beginners', 'Intermediate', 'Advanced'];
const DURATION_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0.5, label: '30 min' },
  { value: 1, label: '1 hr' },
  { value: 1.5, label: '1.5 hr' },
];

const GENERATING_STEPS = [
  'Understanding your topic…',
  'Designing the curriculum…',
  'Structuring modules…',
  'Writing lessons…',
  'Sequencing the learner journey…',
  'Finishing touches…',
];

type Phase = 'input' | 'generating' | 'result';

function countLessons(course: GeneratedCourse) {
  return course.modules.reduce((sum, m) => sum + m.learning_units.length, 0);
}

function countProjects(course: GeneratedCourse) {
  return course.modules.reduce(
    (sum, m) => sum + m.learning_units.filter(lu => /\bproject\b/i.test(lu.name)).length,
    0
  );
}

interface CourseGeneratorProps {
  onClose?: () => void;
  closable?: boolean;
}

export default function CourseGenerator({ onClose, closable = false }: CourseGeneratorProps) {
  const { addCourse } = useContent();
  const { ensureApiKey } = useApiKeyGate();

  const [phase, setPhase] = useState<Phase>('input');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<string>('Beginners');
  const [durationHours, setDurationHours] = useState<number>(1);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [generated, setGenerated] = useState<GeneratedCourse | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const stepTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current !== null) {
        window.clearInterval(stepTimerRef.current);
      }
    };
  }, []);

  const summary = useMemo(() => {
    if (!generated) return null;
    const lessons = countLessons(generated);
    return {
      modules: generated.modules.length,
      lessons,
      projects: countProjects(generated),
      questions: includeQuizzes ? lessons * 5 : 0,
    };
  }, [generated, includeQuizzes]);

  const handleLoadSample = () => {
    addCourse({
      name: SAMPLE_COURSE.name,
      description: SAMPLE_COURSE.description,
      outcomes: SAMPLE_COURSE.outcomes,
      modules: SAMPLE_COURSE.modules,
    });
    onClose?.();
  };

  const handleGenerate = async () => {
    if (!topic.trim() || phase === 'generating') return;

    // Defer the API key requirement until the user actually generates.
    const ready = await ensureApiKey();
    if (!ready) return;

    setError(null);
    setPhase('generating');
    setStepIndex(0);

    stepTimerRef.current = window.setInterval(() => {
      setStepIndex(prev => (prev + 1) % GENERATING_STEPS.length);
    }, 1400);

    const result = await generateCourseStructure({
      topic,
      audience,
      durationHours,
      includeProjects,
      includeQuizzes,
    });

    if (stepTimerRef.current !== null) {
      window.clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }

    if (!result.success || !result.course) {
      setError(result.error || 'Something went wrong. Please try again.');
      setPhase('input');
      return;
    }

    setGenerated(result.course);
    setPhase('result');
  };

  const handleOpenWorkspace = () => {
    if (!generated) return;
    addCourse({
      name: generated.name,
      description: generated.description,
      outcomes: generated.outcomes,
      modules: generated.modules,
    });
    onClose?.();
  };

  const handleStartOver = () => {
    setGenerated(null);
    setError(null);
    setPhase('input');
  };

  // ---- Result / roadmap view ------------------------------------------------
  if (phase === 'result' && generated && summary) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', py: { xs: 2, md: 4 } }}>
        <Fade in timeout={400}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 30 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                Course generated
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 3, ml: 5.5 }}>
              {generated.name}
            </Typography>

            {/* Summary stats */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 1.5,
                mb: 3,
              }}
            >
              {[
                { label: 'Modules', value: summary.modules },
                { label: 'Lessons', value: summary.lessons },
                { label: 'Projects', value: summary.projects },
                { label: 'Quiz Questions', value: summary.questions },
              ].map(stat => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid #ECECEE',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                  }}
                >
                  <Stack direction="row" spacing={0.75} alignItems="baseline">
                    <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 16 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={handleOpenWorkspace}
                sx={{
                  background: AI_GRADIENT,
                  fontWeight: 700,
                  px: 3,
                  boxShadow: '0 10px 24px -12px rgba(91,91,214,0.7)',
                  '&:hover': { background: AI_GRADIENT, filter: 'brightness(1.05)' },
                }}
              >
                Open in workspace
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ReplayRoundedIcon />}
                onClick={handleStartOver}
                sx={{ fontWeight: 600 }}
              >
                Start over
              </Button>
            </Stack>

            {/* Visual roadmap */}
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8 }}
            >
              Course roadmap
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {generated.modules.map((module, mIndex) => (
                <Box
                  key={`${module.name}-${mIndex}`}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #ECECEE',
                    bgcolor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: AI_GRADIENT,
                        flexShrink: 0,
                      }}
                    >
                      {mIndex + 1}
                    </Box>
                    <ViewModuleOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700 }}>{module.name}</Typography>
                    <Chip
                      label={`${module.learning_units.length} lessons`}
                      size="small"
                      sx={{ ml: 'auto', bgcolor: 'rgba(79,70,229,0.08)', fontSize: '0.72rem' }}
                    />
                  </Box>
                  <Divider />
                  <Stack sx={{ px: 2, py: 1 }}>
                    {module.learning_units.map((lu, luIndex) => (
                      <Stack
                        key={`${lu.name}-${luIndex}`}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ py: 0.6 }}
                      >
                        <MenuBookOutlinedIcon sx={{ color: 'text.disabled', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {lu.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lu.duration} min
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Fade>
      </Box>
    );
  }

  // ---- Generating view ------------------------------------------------------
  if (phase === 'generating') {
    return (
      <Box
        sx={{
          minHeight: 460,
          display: 'grid',
          placeItems: 'center',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Stack spacing={3} alignItems="center" sx={{ maxWidth: 460 }}>
          <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={88} thickness={2.5} sx={{ color: '#7C5CFF' }} />
            <AutoAwesomeRoundedIcon
              sx={{
                position: 'absolute',
                fontSize: 34,
                color: '#5B5BD6',
                animation: 'pulse 1.6s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.5, transform: 'scale(0.92)' },
                  '50%': { opacity: 1, transform: 'scale(1.06)' },
                },
              }}
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Building your course
            </Typography>
            <Box sx={{ height: 28, mt: 1 }}>
              <Fade in key={stepIndex} timeout={400}>
                <Typography color="text.secondary">{GENERATING_STEPS[stepIndex]}</Typography>
              </Fade>
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  }

  // ---- Input / prompt-first hero -------------------------------------------
  return (
    <Box sx={{ position: 'relative', maxWidth: 720, mx: 'auto', py: { xs: 4, md: 7 } }}>
      {closable && onClose && (
        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 0, color: 'text.secondary' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
      )}

      <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: AI_GRADIENT,
            boxShadow: '0 12px 28px -12px rgba(91,91,214,0.7)',
            mb: 1,
          }}
        >
          <RocketLaunchRoundedIcon />
        </Box>
        <Typography
          variant="h3"
          sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '1.9rem', md: '2.4rem' } }}
        >
          What would you like to teach today?
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
          Describe a topic and let AI design the full course — modules, lessons, and a
          learner journey. You can refine everything afterwards.
        </Typography>

        <Button
          variant="text"
          startIcon={<AutoStoriesOutlinedIcon />}
          onClick={handleLoadSample}
          sx={{
            mt: 0.5,
            fontWeight: 600,
            color: 'primary.main',
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(91,91,214,0.06)' },
          }}
        >
          No API key? See a ready-made sample course
        </Button>
      </Stack>

      <Box
        sx={{
          borderRadius: 4,
          border: '1px solid #E0E0E3',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 24px 60px -32px rgba(16,24,40,0.28)',
          p: { xs: 2, md: 2.5 },
        }}
      >
        <TextField
          inputRef={inputRef}
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate();
          }}
          placeholder="Create a complete course on React.js…"
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          autoFocus
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { fontSize: '1.05rem', px: 1, py: 0.5 } }}
        />

        <Divider sx={{ my: 1.5 }} />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ px: 0.5 }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Audience
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={audience}
              onChange={(_, v) => v && setAudience(v)}
              sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap' }}
            >
              {AUDIENCE_OPTIONS.map(opt => (
                <ToggleButton key={opt} value={opt} sx={{ textTransform: 'none', px: 1.5 }}>
                  {opt}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Duration
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={durationHours}
              onChange={(_, v) => v && setDurationHours(v)}
              sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap' }}
            >
              {DURATION_OPTIONS.map(opt => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'none', px: 1.5 }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Include
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
              <Chip
                label="Projects"
                size="small"
                variant={includeProjects ? 'filled' : 'outlined'}
                color={includeProjects ? 'primary' : 'default'}
                onClick={() => setIncludeProjects(v => !v)}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label="Quizzes"
                size="small"
                variant={includeQuizzes ? 'filled' : 'outlined'}
                color={includeQuizzes ? 'primary' : 'default'}
                onClick={() => setIncludeQuizzes(v => !v)}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Box>

          <Button
            variant="contained"
            size="large"
            disabled={!topic.trim()}
            endIcon={<AutoAwesomeRoundedIcon />}
            onClick={handleGenerate}
            sx={{
              ml: { md: 'auto' },
              alignSelf: { xs: 'stretch', md: 'center' },
              background: AI_GRADIENT,
              fontWeight: 700,
              px: 3,
              boxShadow: '0 10px 24px -12px rgba(91,91,214,0.7)',
              '&:hover': { background: AI_GRADIENT, filter: 'brightness(1.05)' },
              '&.Mui-disabled': { background: '#E5E5EA', color: '#A1A1AA' },
            }}
          >
            Generate
          </Button>
        </Stack>
      </Box>

      <Collapse in={Boolean(error)}>
        <Alert severity="error" variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>

      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, ml: 0.5 }}>
          Examples
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {EXAMPLE_PROMPTS.map(example => (
            <Chip
              key={example}
              label={example}
              variant="outlined"
              onClick={() => {
                setTopic(`Create a complete course on ${example}`);
                inputRef.current?.focus();
              }}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(91,91,214,0.06)', borderColor: 'primary.main' },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
