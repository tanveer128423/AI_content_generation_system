import { memo, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useContent } from '../context/ContentContext';
import { generateLearningUnitContent } from '../ai/generate';
import { generateLearningUnitQuiz } from '../ai/generateQuiz';
import EntityActionsMenu from './EntityActionsMenu';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import QuizGenerationPanel from './QuizGenerationPanel';
import type { QuizQuestion } from '../types';

const pipelineSteps = ['Analyzing input', 'Structuring lesson', 'Generating markdown', 'Finalizing'];

type WorkspaceStep = 'input' | 'loading' | 'output';
type QuizStatus = 'idle' | 'loading' | 'ready' | 'error';

function mapLearningUnitArtifacts(artifacts: any[] | undefined) {
  if (!Array.isArray(artifacts)) return [] as string[];

  return artifacts.map((artifact: any, index: number) => {
    const artifactType = artifact?.artifact_type?.trim();
    const link = artifact?.link?.trim();
    if (artifactType && link) return `${artifactType}: ${link}`;
    if (artifactType) return artifactType;
    if (link) return link;
    return `Artifact ${index + 1}`;
  });
}

function getWorkspaceHydratedState(selectedLU: any) {
  if (!selectedLU?.lu) {
    return {
      unitName: '',
      unitDescription: '',
      duration: 30,
      artifacts: [] as string[],
      guidance: '',
      learnerJourney: '',
      generatedContent: '',
      step: 'input' as WorkspaceStep,
      activeTab: 'editor',
      quizQuestions: [] as QuizQuestion[],
      quizGenerationStatus: 'idle' as QuizStatus
    };
  }

  const storedContent = selectedLU.lu.generated_content || '';
  const storedQuizQuestions = Array.isArray(selectedLU.lu.questions?.generated_questions)
    ? (selectedLU.lu.questions.generated_questions as QuizQuestion[])
    : [];

  return {
    unitName: selectedLU.lu.name?.trim() || 'New Learning Unit',
    unitDescription: selectedLU.lu.description?.trim() || '',
    duration: Number(selectedLU.lu.duration) || 30,
    artifacts: mapLearningUnitArtifacts(selectedLU.lu.artifacts),
    guidance: selectedLU.lu.additional_guidance || '',
    learnerJourney: selectedLU.lu.learner_journey || '',
    generatedContent: storedContent,
    step: (storedContent ? 'output' : 'input') as WorkspaceStep,
    activeTab: storedContent ? 'preview' : 'editor',
    quizQuestions: storedQuizQuestions,
    quizGenerationStatus: (storedQuizQuestions.length > 0 ? 'ready' : 'idle') as QuizStatus
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildGeneratedContent = ({
  courseName,
  moduleName,
  unitName,
  unitDescription,
  duration,
  artifacts,
  guidance
}: {
  courseName: string;
  moduleName: string;
  unitName: string;
  unitDescription: string;
  duration: number;
  artifacts: string[];
  guidance: string;
}) => {
  const normalizedCourseName = courseName.trim() || 'Untitled Course';
  const normalizedModuleName = moduleName.trim() || 'Untitled Module';
  const normalizedUnitName = unitName.trim() || 'New Learning Unit';
  const normalizedDescription = unitDescription.trim() || 'No learning unit description provided.';
  const normalizedGuidance = guidance.trim() || 'No additional guidance provided.';
  const artifactLines = artifacts.map(artifact => artifact.trim()).filter(Boolean).map(artifact => `- ${artifact}`);

  return [
    `# ${normalizedUnitName}`,
    '',
    `**Course:** ${normalizedCourseName}`,
    `**Module:** ${normalizedModuleName}`,
    `**Duration:** ${duration} minutes`,
    '',
    '## Learning Unit Description',
    normalizedDescription,
    '',
    '## Introduction',
    `This learning unit is designed for ${duration} minutes of focused instruction and practice.`,
    '',
    '## Learning Flow',
    '- Start with the core concept and learning objective',
    '- Build understanding through examples and guided explanation',
    '- Reinforce the idea with a short application exercise',
    '',
    '## Additional Guidance',
    normalizedGuidance,
    '',
    '## Artifacts',
    artifactLines.length > 0 ? artifactLines.join('\n') : '- No artifacts added yet.',
    '',
    '## Summary',
    'Review the key takeaways and confirm readiness for the next learning step.'
  ].join('\n');
};

function LoadingPanel({ currentStepIndex, onCancel }: { currentStepIndex: number; onCancel: () => void }) {
  const progressPercent = (currentStepIndex / pipelineSteps.length) * 100;

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.78)', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)' }}>
      <Stack spacing={2.5} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Generating Content...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Running the hierarchy-aware generation pipeline.
          </Typography>
        </Box>

        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 999 }} />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 700, textAlign: 'center' }}>
            Step {currentStepIndex} of {pipelineSteps.length}
          </Typography>
        </Box>

        <Stack spacing={1.25} sx={{ width: '100%' }}>
          {pipelineSteps.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStepIndex;
            const isCurrent = stepNumber === currentStepIndex;

            return (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.08)' : isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.04)',
                  border: '1px solid',
                  borderColor: isCurrent ? 'rgba(59, 130, 246, 0.3)' : isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: isCompleted ? '#10b981' : isCurrent ? '#3b82f6' : '#9ca3af',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0
                  }}
                >
                  {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                </Box>
                <Typography variant="body2" sx={{ color: isCurrent ? '#1e40af' : isCompleted ? '#047857' : 'text.secondary', fontWeight: isCurrent ? 700 : 500 }}>
                  {stepNumber}. {label}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ bgcolor: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}

function TabPanel({
  activeTab,
  value,
  children,
  render,
}: {
  activeTab: string;
  value: string;
  children?: React.ReactNode;
  render?: () => React.ReactNode;
}) {
  if (activeTab !== value) return null;
  if (typeof render === 'function') {
    return <>{render()}</>;
  }
  return <>{children}</>;
}

const MarkdownPreview = memo(function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content || 'No content available'}
    </ReactMarkdown>
  );
});

export default function LearningUnitWorkspace() {
  const {
    contentData,
    selectedLU,
    selectedCourseId,
    selectedModuleId,
    getCourse,
    getModule,
    updateLearningUnit,
    deleteLearningUnit,
    duplicateLearningUnit,
    saveStructure
  } = useContent();

  const initialHydratedState = getWorkspaceHydratedState(selectedLU);

  const [unitName, setUnitName] = useState(() => initialHydratedState.unitName);
  const [unitDescription, setUnitDescription] = useState(() => initialHydratedState.unitDescription);
  const [duration, setDuration] = useState(() => initialHydratedState.duration);
  const [artifacts, setArtifacts] = useState<string[]>(() => initialHydratedState.artifacts);
  const [guidance, setGuidance] = useState(() => initialHydratedState.guidance);
  const [learnerJourney, setLearnerJourney] = useState(() => initialHydratedState.learnerJourney);
  const [step, setStep] = useState<WorkspaceStep>(() => initialHydratedState.step);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedContent, setGeneratedContent] = useState(() => initialHydratedState.generatedContent);
  const [generationError, setGenerationError] = useState('');
  const [newArtifactInput, setNewArtifactInput] = useState('');
  const [activeTab, setActiveTab] = useState(() => initialHydratedState.activeTab);
  const [quizGenerationStatus, setQuizGenerationStatus] = useState<QuizStatus>(() => initialHydratedState.quizGenerationStatus);
  const [quizGenerationError, setQuizGenerationError] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => initialHydratedState.quizQuestions);
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const lastGeneratedSignatureRef = useRef('');
  const hydratedLuIdRef = useRef<string | null>(null);
  const unitNameRef = useRef<HTMLInputElement | null>(null);
  const isGenerating = step === 'loading';
  const deferredGeneratedContent = useDeferredValue(generatedContent);

  const selectedCourse = useMemo(() => {
    if (!selectedLU?.courseId) return getCourse(selectedCourseId || '');
    return getCourse(selectedLU.courseId);
  }, [getCourse, selectedCourseId, selectedLU?.courseId, contentData.courses.length]);

  const selectedModule = useMemo(() => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId) return selectedCourseId && selectedModuleId ? getModule(selectedCourseId, selectedModuleId) : undefined;
    return getModule(selectedLU.courseId, selectedLU.moduleId);
  }, [getModule, selectedCourseId, selectedModuleId, selectedLU?.courseId, selectedLU?.moduleId, contentData.courses.length]);

  const currentPrompts = contentData.prompts;

  useLayoutEffect(() => {
    const hydratedState = getWorkspaceHydratedState(selectedLU);

    setUnitName(hydratedState.unitName);
    setUnitDescription(hydratedState.unitDescription);
    setDuration(hydratedState.duration);
    setArtifacts(hydratedState.artifacts);
    setGuidance(hydratedState.guidance);
    setLearnerJourney(hydratedState.learnerJourney);
    setGeneratedContent(hydratedState.generatedContent);
    setGenerationError('');
    setStep(hydratedState.step);
    setActiveTab(hydratedState.activeTab);
    setCurrentStepIndex(0);
    setNewArtifactInput('');
    setQuizQuestions(hydratedState.quizQuestions);
    setQuizGenerationStatus(hydratedState.quizGenerationStatus);
    setQuizGenerationError('');
    lastGeneratedSignatureRef.current = `${hydratedState.unitName}__${hydratedState.unitDescription}__${hydratedState.duration}__${hydratedState.guidance}__${hydratedState.artifacts.join('|')}`;
    hydratedLuIdRef.current = selectedLU?.lu?.id ?? null;
  }, [selectedLU?.courseId, selectedLU?.moduleId, selectedLU?.lu?.id]);

  useEffect(() => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    if (hydratedLuIdRef.current !== selectedLU.lu.id) return;

    const currentUnitName = selectedLU.lu.name?.trim() || 'New Learning Unit';
    const currentDescription = selectedLU.lu.description?.trim() || '';
    const currentDuration = Number(selectedLU.lu.duration) || 30;
    const currentArtifacts = mapLearningUnitArtifacts(selectedLU.lu.artifacts);
    const currentGuidance = selectedLU.lu.additional_guidance || '';
    const currentLearnerJourney = selectedLU.lu.learner_journey || '';
    const currentGeneratedContent = selectedLU.lu.generated_content || '';

    const artifactsUnchanged =
      currentArtifacts.length === artifacts.length &&
      currentArtifacts.every((artifact, index) => artifact === artifacts[index]);

    const hasChanges =
      currentUnitName !== unitName ||
      currentDescription !== unitDescription ||
      currentDuration !== duration ||
      !artifactsUnchanged ||
      currentGuidance !== guidance ||
      currentLearnerJourney !== learnerJourney ||
      currentGeneratedContent !== generatedContent;

    if (!hasChanges) {
      return;
    }

    updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
      name: unitName,
      description: unitDescription,
      duration,
      artifacts: artifacts.map(artifact => ({ artifact_type: artifact, link: '' })),
      additional_guidance: guidance,
      learner_journey: learnerJourney,
      generated_content: generatedContent
    });
  }, [selectedLU?.courseId, selectedLU?.moduleId, selectedLU?.lu?.id, unitName, unitDescription, duration, guidance, artifacts, generatedContent, updateLearningUnit]);

  const persistGeneratedContent = (nextContent: string) => {
    setGeneratedContent(nextContent);
  };

  /* REMOVED: This effect was overwriting AI content with template fallback */

  const startGeneration = async (triggeredByUser = false) => {
    if (!triggeredByUser || !selectedLU?.lu || step === 'loading') return;

    const learningUnit = {
      id: selectedLU.lu.id,
      courseId: selectedLU.courseId,
      moduleId: selectedLU.moduleId,
      courseName: selectedCourse?.name || 'Untitled Course',
      moduleName: selectedModule?.name || 'Untitled Module',
      name: unitName,
      description: unitDescription,
      duration,
      artifacts: [...artifacts],
      additionalGuidance: guidance,
      learnerJourney
    };

    

    setGenerationError('');
    setGeneratedContent('');
    lastGeneratedSignatureRef.current = '';
    updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
      generated_content: '',
      generated_at: null
    });
    setActiveTab('preview');
    setStep('loading');
    setCurrentStepIndex(1);

    for (let index = 1; index <= pipelineSteps.length; index += 1) {
      setCurrentStepIndex(index);
      if (index < pipelineSteps.length) {
        await delay(600);
      }
    }

    try {
      const result = await generateLearningUnitContent({
        course: {
          name: selectedCourse?.name || 'Untitled Course',
          description: selectedCourse?.description || '',
          outcomes: selectedCourse?.outcomes || []
        },
        module: {
          name: selectedModule?.name || 'Untitled Module',
          description: selectedModule?.description || ''
        },
        learningUnit: {
          name: unitName,
          description: unitDescription,
          duration,
          learner_journey: learnerJourney,
          additional_guidance: guidance,
          artifacts: artifacts.map(a => ({
            artifact_type: a,
            link: ''
          }))
        },
        prompts: {
          content: {
            systemPrompt: currentPrompts.content?.systemPrompt || '',
            userPrompt: currentPrompts.content?.userPrompt || ''
          }
        }
      });

      if (!result?.success) {
        console.error('❌ GENERATION_FAILED - Result success:', result?.success, 'Error:', result?.error);
        setGenerationError(result?.error || 'Generation failed');
        setStep('input');
      } else {
        
        // IMPORTANT: ONLY use real AI content, never template fallback on success
        const nextContent = result?.content && result.content.trim().length > 0
          ? result.content
          : '';
        
        if (!nextContent) {
          console.error('❌ GENERATION_EMPTY - AI returned empty content');
          setGenerationError('Generation returned empty content');
          setStep('input');
          return;
        }
        lastGeneratedSignatureRef.current = `${unitName}__${unitDescription}__${duration}__${guidance}__${artifacts.join('|')}`;
        persistGeneratedContent(nextContent);
        updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
          generated_content: nextContent,
          generated_at: new Date().toISOString()
        });
        setStep('output');
        setActiveTab('preview');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate learning unit content';
      setGenerationError(message);
      setStep('input');
    } finally {
      setCurrentStepIndex(0);
    }
  };

  const buildQuizGenerationPayload = () => {
    const quizConfig = {
      total_questions: selectedLU?.lu?.questions?.total_questions ?? 5,
      easy: selectedLU?.lu?.questions?.easy ?? 2,
      medium: selectedLU?.lu?.questions?.medium ?? 2,
      hard: selectedLU?.lu?.questions?.hard ?? 1
    };

    return {
      course: {
        name: selectedCourse?.name || 'Untitled Course',
        description: selectedCourse?.description || '',
        outcomes: selectedCourse?.outcomes || []
      },
      module: {
        name: selectedModule?.name || 'Untitled Module',
        description: selectedModule?.description || ''
      },
      learningUnit: {
        name: unitName,
        description: unitDescription,
        duration,
        learner_journey: learnerJourney,
        additional_guidance: guidance,
        generated_content: generatedContent,
        artifacts: artifacts.map(artifact => ({
          artifact_type: artifact,
          link: ''
        })),
        questions: {
          ...quizConfig,
          config: quizConfig
        }
      },
      prompts: {
        quiz: {
          systemPrompt: currentPrompts.quiz?.systemPrompt || '',
          userPrompt: currentPrompts.quiz?.userPrompt || ''
        }
      }
    };
  };

  const startQuizGeneration = async (skipLoadingGuard = false) => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    if (quizGenerationStatus === 'loading' && !skipLoadingGuard) return;

    const sourceContent = generatedContent.trim();
    if (!sourceContent) {
      setQuizGenerationError('Generate the learning unit content before creating a quiz.');
      setQuizGenerationStatus('error');
      return;
    }

    setQuizGenerationError('');
    setQuizGenerationStatus('loading');

    try {
      const result = await generateLearningUnitQuiz(buildQuizGenerationPayload());

      if (!result.success) {
        setQuizQuestions([]);
        setQuizGenerationError(result.error || 'Quiz generation failed');
        setQuizGenerationStatus('error');
        return;
      }

      const nextQuestions = result.questions || [];
      if (nextQuestions.length === 0) {
        setQuizGenerationError('Quiz generation returned no questions');
        setQuizGenerationStatus('error');
        return;
      }

      const generatedAt = new Date().toISOString();
      setQuizQuestions(nextQuestions as QuizQuestion[]);
      setQuizGenerationStatus('ready');
      setQuizGenerationError('');

      updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
        questions: {
          ...(selectedLU.lu.questions || {}),
          generated_questions: nextQuestions,
          generated_at: generatedAt
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate quiz';
      setQuizGenerationError(message);
      setQuizGenerationStatus('error');
    }
  };

  const handleGenerateQuizFromPreview = () => {
    setActiveTab('quiz');
    setQuizGenerationError('');
    setQuizGenerationStatus('loading');
    window.setTimeout(() => {
      void startQuizGeneration(true);
    }, 0);
  };

  const cancelLoading = () => {
    setStep('input');
    setCurrentStepIndex(0);
  };

  const handleMarkdownChange = (value: string) => {
    setGeneratedContent(value);
  };

  const isUnitNameEmpty = unitName.trim().length === 0;
  const isDurationInvalid = duration <= 0;
  const isFormValid = !isUnitNameEmpty && !isDurationInvalid;

  const handleAddArtifact = () => {
    if (newArtifactInput.trim()) {
      setArtifacts(prev => [...prev, newArtifactInput.trim()]);
      setNewArtifactInput('');
    }
  };

  const handleRemoveArtifact = (index: number) => {
    setArtifacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveContent = () => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;

    updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
      name: unitName,
      description: unitDescription,
      duration,
      artifacts: artifacts.map(artifact => ({ artifact_type: artifact, link: '' })),
      additional_guidance: guidance,
      learner_journey: learnerJourney,
      generated_content: generatedContent,
      draft_saved_at: new Date().toISOString()
    });
    saveStructure();
    setSaveOpen(true);
  };

  const handleRename = () => {
    unitNameRef.current?.focus();
  };

  const handleDuplicate = () => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id || !duplicateLearningUnit) return;
    duplicateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id);
  };

  const handleDelete = () => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    deleteLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id);
    setDeleteOpen(false);
  };

  if (!selectedLU?.lu) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, minHeight: 360, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.8)', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)' }}>
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create a learning unit
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            Select or add a learning unit to unlock the content editor.
          </Typography>
        </Box>
      </Paper>
    );
  }

  function renderPreviewContent() {
    
    if (step === 'loading') {
      return <LoadingPanel currentStepIndex={currentStepIndex} onCancel={cancelLoading} />;
    }

    if (step === 'output') {
      if (!generatedContent || generatedContent.trim().length === 0) {
        return (
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(15, 23, 42, 0.08)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
              No content generated. Please try generating again.
            </Typography>
          </Box>
        );
      }
      return (
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(15, 23, 42, 0.06)'
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Preview Markdown
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review the generated content or trigger quiz generation from the current markdown.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateQuizFromPreview}
                startIcon={quizGenerationStatus === 'loading' ? <CircularProgress size={18} color="inherit" /> : <QuizOutlinedIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Generate Quiz
              </Button>
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, minHeight: { xs: 620, lg: 680 }, borderRadius:4, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.72)', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
            <Box
  sx={{
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderRight: {
      xs: 'none',
      lg: '1px solid rgba(15, 23, 42, 0.12)'
    },
    borderBottom: {
      xs: '1px solid rgba(15, 23, 42, 0.12)',
      lg: 'none'
    }
  }}
>
  <TextField
    value={generatedContent}
    onChange={(event) => handleMarkdownChange(event.target.value)}
    fullWidth
    multiline
    minRows={28}
    variant="outlined"
    InputProps={{
      sx: {
        fontFamily: '"Fira Code", monospace',
        fontSize: '14px',
        lineHeight: 1.8,
        alignItems: 'flex-start',
        overflow: 'hidden',

        '& textarea': {
          overflowY: 'auto !important',
          overflowX: 'hidden !important',
          resize: 'none',
          padding: '16px',
          whiteSpace: 'pre-wrap !important',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          boxSizing: 'border-box'
        }
      }
    }}
    sx={{
      height: '100%',

      '& .MuiOutlinedInput-root': {
        height: '100%',
        alignItems: 'flex-start',
        borderRadius: 0,

        '& fieldset': {
          border: 'none'
        }
      },

      '& .MuiInputBase-inputMultiline': {
        overflowX: 'hidden !important',
        whiteSpace: 'pre-wrap !important',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere'
      }
    }}
  />
</Box>

            <Box sx={{ flex: 1, minWidth: 0, p: 3, overflow: 'auto', bgcolor: 'rgba(255,255,255,0.94)', '& h1': { fontSize: '2.4rem', fontWeight: 800, mb: 2, color: '#111827', lineHeight: 1.2 }, '& h2': { fontSize: '1.8rem', fontWeight: 700, mt: 4, mb: 2, color: '#1f2937', borderBottom: '2px solid rgba(37, 99, 235, 0.18)', pb: 1 }, '& h3': { fontSize: '1.3rem', fontWeight: 700, mt: 3, mb: 1.5, color: '#374151' }, '& p': { lineHeight: 1.9, marginBottom: '16px', color: '#374151', fontSize: '15px' }, '& ul, & ol': { paddingLeft: '28px', marginBottom: '16px', color: '#374151' }, '& li': { marginBottom: '8px', lineHeight: 1.8 }, '& strong': { fontWeight: 700, color: '#111827' }, '& blockquote': { borderLeft: '4px solid #3b82f6', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px', marginTop: '16px', marginBottom: '16px', backgroundColor: '#f8fafc', color: '#475569' }, '& table': { width: '100%', borderCollapse: 'collapse', marginTop: '20px', marginBottom: '20px' }, '& th': { border: '1px solid rgba(15, 23, 42, 0.08)', padding: '12px', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 700 }, '& td': { border: '1px solid rgba(15, 23, 42, 0.08)', padding: '12px' }, '& code': { fontFamily: '"Fira Code", monospace', fontSize: '14px' }, '& pre': { backgroundColor: '#0f172a', color: '#e2e8f0', padding: '20px', borderRadius: '14px', overflowX: 'auto', overflowY: 'hidden', fontSize: '14px', lineHeight: 1.8, marginTop: '20px', marginBottom: '20px', border: '1px solid #1e293b', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', whiteSpace: 'pre' }, '& pre code': { backgroundColor: 'transparent', color: 'inherit', padding: 0, fontSize: '14px', whiteSpace: 'pre', display: 'block' }, '& :not(pre) > code': { backgroundColor: '#f1f5f9', color: '#e11d48', padding: '2px 6px', borderRadius: '6px', fontSize: '13px' } }}
            >
              <MarkdownPreview content={deferredGeneratedContent} />
            </Box>
          </Box>
        </Stack>
      );
    }

    return (
      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(15, 23, 42, 0.08)' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          Generate content to preview markdown
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', bgcolor: '#F5F7FB' }}>
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#FCFCFD', overflow: 'hidden', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.08)', border: '1px solid rgba(255,255,255,0.34)' }}>
          <Box sx={{ pb: 2, mb: 3, borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
              <Box>
                
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.5rem', mt: 0.5 }}>
                  {unitName || 'Learning Unit'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center" flexShrink={0}>
                
                <EntityActionsMenu onRename={handleRename} onDuplicate={handleDuplicate} onDelete={() => setDeleteOpen(true)} />
              </Stack>
            </Stack>
          </Box>

          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2.5, borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }} variant="scrollable" scrollButtons="auto">
            <Tab value="editor" label="EDITOR" sx={{ fontSize: { xs: '0.875rem', sm: '0.89rem' } }} />
            <Tab value="preview" label="PREVIEW" sx={{ fontSize: { xs: '0.875rem', sm: '0.89rem' } }} />
            <Tab value="quiz" label="QUIZ" sx={{ fontSize: { xs: '0.875rem', sm: '0.89rem' } }} />
          </Tabs>

          <TabPanel activeTab={activeTab} value="editor">
            <Stack spacing={3}>
              {/* SECTION 1: BASIC INFORMATION */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.5)', border: '2px solid rgba(15, 23, 42, 0.06)', '&:hover': { border: '2px solid rgba(15, 23, 42, 0.08)' }, transition: 'all 0.2s' }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 0.5 }}>
                      Basic Information
                    </Typography>
                    
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography component="label" sx={{ fontWeight: 600, fontSize: '1.025rem', color: 'text.secondary' }}>
                          Learning Unit Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                        </Typography>
                        <TextField
                          inputRef={unitNameRef}
                          value={unitName}
                          onChange={(event) => setUnitName(event.target.value)}
                          fullWidth
                          placeholder="Enter an engaging title for this learning unit"
                          error={isUnitNameEmpty && step === 'input'}
                          helperText={isUnitNameEmpty && step === 'input' ? 'Learning unit name is required' : ''}
                          size="medium"
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.7)',
                              borderRadius: 1.5,
                              '& fieldset': {
                                borderColor: 'rgba(15, 23, 42, 0.12)',
                                transition: 'all 0.2s'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(15, 23, 42, 0.18)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4696e5',
                                boxShadow: '0 0 0 4px rgba(146, 144, 170, 0.14)'
                              }
                            },

                            '& .MuiOutlinedInput-input': {
                              fontSize: '0.95rem',
                              fontWeight: 500
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography component="label" sx={{ fontWeight: 600, fontSize: '1.025rem', color: 'text.secondary' }}>
                          Duration (minutes) <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                        </Typography>
                        <TextField
                          type="number"
                          value={duration}
                          onChange={(event) => setDuration(Number(event.target.value || 0))}
                          fullWidth
                          placeholder="45"
                          error={isDurationInvalid && step === 'input'}
                          helperText={isDurationInvalid && step === 'input' ? 'Duration must be > 0' : ''}
                          size="medium"
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.7)',
                              borderRadius: 1.5,
                              '& fieldset': {
                                borderColor: 'rgba(15, 23, 42, 0.12)',
                                transition: 'all 0.2s'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(15, 23, 42, 0.18)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4696e5',
                                boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.14)'
                              }
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography component="label" sx={{ fontWeight: 600, fontSize: '1.025rem', color: 'text.secondary' }}>
                      Description
                    </Typography>
                    <TextField
                      value={unitDescription}
                      onChange={(event) => setUnitDescription(event.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="What will learners cover in this unit? (e.g., Key concepts, learning objectives)"
                      size="medium"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          borderRadius: 1.5,
                          '& fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.12)',
                            transition: 'all 0.2s'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.18)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4696e5',
                            boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.14)'
                          }
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* SECTION 2: LEARNING EXPERIENCE */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.5)', border: '2px solid rgba(15, 23, 42, 0.06)', '&:hover': { border: '2px solid rgba(15, 23, 42, 0.08)' }, transition: 'all 0.2s' }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 0.5 }}>
                      Learning Experience
                    </Typography>
                    
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography component="label" sx={{ fontWeight: 600, fontSize: '1.025rem', color: 'text.secondary' }}>
                      Additional Guidance
                    </Typography>
                    <TextField
                      value={guidance}
                      onChange={(event) => setGuidance(event.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Specify tone, difficulty level, target audience, or special instructions for content generation..."
                      size="medium"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          borderRadius: 1.5,
                          '& fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.12)',
                            transition: 'all 0.2s'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.18)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4696e5',
                            boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.14)'
                          }
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography component="label" sx={{ fontWeight: 600, fontSize: '1.025rem', color: 'text.secondary' }}>
                      Learner Journey
                    </Typography>
                    <TextField
                      value={learnerJourney}
                      onChange={(event) => setLearnerJourney(event.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe the learner's path through this unit. How should they progress? What challenges might they face?"
                      size="medium"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          borderRadius: 1.5,
                          '& fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.12)',
                            transition: 'all 0.2s'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.18)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4696e5',
                            boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.14)'
                          }
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* SECTION 3: SUPPORTING MATERIALS */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(15, 23, 42, 0.06)', '&:hover': { border: '1px solid rgba(15, 23, 42, 0.08)' }, transition: 'all 0.2s' }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 0.5 }}>
                      Supporting Materials
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Add resources and artifacts for this learning unit
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label="Add Artifact"
                      placeholder="e.g., Slide Deck, Video Link, Worksheet"
                      value={newArtifactInput}
                      onChange={(event) => setNewArtifactInput(event.target.value)}
                      fullWidth
                      size="medium"
                      variant="outlined"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleAddArtifact();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          borderRadius: 1.5,
                          '& fieldset': {
                            borderColor: 'rgba(15, 23, 42, 0.12)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4696e5',
                            boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.14)'
                          }
                        }
                      }}
                    />
                    <Button variant="contained" onClick={handleAddArtifact} size="large" sx={{ whiteSpace: 'nowrap', textTransform: 'none', fontWeight: 600, px: 3 }}>
                      Add
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
                    {artifacts.map((artifact, index) => (
                      <Chip
                        key={`${artifact}-${index}`}
                        label={artifact}
                        onDelete={() => handleRemoveArtifact(index)}
                        size="medium"
                        sx={{
                          backgroundColor: 'rgba(37, 99, 235, 0.08)',
                          color: 'primary.main',
                          fontWeight: 600,
                          '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.12)' }
                        }}
                      />
                    ))}
                    {artifacts.length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic', pt: 1 }}>
                        No artifacts yet
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Paper>

              {/* SECTION 4: ACTIONS */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04), rgba(15, 118, 110, 0.04))', border: '1px solid rgba(37, 99, 235, 0.12)' }}>
                <Stack spacing={2}>
                  

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => void startGeneration(true)}
                      disabled={!isFormValid || isGenerating}
                      startIcon={isGenerating ? <CircularProgress size={20} /> : undefined}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 1.25,
                        borderRadius: 1.5,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                        '&:hover': { boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)' }
                      }}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Content'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleSaveContent}
                      disabled={isGenerating}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        py: 1.25,
                        borderRadius: 1.5,
                        borderColor: 'rgba(15, 23, 42, 0.2)',
                        '&:hover': {
                          borderColor: 'rgba(15, 23, 42, 0.3)',
                          backgroundColor: 'rgba(15, 23, 42, 0.02)'
                        }
                      }}
                    >
                      Save Draft
                    </Button>
                  </Stack>

                  {generationError && (
                    <Alert severity="error" variant="outlined" sx={{ borderRadius: 1.5 }}>
                      {generationError}
                    </Alert>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </TabPanel>

          <TabPanel activeTab={activeTab} value="preview" render={renderPreviewContent} />

          <TabPanel
            activeTab={activeTab}
            value="quiz"
            render={() => (
              <QuizGenerationPanel
                questions={quizQuestions}
                status={quizGenerationStatus}
                error={quizGenerationError}
                hasGeneratedContent={generatedContent.trim().length > 0}
                onGenerateQuiz={() => void startQuizGeneration()}
              />
            )}
          />
        </Paper>
      </Stack>

      <DeleteConfirmationDialog
        open={deleteOpen}
        title="Delete learning unit?"
        description={`This will remove ${unitName || 'this learning unit'} and its generated content.`}
        confirmLabel="Delete Learning Unit"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={saveOpen}
        autoHideDuration={2200}
        onClose={() => setSaveOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Content saved"
      />
    </Box>
  );
}
