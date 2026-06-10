import { Box, Button, Collapse, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface QuizExplanationProps {
  explanation: string;
  open: boolean;
  onToggle: () => void;
}

export default function QuizExplanation({ explanation, open, onToggle }: QuizExplanationProps) {
  return (
    <Box sx={{ pt: 0.25 }}>
      <Button
        onClick={onToggle}
        variant="text"
        size="small"
        endIcon={
          <ExpandMoreIcon
            sx={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 180ms ease'
            }}
          />
        }
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          textTransform: 'none',
          fontWeight: 700,
          px: 0,
          minWidth: 0,
          color: 'text.secondary',
          '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          '& .MuiButton-endIcon': { ml: 0.5 }
        }}
      >
        {open ? 'Hide Explanation' : 'Show Explanation'}
      </Button>

      <Collapse in={open} timeout={220} unmountOnExit>
        <Box
          sx={{
            mt: 1,
            p: 1.75,
            borderRadius: 2,
            bgcolor: 'rgba(15, 23, 42, 0.025)',
            border: '1px solid rgba(15, 23, 42, 0.06)'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {explanation}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
