import { memo, useCallback, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  Drawer,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useContent } from '../context/ContentContext';
import ApiSettingsDialog from './ApiSettingsDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { exportWorkflowState } from '../utils/fileOperations';

type NodeStatus = 'complete' | 'inProgress' | 'notStarted';

const STATUS_COLOR: Record<NodeStatus, string> = {
  complete: '#16A34A',
  inProgress: '#5B5BD6',
  notStarted: '#C4C4CC',
};

const SPINE_LEFT = 13;

function moduleStatus(module: any, selectedLuId: string | null): NodeStatus {
  const lus = module?.learning_units || [];
  if (lus.length === 0) return 'notStarted';
  const complete = lus.map((lu: any) => Boolean((lu?.generated_content || '').trim()));
  if (complete.every(Boolean)) return 'complete';
  if (complete.some(Boolean) || lus.some((lu: any) => lu.id === selectedLuId)) return 'inProgress';
  return 'notStarted';
}

function courseProgress(course: any): number {
  let total = 0;
  let done = 0;
  (course?.modules || []).forEach((m: any) => {
    (m?.learning_units || []).forEach((lu: any) => {
      total += 1;
      if ((lu?.generated_content || '').trim()) done += 1;
    });
  });
  return total ? Math.round((done / total) * 100) : 0;
}

/* ------------------------------------------------------------------ */
/* Memoized lesson row — only re-renders when its own props change,    */
/* so switching lessons only repaints the two affected rows.           */
/* ------------------------------------------------------------------ */
interface LessonRowProps {
  courseId: string;
  moduleId: string;
  luId: string;
  name: string;
  isActive: boolean;
  isComplete: boolean;
  onSelect: (courseId: string, moduleId: string, luId: string) => void;
  onDelete: (courseId: string, moduleId: string, luId: string) => void;
}

const LessonRow = memo(function LessonRow({ courseId, moduleId, luId, name, isActive, isComplete, onSelect, onDelete }: LessonRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', '&:hover .lesson-actions': { opacity: 1 } }}>
      {/* node on the spine */}
      <Box sx={{ width: 26, display: 'grid', placeItems: 'center', flexShrink: 0, zIndex: 1 }}>
        {isActive ? (
          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#FBFBFB', display: 'grid', placeItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#5B5BD6', boxShadow: '0 0 0 3px rgba(91,91,214,0.22)' }} />
          </Box>
        ) : (
          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#FBFBFB', display: 'grid', placeItems: 'center' }}>
            {isComplete ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#16A34A' }} />
            ) : (
              <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16, color: '#C4C4CC' }} />
            )}
          </Box>
        )}
      </Box>

      {/* label pill */}
      <Box
        role="button"
        tabIndex={0}
        onClick={() => onSelect(courseId, moduleId, luId)}
        onKeyDown={e => { if (e.key === 'Enter') onSelect(courseId, moduleId, luId); }}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          ml: 0.25,
          px: 1,
          py: 0.5,
          borderRadius: 1.75,
          cursor: 'pointer',
          transition: 'background-color 130ms ease',
          // Active = "the document I'm working on": a soft, solid surface.
          // No border, no accent bar — the glowing node + bold label carry it.
          ...(isActive
            ? { bgcolor: 'rgba(91,91,214,0.10)' }
            : { '&:hover': { bgcolor: 'rgba(15,23,42,0.035)' } }),
        }}
      >
        <Typography
          noWrap
          sx={{
            flex: 1,
            fontSize: isActive ? '0.86rem' : '0.83rem',
            fontWeight: isActive ? 700 : isComplete ? 600 : 500,
            color: isActive ? 'primary.dark' : isComplete ? 'text.primary' : 'text.secondary',
            letterSpacing: isActive ? '-0.01em' : 0,
          }}
        >
          {name || 'Untitled Lesson'}
        </Typography>
        <Box className="lesson-actions" sx={{ opacity: 0, transition: 'opacity 140ms ease' }}>
          <Tooltip title="Delete lesson">
            <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(courseId, moduleId, luId); }}>
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
});

type SidebarProps = {
  width: number;
  onGenerateCourse?: () => void;
  onOpenCommandPalette?: () => void;
};

function Sidebar({ width, onGenerateCourse, onOpenCommandPalette }: SidebarProps) {
  const {
    contentData,
    setSelectedCourseId,
    setSelectedModuleId,
    setSelectedLU,
    setSelectedNode,
    setCurrentView,
    addCourse,
    addModule,
    addLearningUnit,
    getLearningUnit,
    saveStructure,
    selectedCourseId,
    selectedModuleId,
    selectedLU,
    selectedNode,
    setUiState,
    deleteCourse,
    deleteModule,
    deleteLearningUnit,
  } = useContent();

  const [saveOpen, setSaveOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [newAnchor, setNewAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'course' | 'module' | 'lu' | null;
    courseId?: string | null;
    moduleId?: string | null;
    luId?: string | null;
  }>({ open: false, type: null });

  const courses = contentData.courses || [];
  const selectedLuId = selectedLU?.lu?.id ?? null;

  const handleSelectCourse = (courseId: string) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedLU(null);
    setSelectedNode({ type: 'course', courseId });
    setUiState('idle');
  };

  const handleSelectModule = (courseId: string, moduleId: string) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setSelectedLU(null);
    setSelectedNode({ type: 'module', courseId, moduleId });
    setUiState('idle');
  };

  // Stable callbacks so memoized LessonRow children don't re-render on navigation.
  const selectLesson = useCallback((courseId: string, moduleId: string, luId: string) => {
    const lu = getLearningUnit(courseId, moduleId, luId);
    if (!lu) return;
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setSelectedLU({ courseId, moduleId, lu });
    setSelectedNode({ type: 'lu', luId });
    setUiState('editing');
  }, [getLearningUnit, setCurrentView, setSelectedCourseId, setSelectedModuleId, setSelectedLU, setSelectedNode, setUiState]);

  const requestDeleteLesson = useCallback((courseId: string, moduleId: string, luId: string) => {
    setDeleteDialog({ open: true, type: 'lu', courseId, moduleId, luId });
  }, []);

  const handleGenerateWithAI = () => {
    setNewAnchor(null);
    if (onGenerateCourse) return onGenerateCourse();
    addCourse({ name: `Course ${courses.length + 1}`, description: '', outcomes: [], modules: [] });
  };

  const handleAddBlankCourse = () => {
    setNewAnchor(null);
    addCourse({ name: `Course ${courses.length + 1}`, description: '', outcomes: [], modules: [] });
  };

  const handleAddModule = (courseId: string) => {
    const course = courses.find(item => item.id === courseId);
    addModule(courseId, { name: `Module ${(course?.modules?.length || 0) + 1}`, description: '' });
  };

  const handleAddLearningUnit = (courseId: string, moduleId: string) => {
    addLearningUnit(courseId, moduleId, {
      name: 'New Learning Unit',
      description: '',
      duration: 30,
      learner_journey: '',
      artifacts: [],
      additional_guidance: '',
      generated_content: '',
    });
  };

  const deleteMeta = (() => {
    if (deleteDialog.type === 'course') {
      const c = courses.find(x => x.id === deleteDialog.courseId);
      return { title: `Delete “${c?.name || 'Untitled Course'}”?`, items: ['All modules and lessons', 'Generated lesson content', 'Generated quizzes'], confirmLabel: 'Delete course' };
    }
    if (deleteDialog.type === 'module') {
      const c = courses.find(x => x.id === deleteDialog.courseId);
      const m = c?.modules.find(x => x.id === deleteDialog.moduleId);
      return { title: `Delete “${m?.name || 'Untitled Module'}”?`, items: ['All lessons in this module', 'Their generated content & quizzes'], confirmLabel: 'Delete module' };
    }
    if (deleteDialog.type === 'lu') {
      const c = courses.find(x => x.id === deleteDialog.courseId);
      const m = c?.modules.find(x => x.id === deleteDialog.moduleId);
      const lu = m?.learning_units.find(x => x.id === deleteDialog.luId);
      return { title: `Delete “${lu?.name || 'Untitled Lesson'}”?`, items: ['Lesson content', 'Quiz content', 'Generated materials'], confirmLabel: 'Delete lesson' };
    }
    return { title: 'Delete this item?', items: [] as string[], confirmLabel: 'Delete' };
  })();

  function confirmDelete() {
    if (!deleteDialog.type) return;
    if (deleteDialog.type === 'course' && deleteDialog.courseId) deleteCourse?.(deleteDialog.courseId);
    if (deleteDialog.type === 'module' && deleteDialog.courseId && deleteDialog.moduleId) deleteModule?.(deleteDialog.courseId, deleteDialog.moduleId);
    if (deleteDialog.type === 'lu' && deleteDialog.courseId && deleteDialog.moduleId && deleteDialog.luId) deleteLearningUnit?.(deleteDialog.courseId, deleteDialog.moduleId, deleteDialog.luId);
    setDeleteDialog({ open: false, type: null });
  }

  const handleSaveWorkspace = () => {
    saveStructure();
    setSaveOpen(true);
  };

  const handleExportWorkflow = () => {
    const result = exportWorkflowState({
      contentData,
      selectedCourseId,
      selectedModuleId,
      selectedLUId: selectedLU?.lu?.id ?? null,
      selectedNode,
    });
    if (result.success) setExportOpen(true);
  };

  const sidebarWidthCss = `var(--sidebar-width, ${width}px)`;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: sidebarWidthCss,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidthCss,
          boxSizing: 'border-box',
          bgcolor: '#FBFBFB',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* SLIM HEADER */}
      <Box sx={{ px: 1.75, pt: 1.75, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 26, height: 26, borderRadius: 1.5, display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(120deg, #5B5BD6, #7C5CFF 60%, #22B8CF)', flexShrink: 0 }}>
            <SchoolRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.01em', flex: 1 }}>
            AI Course Maker
          </Typography>
          <Tooltip title="New course">
            <IconButton size="small" onClick={e => setNewAnchor(e.currentTarget)} sx={{ border: '1px solid #E0E0E3', borderRadius: 1.5, color: 'primary.main' }}>
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={newAnchor} open={Boolean(newAnchor)} onClose={() => setNewAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} PaperProps={{ sx: { borderRadius: 2, mt: 0.5, minWidth: 200 } }}>
            <MenuItem onClick={handleGenerateWithAI} sx={{ gap: 1.25, fontWeight: 600, fontSize: '0.88rem' }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} /> Create with AI
            </MenuItem>
            <MenuItem onClick={handleAddBlankCourse} sx={{ gap: 1.25, fontSize: '0.88rem' }}>
              <AddIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> Blank course
            </MenuItem>
          </Menu>
        </Stack>

        {onOpenCommandPalette && (
          <Box
            role="button"
            tabIndex={0}
            onClick={onOpenCommandPalette}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenCommandPalette(); } }}
            sx={{
              mt: 1.25,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.1,
              py: 0.7,
              borderRadius: 2,
              cursor: 'pointer',
              border: '1px solid #ECECEE',
              bgcolor: '#FFFFFF',
              color: 'text.secondary',
              transition: 'border-color 140ms ease, background-color 140ms ease',
              '&:hover': { borderColor: '#D8D8DC', bgcolor: '#FCFCFD' },
            }}
          >
            <SearchRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, fontSize: '0.84rem' }}>
              Search or ask AI…
            </Typography>
            <Box component="kbd" sx={{ fontSize: '0.66rem', fontWeight: 700, px: 0.55, py: 0.05, borderRadius: 1, border: '1px solid #E0E0E3', bgcolor: '#F6F6F7', color: 'text.secondary' }}>
              ⌘K
            </Box>
          </Box>
        )}
      </Box>

      {/* ROADMAP — a learning journey */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.25, pt: 0.5, pb: 2 }}>
        {courses.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
            No courses yet. Tap <strong>+</strong> to create one with AI.
          </Typography>
        )}

        <Stack spacing={2.5}>
          {courses.map(course => {
            const progress = courseProgress(course);
            const lessonCount = course.modules.reduce((n, m) => n + m.learning_units.length, 0);
            const isCourseActive = selectedNode?.type === 'course' && selectedNode.courseId === course.id;

            return (
              <Box key={course.id}>
                {/* Course hero card */}
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectCourse(course.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSelectCourse(course.id); }}
                  sx={{
                    px: 1,
                    py: 0.85,
                    borderRadius: 2,
                    cursor: 'pointer',
                    // Lighter, less boxy: no border. Active = soft tint only.
                    bgcolor: isCourseActive ? 'rgba(91,91,214,0.07)' : 'transparent',
                    transition: 'background-color 140ms ease',
                    '&:hover .course-actions': { opacity: 1 },
                    '&:hover': { bgcolor: isCourseActive ? 'rgba(91,91,214,0.07)' : 'rgba(15,23,42,0.03)' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 26, height: 26, borderRadius: 1.75, flexShrink: 0, display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(120deg, #5B5BD6, #7C5CFF 70%, #22B8CF)' }}>
                      <SchoolRoundedIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Typography noWrap sx={{ fontWeight: 800, fontSize: '1rem', flex: 1, letterSpacing: '-0.02em' }}>
                      {course.name || 'Untitled Course'}
                    </Typography>
                    <Stack direction="row" className="course-actions" sx={{ opacity: 0, transition: 'opacity 140ms ease' }}>
                      <Tooltip title="Add module">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); handleAddModule(course.id); }}>
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete course">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, type: 'course', courseId: course.id }); }}>
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ flex: 1, height: 5, borderRadius: 999, bgcolor: 'rgba(15,23,42,0.07)', '& .MuiLinearProgress-bar': { borderRadius: 999, backgroundColor: progress === 100 ? '#16A34A' : '#5B5BD6' } }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: progress === 100 ? '#16A34A' : 'text.secondary' }}>
                      {progress}%
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                      · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                    </Typography>
                  </Stack>
                </Box>

                {/* Modules + lessons on a timeline spine */}
                <Box sx={{ mt: 0.5, ml: 0.5 }}>
                  {course.modules.length === 0 && (
                    <Button onClick={() => handleAddModule(course.id)} size="small" startIcon={<AddIcon sx={{ fontSize: 15 }} />} sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary', fontWeight: 600, ml: 1 }}>
                      Add module
                    </Button>
                  )}

                  {course.modules.map(module => {
                    const mStatus = moduleStatus(module, selectedLuId);

                    return (
                      <Box key={module.id} sx={{ position: 'relative', '&:hover .module-actions': { opacity: 1 } }}>
                        {/* spine connecting module node → lesson nodes */}
                        {module.learning_units.length > 0 && (
                          <Box sx={{ position: 'absolute', left: SPINE_LEFT, top: 18, bottom: 22, width: 2, bgcolor: '#EAEAEE', zIndex: 0 }} />
                        )}

                        {/* Module header on the spine */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.25}
                          onClick={() => handleSelectModule(course.id, module.id)}
                          sx={{ cursor: 'pointer', borderRadius: 1.75, py: 0.5, pr: 0.75, mt: 0.5, '&:hover': { bgcolor: 'rgba(15,23,42,0.025)' } }}
                        >
                          <Box sx={{ width: 26, display: 'grid', placeItems: 'center', flexShrink: 0, zIndex: 1 }}>
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#FBFBFB', display: 'grid', placeItems: 'center' }}>
                              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: STATUS_COLOR[mStatus] }} />
                            </Box>
                          </Box>
                          <Typography noWrap sx={{ flex: 1, fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                            {module.name || 'Untitled Module'}
                          </Typography>
                          <Stack direction="row" className="module-actions" sx={{ opacity: 0, transition: 'opacity 140ms ease' }}>
                            <Tooltip title="Add lesson">
                              <IconButton size="small" onClick={e => { e.stopPropagation(); handleAddLearningUnit(course.id, module.id); }}>
                                <AddIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete module">
                              <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, type: 'module', courseId: course.id, moduleId: module.id }); }}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Lessons */}
                        <Box sx={{ position: 'relative' }}>
                          {module.learning_units.map(lu => (
                            <LessonRow
                              key={lu.id}
                              courseId={course.id}
                              moduleId={module.id}
                              luId={lu.id}
                              name={lu.name}
                              isActive={selectedLuId === lu.id}
                              isComplete={Boolean((lu.generated_content || '').trim())}
                              onSelect={selectLesson}
                              onDelete={requestDeleteLesson}
                            />
                          ))}

                          <Button onClick={() => handleAddLearningUnit(course.id, module.id)} size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.disabled', fontWeight: 600, fontSize: '0.76rem', py: 0.2, ml: '26px', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}>
                            Add lesson
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* SLIM UTILITY FOOTER */}
      <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid #ECECEE' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Save to this browser">
              <IconButton size="small" onClick={handleSaveWorkspace} sx={{ color: 'text.secondary' }}>
                <SaveOutlinedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download as a file">
              <IconButton size="small" onClick={handleExportWorkflow} sx={{ color: 'text.secondary' }}>
                <DownloadRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Tooltip title="API key settings">
            <IconButton size="small" onClick={() => setApiSettingsOpen(true)} sx={{ color: 'text.secondary' }}>
              <VpnKeyOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Snackbar open={saveOpen} autoHideDuration={2200} onClose={() => setSaveOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message="Your work has been saved" />
      <Snackbar open={exportOpen} autoHideDuration={2200} onClose={() => setExportOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message="File downloaded" />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        title={deleteMeta.title}
        items={deleteMeta.items}
        confirmLabel={deleteMeta.confirmLabel}
        onClose={() => setDeleteDialog({ open: false, type: null })}
        onConfirm={confirmDelete}
      />

      <ApiSettingsDialog open={apiSettingsOpen} onClose={() => setApiSettingsOpen(false)} />
    </Drawer>
  );
}

export default memo(Sidebar);
