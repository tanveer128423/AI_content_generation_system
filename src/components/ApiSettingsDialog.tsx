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
      setStatus({ type: 'error', message: result.error || 'That key didn\u2019t work. Please check it and try again.' });
      setIsSaving(false);
      return;
    }

    setStoredGeminiApiKey(apiKey);
    setStatus({ type: 'success', message: 'Your key is saved and working.' });
    setIsSaving(false);
  };

  const handleRemove = async () => {
    if (isRemoving) {
      return;
    }

    setIsRemoving(true);
    clearStoredGeminiApiKey();
    setStatus({ type: 'success', message: 'Your key has been removed from this device.' });
    setApiKey('');
    setIsRemoving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ pb: 1.25 }}>Your Google AI Key</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              This key lets the app create lessons and quizzes for you. It’s stored only on this device.
            </Typography>
            <Chip
              icon={<VpnKeyOutlinedIcon />}
              label={storedKeyExists ? 'Key added' : 'No key yet'}
              color={storedKeyExists ? 'success' : 'default'}
              variant={storedKeyExists ? 'filled' : 'outlined'}
            />
          </Box>

          <TextField
            label="Add or replace your key"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste your Google AI key here"
            autoComplete="off"
            fullWidth
          />

          {status.type === 'error' && <Alert severity="error">{status.message}</Alert>}
          {status.type === 'success' && <Alert severity="success">{status.message}</Alert>}

          <Divider />

          <Typography variant="body2" color="text.secondary">
            We’ll check the key works before saving it. If you remove the key, you’ll be asked to add one again before creating content.
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
          Remove
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            onClick={handleValidateAndSave}
            disabled={isSaving || !apiKey.trim()}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
          >
            {isSaving ? 'Checking…' : 'Save Key'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}