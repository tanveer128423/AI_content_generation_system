import { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { hasStoredGeminiApiKey, setStoredGeminiApiKey } from '../ai/geminiApiKey';
import { validateGeminiApiKey } from '../ai/validateGeminiApiKey';

interface ApiKeyGateValue {
  /**
   * Ensures a Gemini API key is available before a generation runs.
   * Resolves immediately to `true` if a key is already stored. Otherwise it
   * opens the key dialog and resolves `true` once a valid key is saved, or
   * `false` if the user dismisses it.
   */
  ensureApiKey: () => Promise<boolean>;
}

const ApiKeyGateContext = createContext<ApiKeyGateValue | undefined>(undefined);

export const useApiKeyGate = () => {
  const context = useContext(ApiKeyGateContext);
  if (!context) {
    throw new Error('useApiKeyGate must be used within ApiKeyGateProvider');
  }
  return context;
};

const HELP_STEPS = [
  'Open Google AI Studio (it\u2019s free).',
  'Click \u201cCreate API key\u201d and copy the key.',
  'Paste it here and press Continue.',
];

export function ApiKeyGateProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const ensureApiKey = useCallback(() => {
    if (hasStoredGeminiApiKey()) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
      setApiKey('');
      setStatus({ type: 'idle', message: '' });
      setIsValidating(false);
      setOpen(true);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setOpen(false);
    setIsValidating(false);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!apiKey.trim() || isValidating) {
      return;
    }

    setIsValidating(true);
    setStatus({ type: 'idle', message: '' });

    const result = await validateGeminiApiKey(apiKey);

    if (!result.valid) {
      setStatus({ type: 'error', message: result.error || 'That key didn\u2019t work. Please check it and try again.' });
      setIsValidating(false);
      return;
    }

    const normalizedKey = apiKey.trim();
    setStoredGeminiApiKey(normalizedKey);
    setStatus({ type: 'success', message: 'Key saved! Starting generation\u2026' });
    window.setTimeout(() => settle(true), 350);
  }, [apiKey, isValidating, settle]);

  const handleClose = useCallback(() => {
    if (isValidating) return;
    settle(false);
  }, [isValidating, settle]);

  return (
    <ApiKeyGateContext.Provider value={{ ensureApiKey }}>
      {children}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                boxShadow: '0 10px 24px -8px rgba(79,70,229,0.7)',
                flexShrink: 0,
              }}
            >
              <VpnKeyOutlinedIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                Add your free key to generate
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                One quick step — it stays on this device.
              </Typography>
            </Box>
            <IconButton onClick={handleClose} disabled={isValidating} size="small" sx={{ color: 'text.secondary' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              type="password"
              value={apiKey}
              onChange={event => setApiKey(event.target.value)}
              placeholder="Paste your Google AI key (AIza...)"
              autoComplete="off"
              autoFocus
              fullWidth
              size="small"
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />

            {status.type === 'error' && <Alert severity="error" sx={{ borderRadius: 2 }}>{status.message}</Alert>}
            {status.type === 'success' && <Alert severity="success" sx={{ borderRadius: 2 }}>{status.message}</Alert>}

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={isValidating || !apiKey.trim()}
              endIcon={isValidating ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}
              fullWidth
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              {isValidating ? 'Checking your key\u2026' : 'Continue'}
            </Button>

            <Box sx={{ height: '1px', bgcolor: 'divider' }} />

            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>How to get your free key</Typography>
              {HELP_STEPS.map((step, index) => (
                <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'primary.main',
                      bgcolor: 'rgba(79,70,229,0.1)',
                      border: '1px solid rgba(79,70,229,0.25)',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>{step}</Typography>
                </Box>
              ))}
              <Link
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                underline="none"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, width: 'fit-content', mt: 0.5 }}
              >
                Open Google AI Studio
                <OpenInNewIcon fontSize="small" />
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </ApiKeyGateContext.Provider>
  );
}
