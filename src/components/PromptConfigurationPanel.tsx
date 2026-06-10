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
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', bgcolor: '#f8fafc' }}>
      <Stack spacing={3}>
        <PromptWorkspaceSection
          title="Content Prompt"
          description="Configure the shared system and user prompts used for content generation across all learning units."
          icon={<CodeIcon sx={{ color: 'primary.main', fontSize: 28 }} />}
          prompts={contentPrompts}
          onSave={updatePrompts}
          onReset={() => updatePrompts(contentPrompts)}
          variables={VARIABLE_EXAMPLES}
          emptyMessage="These prompts drive the existing content generation workflow and remain fully backward compatible."
        />
      </Stack>
    </Box>
  );
}
