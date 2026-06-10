import { memo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItemButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RemoveIcon from '@mui/icons-material/Remove';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { useContent } from '../context/ContentContext';
import ApiSettingsDialog from './ApiSettingsDialog';
import { exportWorkflowState } from '../utils/fileOperations';

const treeInteractionSx = {
  '& .MuiTreeItem-content': {
    borderRadius: '10px',
    py: 0.4,
    px: 0.4,
    minHeight: 34,
    transition: 'background-color 140ms ease-out',
    willChange: 'background-color',
  },

  '& .MuiTreeItem-content .MuiTypography-root': {
    transition: 'color 140ms ease-out',
  },

  '& .MuiTreeItem-iconContainer svg': {
    transition: 'color 140ms ease-out, opacity 140ms ease-out',
  },

  '& .MuiTreeItem-content:hover': {
    bgcolor: 'rgba(37,99,235,0.05)',
  },

  // Preserve existing Mui-selected rule in case some code applies that class
  '& .MuiTreeItem-content.Mui-selected': {
    bgcolor: 'rgba(37,99,235,0.10) !important',
  },

  '& .MuiTreeItem-content.Mui-selected:hover': {
    bgcolor: 'rgba(37,99,235,0.12) !important',
  },

  // Also support selection applied via the TreeItem root using aria-selected
  '& [aria-selected="true"] .MuiTreeItem-content': {
    bgcolor: 'rgba(37,99,235,0.10) !important',
  },

  '& [aria-selected="true"] .MuiTreeItem-content:hover': {
    bgcolor: 'rgba(37,99,235,0.12) !important',
  },

  '& .MuiTreeItem-groupTransition': {
    ml: 1.2,
    pl: 1,
    borderLeft: '1px dashed rgba(15,23,42,0.08)',
  },
} as const;

type SidebarProps = {
  width: number;
};

function Sidebar({ width }: SidebarProps) {
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
    saveStructure,
    selectedCourseId,
    selectedModuleId,
    selectedLU,
    selectedNode,
    setUiState,
    updatePrompts,
    deleteCourse,
    deleteModule,
    deleteLearningUnit,
  } = useContent();
  const { currentView } = useContent();

  const handleOpenContentPrompts = () => {
    setCurrentView('content-prompts');
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    setSelectedLU(null);
    setSelectedNode(null);
    setUiState('idle');
  };

  const handleOpenQuizPrompts = () => {
    setCurrentView('quiz-prompts');
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    setSelectedLU(null);
    setSelectedNode(null);
    setUiState('idle');
  };

  const [saveOpen, setSaveOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'course' | 'module' | 'lu' | null;
    courseId?: string | null;
    moduleId?: string | null;
    luId?: string | null;
  }>({ open: false, type: null });

  const courses = contentData.courses || [];

  const handleSelectCourse = (courseId: string) => {
    const course = courses.find((item) => item.id === courseId);

    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedLU(null);

    setSelectedNode({
      type: 'course',
      courseId,
    });

    if (typeof setUiState === 'function') {
      setUiState('idle');
    }
  };

  const handleSelectModule = (courseId: string, moduleId: string) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setSelectedLU(null);

    setSelectedNode({
      type: 'module',
      courseId,
      moduleId,
    });

    if (typeof setUiState === 'function') {
      setUiState('idle');
    }
  };

  const handleSelectLearningUnit = (
    courseId: string,
    moduleId: string,
    lu: any
  ) => {
    setCurrentView('content');
    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);

    setSelectedLU({
      courseId,
      moduleId,
      lu,
    });

    setSelectedNode({
      type: 'lu',
      luId: lu.id,
    });

    if (typeof setUiState === 'function') {
      setUiState('editing');
    }
  };

  const handleAddCourse = () => {
    addCourse({
      name: `Course ${courses.length + 1}`,
      description: '',
      outcomes: [],
      modules: [],
    });
  };

  const handleAddModule = (courseId: string) => {
    const course = courses.find((item) => item.id === courseId);

    addModule(courseId, {
      name: `Module ${(course?.modules?.length || 0) + 1}`,
      description: '',
    });
  };

  function handleDeleteCourse(courseId: string) {
    setDeleteDialog({ open: true, type: 'course', courseId });
  }

  function handleDeleteModule(courseId: string, moduleId: string) {
    setDeleteDialog({ open: true, type: 'module', courseId, moduleId });
  }

  function handleDeleteLearningUnit(courseId: string, moduleId: string, luId: string) {
    setDeleteDialog({ open: true, type: 'lu', courseId, moduleId, luId });
  }

  function confirmDelete() {
    if (!deleteDialog.type) return;

    if (deleteDialog.type === 'course' && deleteDialog.courseId) {
      deleteCourse?.(deleteDialog.courseId);
    }

    if (deleteDialog.type === 'module' && deleteDialog.courseId && deleteDialog.moduleId) {
      deleteModule?.(deleteDialog.courseId, deleteDialog.moduleId);
    }

    if (deleteDialog.type === 'lu' && deleteDialog.courseId && deleteDialog.moduleId && deleteDialog.luId) {
      deleteLearningUnit?.(deleteDialog.courseId, deleteDialog.moduleId, deleteDialog.luId);
    }

    setDeleteDialog({ open: false, type: null });
  }

  function cancelDelete() {
    setDeleteDialog({ open: false, type: null });
  }

  const handleAddLearningUnit = (
    courseId: string,
    moduleId: string
  ) => {
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

  const handleSaveWorkspace = () => {
    saveStructure();
    setSaveOpen(true);
  };

  const handleOpenApiSettings = () => {
    setApiSettingsOpen(true);
  };

  const sidebarWidthCss = `var(--sidebar-width, ${width}px)`;

  const handleExportWorkflow = () => {
    const result = exportWorkflowState({
      contentData,
      selectedCourseId,
      selectedModuleId,
      selectedLUId: selectedLU?.lu?.id ?? null,
      selectedNode,
    });

    if (result.success) {
      setExportOpen(true);
    }
  };

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
          bgcolor: '#f8fafc',
          borderRight: '1px solid rgba(15,23,42,0.06)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(15,23,42,0.05)',
        }}
      >
        <Stack spacing={1.25}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Content Generation Engine
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              BYOK Gemini API key support is enabled locally in your browser.
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={handleOpenApiSettings}
              startIcon={<VpnKeyOutlinedIcon fontSize="small" />}
              sx={{ alignSelf: 'flex-start', textTransform: 'none', px: 0.5 }}
            >
              API Settings
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* TREE VIEW */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1.25,
        }}
      >
        <SimpleTreeView
          defaultExpandedItems={courses.flatMap((course) => [
            `course-${course.id}`,
            ...course.modules.map(
              (module) => `module-${module.id}`
            ),
          ])}
          slots={{
            expandIcon: AddBoxIcon,
            collapseIcon: IndeterminateCheckBoxIcon,
          }}
          sx={{
            ...treeInteractionSx,
          }}
        >
          {courses.map((course) => (
            <TreeItem
              key={course.id}
              itemId={`course-${course.id}`}
              aria-selected={selectedNode?.type === 'course' && selectedNode.courseId === course.id}
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    pr: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      pr: 0.5,
                    }}
                  >
                    <Box
                      onClick={() =>
                        handleSelectCourse(course.id)
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flex: 1,
                        cursor: 'pointer',
                        minWidth: 0,
                      }}
                    >
                      

                      <Typography
                        noWrap
                        sx={{
                          fontWeight: 700,
                          fontSize: '1rem'
                        }}
                      >
                        {course.name || 'Untitled Course'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip title="Add Module">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddModule(course.id);
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Course">
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            border: '1px solid rgba(0,0,0,0.04)',
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.06)' },
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteCourse(course.id);
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              }
            >
              {course.modules.map((module) => (
                <TreeItem
                  key={module.id}
                  itemId={`module-${module.id}`}
                  aria-selected={selectedNode?.type === 'module' && selectedNode.courseId === course.id && selectedNode.moduleId === module.id}
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',
                        width: '100%',
                        pr: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          pr: 0.5,
                        }}
                      >
                        <Box
                          onClick={() =>
                            handleSelectModule(
                              course.id,
                              module.id
                            )
                          }
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flex: 1,
                            cursor: 'pointer',
                            minWidth: 0,
                          }}
                        >
                          

                          <Typography
                            noWrap
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                  
                            }}
                          >
                            {module.name || 'Untitled Module'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <Tooltip title="Add Learning Unit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(event) => {
                                event.stopPropagation();

                                handleAddLearningUnit(
                                  course.id,
                                  module.id
                                );
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Module">
                            <IconButton
                              size="small"
                              color="error"
                              sx={{
                                border: '1px solid rgba(0,0,0,0.04)',
                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.06)' },
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteModule(course.id, module.id);
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  }
                >
                  {module.learning_units.map((lu) => (
                    <TreeItem
                      key={lu.id}
                      itemId={`lu-${lu.id}`}
                      aria-selected={selectedLU?.lu?.id === lu.id}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box
                            onClick={() =>
                              handleSelectLearningUnit(
                                course.id,
                                module.id,
                                lu
                              )
                            }
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                              cursor: 'pointer',
                              py: 0.2,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                }}
                              >
                                {lu.name || 'Untitled Learning Unit'}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {lu.duration || 0} mins
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                            <Tooltip title="Delete Learning Unit">
                              <IconButton
                                size="small"
                                color="error"
                                sx={{
                                  border: '1px solid rgba(0,0,0,0.04)',
                                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.06)' },
                                }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteLearningUnit(course.id, module.id, lu.id);
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeItem>
          ))}
        </SimpleTreeView>

        {/* PROMPTS */}
        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ px: 1.25, pb: 1.25 }}>
          <SimpleTreeView
            defaultExpandedItems={[`prompts-root`]}
            slots={{
              expandIcon: AddBoxIcon,
              collapseIcon: IndeterminateCheckBoxIcon,
            }}
            sx={{
              mt: 0.5,
              ...treeInteractionSx,
            }}
          >
              <TreeItem
                itemId="prompts-root"
                label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Prompt Configuration</Typography>
                </Box>
              }
            >
              <TreeItem
                itemId="prompt-content"
                aria-selected={currentView === 'content-prompts'}
                label={
                  <Box
                    onClick={handleOpenContentPrompts}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      py: 0.4,
                      px: 0.4,
                      minHeight: 34,
                      minWidth: 0,
                    }}
                  >
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                      Content Prompt
                    </Typography>
                  </Box>
                }
              />

              <TreeItem
                itemId="prompt-quiz"
                aria-selected={currentView === 'quiz-prompts'}
                label={
                  <Box
                    onClick={handleOpenQuizPrompts}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      py: 0.4,
                      px: 0.4,
                      minHeight: 34,
                      minWidth: 0,
                    }}
                  >
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                      Quiz Prompt
                    </Typography>
                  </Box>
                }
              />
            </TreeItem>
          </SimpleTreeView>
        </Box>
      </Box>

      {/* FOOTER */}
      <Box sx={{ p: 1.25 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveWorkspace}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              minWidth: 0,
            }}
          >
            Save Workspace
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportWorkflow}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              minWidth: 0,
            }}
          >
            Export Workflow
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={saveOpen}
        autoHideDuration={2200}
        onClose={() => setSaveOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        message="Workspace saved"
      />
      <Snackbar
        open={exportOpen}
        autoHideDuration={2200}
        onClose={() => setExportOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        message="Workflow exported"
      />
      <Dialog open={deleteDialog.open} onClose={cancelDelete} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button color="error" onClick={confirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
        <ApiSettingsDialog open={apiSettingsOpen} onClose={() => setApiSettingsOpen(false)} />
    </Drawer>
  );
}

export default memo(Sidebar);