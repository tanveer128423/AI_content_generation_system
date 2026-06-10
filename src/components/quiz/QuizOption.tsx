import { Box, Typography } from '@mui/material';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';
interface QuizOptionProps {
  letter: string;
  text: string;
  correct: boolean;
}

export default function QuizOption({ letter, text, correct }: QuizOptionProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 1.5,
        px: 2.25,
        py: 2.25,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: correct ? '#262626' : 'rgba(15, 23, 42, 0.08)',
        bgcolor: correct ? '#F0FDF4' : 'rgba(248, 250, 252, 0.96)',
        transition: 'background-color 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          borderColor: correct ? '#262626' : 'rgba(15, 23, 42, 0.14)',
          bgcolor: correct ? '#F0FDF4' : 'rgba(255,255,255,0.98)',
          transform: 'translateY(-1px)',
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)'
        }
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '4px',
          border: '0.15rem solid',
          borderColor:'rgba(15, 23, 42, 0.08) ',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          fontSize: 14,
          fontWeight: 800,
          bgcolor: 'white' ,
          color:'text.secondary'
        }}
      >
        {letter}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontSize: '1.101rem', lineHeight: 1.65, color: 'text.primary' }}>
          {text}
        </Typography>
      </Box>

      {correct && <CheckSharpIcon sx={{ color: 'success.main', fontSize: 20, flexShrink: 0 }} />}
    </Box>
  );
}
