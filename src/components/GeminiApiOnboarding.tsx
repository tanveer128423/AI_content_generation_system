import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { setStoredGeminiApiKey } from '../ai/geminiApiKey';
import { validateGeminiApiKey } from '../ai/validateGeminiApiKey';
import { ur } from 'zod/v4/locales';

type GeminiApiOnboardingProps = {
  onKeyValidated: (apiKey: string) => void;
};

const HELP_STEPS = [
  'Visit Google AI Studio',
  'Create a Gemini API Key',
  'Paste it here'
];

export default function GeminiApiOnboarding({ onKeyValidated }: GeminiApiOnboardingProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const handleSubmit = async () => {
    if (!apiKey.trim() || isValidating) {
      return;
    }

    setIsValidating(true);
    setStatus({ type: 'idle', message: '' });

    const result = await validateGeminiApiKey(apiKey);

    if (!result.valid) {
      setStatus({ type: 'error', message: result.error || 'Invalid Gemini API key.' });
      setIsValidating(false);
      return;
    }

    setStatus({ type: 'success', message: 'API key validated successfully.' });
    const normalizedKey = apiKey.trim();
    setStoredGeminiApiKey(normalizedKey);
    window.setTimeout(() => onKeyValidated(normalizedKey), 450);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 4, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            border: '1px solid rgba(148,163,184,0.18)',
            bgcolor: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 28px 80px rgba(15,23,42,0.10)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 8% 10%, rgba(59,130,246,0.14), transparent 24%), radial-gradient(circle at 90% 14%, rgba(15,118,110,0.12), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)'
            }}
          />
          <Box sx={{ position: 'relative', p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1.25}>
                <Chip
                  icon={<VpnKeyOutlinedIcon />}
                  label="Bring Your Own Gemini API Key"
                  sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                />
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                  AI-Powered Learning Content &amp; Quiz Generation Platform
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                  Provide your own Gemini API key to unlock content generation, quiz generation, prompt editing, workspace saving, and export workflows.
                </Typography>
              </Stack>

              <Stack spacing={1.5} sx={{ maxWidth: 560 }}>
                <TextField
                  label="Gemini API Key"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Paste your Gemini API key"
                  autoComplete="off"
                  fullWidth
                />

                {status.type === 'error' && <Alert severity="error">{status.message}</Alert>}
                {status.type === 'success' && <Alert severity="success">{status.message}</Alert>}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={isValidating || !apiKey.trim()}
                  startIcon={isValidating ? <CircularProgress size={18} color="inherit" /> : undefined}
                  sx={{ alignSelf: 'flex-start', minWidth: 220 }}
                >
                  {isValidating ? 'Validating...' : 'Validate & Continue'}
                </Button>
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(248,250,252,0.8)',
                  borderColor: 'rgba(148,163,184,0.25)'
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Help
                  </Typography>
                  <Stack spacing={0.75}>
                    {HELP_STEPS.map((step, index) => (
                      <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip label={index + 1} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                        <Typography variant="body2">{step}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Link
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontWeight: 700, width: 'fit-content' }}
                  >
                    Visit Google AI Studio
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}