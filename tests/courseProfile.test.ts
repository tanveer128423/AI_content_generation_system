import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PROFILE,
  buildProfileGuidance,
  buildQuizProfileGuidance,
  getCourseProfile,
  setCourseProfile,
} from '../src/utils/courseProfile';

describe('course AI profile store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults for an unknown course', () => {
    expect(getCourseProfile('missing')).toEqual(DEFAULT_PROFILE);
  });

  it('persists and merges a patch keyed by course id', () => {
    setCourseProfile('c1', { audience: 'Beginner developers', tone: 'Professional' });
    const profile = getCourseProfile('c1');
    expect(profile.audience).toBe('Beginner developers');
    expect(profile.tone).toBe('Professional');
    // untouched fields keep defaults
    expect(profile.teachingStyle).toBe(DEFAULT_PROFILE.teachingStyle);
  });

  it('keeps separate profiles per course', () => {
    setCourseProfile('c1', { tone: 'Friendly' });
    setCourseProfile('c2', { tone: 'Academic' });
    expect(getCourseProfile('c1').tone).toBe('Friendly');
    expect(getCourseProfile('c2').tone).toBe('Academic');
  });
});

describe('guidance composition', () => {
  it('builds lesson guidance from profile fields', () => {
    const text = buildProfileGuidance({
      ...DEFAULT_PROFILE,
      audience: 'Beginner developers',
      teachingStyle: 'Project-based',
      tone: 'Friendly',
      depth: 'Beginner',
    });
    expect(text).toContain('Audience: Beginner developers');
    expect(text).toContain('Teaching style: Project-based');
    expect(text).toContain('Tone: Friendly');
    expect(text).toContain('Depth: Beginner');
  });

  it('builds quiz guidance with style and difficulty', () => {
    const text = buildQuizProfileGuidance({
      ...DEFAULT_PROFILE,
      quizStyle: 'Application-focused',
      quizDifficulty: 'Hard',
    });
    expect(text).toContain('Question style: Application-focused');
    expect(text).toContain('difficulty bias: Hard');
  });

  it('omits empty audience cleanly', () => {
    const text = buildProfileGuidance({ ...DEFAULT_PROFILE, audience: '' });
    expect(text).not.toContain('Audience:');
    expect(text).toContain('Teaching style:');
  });
});
