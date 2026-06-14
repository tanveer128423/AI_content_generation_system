import { Box, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

interface QuizOptionProps {
  text: string;
  correct: boolean;
}

export default function QuizOption({ text, correct }: QuizOptionProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.25,
        py: 0.9,
        borderRadius: 2,
        bgcolor: correct ? 'rgba(22,163,74,0.07)' : 'transparent',
        transition: 'background-color 140ms ease',
        '&:hover': { bgcolor: correct ? 'rgba(22,163,74,0.09)' : 'rgba(15,23,42,0.025)' },
      }}
    >
      {correct ? (
        <CheckCircleRoundedIcon sx={{ fontSize: 19, color: '#16A34A', flexShrink: 0, mt: '1px' }} />
      ) : (
        <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 19, color: 'rgba(15,23,42,0.28)', flexShrink: 0, mt: '1px' }} />
      )}
      <Typography
        sx={{
          fontSize: '0.98rem',
          lineHeight: 1.6,
          color: correct ? '#15803D' : 'text.primary',
          fontWeight: correct ? 600 : 400,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
