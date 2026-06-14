import { useState } from 'react';
import { Box, Button, CircularProgress, Collapse, InputBase, Stack, Tooltip, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

const AI_GRADIENT = 'linear-gradient(120deg, #5B5BD6 0%, #7C5CFF 55%, #22B8CF 130%)';

export interface CopilotActionDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  disabled?: boolean;
  hint?: string;
  group?: string;
}

interface CopilotRailProps {
  contextPath: string;
  actions: CopilotActionDef[];
  busyActionId: string | null;
  asking: boolean;
  recentActions?: string[];
  onAction: (id: string) => void;
  onAsk: (text: string) => void;
  tuneSlot?: React.ReactNode;
}

export default function CopilotRail({
  contextPath,
  actions,
  busyActionId,
  asking,
  recentActions = [],
  onAction,
  onAsk,
  tuneSlot,
}: CopilotRailProps) {
  const [draft, setDraft] = useState('');
  const [tuneOpen, setTuneOpen] = useState(false);
  const anyBusy = Boolean(busyActionId) || asking;

  const primaryActions = actions.filter(a => a.primary);
  const rest = actions.filter(a => !a.primary);
  const groupOrder: string[] = [];
  const grouped: Record<string, CopilotActionDef[]> = {};
  rest.forEach(action => {
    const group = action.group || 'Actions';
    if (!grouped[group]) {
      grouped[group] = [];
      groupOrder.push(group);
    }
    grouped[group].push(action);
  });

  const submitAsk = () => {
    const text = draft.trim();
    if (!text || anyBusy) return;
    onAsk(text);
    setDraft('');
  };

  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: 0,
        alignSelf: 'flex-start',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FBFBFC',
        border: '1px solid #ECECEE',
        borderRadius: 3,
        overflow: 'hidden',
        minHeight: { lg: 480 },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.75, borderBottom: '1px solid #ECECEE' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: AI_GRADIENT,
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.96rem' }}>Copilot</Typography>
        </Stack>
        <Tooltip title="The Copilot already knows this lesson — just tell it what to do.">
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: 'block', mt: 0.75, fontWeight: 500 }}
          >
            {contextPath || 'No lesson selected'}
          </Typography>
        </Tooltip>
      </Box>

      {/* Actions */}
      <Box sx={{ p: 1.25, flex: 1, overflowY: 'auto' }}>
        {primaryActions.map(action => {
          const isBusy = busyActionId === action.id;
          const disabled = Boolean(action.disabled) || (anyBusy && !isBusy);
          return (
            <Button
              key={action.id}
              fullWidth
              variant="contained"
              disabled={disabled}
              onClick={() => onAction(action.id)}
              startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : action.icon}
              sx={{
                justifyContent: 'flex-start',
                background: AI_GRADIENT,
                fontWeight: 700,
                py: 1.1,
                mb: 0.5,
                boxShadow: '0 8px 20px -12px rgba(91,91,214,0.7)',
                '&:hover': { background: AI_GRADIENT, filter: 'brightness(1.05)' },
                '&.Mui-disabled': { background: '#E5E5EA', color: '#A1A1AA' },
              }}
            >
              {action.label}
            </Button>
          );
        })}

        {groupOrder.length > 0 && (
          <Typography variant="overline" sx={{ px: 0.5, mt: 1, display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.64rem' }}>
            Suggestions
          </Typography>
        )}
        {groupOrder.map(group => (
          <Box key={group} sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ px: 0.5, color: 'text.disabled', fontWeight: 700, fontSize: '0.66rem' }}>
              {group}
            </Typography>
            <Stack spacing={0.25} sx={{ mt: 0.25 }}>
              {grouped[group].map(action => {
                const isBusy = busyActionId === action.id;
                const disabled = Boolean(action.disabled) || (anyBusy && !isBusy);
                return (
                  <Box
                    key={action.id}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && onAction(action.id)}
                    onKeyDown={e => {
                      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onAction(action.id);
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.1,
                      px: 1,
                      py: 0.7,
                      borderRadius: 2,
                      cursor: disabled ? 'default' : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      border: '1px solid transparent',
                      transition: 'background-color 140ms ease, border-color 140ms ease',
                      '&:hover': disabled ? {} : { bgcolor: 'rgba(91,91,214,0.06)', borderColor: 'rgba(91,91,214,0.18)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1.75,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: '#5B5BD6',
                        bgcolor: 'rgba(91,91,214,0.10)',
                      }}
                    >
                      {isBusy ? <CircularProgress size={15} /> : action.icon}
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, flex: 1, color: 'text.primary' }}>
                      {action.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Recent actions */}
      {recentActions.length > 0 && (
        <Box sx={{ px: 1.75, pb: 1.25, borderTop: '1px solid #ECECEE', pt: 1.25 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.64rem' }}>
            Recent
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {recentActions.map((label, index) => (
              <Stack key={`${label}-${index}`} direction="row" spacing={0.75} alignItems="center">
                <CheckRoundedIcon sx={{ fontSize: 14, color: '#16A34A', flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" noWrap>{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Tune AI (course profile / memory) */}
      {tuneSlot && (
        <Box sx={{ borderTop: '1px solid #ECECEE' }}>
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setTuneOpen(o => !o)}
            onKeyDown={e => { if (e.key === 'Enter') setTuneOpen(o => !o); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(15,23,42,0.025)' } }}
          >
            <TuneRoundedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', flex: 1 }}>Tune AI</Typography>
            <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: 'text.secondary', transform: tuneOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms ease' }} />
          </Box>
          <Collapse in={tuneOpen}>
            <Box sx={{ px: 1.75, pb: 1.75 }}>{tuneSlot}</Box>
          </Collapse>
        </Box>
      )}

      {/* Chat */}
      <Box sx={{ p: 1.25, borderTop: '1px solid #ECECEE' }}>
        <Typography variant="overline" sx={{ px: 0.5, color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.64rem' }}>
          Chat
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 0.75,
            px: 1,
            py: 0.5,
            borderRadius: 2,
            border: '1px solid #E0E0E3',
            bgcolor: '#FFFFFF',
            '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(91,91,214,0.12)' },
          }}
        >
          <InputBase
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitAsk();
              }
            }}
            placeholder="Ask Copilot to edit…"
            multiline
            maxRows={4}
            disabled={anyBusy}
            sx={{ flex: 1, fontSize: '0.86rem', py: 0.5 }}
          />
          <Tooltip title="Send">
            <span>
              <Button
                onClick={submitAsk}
                disabled={!draft.trim() || anyBusy}
                sx={{ minWidth: 0, p: 0.75, borderRadius: 1.5, color: 'primary.main' }}
              >
                {asking ? <CircularProgress size={16} /> : <SendRoundedIcon sx={{ fontSize: 18 }} />}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
