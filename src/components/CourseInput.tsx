import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Stack, Chip, Card, CardContent, Grid, Divider, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useContent } from '../context/ContentContext';
import { validateCourse } from '../utils/validationUtils';

export const CourseInput = () => {
  const { contentData, updateCourse } = useContent();
  const [courseName, setCourseName] = useState('');
  const [courseHld, setCourseHld] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (contentData.course) {
      const nextCourseName = contentData.course.name || '';
      const nextCourseHld = contentData.course.hld || '';
      const nextOutcomes = contentData.course.outcomes || [];

      setCourseName(prev => prev === nextCourseName ? prev : nextCourseName);
      setCourseHld(prev => prev === nextCourseHld ? prev : nextCourseHld);
      setOutcomes(prev => JSON.stringify(prev) === JSON.stringify(nextOutcomes) ? prev : nextOutcomes);
    }
  }, [contentData.course]);

  const handleAddOutcome = () => {
    if (outcomeInput.trim()) {
      setOutcomes(prev => [...prev, outcomeInput.trim()]);
      setOutcomeInput('');
    }
  };

  const handleRemoveOutcome = (index: number) => {
    setOutcomes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const courseData = {
      name: courseName,
      hld: courseHld,
      outcomes: outcomes
    };

    const validation = validateCourse(courseData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    updateCourse(courseData);
    setErrors([]);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Course Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define the course before building learning units.
              </Typography>
            </Box>

            <Divider />

            <Stack spacing={3}>
              <TextField
                label="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                fullWidth
                required
                error={errors.some(e => e.includes('Course name'))}
              />

              <TextField
                label="Course High-Level Description (HLD)"
                value={courseHld}
                onChange={(e) => setCourseHld(e.target.value)}
                fullWidth
                multiline
                rows={4}
                required
                error={errors.some(e => e.includes('HLD'))}
                helperText="Provide a comprehensive overview of the course"
              />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Course Outcomes
                </Typography>

                <Grid container spacing={1.5} alignItems="center">
                  <Grid size={{ xs: 12, sm: 9 }}>
                    <TextField
                      label="Add Outcome"
                      value={outcomeInput}
                      onChange={(e) => setOutcomeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome()}
                      fullWidth
                      error={errors.some(e => e.includes('outcome'))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Button variant="contained" onClick={handleAddOutcome} startIcon={<AddIcon />} fullWidth sx={{ height: '100%' }}>
                      Add
                    </Button>
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {outcomes.map((outcome, index) => (
                    <Chip
                      key={index}
                      label={outcome}
                      onDelete={() => handleRemoveOutcome(index)}
                      deleteIcon={<DeleteIcon />}
                      variant="outlined"
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>

                {outcomes.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    No outcomes added yet. Add at least one course outcome.
                  </Typography>
                )}
              </Box>

              {errors.length > 0 && (
                <Alert severity="error" variant="outlined">
                  <Stack spacing={0.5}>
                    {errors.map((error, index) => (
                      <Typography key={index} variant="body2" color="inherit">
                        {error}
                      </Typography>
                    ))}
                  </Stack>
                </Alert>
              )}

              <Button variant="contained" color="primary" size="large" onClick={handleSave}>
                Save Course Information
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          Course data saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};