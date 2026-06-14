import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Breadcrumbs, Container, Stack, Typography } from '@mui/material';
import { useContent } from '../context/ContentContext';
import CourseEditor from './CourseEditor';
import ModuleEditor from './ModuleEditor';
import LearningUnitWorkspace from './LearningUnitWorkspace';
import PromptConfigurationPanel from './PromptConfigurationPanel';
import QuizPromptWorkspace from './QuizPromptWorkspace';
import CourseGenerator from './CourseGenerator';

interface MainWorkspaceProps {
  generatorOpen?: boolean;
  onCloseGenerator?: () => void;
}

function MainWorkspace({ generatorOpen = false, onCloseGenerator }: MainWorkspaceProps) {
  const {
    contentData,
    selectedCourseId,
    selectedModuleId,
    selectedLU,
    selectedNode,
    currentView,
    getCourse,
    getModule,
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

    if (generatorOpen || !contentData.courses.length) {
      return (
        <CourseGenerator
          closable={contentData.courses.length > 0}
          onClose={onCloseGenerator}
        />
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
          {currentView === 'content' && !generatorOpen && breadcrumbItems.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.75,
                  py: 0.75,
                  borderRadius: 999,
                  bgcolor: 'rgba(79,70,229,0.06)',
                  border: '1px solid rgba(79,70,229,0.14)'
                }}
              >
                <Breadcrumbs aria-label="workspace breadcrumb" separator="›" sx={{ '& .MuiBreadcrumbs-ol': { gap: 0.75 }, '& .MuiBreadcrumbs-separator': { color: 'rgba(79,70,229,0.5)' } }}>
                  {breadcrumbItems.map((item, index) => (
                    <Typography
                      key={item.label}
                      variant="body2"
                      sx={{
                        fontWeight: index === breadcrumbItems.length - 1 ? 700 : 500,
                        color: index === breadcrumbItems.length - 1 ? 'primary.dark' : 'text.secondary'
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Breadcrumbs>
              </Box>
            </Box>
          )}

          <Box
            className="rise-in"
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
        </Stack>
      </Container>
    </Box>
  );
}

export default memo(MainWorkspace);
