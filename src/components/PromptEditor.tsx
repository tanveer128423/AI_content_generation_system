import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useContent } from '../context/ContentContext';

interface PromptEditorProps {
  open: boolean;
  onClose: () => void;
}

export default function PromptEditor({ open, onClose }: PromptEditorProps) {
  const { contentData, updatePrompts } = useContent();
  const prompts = contentData.prompts;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: 'hidden',
          bgcolor: 'rgba(255,255,255,0.94)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)',
          backdropFilter: 'blur(24px)'
        }
      }}
    >
      <Box sx={{ px: 3, py: 2.5, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.10), rgba(15, 118, 110, 0.08))', borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.2, color: 'primary.main' }}>
          Prompt Studio
        </Typography>
        <DialogTitle sx={{ p: 0, mt: 0.5 }}>Shared prompt settings</DialogTitle>
        <Typography variant="body2" color="text.secondary">
          Shared prompts used across all learning units.
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>

          <TextField
            label="System Prompt"
            value={prompts.content?.systemPrompt || ''}
            onChange={(event) => updatePrompts({ systemPrompt: event.target.value })}
            fullWidth
            multiline
            minRows={6}
            placeholder="Define the global system instructions for content generation"
          />

          <TextField
            label="User Prompt"
            value={prompts.content?.userPrompt || ''}
            onChange={(event) => updatePrompts({ userPrompt: event.target.value })}
            fullWidth
            multiline
            minRows={8}
            placeholder="Describe the generation request template"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.25, bgcolor: 'rgba(248, 250, 252, 0.92)', borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 999 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
