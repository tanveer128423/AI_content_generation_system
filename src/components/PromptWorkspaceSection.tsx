import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

interface TabPanelProps {
  activeTab: string;
  value: string;
  children: React.ReactNode;
}

export interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

export interface PromptWorkspaceSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  prompts: PromptPair;
  onSave: (patch: Partial<PromptPair>) => void;
  onReset: () => void;
  variables: Array<{ name: string; desc: string }>;
  emptyMessage: string;
}

function PromptTabPanel({ activeTab, value, children }: TabPanelProps) {
  if (activeTab !== value) return null;
  return <>{children}</>;
}

export default function PromptWorkspaceSection({ title, description, icon, prompts, onSave, onReset, variables, emptyMessage }: PromptWorkspaceSectionProps) {
  const [activeTab, setActiveTab] = useState('system');
  const [systemPrompt, setSystemPrompt] = useState(prompts.systemPrompt || '');
  const [userPrompt, setUserPrompt] = useState(prompts.userPrompt || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSystemPrompt(prompts.systemPrompt || '');
    setUserPrompt(prompts.userPrompt || '');
  }, [prompts.systemPrompt, prompts.userPrompt]);

  const handleSave = (patch: Partial<PromptPair>) => {
    onSave(patch);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.80)',
        border: '1px solid rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3, pb: 2.5 }}>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {icon}
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </Box>

      {saved && (
        <Box sx={{ px: 3, pb: 0.5 }}>
          <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
            {title} saved successfully
          </Alert>
        </Box>
      )}

      <Box sx={{ borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              py: 2,
            },
          }}
        >
          <Tab value="system" label="System Prompt" />
          <Tab value="user" label="User Prompt" />
          <Tab value="variables" label="Variables" />
        </Tabs>
      </Box>

      <PromptTabPanel activeTab={activeTab} value="system">
        <Stack spacing={2.5} sx={{ p: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              System Prompt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defines the global instructions and tone for {title.toLowerCase()} generation.
            </Typography>
          </Box>

          <TextField
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            fullWidth
            multiline
            minRows={14}
            placeholder="Enter system prompt..."
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.12)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                lineHeight: 1.6,
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => handleSave({ systemPrompt })}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Save Prompt
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </PromptTabPanel>

      <PromptTabPanel activeTab={activeTab} value="user">
        <Stack spacing={2.5} sx={{ p: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              User Prompt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Describes the request template and how the generation workflow should respond.
            </Typography>
          </Box>

          <TextField
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
            fullWidth
            multiline
            minRows={14}
            placeholder="Enter user prompt..."
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.12)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                lineHeight: 1.6,
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => handleSave({ userPrompt })}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Save Prompt
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </PromptTabPanel>

      <PromptTabPanel activeTab={activeTab} value="variables">
        <Stack spacing={2.5} sx={{ p: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Available Variables
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use these variables in your prompts to reference workspace data during generation.
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.06)', p: 2, borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.12)' }}>
            <Stack spacing={1.5}>
              {variables.map((variable) => (
                <Box key={variable.name} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Chip
                    label={variable.name}
                    size="small"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'primary.main',
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25 }}>
                    {variable.desc}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Card
            sx={{
              p: 2.5,
              bgcolor: 'rgba(251, 146, 60, 0.04)',
              border: '1px solid rgba(251, 146, 60, 0.12)',
            }}
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <InfoOutlinedIcon sx={{ fontSize: 20, color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Handlebars Syntax
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Variables use Handlebars templates. Wrap variable names in double curly braces like{' '}
                    <code style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: 4 }}>
                      {'{{variable}}'}
                    </code>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            </Stack>
          </Card>
        </Stack>
      </PromptTabPanel>
    </Paper>
  );
}
