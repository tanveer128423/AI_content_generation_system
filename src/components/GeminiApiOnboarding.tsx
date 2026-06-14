import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { setStoredGeminiApiKey } from '../ai/geminiApiKey';
import { validateGeminiApiKey } from '../ai/validateGeminiApiKey';

type GeminiApiOnboardingProps = {
  onKeyValidated: (apiKey: string) => void;
};

const FEATURES = [
  { icon: <MenuBookOutlinedIcon />, title: 'Write lessons', desc: 'Turn an idea into a polished lesson in seconds.' },
  { icon: <QuizOutlinedIcon />, title: 'Build quizzes', desc: 'Generate smart questions from any lesson.' },
  { icon: <ShieldOutlinedIcon />, title: 'Stays private', desc: 'Your key never leaves this device.' }
];

const HELP_STEPS = [
  'Open Google AI Studio (it\u2019s free).',
  'Click \u201cCreate API key\u201d and copy the key.',
  'Paste it here and press Continue.'
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
      setStatus({ type: 'error', message: result.error || 'That key didn\u2019t work. Please check it and try again.' });
      setIsValidating(false);
      return;
    }

    setStatus({ type: 'success', message: 'Success! Taking you in\u2026' });
    const normalizedKey = apiKey.trim();
    setStoredGeminiApiKey(normalizedKey);
    window.setTimeout(() => onKeyValidated(normalizedKey), 450);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        color: '#fff',
        background: 'radial-gradient(1100px 620px at 82% -8%, #1b1b3a 0%, transparent 58%), linear-gradient(165deg, #0b0b12 0%, #111125 60%, #0b0b12 100%)'
      }}
    >
      {/* One quiet accent glow — calm, premium first impression */}
      <Box sx={{ position: 'absolute', top: '-18%', right: '-8%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,91,214,0.28), transparent 64%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Box
        className="rise-in"
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 1120,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          gap: { xs: 3, md: 6 },
          alignItems: 'center'
        }}
      >
        {/* LEFT — hero */}
        <Stack spacing={3.5}>
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ color: '#fff !important' }} />}
            label="AI Course & Quiz Maker"
            sx={{
              alignSelf: 'flex-start',
              fontWeight: 700,
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              height: 36,
              px: 0.5
            }}
          />

          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              fontSize: { xs: '2.6rem', sm: '3.4rem', md: '4rem' }
            }}
          >
            Create courses &amp;
            <br />
            quizzes that feel
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                ml: 1.5,
                background: 'linear-gradient(100deg, #a78bfa, #67e8f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              effortless.
            </Box>
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: { xs: '1rem', md: '1.12rem' }, maxWidth: 520, lineHeight: 1.6 }}>
            Turn a single idea into ready-to-teach lessons and thoughtful quizzes — in minutes. Add a free Google AI key to begin.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
            {FEATURES.map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  flex: 1,
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Box sx={{ display: 'inline-flex', p: 0.9, borderRadius: 2, bgcolor: 'rgba(167,139,250,0.18)', color: '#c4b5fd', mb: 1 }}>
                  {feature.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{feature.title}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', mt: 0.25 }}>{feature.desc}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* RIGHT — glass key card */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 5,
            p: { xs: 3, md: 4 },
            bgcolor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            boxShadow: '0 40px 90px -40px rgba(0,0,0,0.7)'
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: 2.5, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', boxShadow: '0 10px 24px -8px rgba(79,70,229,0.7)' }}>
                <VpnKeyOutlinedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>
                  Add your free key
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
                  One quick step to get started
                </Typography>
              </Box>
            </Box>

            <TextField
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste your Google AI key (AIza...)"
              autoComplete="off"
              fullWidth
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.45)' },
                  '&.Mui-focused fieldset': { borderColor: '#a78bfa' }
                },
                '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 }
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
              sx={{ py: 1.4, fontSize: '1rem' }}
            >
              {isValidating ? 'Checking your key\u2026' : 'Continue'}
            </Button>

            <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.12)' }} />

            <Stack spacing={1.25}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                How to get your free key
              </Typography>
              {HELP_STEPS.map((step, index) => (
                <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: '#fff', bgcolor: 'rgba(167,139,250,0.25)', border: '1px solid rgba(167,139,250,0.5)' }}>
                    {index + 1}
                  </Box>
                  <Typography sx={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.75)' }}>{step}</Typography>
                </Box>
              ))}
              <Link
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                underline="none"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontWeight: 700, color: '#67e8f9', width: 'fit-content', mt: 0.5, '&:hover': { color: '#a5f3fc' } }}
              >
                Open Google AI Studio
                <OpenInNewIcon fontSize="small" />
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
