import type { GeneratedContent } from '../types';

// Modular content generator: returns structured content object

// Intro generator: explains why the topic matters and adapts by level
export function generateIntro(topic: string | null | undefined, duration: number | string, level: string) {
  const dur = Number(duration) || 0;
  const timePhrase = dur ? `${dur}-minute` : 'brief';

  if (!topic) {
    const text = `${timePhrase} lesson that focuses on practical impact: which problems it solves, where it changes design choices, and the concrete skills learners will gain.`;
    return Promise.resolve(text);
  }

  const t = String(topic).trim();
  const lower = t.toLowerCase();

  if (lower.includes('what is')) {
    const text = `${timePhrase} primer that defines the concept clearly, explains its motivation and evolution, and shows representative situations where recognizing the concept improves solutions.`;
    return Promise.resolve(text);
  }

  if (lower.includes('arrays')) {
    const text = `${timePhrase} practical overview focused on indexed collections: how layout and indexing influence algorithm choice, and which operations are essential for everyday tasks.`;
    return Promise.resolve(text);
  }

  if (lower.includes('loops')) {
    const text = `${timePhrase} focused session on iteration: selecting the right loop form for clarity and performance, and patterns for safe, maintainable iteration.`;
    return Promise.resolve(text);
  }

  if (lower.includes('state')) {
    const text = `${timePhrase} session on state management covering lifecycle, common update patterns, and why predictable state leads to fewer bugs and simpler testing.`;
    return Promise.resolve(text);
  }

  const generic = `${timePhrase} session that explains the practical importance of ${t}: common scenarios, concrete outcomes, and first steps to apply the ideas.`;
  return Promise.resolve(generic);
}

// Concepts generator: returns 3-5 meaningful, non-repetitive points
export function generateConcepts(topic: string | null | undefined, duration: number | string, level: string) {
  const t = topic && String(topic).trim();
  const lower = t ? t.toLowerCase() : '';
  const n = level === 'short' ? 3 : level === 'medium' ? 4 : 5;

  const sliceN = (arr: string[]) => arr.slice(0, n);

  if (lower.includes('what is')) {
    const base = [
      'One-sentence definition that captures the core idea and its boundaries.',
      'Key properties that distinguish the concept and how to recognize them in examples.',
      'Motivation: the practical problems the concept was created to solve.',
      'Representative use cases where applying the concept provides clear benefits.',
      'A short checklist for deciding when to apply the concept in real work.'
    ];
    return Promise.resolve(sliceN(base));
  }

  if (lower.includes('arrays')) {
    const base = [
      'Indexed access and traversal patterns: how indexing enables direct reads and shapes algorithm choices.',
      'Common operations: mapping, filtering, slicing, insertion and removal with their typical costs.',
      'Memory and performance notes: contiguous layout, resizing behavior, and cache effects.',
      'Language-specific helpers and idioms that simplify array manipulation.',
      'Practical pitfalls and when to prefer alternate data structures.'
    ];
    return Promise.resolve(sliceN(base));
  }

  if (lower.includes('loops')) {
    const base = [
      'Loop kinds and intent: index-based, iterator-based, and condition-driven loops.',
      'When to prefer declarative transformations (map/reduce) over imperative loops.',
      'Control-flow patterns: breaking, continuing, and structuring loops to avoid deep nesting.',
      'Termination and performance: proving termination and avoiding accidental quadratic costs.',
      'Debugging strategies for loop-related bugs and common off-by-one patterns.'
    ];
    return Promise.resolve(sliceN(base));
  }

  if (lower.includes('state')) {
    const base = [
      'What belongs in state and how its shape affects reasoning about behavior.',
      'Update strategies: immutable updates vs controlled mutation and their trade-offs.',
      'Lifecycle concerns: initialization, persistence, and teardown.',
      'Architecture patterns: local vs shared state and reducing coupling.',
      'Testing and observability: asserting transitions and inspecting runtime state.'
    ];
    return Promise.resolve(sliceN(base));
  }

  const generic = [
    'Core principles and the mental model to reason about practical problems.',
    'Concrete operations or workflows you will perform when using the topic.',
    'Patterns and best practices that improve correctness and maintainability.',
    'Performance and safety trade-offs to evaluate during design.',
    'Actionable next steps and small project ideas to practice the concepts.'
  ];

  return Promise.resolve(sliceN(generic));
}

// Examples: realistic, topic-specific snippets
export function generateExample(topic: string | null | undefined) {
  const t = topic && String(topic).trim();
  const lower = t ? t.toLowerCase() : '';

  if (!t) {
    return Promise.resolve(
      'Real scenario: given a list of user records, deduplicate by email and produce a count per domain. Implement the transform, show input → output, and explain complexity.'
    );
  }

  if (lower.includes('what is')) {
    return Promise.resolve(
      `Teaching exercise: compare two short code snippets that implement the problem before and after applying the concept.

Example (pseudo-JS):






\`\`\`javascript
// naive
function summarize(items){ /* simple, repetitive code */ }

// improved: use the concept to structure responsibilities
function summarize(items){ /* clearer, composable approach */ }
\`\`\`

Ask learners to identify the differences and benefits.`
    );
  }

  if (lower.includes('arrays')) {
    return Promise.resolve(
      `Scenario: compute a sliding-window average over sensor readings.

JavaScript:
\`\`\`javascript
function slidingAverage(values, windowSize=3){
  const res=[];
  for(let i=0;i<=values.length-windowSize;i++){
    let sum=0;
    for(let j=i;j<i+windowSize;j++) sum+=values[j];
    res.push(sum/windowSize);
  }
  return res;
}
\`\`\`

This exercise focuses on indexing, traversal, and performance trade-offs.`
    );
  }

  if (lower.includes('loops')) {
    return Promise.resolve(
      `Scenario: aggregate user actions into daily totals, then compare imperative and declarative approaches.

JavaScript:
\`\`\`javascript
// imperative
const agg={}; for(const a of actions){ agg[a.day]=(agg[a.day]||0)+a.val }

// declarative
const reduced = actions.reduce((m,a)=>{ m[a.day]=(m[a.day]||0)+a.val; return m },{});
\`\`\`

Discuss readability, mutability, and performance.`
    );
  }

  if (lower.includes('state')) {
    return Promise.resolve(
      `Scenario: React counter persisted to localStorage to illustrate initialization, updates, and persistence.

\`\`\`jsx
import { useState, useEffect } from 'react';
function PersistentCounter(){
  const [count,setCount]=useState(()=>Number(localStorage.getItem('count'))||0);
  useEffect(()=>{ localStorage.setItem('count',count) },[count]);
  return <button onClick={()=>setCount(c=>c+1)}>Count: {count}</button>;
}
\`\`\`

This ties lifecycle, persistence, and common bugs together.`
    );
  }

  return Promise.resolve(
    `Concrete task: implement a focused transformation (parse → transform → output) with a short code snippet and expected results to make the idea actionable.`
  );
}

export function generateSummary(topic: string | null | undefined) {
  if (!topic) return Promise.resolve('Summary: key takeaways and recommended next steps to practice the ideas.');
  const t = String(topic).trim();
  return Promise.resolve(`Summary: the lesson covered the essential ideas for ${t}, practical applications, and suggested next steps to build real experience.`);
}

// Helper: extract a concise topic from a guidance string
export function extractTopic(text: string | null | undefined) {
  if (!text) return null;
  const cleaned = String(text)
    .trim()
    .replace(/^(teach|learn|understand|explore|master|implement|build|create|develop)\s+/i, '');
  const parts = cleaned.split(/\s+(in|with|using|on|for|about|and)\s+/i);
  return parts[0] ? parts[0].trim() : cleaned;
}

// Format a short text into a clean title. Removes excess whitespace and converts to Title Case.
export function formatTitle(text: string | null | undefined) {
  if (!text) return 'New Learning Unit';
  const smallWords = new Set(['in', 'and', 'or', 'of', 'the', 'a', 'an', 'to', 'for', 'with', 'on']);

  // Normalize whitespace and trim
  const cleaned = String(text).trim().replace(/\s+/g, ' ');

  // Lowercase everything first for consistent processing
  const parts = cleaned.toLowerCase().split(' ');

  const replacements: Record<string, string> = {
    javascript: 'JavaScript',
    java: 'Java',
    react: 'React',
    jsx: 'JSX',
    css: 'CSS',
    html: 'HTML'
  };

  const titled = parts.map((word, idx) => {
    if (replacements[word]) return replacements[word];
    if (idx !== 0 && smallWords.has(word)) return word; // keep small words lowercase unless first
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  const result = titled.join(' ');
  return result || 'New Learning Unit';
}

// Main generator: returns structured object. Accepts guidance (free text) and extracts topic internally.
export async function generateContent(duration: number | string, guidanceOrTopic: string | null | undefined): Promise<GeneratedContent> {
  const dur = Number(duration) || 0;
  let level = 'detailed';
  if (dur <= 10) level = 'short';
  else if (dur <= 30) level = 'medium';

  const maybeTopic = extractTopic(guidanceOrTopic);
  const cleanTopic = maybeTopic && maybeTopic.length ? maybeTopic : null;
  const title = cleanTopic ? `${cleanTopic} — ${dur} min` : `Learning Unit — ${dur} min`;

  const intro = await generateIntro(cleanTopic, dur, level);
  const concepts = await generateConcepts(cleanTopic, dur, level);
  const example = await generateExample(cleanTopic);
  const summary = await generateSummary(cleanTopic);

  return {
    title,
    intro,
    concepts,
    example,
    summary
  };
}

// Format structured content to markdown string
export function formatToMarkdown(contentObj: GeneratedContent | any) {
  if (!contentObj) return '';
  const title = `## ${contentObj.title || 'Learning Unit'}`;

  const intro = contentObj.intro ? `### Introduction\n\n${contentObj.intro}` : `### Introduction\n\nA concise introduction describing why this lesson matters.`;

  let concepts = '### Key Concepts\n\n';
  if (Array.isArray(contentObj.concepts) && contentObj.concepts.length) {
    concepts += contentObj.concepts.map((c: string) => `- ${c}`).join('\n');
  } else {
    concepts += '- Core idea and its practical implications.';
  }

  const example = contentObj.example ? `### Example\n\n${contentObj.example}` : `### Example\n\nA short, practical example demonstrating the main idea.`;

  const summary = contentObj.summary ? `### Summary\n\n${contentObj.summary}` : `### Summary\n\nKey takeaways and suggested next steps.`;

  return [title, intro, concepts, example, summary].map((s: string) => s.trim()).join('\n\n');
}

export default generateContent;
