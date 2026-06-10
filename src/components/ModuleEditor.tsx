import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContent } from '../context/ContentContext';
import EntityActionsMenu from './EntityActionsMenu';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

export default function ModuleEditor() {
  const {
    selectedCourseId,
    selectedModuleId,
    getCourse,
    getModule,
    updateModule,
    addLearningUnit,
    deleteModule,
    duplicateModule,
    saveStructure
  } = useContent();

  const course = useMemo(() => (selectedCourseId ? getCourse(selectedCourseId) : undefined), [getCourse, selectedCourseId]);
  const module = useMemo(
    () => (selectedCourseId && selectedModuleId ? getModule(selectedCourseId, selectedModuleId) : undefined),
    [getModule, selectedCourseId, selectedModuleId]
  );

  const [moduleName, setModuleName] = useState(module?.name ?? '');
  const [moduleDescription, setModuleDescription] = useState(module?.description ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setModuleName(module?.name ?? '');
    setModuleDescription(module?.description ?? '');
  }, [module?.id]);

  if (!course || !module) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.78)', boxShadow: '0 16px 44px rgba(15, 23, 42, 0.08)' }}>
        <Alert severity="info" variant="standard" sx={{ bgcolor: 'rgba(15, 118, 110, 0.06)' }}>
          Add a module to continue.
        </Alert>
      </Paper>
    );
  }

  const handleSave = () => {
    updateModule(course.id, module.id, { id: module.id, name: moduleName, description: moduleDescription });
    saveStructure();
  };

  const handleAddLearningUnit = () => {
    addLearningUnit(course.id, module.id, {
      name: `Learning Unit ${module.learning_units.length + 1}`,
      description: '',
      duration: 30,
      learner_journey: '',
      artifacts: [],
      additional_guidance: '',
      generated_content: ''
    });
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
            {moduleName || 'Untitled Module'}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexShrink={0}>
            <Chip label={`${module.learning_units.length} units`} size="small" sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', fontSize: '0.75rem' }} />
            <Button variant="contained" onClick={handleSave} size="small" sx={{ fontSize: '0.8rem', py: 0.65 }}>
              Save
            </Button>
            <EntityActionsMenu
              onRename={() => nameRef.current?.focus()}
              onDuplicate={duplicateModule ? () => duplicateModule(course.id, module.id) : undefined}
              onDelete={() => setDeleteOpen(true)}
            />
          </Stack>
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 2, borderRadius: 3, border: '1px solid rgba(15, 23, 42, 0.05)' }}>
        <TextField
          inputRef={nameRef}
          label="Module Name"
          value={moduleName}
          onChange={(event) => setModuleName(event.target.value)}
          fullWidth
          placeholder="Enter the module name"
          size="small"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.6)',
              '& fieldset': {
                borderColor: 'rgba(15, 23, 42, 0.08)'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(15, 23, 42, 0.12)'
              }
            }
          }}
        />
        <TextField
          label="Module Description"
          value={moduleDescription}
          onChange={(event) => setModuleDescription(event.target.value)}
          fullWidth
          multiline
          minRows={3}
          placeholder="Describe the module focus"
          size="small"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.6)',
              '& fieldset': {
                borderColor: 'rgba(15, 23, 42, 0.08)'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(15, 23, 42, 0.12)'
              }
            }
          }}
        />
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
          Learning Units
        </Typography>

        {module.learning_units.length === 0 ? (
          <Stack spacing={1} alignItems="flex-start" sx={{ bgcolor: 'rgba(255,255,255,0.3)', p: 1.5, borderRadius: 2.5, border: '1px dashed rgba(15, 23, 42, 0.08)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Create a learning unit to continue.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLearningUnit} size="small" sx={{ fontSize: '0.75rem' }}>
              Add Learning Unit
            </Button>
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignContent: 'flex-start' }}>
            {module.learning_units.map(learningUnit => (
              <Chip 
                key={learningUnit.id} 
                label={learningUnit.name || 'Untitled Learning Unit'} 
                size="small"
                sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', fontSize: '0.75rem', fontWeight: 600 }} 
              />
            ))}
            <Button variant="text" startIcon={<AddIcon />} onClick={handleAddLearningUnit} size="small" sx={{ height: '24px', fontSize: '0.75rem' }}>
              Add
            </Button>
          </Box>
        )}
      </Box>

      <DeleteConfirmationDialog
        open={deleteOpen}
        title="Delete module?"
        description={`This will remove ${module.name || 'this module'} and all nested learning units.`}
        confirmLabel="Delete Module"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteModule(course.id, module.id);
          setDeleteOpen(false);
        }}
      />
    </Stack>
  );
}
