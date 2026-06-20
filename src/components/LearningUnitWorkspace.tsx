import { memo, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  InputBase,
  Paper,
  Popper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { useContent } from '../context/ContentContext';
import { useApiKeyGate } from '../context/ApiKeyGate';
import { generateLearningUnitContent } from '../ai/generate';
import { generateLearningUnitQuiz } from '../ai/generateQuiz';
import { transformLessonContent } from '../ai/transformContent';
import EntityActionsMenu from './EntityActionsMenu';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import QuizGenerationPanel from './QuizGenerationPanel';
import CopilotRail, { type CopilotActionDef } from './CopilotRail';
import CourseAIProfilePanel from './CourseAIProfilePanel';
import { useCourseProfile, buildProfileGuidance, buildQuizProfileGuidance } from '../utils/courseProfile';
import type { QuizQuestion } from '../types';

const AI_GRADIENT = 'linear-gradient(120deg, #5B5BD6 0%, #7C5CFF 55%, #22B8CF 130%)';

type QuizStatus = 'idle' | 'loading' | 'ready' | 'error';

const lessonProseSx = {
  '& h1': { fontSize: '2rem', fontWeight: 800, mb: 2, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.02em' },
  '& h2': { fontSize: '1.5rem', fontWeight: 700, mt: 3.5, mb: 1.5, color: '#1f2937', borderBottom: '1px solid #ECECEE', pb: 0.75 },
  '& h3': { fontSize: '1.2rem', fontWeight: 700, mt: 2.5, mb: 1, color: '#374151' },
  '& p': { lineHeight: 1.8, marginBottom: '14px', color: '#374151', fontSize: '15px' },
  '& ul, & ol': { paddingLeft: '26px', marginBottom: '14px', color: '#374151' },
  '& li': { marginBottom: '6px', lineHeight: 1.7 },
  '& strong': { fontWeight: 700, color: '#111827' },
  '& blockquote': { borderLeft: '3px solid #7C5CFF', paddingLeft: '16px', py: '4px', my: '16px', backgroundColor: '#FAFAFC', color: '#475569' },
  '& table': { width: '100%', borderCollapse: 'collapse', my: '18px' },
  '& th': { border: '1px solid #ECECEE', padding: '10px', backgroundColor: '#F6F6F7', textAlign: 'left', fontWeight: 700 },
  '& td': { border: '1px solid #ECECEE', padding: '10px' },
  '& code': { fontFamily: '"Fira Code", monospace', fontSize: '13.5px' },
  '& pre': { backgroundColor: '#0f172a', color: '#e2e8f0', padding: '18px', borderRadius: '12px', overflowX: 'auto', fontSize: '13.5px', lineHeight: 1.7, my: '18px', whiteSpace: 'pre' },
  '& pre code': { backgroundColor: 'transparent', color: 'inherit', padding: 0, whiteSpace: 'pre', display: 'block' },
  '& :not(pre) > code': { backgroundColor: '#F1F5F9', color: '#7C3AED', padding: '2px 6px', borderRadius: '6px', fontSize: '13px' },
} as const;

const SLASH_COMMANDS = [
  { id: 'examples', label: 'Add example', desc: 'Insert concrete examples', keys: 'add example examples' },
  { id: 'project', label: 'Add project', desc: 'Append a hands-on project', keys: 'add project hands on' },
  { id: 'quiz', label: 'Generate quiz', desc: 'Create a quiz from this lesson', keys: 'generate quiz test' },
  { id: 'summarize', label: 'Summarize', desc: 'Add a short TL;DR summary', keys: 'summarize summary tldr' },
  { id: 'rewrite', label: 'Rewrite', desc: 'Rewrite for clarity', keys: 'rewrite improve clarity' },
] as const;

const TRANSFORM_INSTRUCTIONS: Record<string, string> = {
  improve: 'Improve the clarity, flow, and readability of this lesson without changing its scope or meaning.',
  examples: 'Add one or two concrete, illustrative examples in the most relevant sections.',
  advanced: 'Increase the depth and technical rigor of this lesson, assuming more prior knowledge from the learner.',
  project: 'Append a clearly-labelled hands-on practical project section at the end, with step-by-step instructions.',
  summarize: 'Add a concise "Summary" (TL;DR) section near the top that captures the key takeaways.',
  rewrite: 'Rewrite the entire lesson to be clearer and better structured, keeping the same scope and topic.',
  simplify: 'Simplify the language and structure so a beginner can follow it easily, without losing the key points.',
};

const CONTEXT_STRIP_ACTIONS = [
  { id: 'examples', label: 'Add examples' },
  { id: 'project', label: 'Create project' },
  { id: 'simplify', label: 'Simplify' },
  { id: 'advanced', label: 'Make advanced' },
  { id: 'quiz', label: 'Generate quiz' },
] as const;

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

function getHydratedState(selectedLU: any) {
  if (!selectedLU?.lu) {
    return {
      unitName: '', unitDescription: '', duration: 30, artifacts: [] as string[],
      guidance: '', learnerJourney: '', generatedContent: '',
      quizQuestions: [] as QuizQuestion[], quizStatus: 'idle' as QuizStatus,
    };
  }
  const storedContent = selectedLU.lu.generated_content || '';
  const storedQuiz = Array.isArray(selectedLU.lu.questions?.generated_questions)
    ? (selectedLU.lu.questions.generated_questions as QuizQuestion[]) : [];
  return {
    unitName: selectedLU.lu.name?.trim() || 'New Learning Unit',
    unitDescription: selectedLU.lu.description?.trim() || '',
    duration: Number(selectedLU.lu.duration) || 30,
    artifacts: mapLearningUnitArtifacts(selectedLU.lu.artifacts),
    guidance: selectedLU.lu.additional_guidance || '',
    learnerJourney: selectedLU.lu.learner_journey || '',
    generatedContent: storedContent,
    quizQuestions: storedQuiz,
    quizStatus: (storedQuiz.length > 0 ? 'ready' : 'idle') as QuizStatus,
  };
}

const MarkdownPreview = memo(function MarkdownPreview({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || 'No content available'}</ReactMarkdown>;
});

export default function LearningUnitWorkspace() {
  const {
    contentData, selectedLU, selectedCourseId, selectedModuleId,
    getCourse, getModule, updateLearningUnit, deleteLearningUnit,
    duplicateLearningUnit, saveStructure,
  } = useContent();
  const { ensureApiKey } = useApiKeyGate();

  const hydrated = getHydratedState(selectedLU);

  const [unitName, setUnitName] = useState(() => hydrated.unitName);
  const [unitDescription, setUnitDescription] = useState(() => hydrated.unitDescription);
  const [duration, setDuration] = useState(() => hydrated.duration);
  const [artifacts, setArtifacts] = useState<string[]>(() => hydrated.artifacts);
  const [guidance, setGuidance] = useState(() => hydrated.guidance);
  const [learnerJourney, setLearnerJourney] = useState(() => hydrated.learnerJourney);
  const [generatedContent, setGeneratedContent] = useState(() => hydrated.generatedContent);
  const [newArtifactInput, setNewArtifactInput] = useState('');

  const [propsOpen, setPropsOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [copilotBusy, setCopilotBusy] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState('');
  const [recentActions, setRecentActions] = useState<string[]>([]);

  const logAction = (label: string) => setRecentActions(prev => [label, ...prev].slice(0, 5));

  const [quizStatus, setQuizStatus] = useState<QuizStatus>(() => hydrated.quizStatus);
  const [quizError, setQuizError] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => hydrated.quizQuestions);

  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Slash command state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const slashRangeRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const hydratedLuIdRef = useRef<string | null>(null);
  const unitNameRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const streamTimerRef = useRef<number | null>(null);
  const quizSectionRef = useRef<HTMLDivElement | null>(null);
  const autoQuizRef = useRef(false);

  const deferredStream = useDeferredValue(streamText);

  const selectedCourse = useMemo(() => {
    if (!selectedLU?.courseId) return getCourse(selectedCourseId || '');
    return getCourse(selectedLU.courseId);
  }, [getCourse, selectedCourseId, selectedLU?.courseId, contentData.courses.length]);

  const selectedModule = useMemo(() => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId) return selectedCourseId && selectedModuleId ? getModule(selectedCourseId, selectedModuleId) : undefined;
    return getModule(selectedLU.courseId, selectedLU.moduleId);
  }, [getModule, selectedCourseId, selectedModuleId, selectedLU?.courseId, selectedLU?.moduleId, contentData.courses.length]);

  const currentPrompts = contentData.prompts;
  const hasContent = generatedContent.trim().length > 0;
  const [aiProfile] = useCourseProfile(selectedLU?.courseId ?? null);

  const genBaselineRef = useRef('');
  const genSignature = () =>
    [unitName, unitDescription, duration, learnerJourney, guidance, artifacts.join('|')].join('§');
  const currentSignature = useMemo(
    () => [unitName, unitDescription, duration, learnerJourney, guidance, artifacts.join('|')].join('§'),
    [unitName, unitDescription, duration, learnerJourney, guidance, artifacts]
  );
  const isDirty = hasContent && !isStreaming && currentSignature !== genBaselineRef.current;

  // ---- Hydration on LU switch ----------------------------------------------
  useLayoutEffect(() => {
    const next = getHydratedState(selectedLU);
    setUnitName(next.unitName);
    setUnitDescription(next.unitDescription);
    setDuration(next.duration);
    setArtifacts(next.artifacts);
    setGuidance(next.guidance);
    setLearnerJourney(next.learnerJourney);
    setGeneratedContent(next.generatedContent);
    setGenerationError('');
    setNewArtifactInput('');
    setQuizQuestions(next.quizQuestions);
    setQuizStatus(next.quizStatus);
    setQuizError('');
    setIsStreaming(false);
    setStreamText('');
    setCopilotBusy(null);
    setEditingContent(false);
    // Auto-expand Properties for a brand-new, blank lesson so the title, duration
    // and artifacts are ready to edit immediately; keep it collapsed for lessons
    // that already have content.
    const isBlankNewLesson =
      !next.generatedContent?.trim() &&
      !next.unitDescription?.trim() &&
      next.artifacts.length === 0 &&
      (!next.unitName?.trim() || next.unitName.trim() === 'New Learning Unit');
    setPropsOpen(isBlankNewLesson);
    setSlashOpen(false);
    setRecentActions([]);
    hydratedLuIdRef.current = selectedLU?.lu?.id ?? null;
    genBaselineRef.current = [next.unitName, next.unitDescription, next.duration, next.learnerJourney, next.guidance, next.artifacts.join('|')].join('§');
    if (streamTimerRef.current !== null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }, [selectedLU?.courseId, selectedLU?.moduleId, selectedLU?.lu?.id]);

  useEffect(() => () => {
    if (streamTimerRef.current !== null) window.clearInterval(streamTimerRef.current);
  }, []);

  // ---- Autosave field changes ----------------------------------------------
  useEffect(() => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    if (hydratedLuIdRef.current !== selectedLU.lu.id) return;
    if (isStreaming) return;

    const currentArtifacts = mapLearningUnitArtifacts(selectedLU.lu.artifacts);
    const artifactsUnchanged = currentArtifacts.length === artifacts.length && currentArtifacts.every((a, i) => a === artifacts[i]);
    const hasChanges =
      (selectedLU.lu.name?.trim() || 'New Learning Unit') !== unitName ||
      (selectedLU.lu.description?.trim() || '') !== unitDescription ||
      (Number(selectedLU.lu.duration) || 30) !== duration ||
      !artifactsUnchanged ||
      (selectedLU.lu.additional_guidance || '') !== guidance ||
      (selectedLU.lu.learner_journey || '') !== learnerJourney ||
      (selectedLU.lu.generated_content || '') !== generatedContent;

    if (!hasChanges) return;

    updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
      name: unitName,
      description: unitDescription,
      duration,
      artifacts: artifacts.map(a => ({ artifact_type: a, link: '' })),
      additional_guidance: guidance,
      learner_journey: learnerJourney,
      generated_content: generatedContent,
    });
  }, [selectedLU?.courseId, selectedLU?.moduleId, selectedLU?.lu?.id, unitName, unitDescription, duration, guidance, learnerJourney, artifacts, generatedContent, isStreaming, updateLearningUnit]);

  // ---- Streaming reveal (typewriter) ---------------------------------------
  const streamInto = (fullText: string, onDone?: (text: string) => void) => {
    if (streamTimerRef.current !== null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setEditingContent(false);
    setIsStreaming(true);
    setStreamText('');

    const total = fullText.length;
    // Aim for a lively ~2.4s reveal regardless of length.
    const chunk = Math.max(3, Math.ceil(total / 150));
    let cursor = 0;

    streamTimerRef.current = window.setInterval(() => {
      cursor = Math.min(total, cursor + chunk);
      setStreamText(fullText.slice(0, cursor));
      if (cursor >= total) {
        if (streamTimerRef.current !== null) {
          window.clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        setIsStreaming(false);
        setGeneratedContent(fullText);
        onDone?.(fullText);
      }
    }, 16);
  };

  const persistContent = (content: string) => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
      generated_content: content,
      generated_at: new Date().toISOString(),
    });
  };

  // ---- Generate full lesson ------------------------------------------------
  const runGenerate = async (busyId: string, extraInstruction?: string, thenQuiz = false) => {
    if (!selectedLU?.lu || isStreaming || copilotBusy) return;
    if (!unitName.trim() || duration <= 0) {
      setPropsOpen(true);
      setGenerationError('Add a lesson title and a duration greater than 0 first.');
      return;
    }

    if (!(await ensureApiKey())) return;

    setGenerationError('');
    setCopilotBusy(busyId);
    autoQuizRef.current = thenQuiz;
    const sigAtStart = genSignature();

    const combinedGuidance = [buildProfileGuidance(aiProfile), guidance, extraInstruction].filter(Boolean).join('\n\n');

    try {
      const result = await generateLearningUnitContent({
        course: { name: selectedCourse?.name || 'Untitled Course', description: selectedCourse?.description || '', outcomes: selectedCourse?.outcomes || [] },
        module: { name: selectedModule?.name || 'Untitled Module', description: selectedModule?.description || '' },
        learningUnit: {
          name: unitName, description: unitDescription, duration,
          learner_journey: learnerJourney, additional_guidance: combinedGuidance,
          artifacts: artifacts.map(a => ({ artifact_type: a, link: '' })),
        },
        prompts: { content: { systemPrompt: currentPrompts.content?.systemPrompt || '', userPrompt: currentPrompts.content?.userPrompt || '' } },
      });

      if (!result?.success || !result.content?.trim()) {
        setGenerationError(result?.error || 'Generation returned empty content.');
        setCopilotBusy(null);
        return;
      }

      streamInto(result.content, content => {
        persistContent(content);
        genBaselineRef.current = sigAtStart;
        setCopilotBusy(null);
        if (autoQuizRef.current) {
          autoQuizRef.current = false;
          void runQuiz();
        }
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unable to generate lesson content.');
      setCopilotBusy(null);
    }
  };

  // ---- Transform existing lesson -------------------------------------------
  const runTransform = async (busyId: string, instruction: string) => {
    if (isStreaming || copilotBusy) return;
    if (!generatedContent.trim()) {
      setGenerationError('Generate the lesson first, then ask the Copilot to refine it.');
      return;
    }
    if (!(await ensureApiKey())) return;
    setGenerationError('');
    setCopilotBusy(busyId);
    try {
      const result = await transformLessonContent({
        content: generatedContent,
        instruction: [instruction, buildProfileGuidance(aiProfile)].filter(Boolean).join('\n\n'),
        context: { courseName: selectedCourse?.name, moduleName: selectedModule?.name, lessonName: unitName },
      });
      if (!result.success || !result.content.trim()) {
        setGenerationError(result.error || 'The edit could not be applied. Please try again.');
        setCopilotBusy(null);
        return;
      }
      streamInto(result.content, content => {
        persistContent(content);
        setCopilotBusy(null);
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unable to apply the edit.');
      setCopilotBusy(null);
    }
  };

  // ---- Quiz generation ------------------------------------------------------
  const runQuiz = async () => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    if (!generatedContent.trim()) {
      setQuizError('Generate the lesson content before creating a quiz.');
      setQuizStatus('error');
      return;
    }
    if (!(await ensureApiKey())) return;
    setQuizError('');
    setQuizStatus('loading');
    setCopilotBusy('quiz');
    quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const quizConfig = {
      total_questions: selectedLU.lu.questions?.total_questions ?? 5,
      easy: selectedLU.lu.questions?.easy ?? 2,
      medium: selectedLU.lu.questions?.medium ?? 2,
      hard: selectedLU.lu.questions?.hard ?? 1,
    };

    try {
      const result = await generateLearningUnitQuiz({
        course: { name: selectedCourse?.name || 'Untitled Course', description: selectedCourse?.description || '', outcomes: selectedCourse?.outcomes || [] },
        module: { name: selectedModule?.name || 'Untitled Module', description: selectedModule?.description || '' },
        learningUnit: {
          name: unitName, description: unitDescription, duration,
          learner_journey: learnerJourney,
          additional_guidance: [buildQuizProfileGuidance(aiProfile), guidance].filter(Boolean).join('\n\n'),
          generated_content: generatedContent,
          artifacts: artifacts.map(a => ({ artifact_type: a, link: '' })),
          questions: { ...quizConfig, config: quizConfig },
        },
        prompts: { quiz: { systemPrompt: currentPrompts.quiz?.systemPrompt || '', userPrompt: currentPrompts.quiz?.userPrompt || '' } },
      });

      if (!result.success || (result.questions || []).length === 0) {
        setQuizQuestions([]);
        setQuizError(result.error || 'Quiz generation returned no questions.');
        setQuizStatus('error');
        return;
      }

      const nextQuestions = result.questions as QuizQuestion[];
      setQuizQuestions(nextQuestions);
      setQuizStatus('ready');
      updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
        questions: { ...(selectedLU.lu.questions || {}), generated_questions: nextQuestions, generated_at: new Date().toISOString() },
      });
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Unable to generate quiz.');
      setQuizStatus('error');
    } finally {
      setCopilotBusy(prev => (prev === 'quiz' ? null : prev));
    }
  };

  // ---- Copilot action router ------------------------------------------------
  const ACTION_LABELS: Record<string, string> = {
    generate: 'Generated lesson',
    regenerate: 'Regenerated lesson',
    quiz: 'Generated quiz',
    improve: 'Improved writing',
    examples: 'Added examples',
    advanced: 'Made advanced',
    project: 'Added project',
    summarize: 'Summarized',
    rewrite: 'Rewrote lesson',
    simplify: 'Simplified',
  };

  const handleCopilotAction = (id: string) => {
    if (ACTION_LABELS[id]) logAction(ACTION_LABELS[id]);
    switch (id) {
      case 'generate': return void runGenerate('generate');
      case 'regenerate': return void runGenerate('regenerate');
      case 'quiz': return void runQuiz();
      case 'improve':
      case 'examples':
      case 'advanced':
      case 'project':
      case 'summarize':
      case 'rewrite':
      case 'simplify':
        return void runTransform(id, TRANSFORM_INSTRUCTIONS[id]);
      default:
        return;
    }
  };

  const handleAsk = (text: string) => {
    logAction(`Asked: ${text.length > 28 ? text.slice(0, 28) + '…' : text}`);
    void runTransform('ask', text);
  };

  const copilotActions = useMemo<CopilotActionDef[]>(() => {
    if (!hasContent) {
      return [{ id: 'generate', label: 'Generate this lesson', icon: <AutoAwesomeRoundedIcon fontSize="small" />, primary: true }];
    }
    return [
      { id: 'improve', label: 'Improve writing', icon: <AutoFixHighRoundedIcon fontSize="small" />, group: 'Edit content' },
      { id: 'examples', label: 'Add examples', icon: <LightbulbOutlinedIcon fontSize="small" />, group: 'Edit content' },
      { id: 'advanced', label: 'Make advanced', icon: <TrendingUpRoundedIcon fontSize="small" />, group: 'Edit content' },
      { id: 'project', label: 'Add project', icon: <HandymanRoundedIcon fontSize="small" />, group: 'Edit content' },
      { id: 'summarize', label: 'Summarize', icon: <NotesRoundedIcon fontSize="small" />, group: 'Edit content' },
      { id: 'quiz', label: 'Generate quiz', icon: <QuizOutlinedIcon fontSize="small" />, group: 'Assess' },
      { id: 'regenerate', label: 'Regenerate lesson', icon: <RefreshRoundedIcon fontSize="small" />, group: 'Lesson' },
    ];
  }, [hasContent]);

  // ---- Slash commands -------------------------------------------------------
  const filteredSlash = useMemo(() => {
    const q = slashQuery.toLowerCase();
    return SLASH_COMMANDS.filter(cmd => !q || cmd.keys.includes(q) || cmd.label.toLowerCase().includes(q));
  }, [slashQuery]);

  useEffect(() => { setSlashIndex(0); }, [slashQuery]);

  const detectSlash = (value: string, caret: number) => {
    const upto = value.slice(0, caret);
    const match = upto.match(/(?:^|\s)\/([\w-]*)$/);
    if (match) {
      const query = match[1];
      slashRangeRef.current = { start: caret - query.length - 1, end: caret };
      setSlashQuery(query);
      setSlashOpen(true);
    } else {
      setSlashOpen(false);
    }
  };

  const runSlashCommand = (cmdId: string) => {
    const { start, end } = slashRangeRef.current;
    const cleaned = generatedContent.slice(0, start) + generatedContent.slice(end);
    setSlashOpen(false);
    setGeneratedContent(cleaned);

    logAction(cmdId === 'quiz' ? 'Generated quiz' : ACTION_LABELS[cmdId] || `/${cmdId}`);
    if (cmdId === 'quiz') {
      void runQuiz();
      return;
    }
    const instruction = TRANSFORM_INSTRUCTIONS[cmdId];
    if (instruction) {
      // Transform from the cleaned content (without the slash token).
      void (async () => {
        setGenerationError('');
        setCopilotBusy(cmdId);
        try {
          const result = await transformLessonContent({
            content: cleaned,
            instruction: [instruction, buildProfileGuidance(aiProfile)].filter(Boolean).join('\n\n'),
            context: { courseName: selectedCourse?.name, moduleName: selectedModule?.name, lessonName: unitName },
          });
          if (!result.success || !result.content.trim()) {
            setGenerationError(result.error || 'The command could not be applied.');
            setCopilotBusy(null);
            return;
          }
          streamInto(result.content, content => { persistContent(content); setCopilotBusy(null); });
        } catch (error) {
          setGenerationError(error instanceof Error ? error.message : 'Unable to run the command.');
          setCopilotBusy(null);
        }
      })();
    }
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!slashOpen || filteredSlash.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSlashIndex(prev => (prev + 1) % filteredSlash.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSlashIndex(prev => (prev - 1 + filteredSlash.length) % filteredSlash.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runSlashCommand(filteredSlash[slashIndex].id);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setSlashOpen(false);
    }
  };

  // ---- Artifact + meta helpers ---------------------------------------------
  const handleAddArtifact = () => {
    if (newArtifactInput.trim()) {
      setArtifacts(prev => [...prev, newArtifactInput.trim()]);
      setNewArtifactInput('');
    }
  };
  const handleSaveDraft = () => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    updateLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id, {
      name: unitName, description: unitDescription, duration,
      artifacts: artifacts.map(a => ({ artifact_type: a, link: '' })),
      additional_guidance: guidance, learner_journey: learnerJourney,
      generated_content: generatedContent, draft_saved_at: new Date().toISOString(),
    });
    saveStructure();
    setSaveOpen(true);
  };
  const handleDelete = () => {
    if (!selectedLU?.courseId || !selectedLU?.moduleId || !selectedLU?.lu?.id) return;
    deleteLearningUnit(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id);
    setDeleteOpen(false);
  };

  if (!selectedLU?.lu) {
    return (
      <Box sx={{ p: 4, display: 'grid', placeItems: 'center', minHeight: 360, color: 'text.secondary', textAlign: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Select a lesson</Typography>
          <Typography variant="body2" sx={{ mt: 0.75 }}>Pick a lesson from the outline to start creating.</Typography>
        </Box>
      </Box>
    );
  }

  const contextPath = [selectedModule?.name, unitName].filter(Boolean).join(' › ');

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>
      {/* ============ CANVAS (one scroll) ============ */}
      <Box sx={{ flex: 1, minWidth: 0, maxWidth: 860, mx: { xs: 0, lg: 'auto' }, width: '100%' }}>
        {/* Title row */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'primary.main', mb: 0.5 }}>
              Learning Unit
            </Typography>
            <InputBase
              inputRef={unitNameRef}
              value={unitName}
              onChange={e => setUnitName(e.target.value)}
              placeholder="Untitled lesson"
              fullWidth
              sx={{ fontSize: { xs: '1.7rem', md: '2rem' }, fontWeight: 800, letterSpacing: '-0.025em', '& input': { p: 0 } }}
            />
            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} alignItems="center">
              <Chip size="small" label={`${duration || 0} min`} sx={{ bgcolor: 'rgba(91,91,214,0.08)', color: 'primary.dark', fontWeight: 700 }} />
              <Chip size="small" label={hasContent ? 'Lesson ready' : 'Draft'} sx={{ bgcolor: hasContent ? 'rgba(22,163,74,0.10)' : 'rgba(15,23,42,0.06)', color: hasContent ? 'success.dark' : 'text.secondary', fontWeight: 700 }} />
            </Stack>
          </Box>
          <EntityActionsMenu
            onRename={() => unitNameRef.current?.focus()}
            onDuplicate={() => selectedLU.courseId && duplicateLearningUnit?.(selectedLU.courseId, selectedLU.moduleId, selectedLU.lu.id)}
            onDelete={() => setDeleteOpen(true)}
          />
        </Stack>

        {/* ---- Properties (collapsible, inline) ---- */}
        <Box sx={{ mt: 2, border: '1px solid #ECECEE', borderRadius: 2.5, overflow: 'hidden' }}>
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setPropsOpen(o => !o)}
            onKeyDown={e => { if (e.key === 'Enter') setPropsOpen(o => !o); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: '#FAFAFB' } }}
          >
            <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: 'text.secondary', transform: propsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms ease' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Properties</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, flex: 1 }}>
              {duration} min · {artifacts.length} artifact{artifacts.length === 1 ? '' : 's'}
            </Typography>
            {isDirty && (
              <Chip
                size="small"
                label="Changes"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: 'rgba(91,91,214,0.12)', color: 'primary.dark' }}
              />
            )}
          </Box>
          <Collapse in={propsOpen}>
            <Divider />
            <Stack spacing={2} sx={{ p: 2 }}>
              <PropertyRow label="Duration">
                <TextField
                  type="number" size="small" value={duration}
                  onChange={e => setDuration(Number(e.target.value || 0))}
                  sx={{ width: 120 }}
                  InputProps={{ endAdornment: <Typography variant="caption" color="text.secondary">min</Typography> }}
                />
              </PropertyRow>
              <PropertyRow label="Description">
                <TextField fullWidth size="small" multiline minRows={2} value={unitDescription} onChange={e => setUnitDescription(e.target.value)} placeholder="What does this lesson cover?" />
              </PropertyRow>
              <PropertyRow label="Learner journey">
                <TextField fullWidth size="small" multiline minRows={2} value={learnerJourney} onChange={e => setLearnerJourney(e.target.value)} placeholder="What can the learner do afterwards?" />
              </PropertyRow>
              <PropertyRow label="Guidance">
                <TextField fullWidth size="small" multiline minRows={2} value={guidance} onChange={e => setGuidance(e.target.value)} placeholder="Tone, difficulty, audience notes for the AI…" />
              </PropertyRow>
              <PropertyRow label="Artifacts">
                <Box sx={{ width: '100%' }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth size="small" value={newArtifactInput}
                      onChange={e => setNewArtifactInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddArtifact(); } }}
                      placeholder="e.g. Slides, Video link"
                    />
                    <Button onClick={handleAddArtifact} variant="outlined" size="small">Add</Button>
                  </Stack>
                  {artifacts.length > 0 && (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      {artifacts.map((a, i) => (
                        <Chip key={`${a}-${i}`} label={a} size="small" onDelete={() => setArtifacts(prev => prev.filter((_, idx) => idx !== i))} sx={{ bgcolor: 'rgba(91,91,214,0.08)', color: 'primary.main', fontWeight: 600 }} />
                      ))}
                    </Stack>
                  )}
                </Box>
              </PropertyRow>
              {isDirty ? (
                <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: 'rgba(91,91,214,0.05)', border: '1px solid rgba(91,91,214,0.20)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#5B5BD6', flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Changes detected</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1.5 }}>
                    Regenerate the lesson to apply your updated properties.
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={handleSaveDraft} variant="outlined" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                      Save draft
                    </Button>
                    <Button
                      onClick={() => void runGenerate('regenerate')}
                      variant="contained"
                      size="small"
                      disabled={Boolean(copilotBusy) || isStreaming}
                      startIcon={<RefreshRoundedIcon fontSize="small" />}
                      sx={{ textTransform: 'none', fontWeight: 700, background: AI_GRADIENT, boxShadow: '0 8px 20px -12px rgba(91,91,214,0.7)', '&:hover': { background: AI_GRADIENT, filter: 'brightness(1.05)' } }}
                    >
                      Regenerate lesson
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <Button onClick={handleSaveDraft} variant="text" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>Save draft</Button>
                </Box>
              )}
            </Stack>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ---- Contextual AI action strip ---- */}
        {hasContent && !isStreaming && (
          <Box sx={{ mb: 1.75, p: 1.1, borderRadius: 2.5, border: '1px solid #ECECEE', bgcolor: '#FBFBFC', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pl: 0.5, pr: 0.25 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 17, color: '#5B5BD6' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary' }} noWrap>
                What would you like to improve?
              </Typography>
            </Stack>
            {CONTEXT_STRIP_ACTIONS.map(action => (
              <Chip
                key={action.id}
                label={action.label}
                size="small"
                clickable
                disabled={Boolean(copilotBusy) || isStreaming}
                onClick={() => handleCopilotAction(action.id)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0E3',
                  '&:hover': { bgcolor: 'rgba(91,91,214,0.06)', borderColor: 'rgba(91,91,214,0.30)' },
                }}
              />
            ))}
          </Box>
        )}

        {/* ---- Lesson content ---- */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8 }}>Lesson content</Typography>
          {hasContent && !isStreaming && (
            <Button
              size="small" variant="text"
              startIcon={editingContent ? <VisibilityRoundedIcon fontSize="small" /> : <EditRoundedIcon fontSize="small" />}
              onClick={() => setEditingContent(e => !e)}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              {editingContent ? 'Preview' : 'Edit'}
            </Button>
          )}
        </Stack>

        {generationError && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setGenerationError('')}>
            {generationError}
          </Alert>
        )}

        {/* Streaming view */}
        {isStreaming && (
          <Box sx={{ ...lessonProseSx, position: 'relative' }}>
            <Box component="span" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '15px', lineHeight: 1.8, color: '#374151', fontFamily: 'inherit' }}>
              {deferredStream}
            </Box>
            <Box component="span" sx={{ display: 'inline-block', width: '8px', height: '1.1em', ml: '2px', verticalAlign: 'text-bottom', bgcolor: '#7C5CFF', borderRadius: '1px', animation: 'blink 1s step-end infinite', '@keyframes blink': { '50%': { opacity: 0 } } }} />
          </Box>
        )}

        {/* Empty state — AI suggestions */}
        {!isStreaming && !hasContent && (
          <Box sx={{ border: '1px dashed #E0E0E3', borderRadius: 3, p: { xs: 3, md: 4 }, textAlign: 'center', bgcolor: '#FCFCFD' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>This lesson is a blank canvas</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
              Let the Copilot draft it — it already knows the course and module context.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
              <SuggestionChip primary icon={<AutoAwesomeRoundedIcon fontSize="small" />} label="Generate lesson" busy={copilotBusy === 'generate'} disabled={Boolean(copilotBusy)} onClick={() => { logAction('Generated lesson'); void runGenerate('generate'); }} />
              <SuggestionChip icon={<FlagOutlinedIcon fontSize="small" />} label="Create learning objectives" busy={copilotBusy === 'objectives'} disabled={Boolean(copilotBusy)} onClick={() => { logAction('Created objectives'); void runGenerate('objectives', 'Begin the lesson with a clear "Learning Objectives" section listing what the learner will be able to do.'); }} />
              <SuggestionChip icon={<HandymanRoundedIcon fontSize="small" />} label="Create practical project" busy={copilotBusy === 'projectGen'} disabled={Boolean(copilotBusy)} onClick={() => { logAction('Created project'); void runGenerate('projectGen', 'Structure this lesson primarily as a hands-on, practical project with step-by-step instructions.'); }} />
              <SuggestionChip icon={<QuizOutlinedIcon fontSize="small" />} label="Generate lesson + quiz" busy={copilotBusy === 'genquiz'} disabled={Boolean(copilotBusy)} onClick={() => { logAction('Generated lesson + quiz'); void runGenerate('genquiz', undefined, true); }} />
            </Stack>
          </Box>
        )}

        {/* Editing view (with slash commands) */}
        {!isStreaming && hasContent && editingContent && (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ border: '1px solid #E0E0E3', borderRadius: 2.5, overflow: 'hidden', '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(91,91,214,0.12)' } }}>
              <textarea
                ref={editorRef}
                value={generatedContent}
                onChange={e => { setGeneratedContent(e.target.value); detectSlash(e.target.value, e.target.selectionStart ?? e.target.value.length); }}
                onKeyDown={handleEditorKeyDown}
                onBlur={() => window.setTimeout(() => setSlashOpen(false), 120)}
                placeholder="Write in Markdown… type / for commands"
                style={{ width: '100%', minHeight: 460, border: 'none', outline: 'none', resize: 'vertical', padding: '18px', fontFamily: '"Fira Code", monospace', fontSize: '14px', lineHeight: 1.8, color: '#1f2937', boxSizing: 'border-box' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
              Type <Box component="kbd" sx={{ px: 0.5, py: 0.1, border: '1px solid #E0E0E3', borderRadius: 0.75, bgcolor: '#F6F6F7', fontSize: '0.7rem' }}>/</Box> for commands · changes save automatically
            </Typography>

            <Popper open={slashOpen && filteredSlash.length > 0} anchorEl={editorRef.current} placement="bottom-start" style={{ zIndex: 1500 }}>
              <Paper elevation={0} sx={{ mt: 0.5, width: 280, border: '1px solid #E0E0E3', borderRadius: 2, boxShadow: '0 12px 32px -12px rgba(16,24,40,0.32)', overflow: 'hidden' }}>
                {filteredSlash.map((cmd, i) => (
                  <Box
                    key={cmd.id}
                    onMouseDown={e => { e.preventDefault(); runSlashCommand(cmd.id); }}
                    onMouseEnter={() => setSlashIndex(i)}
                    sx={{ display: 'flex', flexDirection: 'column', px: 1.5, py: 1, cursor: 'pointer', bgcolor: i === slashIndex ? 'rgba(91,91,214,0.08)' : 'transparent' }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>/{cmd.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{cmd.desc}</Typography>
                  </Box>
                ))}
              </Paper>
            </Popper>
          </Box>
        )}

        {/* Rendered view */}
        {!isStreaming && hasContent && !editingContent && (
          <Box sx={lessonProseSx}>
            <MarkdownPreview content={generatedContent} />
          </Box>
        )}

        {/* ---- Quiz section ---- */}
        <Divider sx={{ my: 2 }} />
        <Box ref={quizSectionRef}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8 }}>Quiz</Typography>
          <Box sx={{ mt: 1 }}>
            <QuizGenerationPanel
              questions={quizQuestions}
              status={quizStatus}
              error={quizError}
              hasGeneratedContent={hasContent}
              onGenerateQuiz={() => void runQuiz()}
            />
          </Box>
        </Box>
      </Box>

      {/* ============ COPILOT RAIL ============ */}
      <Box sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0, position: { lg: 'sticky' }, top: 0 }}>
        <CopilotRail
          contextPath={contextPath}
          actions={copilotActions}
          busyActionId={copilotBusy && copilotBusy !== 'ask' ? copilotBusy : null}
          asking={copilotBusy === 'ask'}
          recentActions={recentActions}
          onAction={handleCopilotAction}
          onAsk={handleAsk}
          tuneSlot={selectedLU?.courseId ? <CourseAIProfilePanel courseId={selectedLU.courseId} /> : undefined}
        />
      </Box>

      <DeleteConfirmationDialog
        open={deleteOpen}
        title={`Delete “${unitName || 'Untitled Lesson'}”?`}
        items={['Lesson content', 'Quiz content', 'Generated materials']}
        confirmLabel="Delete lesson"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <Snackbar open={saveOpen} autoHideDuration={2200} onClose={() => setSaveOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message="Draft saved" />
    </Box>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }}>
      <Typography sx={{ width: { sm: 130 }, flexShrink: 0, fontSize: '0.82rem', fontWeight: 600, color: 'text.secondary', pt: { sm: 1 } }}>{label}</Typography>
      <Box sx={{ flex: 1, width: '100%' }}>{children}</Box>
    </Stack>
  );
}

function SuggestionChip({ icon, label, onClick, busy, disabled, primary }: { icon: React.ReactNode; label: string; onClick: () => void; busy?: boolean; disabled?: boolean; primary?: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      startIcon={busy ? undefined : icon}
      variant={primary ? 'contained' : 'outlined'}
      sx={{
        textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2,
        ...(primary
          ? { background: AI_GRADIENT, boxShadow: '0 8px 20px -12px rgba(91,91,214,0.7)', '&:hover': { background: AI_GRADIENT, filter: 'brightness(1.05)' }, '&.Mui-disabled': { background: '#E5E5EA', color: '#A1A1AA' } }
          : { borderColor: '#E0E0E3', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(91,91,214,0.05)' } }),
      }}
    >
      {busy ? 'Working…' : label}
    </Button>
  );
}
