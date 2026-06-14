import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  InputBase,
  Stack,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useContent } from '../context/ContentContext';
import { exportWorkflowState } from '../utils/fileOperations';

const AI_GRADIENT = 'linear-gradient(120deg, #5B5BD6 0%, #7C5CFF 55%, #22B8CF 130%)';

interface CommandItem {
  id: string;
  group: 'Actions' | 'Navigate';
  label: string;
  sublabel?: string;
  keywords: string;
  icon: React.ReactNode;
  ai?: boolean;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCreateWithAI: () => void;
  onOpenApiSettings: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  onCreateWithAI,
  onOpenApiSettings,
}: CommandPaletteProps) {
  const {
    contentData,
    addCourse,
    setSelectedCourseId,
    setSelectedModuleId,
    setSelectedLU,
    setSelectedNode,
    setCurrentView,
    setUiState,
    saveStructure,
    selectedCourseId,
    selectedModuleId,
    selectedLU,
    selectedNode,
  } = useContent();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Focus shortly after the dialog mounts.
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const navigateToLesson = (courseId: string, moduleId: string, lu: any) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setSelectedLU({ courseId, moduleId, lu });
    setSelectedNode({ type: 'lu', luId: lu.id });
    setUiState('editing');
  };

  const navigateToModule = (courseId: string, moduleId: string) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setSelectedLU(null);
    setSelectedNode({ type: 'module', courseId, moduleId });
    setUiState('idle');
  };

  const navigateToCourse = (courseId: string) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedLU(null);
    setSelectedNode({ type: 'course', courseId });
    setUiState('idle');
  };

  const items = useMemo<CommandItem[]>(() => {
    const courses = contentData.courses || [];

    const actions: CommandItem[] = [
      {
        id: 'create-ai',
        group: 'Actions',
        label: 'Create a course with AI',
        sublabel: 'Describe a topic, get a full roadmap',
        keywords: 'create course ai generate new prompt',
        icon: <AutoAwesomeRoundedIcon fontSize="small" />,
        ai: true,
        run: () => {
          onClose();
          onCreateWithAI();
        },
      },
      {
        id: 'create-blank',
        group: 'Actions',
        label: 'New blank course',
        sublabel: 'Start from scratch',
        keywords: 'new blank course empty manual',
        icon: <AddRoundedIcon fontSize="small" />,
        run: () => {
          onClose();
          addCourse({ name: `Course ${courses.length + 1}`, description: '', outcomes: [], modules: [] });
        },
      },
      {
        id: 'tune-lesson',
        group: 'Actions',
        label: 'Tune AI · Lesson instructions',
        sublabel: 'Edit the lesson generation prompt',
        keywords: 'tune ai instructions lesson prompt content system user advanced',
        icon: <TuneRoundedIcon fontSize="small" />,
        run: () => {
          onClose();
          setCurrentView('content-prompts');
          setSelectedCourseId(null);
          setSelectedModuleId(null);
          setSelectedLU(null);
          setSelectedNode(null);
          setUiState('idle');
        },
      },
      {
        id: 'tune-quiz',
        group: 'Actions',
        label: 'Tune AI · Quiz instructions',
        sublabel: 'Edit the quiz generation prompt',
        keywords: 'tune ai instructions quiz prompt system user advanced',
        icon: <QuizOutlinedIcon fontSize="small" />,
        run: () => {
          onClose();
          setCurrentView('quiz-prompts');
          setSelectedCourseId(null);
          setSelectedModuleId(null);
          setSelectedLU(null);
          setSelectedNode(null);
          setUiState('idle');
        },
      },
      {
        id: 'save',
        group: 'Actions',
        label: 'Save workspace',
        sublabel: 'Keep your work in this browser',
        keywords: 'save workspace store local',
        icon: <SaveRoundedIcon fontSize="small" />,
        run: () => {
          onClose();
          saveStructure();
        },
      },
      {
        id: 'download',
        group: 'Actions',
        label: 'Download workspace',
        sublabel: 'Export everything as a file',
        keywords: 'download export backup file json',
        icon: <DownloadRoundedIcon fontSize="small" />,
        run: () => {
          onClose();
          exportWorkflowState({
            contentData,
            selectedCourseId,
            selectedModuleId,
            selectedLUId: selectedLU?.lu?.id ?? null,
            selectedNode,
          });
        },
      },
      {
        id: 'api-key',
        group: 'Actions',
        label: 'API key settings',
        sublabel: 'Manage your Gemini API key',
        keywords: 'api key gemini settings byok',
        icon: <VpnKeyOutlinedIcon fontSize="small" />,
        run: () => {
          onClose();
          onOpenApiSettings();
        },
      },
    ];

    const navigation: CommandItem[] = [];
    courses.forEach(course => {
      navigation.push({
        id: `course-${course.id}`,
        group: 'Navigate',
        label: course.name || 'Untitled Course',
        sublabel: 'Course',
        keywords: `course ${course.name}`,
        icon: <SchoolOutlinedIcon fontSize="small" />,
        run: () => {
          onClose();
          navigateToCourse(course.id);
        },
      });

      course.modules.forEach(module => {
        navigation.push({
          id: `module-${module.id}`,
          group: 'Navigate',
          label: module.name || 'Untitled Module',
          sublabel: course.name || 'Untitled Course',
          keywords: `module ${module.name} ${course.name}`,
          icon: <ViewModuleOutlinedIcon fontSize="small" />,
          run: () => {
            onClose();
            navigateToModule(course.id, module.id);
          },
        });

        module.learning_units.forEach(lu => {
          navigation.push({
            id: `lu-${lu.id}`,
            group: 'Navigate',
            label: lu.name || 'Untitled Learning Unit',
            sublabel: `${course.name || 'Course'} › ${module.name || 'Module'}`,
            keywords: `lesson learning unit ${lu.name} ${module.name} ${course.name}`,
            icon: <MenuBookOutlinedIcon fontSize="small" />,
            run: () => {
              onClose();
              navigateToLesson(course.id, module.id, lu);
            },
          });
        });
      });
    });

    return [...actions, ...navigation];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentData, selectedCourseId, selectedModuleId, selectedLU, selectedNode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const tokens = q.split(/\s+/);
    return items.filter(item => {
      const haystack = `${item.label} ${item.sublabel ?? ''} ${item.keywords}`.toLowerCase();
      return tokens.every(token => haystack.includes(token));
    });
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filtered.length]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(prev => (filtered.length ? (prev + 1) % filtered.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(prev => (filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      filtered[activeIndex]?.run();
    }
  };

  let runningIndex = -1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(15,23,42,0.32)', backdropFilter: 'blur(2px)' } } }}
      PaperProps={{
        sx: {
          position: 'absolute',
          top: { xs: 24, sm: 88 },
          m: 0,
          width: '100%',
          borderRadius: 3.5,
          overflow: 'hidden',
          border: '1px solid #E0E0E3',
          boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 32px 64px -24px rgba(16,24,40,0.45)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #ECECEE',
        }}
      >
        <SearchRoundedIcon sx={{ color: 'text.disabled' }} />
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or ask AI…"
          fullWidth
          sx={{ fontSize: '1.02rem' }}
        />
        <Chip label="ESC" size="small" onClick={onClose} sx={{ fontSize: '0.66rem', height: 22, fontWeight: 600 }} />
      </Box>

      <Box ref={listRef} sx={{ maxHeight: 420, overflowY: 'auto', py: 1 }}>
        {filtered.length === 0 && (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No matches for “{query}”.
            </Typography>
          </Box>
        )}

        {(['Actions', 'Navigate'] as const).map(group => {
          const groupItems = filtered.filter(item => item.group === group);
          if (!groupItems.length) return null;

          return (
            <Box key={group} sx={{ mb: 0.5 }}>
              <Typography
                variant="overline"
                sx={{ px: 2, color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.66rem' }}
              >
                {group}
              </Typography>
              <Stack sx={{ px: 1 }}>
                {groupItems.map(item => {
                  runningIndex += 1;
                  const isActive = runningIndex === activeIndex;
                  const itemIndex = runningIndex;

                  return (
                    <Box
                      key={item.id}
                      data-active={isActive ? 'true' : 'false'}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      onClick={() => item.run()}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: isActive ? 'rgba(91,91,214,0.08)' : 'transparent',
                        transition: 'background-color 120ms ease',
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          color: item.ai ? '#fff' : 'text.secondary',
                          background: item.ai ? AI_GRADIENT : 'rgba(15,23,42,0.05)',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                          {item.label}
                        </Typography>
                        {item.sublabel && (
                          <Typography noWrap variant="caption" color="text.secondary">
                            {item.sublabel}
                          </Typography>
                        )}
                      </Box>
                      {isActive && (
                        <Chip
                          label="↵"
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'rgba(91,91,214,0.12)', color: 'primary.dark' }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Dialog>
  );
}
