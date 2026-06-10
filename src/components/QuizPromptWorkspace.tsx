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
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', bgcolor: '#f8fafc' }}>
      <Stack spacing={3}>
        <PromptWorkspaceSection
          title="Quiz Prompt"
          description="Configure the dedicated system and user prompts used for quiz generation from generated markdown content."
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
          emptyMessage="These prompts are isolated from content generation and only drive quiz creation."
        />
      </Stack>
    </Box>
  );
}
