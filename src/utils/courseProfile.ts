import { useCallback, useEffect, useState } from 'react';

/**
 * Course-level "AI memory". Stored in a SEPARATE localStorage namespace, keyed by
 * course id — it deliberately does NOT live inside the content schema (which strips
 * unknown fields on normalize). The profile is injected into generation by composing
 * the guidance string at call time, so no generation contract changes.
 */
export interface CourseAIProfile {
  audience: string;
  teachingStyle: string;
  tone: string;
  depth: string;
  quizStyle: string;
  quizDifficulty: string;
}

export const TEACHING_STYLE_OPTIONS = ['Project-based', 'Concept-first', 'Example-driven', 'Socratic', 'Story-driven'];
export const TONE_OPTIONS = ['Friendly', 'Professional', 'Academic', 'Conversational', 'Encouraging'];
export const DEPTH_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
export const QUIZ_STYLE_OPTIONS = ['Application-focused', 'Recall', 'Conceptual', 'Scenario-based'];
export const QUIZ_DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard', 'Mixed'];

export const DEFAULT_PROFILE: CourseAIProfile = {
  audience: '',
  teachingStyle: 'Project-based',
  tone: 'Friendly',
  depth: 'Beginner',
  quizStyle: 'Application-focused',
  quizDifficulty: 'Medium',
};

const STORAGE_KEY = 'content_generation_engine.course_ai_profiles.v1';

type ProfileStore = Record<string, Partial<CourseAIProfile>>;

const listeners = new Set<() => void>();

function readStore(): ProfileStore {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProfileStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: ProfileStore) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage failures
  }
}

export function getCourseProfile(courseId: string | null | undefined): CourseAIProfile {
  if (!courseId) return { ...DEFAULT_PROFILE };
  return { ...DEFAULT_PROFILE, ...(readStore()[courseId] || {}) };
}

export function setCourseProfile(courseId: string, patch: Partial<CourseAIProfile>): CourseAIProfile {
  const store = readStore();
  const next = { ...DEFAULT_PROFILE, ...(store[courseId] || {}), ...patch };
  store[courseId] = next;
  writeStore(store);
  listeners.forEach(listener => listener());
  return next;
}

export function subscribeCourseProfiles(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** React hook: read + update a course's AI profile with cross-component sync. */
export function useCourseProfile(courseId: string | null | undefined): [CourseAIProfile, (patch: Partial<CourseAIProfile>) => void] {
  const [profile, setProfile] = useState<CourseAIProfile>(() => getCourseProfile(courseId));

  useEffect(() => {
    setProfile(getCourseProfile(courseId));
    return subscribeCourseProfiles(() => setProfile(getCourseProfile(courseId)));
  }, [courseId]);

  const update = useCallback(
    (patch: Partial<CourseAIProfile>) => {
      if (!courseId) return;
      setProfile(setCourseProfile(courseId, patch));
    },
    [courseId]
  );

  return [profile, update];
}

/** Compose the lesson-generation guidance preamble from the profile. */
export function buildProfileGuidance(profile: CourseAIProfile): string {
  const lines = [
    profile.audience.trim() ? `- Audience: ${profile.audience.trim()}` : '',
    profile.teachingStyle ? `- Teaching style: ${profile.teachingStyle}` : '',
    profile.tone ? `- Tone: ${profile.tone}` : '',
    profile.depth ? `- Depth: ${profile.depth}` : '',
  ].filter(Boolean);

  if (!lines.length) return '';
  return ['Follow this course AI profile:', ...lines].join('\n');
}

/** Compose the quiz-generation guidance preamble from the profile. */
export function buildQuizProfileGuidance(profile: CourseAIProfile): string {
  const lines = [
    profile.audience.trim() ? `- Audience: ${profile.audience.trim()}` : '',
    profile.quizStyle ? `- Question style: ${profile.quizStyle}` : '',
    profile.quizDifficulty ? `- Overall difficulty bias: ${profile.quizDifficulty}` : '',
    profile.tone ? `- Tone: ${profile.tone}` : '',
  ].filter(Boolean);

  if (!lines.length) return '';
  return ['Follow this course quiz profile:', ...lines].join('\n');
}
