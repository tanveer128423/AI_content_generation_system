import { Box, Stack } from '@mui/material';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import PromptWorkspaceSection from './PromptWorkspaceSection';
import { useContent } from '../context/ContentContext';
import initialData from '../data/data.json';
import { useEffect, useState } from 'react';

const VARIABLE_EXAMPLES = [
  { name: '{{course.name}}', desc: 'Current course name' },
  { name: '{{module.name}}', desc: 'Current module name' },
  { name: '{{learningUnit.name}}', desc: 'Learning unit name' },
  { name: '{{learningUnit.generated_content}}', desc: 'Generated markdown content' },
  { name: '{{learningUnit.questions.config.easy}}', desc: 'Easy question count' },
  { name: '{{learningUnit.questions.config.medium}}', desc: 'Medium question count' },
  { name: '{{learningUnit.questions.config.hard}}', desc: 'Hard question count' },
];

export default function QuizPromptWorkspace() {
  const { contentData, updateQuizPrompts } = useContent();
  const workspacePrompts = contentData.prompts;
  const defaultQuizPrompts = initialData.prompts.quiz ?? { systemPrompt: '', userPrompt: '' };

  const [syncedPrompts, setSyncedPrompts] = useState(() => (
    workspacePrompts?.quiz ?? defaultQuizPrompts
  ));

  useEffect(() => {
  }, [workspacePrompts]);

  useEffect(() => {
    const next = workspacePrompts?.quiz ?? defaultQuizPrompts;
    setSyncedPrompts(next);
  }, [workspacePrompts?.quiz]);

  return (
    <Box sx={{ p: { xs: 0.5, md: 1 }, height: '100%', overflowY: 'auto', bgcolor: 'transparent' }}>
      <Stack spacing={3}>
        <PromptWorkspaceSection
          title="Quiz Instructions"
          description="Advanced (optional). These are the instructions the AI follows when creating quiz questions from a lesson. The defaults work well — only change them if you want different questions."
          icon={<QuizOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
          prompts={syncedPrompts}
          onSave={(patch) => {
            setSyncedPrompts(prev => ({ ...prev, ...(patch as any) }));
            updateQuizPrompts(patch as any);
          }}
          onReset={() => {
            setSyncedPrompts(defaultQuizPrompts);
            updateQuizPrompts(defaultQuizPrompts);
          }}
          variables={VARIABLE_EXAMPLES}
          emptyMessage="Tip: the defaults are a great starting point. You can always reset to them."
        />
      </Stack>
    </Box>
  );
}
