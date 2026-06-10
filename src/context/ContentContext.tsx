import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import initialData from '../data/data.json';
import { saveToFile, loadFromFile } from '../utils/fileOperations';
import type {
  ContentContextValue,
  ContentData,
  Course,
  LearningUnit,
  Module,
  PromptSection,
  PromptConfiguration,
  SelectedLU,
  SelectedNode
} from '../types';

const STORAGE_KEY = 'content_generation_engine.workspace_state.v2';
const DEFAULT_COURSE_ID = 'course_default';

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};

function createDefaultPromptConfiguration(): PromptConfiguration {
  return {
    content: {
      systemPrompt: '',
      userPrompt: ''
    },
    quiz: {
      systemPrompt: '',
      userPrompt: ''
    }
  };
}

function hasPatchChanges<T extends Record<string, any>>(existing: T | undefined, patch: Partial<T>) {
  if (!existing) return true;

  return Object.keys(patch).some(key => {
    const patchValue = patch[key as keyof T];

    if (typeof patchValue === 'undefined') {
      return false;
    }

    try {
      return JSON.stringify(existing[key as keyof T]) !== JSON.stringify(patchValue);
    } catch {
      return !Object.is(existing[key as keyof T], patchValue);
    }
  });
}

function createDefaultCourse(): Course {
  return {
    id: DEFAULT_COURSE_ID,
    name: '',
    description: '',
    outcomes: [],
    modules: []
  };
}

function createDefaultContentData(): ContentData {
  const data = initialData as Partial<ContentData> & { prompts?: any };
  const rawCourses = Array.isArray(data.courses) ? data.courses : [];
  const courses = rawCourses.length > 0 ? rawCourses.map(normalizeCourse) : [normalizeCourse(data.course || createDefaultCourse())];
  return attachLegacyFields({
    metadata: {
      ...data.metadata,
      created_at: data.metadata?.created_at ?? new Date().toISOString(),
      updated_at: data.metadata?.updated_at ?? new Date().toISOString(),
      version: data.metadata?.version ?? '1.0.0'
    },
    courses,
    prompts: normalizePrompts(data.prompts),
    templates: normalizeTemplates(data.templates)
  } as ContentData);
}

function normalizeTemplates(templates: any) {
  const fallbackCourse = createDefaultCourse();
  const fallbackModule: Module = {
    id: '',
    name: 'New Module',
    description: '',
    learning_units: []
  };
  const fallbackLearningUnit: LearningUnit = {
    id: '',
    name: 'New Learning Unit',
    description: '',
    learner_journey: '',
    duration: 90,
    artifacts: [],
    additional_guidance: '',
    generated_content: '',
    generated_at: null,
    questions: {
      total_questions: 5,
      easy: 2,
      medium: 2,
      hard: 1,
      generated_questions: [],
      generated_at: null
    }
  };

  return {
    course: {
      ...fallbackCourse,
      ...(templates?.course || {})
    },
    module: {
      ...fallbackModule,
      ...(templates?.module || {})
    },
    learning_unit: {
      ...fallbackLearningUnit,
      ...(templates?.learning_unit || {})
    },
    artifact: {
      index_id: 0,
      artifact_type: 'video',
      link: '',
      ...(templates?.artifact || {})
    },
    question: {
      id: '',
      difficulty: 'easy',
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      ...(templates?.question || {})
    }
  };
}

function normalizePrompts(prompts: any, fallbackPrompts: any = initialData.prompts): PromptConfiguration {
  const contentSystemPrompt =
    prompts?.content?.systemPrompt ?? prompts?.learning_unit?.system_prompt ?? fallbackPrompts?.content?.systemPrompt ?? '';
  const contentUserPrompt =
    prompts?.content?.userPrompt ?? prompts?.learning_unit?.user_prompt ?? fallbackPrompts?.content?.userPrompt ?? '';

  const quizSystemPrompt = prompts?.quiz?.systemPrompt ?? prompts?.quiz?.system_prompt ?? fallbackPrompts?.quiz?.systemPrompt ?? '';
  const quizUserPrompt = prompts?.quiz?.userPrompt ?? prompts?.quiz?.user_prompt ?? fallbackPrompts?.quiz?.userPrompt ?? '';

  return {
    content: {
      systemPrompt: contentSystemPrompt,
      userPrompt: contentUserPrompt
    },
    quiz: {
      systemPrompt: quizSystemPrompt,
      userPrompt: quizUserPrompt
    }
  };
}

function normalizeArtifact(artifact: any) {
  return {
    index_id: artifact?.index_id ?? undefined,
    artifact_type: String(artifact?.artifact_type ?? artifact?.type ?? '').trim(),
    link: String(artifact?.link ?? '').trim()
  };
}

function createUniqueId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneLearningUnit(lu: LearningUnit): LearningUnit {
  return {
    ...lu,
    id: createUniqueId('lu'),
    name: `${lu.name || 'New Learning Unit'} Copy`,
    artifacts: Array.isArray(lu.artifacts) ? lu.artifacts.map(normalizeArtifact) : [],
    generated_content: lu.generated_content || '',
    generated_at: null,
    questions: {
      ...lu.questions,
      generated_questions: Array.isArray(lu.questions?.generated_questions) ? [...lu.questions.generated_questions] : [],
      generated_at: null
    }
  };
}

function cloneModule(moduleData: Module): Module {
  return {
    ...moduleData,
    id: createUniqueId('module'),
    name: `${moduleData.name || 'New Module'} Copy`,
    learning_units: Array.isArray(moduleData.learning_units) ? moduleData.learning_units.map(cloneLearningUnit) : []
  };
}

function cloneCourse(courseData: Course): Course {
  return {
    ...courseData,
    id: createUniqueId('course'),
    name: `${courseData.name || 'Untitled Course'} Copy`,
    modules: Array.isArray(courseData.modules) ? courseData.modules.map(cloneModule) : []
  };
}

function normalizeLearningUnit(lu: any): LearningUnit {
  return {
    id: String(lu?.id ?? `lu_${Date.now()}`),
    name: String(lu?.name ?? 'New Learning Unit'),
    description: String(lu?.description ?? ''),
    learner_journey: String(lu?.learner_journey ?? ''),
    duration: lu?.duration ?? 30,
    artifacts: Array.isArray(lu?.artifacts) ? lu.artifacts.map(normalizeArtifact) : [],
    additional_guidance: String(lu?.additional_guidance ?? ''),
    generated_content: String(lu?.generated_content ?? ''),
    generated_at: lu?.generated_at ?? null,
    questions: {
      total_questions: lu?.questions?.total_questions ?? 5,
      easy: lu?.questions?.easy ?? 2,
      medium: lu?.questions?.medium ?? 2,
      hard: lu?.questions?.hard ?? 1,
      generated_questions: Array.isArray(lu?.questions?.generated_questions) ? lu.questions.generated_questions : [],
      generated_at: lu?.questions?.generated_at ?? null
    }
  };
}

function normalizeModule(moduleData: any): Module {
  return {
    id: String(moduleData?.id ?? `module_${Date.now()}`),
    name: String(moduleData?.name ?? 'New Module'),
    description: String(moduleData?.description ?? ''),
    learning_units: Array.isArray(moduleData?.learning_units) ? moduleData.learning_units.map(normalizeLearningUnit) : []
  };
}

function normalizeCourse(courseData: any): Course {
  return {
    id: String(courseData?.id ?? DEFAULT_COURSE_ID),
    name: String(courseData?.name ?? ''),
    description: String(courseData?.description ?? courseData?.hld ?? ''),
    outcomes: Array.isArray(courseData?.outcomes) ? courseData.outcomes.map((outcome: unknown) => String(outcome)) : [],
    modules: Array.isArray(courseData?.modules)
      ? courseData.modules.map(normalizeModule)
      : Array.isArray(courseData?.learning_units)
        ? [{ id: `module_${Date.now()}`, name: 'Module 1', description: '', learning_units: courseData.learning_units.map(normalizeLearningUnit) }]
        : []
  };
}

function attachLegacyFields(data: ContentData): ContentData {
  const primaryCourse = data.courses[0] ?? createDefaultCourse();
  return {
    ...data,
    course: primaryCourse,
    modules: primaryCourse.modules
  };
}

function normalizeContentData(raw: any): ContentData {
  const coursesSource = Array.isArray(raw?.courses)
    ? raw.courses
    : raw?.course
      ? [raw.course]
      : [];

  const courses = coursesSource.length > 0 ? coursesSource.map(normalizeCourse) : [createDefaultCourse()];

  // Sanitize persisted learning unit quiz configurations to ensure they match the
  // application's expected 5-question distribution. This only adjusts question
  // counts for persisted learning units that have mismatched totals or sums.
  const DEFAULT_QUIZ_CONFIG = { total_questions: 5, easy: 2, medium: 2, hard: 1 };

  try {
    courses.forEach(course => {
      (course.modules || []).forEach(module => {
        (module.learning_units || []).forEach(lu => {
          const q = (lu as any).questions || {};
          const cfg = q.config || q;
          const total = Number(cfg.total_questions ?? 0);
          const easy = Number(cfg.easy ?? 0);
          const medium = Number(cfg.medium ?? 0);
          const hard = Number(cfg.hard ?? 0);
          const sum = easy + medium + hard;

          if (total !== DEFAULT_QUIZ_CONFIG.total_questions || sum !== DEFAULT_QUIZ_CONFIG.total_questions) {
            (lu as any).questions = {
              ...(q || {}),
              total_questions: DEFAULT_QUIZ_CONFIG.total_questions,
              easy: DEFAULT_QUIZ_CONFIG.easy,
              medium: DEFAULT_QUIZ_CONFIG.medium,
              hard: DEFAULT_QUIZ_CONFIG.hard,
              generated_questions: Array.isArray(q?.generated_questions) ? q.generated_questions : [],
              generated_at: q?.generated_at ?? null
            };
          }
        });
      });
    });
  } catch (e) {
    // avoid breaking initialization on unexpected shapes
    // eslint-disable-next-line no-console
    console.error('Failed to sanitize persisted quiz configs', e);
  }

  // Use explicit default-first values from initialData
  const defaultQuizPrompts = (initialData as any).prompts?.quiz || { systemPrompt: '', userPrompt: '' };
  const defaultContentPrompts = (initialData as any).prompts?.content || { systemPrompt: '', userPrompt: '' };
  const persistedPrompts = raw?.prompts || {};

  const normalizedPrompts = {
    content: {
      systemPrompt:
        (persistedPrompts?.content?.systemPrompt && persistedPrompts.content.systemPrompt.trim()) ||
        defaultContentPrompts.systemPrompt,

      userPrompt:
        (persistedPrompts?.content?.userPrompt && persistedPrompts.content.userPrompt.trim()) ||
        defaultContentPrompts.userPrompt
    },

    quiz: {
      systemPrompt:
        (persistedPrompts?.quiz?.systemPrompt && persistedPrompts.quiz.systemPrompt.trim()) ||
        defaultQuizPrompts.systemPrompt,

      userPrompt:
        (persistedPrompts?.quiz?.userPrompt && persistedPrompts.quiz.userPrompt.trim()) ||
        defaultQuizPrompts.userPrompt
    }
  };

  return attachLegacyFields({
    metadata: {
      ...(raw?.metadata || {}),
      created_at: raw?.metadata?.created_at ?? new Date().toISOString(),
      updated_at: raw?.metadata?.updated_at ?? new Date().toISOString(),
      version: raw?.metadata?.version ?? '1.0.0'
    },
    courses,
    prompts: normalizedPrompts,
    templates: normalizeTemplates(raw?.templates)
  } as ContentData);
}

function getPersistedState() {
  if (typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse saved workspace state:', error);
    return null;
  }
}

function savePersistedState(payload: unknown) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const persisted = useMemo(() => getPersistedState(), []);
  const lastPersistedSignatureRef = useRef('');

  const normalizedInitialData = normalizeContentData(persisted?.contentData || initialData);

  const [contentData, setContentData] = useState<ContentData>(() => normalizedInitialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => persisted?.selectedCourseId ?? null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(() => persisted?.selectedModuleId ?? null);
  const [selectedLU, setSelectedLU] = useState<SelectedLU | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(() => persisted?.selectedNode ?? null);
  const [uiState, setUiState] = useState('idle');
  const [currentView, setCurrentView] = useState<'content' | 'content-prompts' | 'quiz-prompts'>('content');

  const courseIndex = useMemo(() => new Map(contentData.courses.map(course => [course.id, course])), [contentData.courses]);

  const getCourse = useCallback((courseId: string) => courseIndex.get(courseId), [courseIndex]);

  const getModule = useCallback((courseId: string, moduleId: string) => {
    return courseIndex.get(courseId)?.modules.find(module => module.id === moduleId);
  }, [courseIndex]);

  const getLearningUnit = useCallback((courseId: string, moduleId: string, luId: string) => {
    const module = getModule(courseId, moduleId);
    return module?.learning_units.find(lu => lu.id === luId);
  }, [getModule]);

  const replaceContentData = useCallback((updater: (prev: ContentData) => ContentData) => {
    setContentData(prev => {
      const updated = updater(prev);
      if (updated === prev) return prev;

      const next = attachLegacyFields(updated);
      return next;
    });
  }, []);

  const syncSelectedLearningUnit = useCallback((courseId: string | null, moduleId: string | null, luId: string | null) => {
    if (!courseId || !moduleId || !luId) {
      setSelectedLU(prev => (prev === null ? prev : null));
      return;
    }

    const current = getLearningUnit(courseId, moduleId, luId);
    setSelectedLU(prev => {
      if (!current) {
        return prev === null ? prev : null;
      }

      if (prev?.courseId === courseId && prev?.moduleId === moduleId && prev?.lu?.id === luId) {
        return prev;
      }

      return { courseId, moduleId, lu: current };
    });
  }, [getLearningUnit]);

  useEffect(() => {
    const fallbackCourseId = contentData.courses[0]?.id ?? null;

    if (!selectedCourseId) {
      if (fallbackCourseId && fallbackCourseId !== selectedCourseId) {
        setSelectedCourseId(fallbackCourseId);
      }
      return;
    }

    const course = getCourse(selectedCourseId);
    if (course) return;

    if (selectedCourseId !== fallbackCourseId) {
      setSelectedCourseId(fallbackCourseId);
    }
    if (selectedModuleId !== null) {
      setSelectedModuleId(null);
    }
    if (selectedLU !== null) {
      setSelectedLU(null);
    }
    if (selectedNode !== null) {
      setSelectedNode(null);
    }
  }, [contentData.courses, getCourse, selectedCourseId, selectedModuleId, selectedLU?.lu?.id, selectedNode]);

  useEffect(() => {
    if (!selectedCourseId) return;
    const course = getCourse(selectedCourseId);
    if (!course) {
      if (selectedModuleId !== null) {
        setSelectedModuleId(null);
      }
      if (selectedLU !== null) {
        setSelectedLU(null);
      }
      return;
    }

    const fallbackModuleId = course.modules[0]?.id ?? null;

    if (!selectedModuleId) {
      if (fallbackModuleId && fallbackModuleId !== selectedModuleId) {
        setSelectedModuleId(fallbackModuleId);
      }
      return;
    }

    const module = getModule(selectedCourseId, selectedModuleId);
    if (module) return;

    if (selectedModuleId !== fallbackModuleId) {
      setSelectedModuleId(fallbackModuleId);
    }
    if (selectedLU !== null) {
      setSelectedLU(null);
    }
  }, [contentData.courses, getCourse, getModule, selectedCourseId, selectedModuleId, selectedLU?.lu?.id]);

  useEffect(() => {
    setUiState(selectedLU ? 'editing' : 'idle');
  }, [selectedLU?.lu?.id]);

  useEffect(() => {
    const payload = {
      contentData,
      selectedCourseId,
      selectedModuleId,
      selectedLUId: selectedLU?.lu?.id ?? null,
      selectedNode
    };
    const signature = JSON.stringify(payload);

    if (lastPersistedSignatureRef.current === signature) return;

    lastPersistedSignatureRef.current = signature;
    savePersistedState({
      ...payload,
      savedAt: new Date().toISOString()
    });
  }, [contentData, selectedCourseId, selectedModuleId, selectedLU?.lu?.id, selectedNode]);

  const updateCourse = useCallback((courseData: any) => {
    const targetCourseId = String(courseData?.id ?? selectedCourseId ?? contentData.courses[0]?.id ?? DEFAULT_COURSE_ID);
    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id !== targetCourseId) return course;

        const nextCourse = { ...course, ...courseData, id: targetCourseId };
        return hasPatchChanges(course, nextCourse) ? nextCourse : course;
      }),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));
  }, [contentData.courses, replaceContentData, selectedCourseId]);

  const addCourse = useCallback((courseData: any) => {
    const newCourse = normalizeCourse({
      ...contentData.templates.course,
      ...courseData,
      id: courseData?.id ?? `course_${Date.now()}`
    });

    replaceContentData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse],
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setSelectedCourseId(newCourse.id);
    setSelectedModuleId(null);
    setSelectedLU(null);
    setSelectedNode({ type: 'course', courseId: newCourse.id });
    return newCourse;
  }, [contentData.templates.course, replaceContentData]);

  const duplicateCourse = useCallback((courseId: string) => {
    const sourceCourse = getCourse(courseId);
    if (!sourceCourse) return undefined;

    const duplicatedCourse = cloneCourse(sourceCourse);

    replaceContentData(prev => ({
      ...prev,
      courses: [...prev.courses, duplicatedCourse],
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setSelectedCourseId(duplicatedCourse.id);
    setSelectedModuleId(duplicatedCourse.modules[0]?.id ?? null);
    setSelectedLU(duplicatedCourse.modules[0]?.learning_units[0] ? {
      courseId: duplicatedCourse.id,
      moduleId: duplicatedCourse.modules[0].id,
      lu: duplicatedCourse.modules[0].learning_units[0]
    } : null);
    setSelectedNode({ type: 'course', courseId: duplicatedCourse.id });
    return duplicatedCourse;
  }, [getCourse, replaceContentData]);

  const deleteCourse = useCallback((courseId: string) => {
    const remainingCourses = contentData.courses.filter(course => course.id !== courseId);
    const fallbackCourseId = remainingCourses[0]?.id ?? createDefaultCourse().id;

    replaceContentData(prev => {
      const nextCourses = prev.courses.filter(course => course.id !== courseId);
      return {
        ...prev,
        courses: nextCourses.length > 0 ? nextCourses : [createDefaultCourse()],
        metadata: {
          ...prev.metadata,
          updated_at: new Date().toISOString()
        }
      };
    });

    if (selectedCourseId === courseId) {
      setSelectedCourseId(fallbackCourseId);
      setSelectedModuleId(remainingCourses[0]?.modules[0]?.id ?? null);
      setSelectedLU(null);
      setSelectedNode(fallbackCourseId ? { type: 'course', courseId: fallbackCourseId } : null);
    }
  }, [contentData.courses, replaceContentData, selectedCourseId]);

  const addModule = useCallback((courseId: string, moduleData: any) => {
    const targetCourseId = courseId || selectedCourseId || contentData.courses[0]?.id || DEFAULT_COURSE_ID;
    const newModule = normalizeModule({
      ...contentData.templates.module,
      ...moduleData,
      id: moduleData?.id ?? `module_${Date.now()}`,
      learning_units: []
    });

    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id === targetCourseId ? { ...course, modules: [...course.modules, newModule] } : course),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setSelectedCourseId(targetCourseId);
    setSelectedModuleId(newModule.id);
    setSelectedLU(null);
    setSelectedNode({ type: 'module', courseId: targetCourseId, moduleId: newModule.id });
    return newModule;
  }, [contentData.courses, contentData.templates.module, replaceContentData, selectedCourseId]);

  const updateModule = useCallback((courseId: string, moduleId: string, moduleData: any) => {
    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id !== courseId) return course;

        return {
          ...course,
          modules: course.modules.map(module => {
            if (module.id !== moduleId) return module;

            const nextModule = { ...module, ...moduleData, id: moduleId };
            return hasPatchChanges(module, nextModule) ? nextModule : module;
          })
        };
      }),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));
  }, [replaceContentData]);

  const duplicateModule = useCallback((courseId: string, moduleId: string) => {
    const sourceModule = getModule(courseId, moduleId);
    if (!sourceModule) return undefined;

    const duplicatedModule = cloneModule(sourceModule);

    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id === courseId ? {
        ...course,
        modules: [...course.modules, duplicatedModule]
      } : course),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setSelectedCourseId(courseId);
    setSelectedModuleId(duplicatedModule.id);
    setSelectedLU(duplicatedModule.learning_units[0] ? { courseId, moduleId: duplicatedModule.id, lu: duplicatedModule.learning_units[0] } : null);
    setSelectedNode({ type: 'module', courseId, moduleId: duplicatedModule.id });
    return duplicatedModule;
  }, [getModule, replaceContentData]);

  const deleteModule = useCallback((courseId: string, moduleId: string) => {
    const remainingModules = getCourse(courseId)?.modules.filter(module => module.id !== moduleId) ?? [];

    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id === courseId ? {
        ...course,
        modules: course.modules.filter(module => module.id !== moduleId)
      } : course),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    if (selectedCourseId === courseId && selectedModuleId === moduleId) {
      setSelectedModuleId(remainingModules[0]?.id ?? null);
      setSelectedLU(null);
      setSelectedNode(remainingModules[0]?.id ? { type: 'module', courseId, moduleId: remainingModules[0].id } : { type: 'course', courseId });
    }
  }, [getCourse, replaceContentData, selectedCourseId, selectedModuleId]);

  const addLearningUnit = useCallback((courseId: string, moduleId: string, luData: any) => {
    const targetCourseId = courseId || selectedCourseId || contentData.courses[0]?.id || DEFAULT_COURSE_ID;
    const targetModuleId = moduleId || selectedModuleId || getCourse(targetCourseId)?.modules[0]?.id || '';
    const newLU = normalizeLearningUnit({
      ...contentData.templates.learning_unit,
      ...luData,
      id: luData?.id ?? `lu_${Date.now()}`,
      artifacts: Array.isArray(luData?.artifacts) ? luData.artifacts : [],
      questions: {
        ...contentData.templates.learning_unit.questions,
        ...(luData?.questions || {})
      }
    });

    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id === targetCourseId ? {
        ...course,
        modules: course.modules.map(module => module.id === targetModuleId ? { ...module, learning_units: [...module.learning_units, newLU] } : module)
      } : course),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setSelectedCourseId(targetCourseId);
    setSelectedModuleId(targetModuleId);
    setSelectedLU({ courseId: targetCourseId, moduleId: targetModuleId, lu: newLU });
    setSelectedNode({ type: 'lu', luId: newLU.id });
    return newLU;
  }, [contentData.courses, contentData.templates.learning_unit, getCourse, replaceContentData, selectedCourseId, selectedModuleId]);

  const updateLearningUnit = useCallback((courseId: string, moduleId: string, luId: string, luData: any) => {
    const currentLearningUnit = getLearningUnit(courseId, moduleId, luId);
    if (currentLearningUnit && !hasPatchChanges(currentLearningUnit, { ...luData, id: luId })) {
      return;
    }

    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id !== courseId) return course;

        return {
          ...course,
          modules: course.modules.map(module => {
            if (module.id !== moduleId) return module;

            return {
              ...module,
              learning_units: module.learning_units.map(lu => {
                if (lu.id !== luId) return lu;

                const nextLearningUnit = { ...lu, ...luData, id: luId };
                return hasPatchChanges(lu, nextLearningUnit) ? nextLearningUnit : lu;
              })
            };
          })
        };
      }),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

  }, [getLearningUnit, replaceContentData]);

  const updateLearningUnitContent = useCallback((courseId: string, moduleId: string, luId: string, content: string) => {
    updateLearningUnit(courseId, moduleId, luId, {
      generated_content: content,
      generated_at: new Date().toISOString()
    });
  }, [updateLearningUnit]);

  const duplicateLearningUnit = useCallback((courseId: string, moduleId: string, luId: string) => {
    const sourceLearningUnit = getLearningUnit(courseId, moduleId, luId);
    if (!sourceLearningUnit) return undefined;

    const duplicatedLearningUnit = cloneLearningUnit(sourceLearningUnit);

    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id === courseId ? {
        ...course,
        modules: course.modules.map(module => module.id === moduleId ? {
          ...module,
          learning_units: [...module.learning_units, duplicatedLearningUnit]
        } : module)
      } : course),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    setSelectedCourseId(courseId);
    setSelectedModuleId(moduleId);
    setSelectedLU({ courseId, moduleId, lu: duplicatedLearningUnit });
    setSelectedNode({ type: 'lu', luId: duplicatedLearningUnit.id });
    return duplicatedLearningUnit;
  }, [getLearningUnit, replaceContentData]);

  const deleteLearningUnit = useCallback((courseId: string, moduleId: string, luId: string) => {
    replaceContentData(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id === courseId ? {
        ...course,
        modules: course.modules.map(module => module.id === moduleId ? {
          ...module,
          learning_units: module.learning_units.filter(lu => lu.id !== luId)
        } : module)
      } : course),
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));

    if (selectedLU?.courseId === courseId && selectedLU?.moduleId === moduleId && selectedLU?.lu?.id === luId) {
      setSelectedLU(null);
      setSelectedNode({ type: 'module', courseId, moduleId });
    }
  }, [replaceContentData, selectedLU]);

  const updatePrompts = useCallback((promptPatch: Partial<PromptConfiguration>) => {
    if (!hasPatchChanges(contentData.prompts, promptPatch)) return;

    // Apply updates to nested `content` section only
    replaceContentData(prev => ({
      ...prev,
      prompts: {
        ...prev.prompts,
        content: {
          systemPrompt: promptPatch.systemPrompt ?? prev.prompts.content?.systemPrompt ?? '',
          userPrompt: promptPatch.userPrompt ?? prev.prompts.content?.userPrompt ?? ''
        }
      },
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));
  }, [contentData.prompts, replaceContentData]);

  const updateQuizPrompts = useCallback((promptPatch: Partial<PromptSection>) => {
    if (!hasPatchChanges(contentData.prompts.quiz, promptPatch)) {
      return;
    }

    replaceContentData(prev => ({
      ...prev,
      prompts: {
        ...prev.prompts,
        quiz: {
          systemPrompt: promptPatch.systemPrompt ?? prev.prompts.quiz?.systemPrompt ?? '',
          userPrompt: promptPatch.userPrompt ?? prev.prompts.quiz?.userPrompt ?? ''
        }
      },
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));
  }, [contentData.prompts.quiz, replaceContentData]);

  const handleSaveToFile = useCallback((filename: string | null = null) => {
    try {
      const result = saveToFile(contentData, filename);
      if (result.success) {
        setError(null);
        return result;
      }
      setError(result.error);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save file';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [contentData]);

  const handleLoadFromFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadFromFile(file);
      if (result.success) {
        setContentData(normalizeContentData(result.data));
        setSelectedCourseId(null);
        setSelectedModuleId(null);
        setSelectedLU(null);
        setSelectedNode(null);
        setError(null);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load file';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveStructure = useCallback(() => {
    savePersistedState({
      contentData,
      selectedCourseId,
      selectedModuleId,
      selectedLUId: selectedLU?.lu?.id ?? null,
      selectedNode,
      savedAt: new Date().toISOString()
    });
  }, [contentData, selectedCourseId, selectedModuleId, selectedLU?.lu?.id, selectedNode]);

  const resetData = useCallback(() => {
    const resetContent = createDefaultContentData();
    setContentData(resetContent);
    setSelectedCourseId(resetContent.courses[0]?.id ?? null);
    setSelectedModuleId(resetContent.courses[0]?.modules[0]?.id ?? null);
    setSelectedLU(null);
    setSelectedNode(null);
    setError(null);
    savePersistedState({
      contentData: resetContent,
      selectedCourseId: resetContent.courses[0]?.id ?? null,
      selectedModuleId: resetContent.courses[0]?.modules[0]?.id ?? null,
      selectedLUId: null,
      selectedNode: null,
      savedAt: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    const persistedCourseId = persisted?.selectedCourseId ?? contentData.courses[0]?.id ?? null;
    const persistedModuleId = persisted?.selectedModuleId ?? contentData.courses[0]?.modules[0]?.id ?? null;
    const persistedLUId = persisted?.selectedLUId ?? null;

    if (persistedCourseId && !selectedCourseId) {
      setSelectedCourseId(persistedCourseId);
    }

    if (persistedModuleId && !selectedModuleId) {
      setSelectedModuleId(persistedModuleId);
    }

    if (persistedLUId && persistedCourseId && persistedModuleId && !selectedLU) {
      syncSelectedLearningUnit(persistedCourseId, persistedModuleId, persistedLUId);
    }
  }, [contentData.courses, persisted, selectedCourseId, selectedLU?.lu?.id, selectedModuleId, syncSelectedLearningUnit]);

  const value = useMemo<ContentContextValue>(() => ({
    contentData,
    setContentData,
    loading,
    error,
    setError,
    selectedCourseId,
    setSelectedCourseId,
    selectedModuleId,
    setSelectedModuleId,
    selectedLU,
    setSelectedLU,
    selectedNode,
    setSelectedNode,
    uiState,
    setUiState,
    currentView,
    setCurrentView,
    saveStructure,
    updatePrompts,
    updateQuizPrompts,
    updateCourse,
    addCourse,
    duplicateCourse,
    deleteCourse,
    getCourse,
    addModule,
    updateModule,
    duplicateModule,
    deleteModule,
    getModule,
    addLearningUnit,
    updateLearningUnit,
    updateLearningUnitContent,
    duplicateLearningUnit,
    deleteLearningUnit,
    getLearningUnit,
    saveToFile: handleSaveToFile,
    loadFromFile: handleLoadFromFile,
    resetData,
    templates: contentData.templates
  }), [
    addCourse,
    addLearningUnit,
    addModule,
    contentData,
    currentView,
    deleteCourse,
    deleteLearningUnit,
    deleteModule,
    duplicateCourse,
    duplicateLearningUnit,
    duplicateModule,
    error,
    getCourse,
    getLearningUnit,
    getModule,
    handleLoadFromFile,
    handleSaveToFile,
    loading,
    resetData,
    saveStructure,
    selectedCourseId,
    selectedLU,
    selectedModuleId,
    selectedNode,
    setContentData,
    setCurrentView,
    setError,
    setSelectedCourseId,
    setSelectedLU,
    setSelectedModuleId,
    setSelectedNode,
    setUiState,
    uiState,
    updateCourse,
    updateLearningUnit,
    updateLearningUnitContent,
    updateModule,
    updatePrompts
  ]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};
