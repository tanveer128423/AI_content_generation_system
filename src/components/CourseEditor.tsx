import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContent } from '../context/ContentContext';
import EntityActionsMenu from './EntityActionsMenu';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

export default function CourseEditor() {
  const {
    selectedCourseId,
    getCourse,
    updateCourse,
    addModule,
    deleteCourse,
    duplicateCourse,
    saveStructure
  } = useContent();

  const course = useMemo(() => (selectedCourseId ? getCourse(selectedCourseId) : undefined), [getCourse, selectedCourseId]);
  const [courseName, setCourseName] = useState(course?.name ?? '');
  const [courseDescription, setCourseDescription] = useState(course?.description ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCourseName(course?.name ?? '');
    setCourseDescription(course?.description ?? '');
  }, [course?.id]);

  if (!course) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.78)', boxShadow: '0 16px 44px rgba(15, 23, 42, 0.08)' }}>
        <Alert severity="info" variant="standard" sx={{ bgcolor: 'rgba(37, 99, 235, 0.06)' }}>
          Create your first course to start building the hierarchy.
        </Alert>
      </Paper>
    );
  }

  const handleSave = () => {
    updateCourse({ id: course.id, name: courseName, description: courseDescription });
    saveStructure();
  };

  const handleAddModule = () => {
    addModule(course.id, {
      name: `Module ${course.modules.length + 1}`,
      description: ''
    });
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
            {courseName || 'Untitled Course'}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexShrink={0}>
            <Chip label={`${course.modules.length} modules`} size="small" sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', fontSize: '0.75rem' }} />
            <Button variant="contained" onClick={handleSave} size="small" sx={{ fontSize: '0.8rem', py: 0.65 }}>
              Save
            </Button>
            <EntityActionsMenu
              onRename={() => nameRef.current?.focus()}
              onDuplicate={duplicateCourse ? () => duplicateCourse(course.id) : undefined}
              onDelete={() => setDeleteOpen(true)}
            />
          </Stack>
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 2, borderRadius: 3, border: '1px solid rgba(15, 23, 42, 0.05)' }}>
        <TextField
          inputRef={nameRef}
          label="Course Name"
          value={courseName}
          onChange={(event) => setCourseName(event.target.value)}
          fullWidth
          placeholder="Enter the course name"
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
          label="Course Description"
          value={courseDescription}
          onChange={(event) => setCourseDescription(event.target.value)}
          fullWidth
          multiline
          minRows={3}
          placeholder="Describe the course at a high level"
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
          Modules
        </Typography>

        {course.modules.length === 0 ? (
          <Stack spacing={1} alignItems="flex-start" sx={{ bgcolor: 'rgba(255,255,255,0.3)', p: 1.5, borderRadius: 2.5, border: '1px dashed rgba(15, 23, 42, 0.08)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Add a module to continue building this course.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddModule} size="small" sx={{ fontSize: '0.75rem' }}>
              Add Module
            </Button>
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignContent: 'flex-start' }}>
            {course.modules.map(module => (
              <Chip 
                key={module.id} 
                label={module.name || 'Untitled Module'} 
                size="small"
                sx={{ bgcolor: 'rgba(15, 118, 110, 0.08)', fontSize: '0.75rem', fontWeight: 600 }} 
              />
            ))}
            <Button variant="text" startIcon={<AddIcon />} onClick={handleAddModule} size="small" sx={{ height: '24px', fontSize: '0.75rem' }}>
              Add
            </Button>
          </Box>
        )}
      </Box>

      <DeleteConfirmationDialog
        open={deleteOpen}
        title="Delete course?"
        description={`This will remove ${course.name || 'this course'} and all nested modules and learning units.`}
        confirmLabel="Delete Course"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteCourse(course.id);
          setDeleteOpen(false);
        }}
      />
    </Stack>
  );
}
