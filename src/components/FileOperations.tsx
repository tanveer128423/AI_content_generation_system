import { useRef, useState } from 'react';
import { Box, Button, Stack, Typography, Alert, Card, CardContent, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress, Divider } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useContent } from '../context/ContentContext';

export const FileOperations = () => {
  const { saveToFile, loadFromFile, resetData, error, loading } = useContent();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSave = () => {
    const result = saveToFile();
    if (result.success) {
      showSnackbar(`File saved successfully: ${result.filename}`, 'success');
    } else {
      showSnackbar(`Error saving file: ${result.error}`, 'error');
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await loadFromFile(file);
      if (result.success) {
        showSnackbar('File loaded successfully!', 'success');
      } else {
        showSnackbar(`Error loading file: ${result.error}`, 'error');
      }
    }
    event.target.value = '';
  };

  const handleReset = () => {
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    resetData();
    setResetDialogOpen(false);
    showSnackbar('Data reset successfully!', 'success');
  };

  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                File Operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save, load, or reset the full JSON workspace.
              </Typography>
            </Box>

            {loading && <LinearProgress />}

            {error && (
              <Alert severity="error" variant="outlined">
                {error}
              </Alert>
            )}

            <Divider />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                fullWidth
              >
                Save to File
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<FolderOpenIcon />}
                onClick={handleLoadClick}
                disabled={loading}
                fullWidth
              >
                Load from File
              </Button>

              <Button
                variant="outlined"
                color="warning"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={loading}
                fullWidth
              >
                Reset Data
              </Button>
            </Stack>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <Typography variant="caption" color="text.secondary">
              All data is stored in a single JSON file. Save your work regularly!
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset all data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will restore the workspace to its initial state. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmReset} color="warning" variant="contained">
            Reset Data
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};