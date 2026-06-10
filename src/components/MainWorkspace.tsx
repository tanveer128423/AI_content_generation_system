import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Breadcrumbs, Button, Container, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContent } from '../context/ContentContext';
import CourseEditor from './CourseEditor';
import ModuleEditor from './ModuleEditor';
import LearningUnitWorkspace from './LearningUnitWorkspace';
import PromptConfigurationPanel from './PromptConfigurationPanel';
import QuizPromptWorkspace from './QuizPromptWorkspace';

function MainWorkspace() {
  const {
    contentData,
    selectedCourseId,
    selectedModuleId,
    selectedLU,
    selectedNode,
    currentView,
    getCourse,
    getModule,
    addCourse
  } = useContent();

  const currentCourse = useMemo(() => {
    if (selectedLU?.courseId) return getCourse(selectedLU.courseId);
    if (selectedCourseId) return getCourse(selectedCourseId);
    return contentData.courses[0];
  }, [contentData.courses, getCourse, selectedCourseId, selectedLU?.courseId]);

  const currentModule = useMemo(() => {
    if (!currentCourse) return undefined;
    if (selectedLU?.courseId && selectedLU?.moduleId) return getModule(selectedLU.courseId, selectedLU.moduleId);
    if (selectedNode?.type === 'module' && selectedNode.courseId && selectedNode.moduleId) {
      return getModule(selectedNode.courseId, selectedNode.moduleId);
    }
    if (selectedModuleId) return getModule(currentCourse.id, selectedModuleId);
    return currentCourse.modules[0];
  }, [currentCourse, getModule, selectedModuleId, selectedLU?.courseId, selectedLU?.moduleId, selectedNode]);

  const currentLearningUnit = useMemo(() => {
    if (!currentModule) return undefined;
    if (selectedLU?.courseId && selectedLU?.moduleId && selectedLU?.lu?.id) {
      return getModule(selectedLU.courseId, selectedLU.moduleId)?.learning_units.find(unit => unit.id === selectedLU.lu.id);
    }
    return currentModule.learning_units[0];
  }, [currentModule, getModule, selectedLU?.courseId, selectedLU?.moduleId, selectedLU?.lu?.id]);

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string }> = [];

    if (currentCourse?.name) {
      items.push({ label: currentCourse.name });
    }

    if (selectedNode?.type === 'module' || selectedNode?.type === 'lu') {
      items.push({ label: currentModule?.name || 'Untitled Module' });
    }

    if (selectedNode?.type === 'lu') {
      items.push({ label: currentLearningUnit?.name || 'Untitled Learning Unit' });
    }

    return items;
  }, [currentCourse?.name, currentLearningUnit?.name, currentModule?.name, selectedNode?.type]);

  const [luTransitionPhase, setLuTransitionPhase] = useState<'idle' | 'prepare' | 'enter'>('idle');
  const previousLearningUnitIdRef = useRef<string | undefined>(selectedLU?.lu?.id);
  const transitionFrameRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  const shouldAnimateWorkspace = currentView === 'content' && selectedNode?.type === 'lu';

  useLayoutEffect(() => {
    const nextLearningUnitId = selectedLU?.lu?.id;
    const previousLearningUnitId = previousLearningUnitIdRef.current;

    if (!shouldAnimateWorkspace || !previousLearningUnitId || !nextLearningUnitId || previousLearningUnitId === nextLearningUnitId) {
      previousLearningUnitIdRef.current = nextLearningUnitId;
      return;
    }

    if (transitionFrameRef.current !== null) {
      window.cancelAnimationFrame(transitionFrameRef.current);
      transitionFrameRef.current = null;
    }

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setLuTransitionPhase('prepare');

    transitionFrameRef.current = window.requestAnimationFrame(() => {
      transitionFrameRef.current = null;
      setLuTransitionPhase('enter');

      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null;
        setLuTransitionPhase('idle');
      }, 190);
    });

    previousLearningUnitIdRef.current = nextLearningUnitId;
  }, [selectedLU?.lu?.id, shouldAnimateWorkspace]);

  useLayoutEffect(() => {
    return () => {
      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const renderEditor = () => {
    if (currentView === 'content-prompts') {
      return <PromptConfigurationPanel />;
    }

    if (currentView === 'quiz-prompts') {
      return <QuizPromptWorkspace />;
    }

    if (!contentData.courses.length) {
      return (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Create your first course
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start with a course, then add modules and learning units.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => addCourse({ name: 'Course 1', description: '', outcomes: [], modules: [] })}>
              Add Course
            </Button>
          </Stack>
        </Paper>
      );
    }

    switch (selectedNode?.type) {
      case 'lu':
        return <LearningUnitWorkspace key={selectedLU?.lu?.id || 'no-learning-unit'} />;
      case 'module':
        return <ModuleEditor />;
      case 'course':
      default:
        return <CourseEditor />;
    }
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: 'transparent' }}>
      <Container maxWidth={false} sx={{ py: 3, height: '100%', minHeight: 0 }}>
        <Stack spacing={3} sx={{ height: '100%', minHeight: 0 }}>
          {currentView === 'content' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Breadcrumbs aria-label="workspace breadcrumb" separator="/" sx={{ '& .MuiBreadcrumbs-ol': { gap: 0.75 } }}>
                  {breadcrumbItems.map((item, index) => (
                    <Typography
                      key={item.label}
                      variant="body2"
                      sx={{
                        fontWeight: index === breadcrumbItems.length - 1 ? 700 : 500,
                        color: index === breadcrumbItems.length - 1 ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Breadcrumbs>
              </Box>
              
            </Box>
          )}

          {currentView !== 'content' || contentData.courses.length > 0 ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                transition: shouldAnimateWorkspace ? 'opacity 190ms ease-out, transform 190ms ease-out' : 'none',
                opacity: shouldAnimateWorkspace && luTransitionPhase === 'prepare' ? 0 : 1,
                transform: shouldAnimateWorkspace && luTransitionPhase === 'prepare' ? 'translateY(6px)' : 'translateY(0)',
                willChange: shouldAnimateWorkspace && luTransitionPhase !== 'idle' ? 'opacity, transform' : 'auto'
              }}
            >
              {renderEditor()}
            </Box>
          ) : (
            <Alert severity="info" variant="outlined">
              Create your first course to start building content.
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default memo(MainWorkspace);
