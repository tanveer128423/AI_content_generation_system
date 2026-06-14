import { Box, Stack } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import PromptWorkspaceSection from './PromptWorkspaceSection';
import { useContent } from '../context/ContentContext';

const VARIABLE_EXAMPLES = [
  { name: '{{course.name}}', desc: 'Current course name' },
  { name: '{{module.name}}', desc: 'Current module name' },
  { name: '{{learningUnit.name}}', desc: 'Learning unit name' },
  { name: '{{learningUnit.description}}', desc: 'Learning unit description' },
  { name: '{{learningUnit.duration}}', desc: 'Learning unit duration in minutes' },
  { name: '{{learningUnit.additional_guidance}}', desc: 'Additional guidance provided' },
];

export default function PromptConfigurationPanel() {
  const { contentData, updatePrompts } = useContent();
  const prompts = contentData.prompts;
  const contentPrompts = prompts.content ?? { systemPrompt: '', userPrompt: '' };

  return (
    <Box sx={{ p: { xs: 0.5, md: 1 }, height: '100%', overflowY: 'auto', bgcolor: 'transparent' }}>
      <Stack spacing={3}>
        <PromptWorkspaceSection
          title="Lesson Instructions"
          description="Advanced (optional). These are the instructions the AI follows when writing every lesson. The defaults work well — only change them if you want a different style."
          icon={<CodeIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
          prompts={contentPrompts}
          onSave={updatePrompts}
          onReset={() => updatePrompts(contentPrompts)}
          variables={VARIABLE_EXAMPLES}
          emptyMessage="Tip: the defaults are a great starting point. You can always reset to them."
        />
      </Stack>
    </Box>
  );
}
