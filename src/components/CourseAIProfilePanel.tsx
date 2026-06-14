import { Box, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useContent } from '../context/ContentContext';
import {
  DEPTH_OPTIONS,
  QUIZ_DIFFICULTY_OPTIONS,
  QUIZ_STYLE_OPTIONS,
  TEACHING_STYLE_OPTIONS,
  TONE_OPTIONS,
  useCourseProfile,
} from '../utils/courseProfile';

interface CourseAIProfilePanelProps {
  courseId: string;
  showAdvancedLink?: boolean;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      size="small"
      fullWidth
      InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
      sx={{ '& .MuiInputBase-input': { fontSize: '0.84rem', fontWeight: 600 } }}
    >
      {options.map(opt => (
        <MenuItem key={opt} value={opt} sx={{ fontSize: '0.84rem' }}>
          {opt}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function CourseAIProfilePanel({ courseId, showAdvancedLink = true }: CourseAIProfilePanelProps) {
  const [profile, update] = useCourseProfile(courseId);
  const { setCurrentView, setSelectedCourseId, setSelectedModuleId, setSelectedLU, setSelectedNode } = useContent();

  const openRawPrompts = (view: 'content-prompts' | 'quiz-prompts') => {
    setCurrentView(view);
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    setSelectedLU(null);
    setSelectedNode(null);
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        Set this once — every lesson and quiz in this course is generated with it.
      </Typography>

      <TextField
        label="Audience"
        placeholder="e.g. Beginner developers"
        value={profile.audience}
        onChange={e => update({ audience: e.target.value })}
        size="small"
        fullWidth
        InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.84rem' } }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
        <SelectField label="Teaching style" value={profile.teachingStyle} options={TEACHING_STYLE_OPTIONS} onChange={v => update({ teachingStyle: v })} />
        <SelectField label="Tone" value={profile.tone} options={TONE_OPTIONS} onChange={v => update({ tone: v })} />
        <SelectField label="Depth" value={profile.depth} options={DEPTH_OPTIONS} onChange={v => update({ depth: v })} />
        <SelectField label="Quiz difficulty" value={profile.quizDifficulty} options={QUIZ_DIFFICULTY_OPTIONS} onChange={v => update({ quizDifficulty: v })} />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SelectField label="Quiz style" value={profile.quizStyle} options={QUIZ_STYLE_OPTIONS} onChange={v => update({ quizStyle: v })} />
        </Box>
      </Box>

      {showAdvancedLink && (
        <Typography variant="caption" color="text.secondary">
          Power user?{' '}
          <Link component="button" type="button" underline="hover" sx={{ fontSize: 'inherit', fontWeight: 600 }} onClick={() => openRawPrompts('content-prompts')}>
            Edit raw lesson prompt
          </Link>
          {' · '}
          <Link component="button" type="button" underline="hover" sx={{ fontSize: 'inherit', fontWeight: 600 }} onClick={() => openRawPrompts('quiz-prompts')}>
            quiz prompt
          </Link>
        </Typography>
      )}
    </Stack>
  );
}
