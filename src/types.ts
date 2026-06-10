export interface Artifact {
  index_id?: number;
  artifact_type: string;
  link: string;
}

export interface PromptSection {
  systemPrompt: string;
  userPrompt: string;
}

export interface QuizQuestion {
  id?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  [key: string]: any;
}

export interface PromptConfiguration {
  content: PromptSection;
  quiz: PromptSection;
}

export interface QuestionConfig {
  total_questions: number;
  easy: number;
  medium: number;
  hard: number;
  generated_questions?: QuizQuestion[];
  generated_at?: string | null;
}

export interface LearningUnit {
  id: string;
  name: string;
  description: string;
  learner_journey: string;
  duration: number | string;
  artifacts: Artifact[];
  additional_guidance: string;
  generated_content: string;
  generated_at?: string | null;
  questions: QuestionConfig;
  [key: string]: any;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  learning_units: LearningUnit[];
  [key: string]: any;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  outcomes: string[];
  modules: Module[];
  [key: string]: any;
}

export interface PromptTemplate {
  system_prompt: string;
  user_prompt: string;
  last_updated?: string;
  [key: string]: any;
}

export interface ContentMetadata {
  created_at?: string | null;
  updated_at?: string | null;
  version?: string;
  [key: string]: any;
}

export interface ContentData {
  metadata: ContentMetadata;
  courses: Course[];
  prompts: PromptConfiguration;
  templates: {
    course: Course;
    module: Module;
    learning_unit: LearningUnit;
    artifact: Artifact;
    question: any;
  };
  course?: Course;
  modules?: Module[];
  [key: string]: any;
}

export interface SelectedLU {
  courseId: string;
  moduleId: string;
  lu: LearningUnit;
}

export type SelectedNode =
  | { type: 'course'; courseId: string }
  | { type: 'module'; courseId: string; moduleId: string }
  | { type: 'lu'; luId: string }
  | { type: 'prompt'; promptType: 'system' | 'user' }

export interface ContentContextValue {
  contentData: ContentData;
  setContentData: React.Dispatch<React.SetStateAction<ContentData>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  selectedCourseId: string | null;
  setSelectedCourseId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedModuleId: string | null;
  setSelectedModuleId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedLU: SelectedLU | null;
  setSelectedLU: React.Dispatch<React.SetStateAction<SelectedLU | null>>;
  selectedNode: SelectedNode | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<SelectedNode | null>>;
  uiState: string;
  setUiState: React.Dispatch<React.SetStateAction<string>>;
  currentView: 'content' | 'content-prompts' | 'quiz-prompts';
  setCurrentView: React.Dispatch<React.SetStateAction<'content' | 'content-prompts' | 'quiz-prompts'>>;
  saveStructure: () => void;
  updatePrompts: (prompts: Partial<PromptSection>) => void;
  updateQuizPrompts: (prompts: Partial<PromptSection>) => void;
  updateCourse: (courseData: any) => void;
  addCourse: (courseData: any) => Course | undefined;
  duplicateCourse?: (courseId: string) => Course | undefined;
  deleteCourse: (courseId: string) => void;
  getCourse: (courseId: string) => Course | undefined;
  addModule: (courseId: string, moduleData: any) => Module | undefined;
  updateModule: (courseId: string, moduleId: string, moduleData: any) => void;
  duplicateModule?: (courseId: string, moduleId: string) => Module | undefined;
  deleteModule: (courseId: string, moduleId: string) => void;
  getModule: (courseId: string, moduleId: string) => Module | undefined;
  addLearningUnit: (courseId: string, moduleId: string, luData: any) => LearningUnit | undefined;
  updateLearningUnit: (courseId: string, moduleId: string, luId: string, luData: any) => void;
  updateLearningUnitContent: (courseId: string, moduleId: string, luId: string, content: string) => void;
  duplicateLearningUnit?: (courseId: string, moduleId: string, luId: string) => LearningUnit | undefined;
  deleteLearningUnit: (courseId: string, moduleId: string, luId: string) => void;
  getLearningUnit: (courseId: string, moduleId: string, luId: string) => LearningUnit | undefined;
  saveToFile: (filename?: string | null) => any;
  loadFromFile: (file: File) => Promise<any>;
  resetData: () => void;
  templates: ContentData['templates'];
}

export interface GeneratedContent {
  title: string;
  intro: string;
  concepts: string[];
  example: string;
  summary: string;
}
