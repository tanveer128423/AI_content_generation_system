import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { clearStoredGeminiApiKey, getStoredGeminiApiKey, setStoredGeminiApiKey } from '../ai/geminiApiKey';
import { validateGeminiApiKey } from '../ai/validateGeminiApiKey';

type ApiSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function ApiSettingsDialog({ open, onClose }: ApiSettingsDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setApiKey('');
    setStatus({ type: 'idle', message: '' });
  }, [open]);

  const storedKeyExists = Boolean(getStoredGeminiApiKey());

  const handleValidateAndSave = async () => {
    if (!apiKey.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    setStatus({ type: 'idle', message: '' });

    const result = await validateGeminiApiKey(apiKey);

    if (!result.valid) {
      setStatus({ type: 'error', message: result.error || 'Invalid Gemini API key.' });
      setIsSaving(false);
      return;
    }

    setStoredGeminiApiKey(apiKey);
    setStatus({ type: 'success', message: 'Gemini API key saved and validated.' });
    setIsSaving(false);
  };

  const handleRemove = async () => {
    if (isRemoving) {
      return;
    }

    setIsRemoving(true);
    clearStoredGeminiApiKey();
    setStatus({ type: 'success', message: 'Gemini API key removed from local storage.' });
    setApiKey('');
    setIsRemoving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ pb: 1.25 }}>API Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Manage the browser-stored Gemini API key used by generation workflows.
            </Typography>
            <Chip
              icon={<VpnKeyOutlinedIcon />}
              label={storedKeyExists ? 'Configured' : 'Not configured'}
              color={storedKeyExists ? 'success' : 'default'}
              variant={storedKeyExists ? 'filled' : 'outlined'}
            />
          </Box>

          <TextField
            label="Replace Gemini API Key"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste a new Gemini API key"
            autoComplete="off"
            fullWidth
          />

          {status.type === 'error' && <Alert severity="error">{status.message}</Alert>}
          {status.type === 'success' && <Alert severity="success">{status.message}</Alert>}

          <Divider />

          <Typography variant="body2" color="text.secondary">
            Validate the replacement key before saving it. Removing the key will return the app to onboarding mode on the next screen update.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between', gap: 1 }}>
        <Button
          color="error"
          onClick={handleRemove}
          disabled={isRemoving || !storedKeyExists}
          startIcon={isRemoving ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
        >
          Remove Key
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            onClick={handleValidateAndSave}
            disabled={isSaving || !apiKey.trim()}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
          >
            {isSaving ? 'Validating...' : 'Validate & Save'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}