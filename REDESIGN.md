# AI Course & Quiz Maker — Redesign System

> A complete visual & UX redesign toward a premium, AI-native SaaS — in the spirit of
> Linear, Notion, Framer, Vercel, Cursor, and Apple.
>
> **Non-destructive guarantee:** no backend, business logic, database, routing, or feature
> was changed. This redesign operates entirely through the **design system (MUI theme)** and
> the **app shell** visual treatment. Every component inherits the new language automatically.

---

## 1. Redesign Strategy

The current UI is *maximalist*: animated aurora blobs, dotted page texture, multiple
simultaneous gradients, glassmorphism, pill buttons, 16–20px radii, and heavy multi-layer
shadows. It reads as "decorated," which competes with the content and the AI.

The redesign inverts this with **five moves**:

1. **Quiet the canvas.** Remove the aurora blobs, dotted texture, and gradient washes. The
   background becomes a single calm neutral so content and AI are the only focal points.
2. **Hairline structure, not heavy chrome.** Replace big drop shadows + glass with crisp
   1px borders and one soft elevation token. ~70% less visual noise.
3. **Calmer geometry.** Pills → 8px buttons. 16–20px card radii → 10–12px. One accent
   gradient reserved *only* for the primary AI action.
4. **One cohesive typeface.** Inter everywhere with Apple-grade negative tracking on
   headings (drop the secondary display font for consistency).
5. **AI as the protagonist.** Generation actions get the single brand gradient; everything
   else is neutral, so the eye always lands on "Generate."

---

## 2. New Page Architecture

Information architecture and routing are **unchanged**. The same three views remain:
`content`, `content-prompts`, `quiz-prompts`. The shell is re-expressed as a calm
three-zone workspace:

```
┌──────────────┬──────────────────────────────────────┬───────────────┐
│  EXPLORER    │            WORKSPACE                  │  AI COPILOT    │
│  (Structure) │            (Notion-style canvas)      │  (optional)    │
│              │                                        │               │
│  Course ▸    │   Breadcrumb · Title                  │  Generate      │
│   Module ▸   │   ───────────────────────────         │  Prompts       │
│    Lesson    │   Content / Editor / Quiz             │  Suggestions   │
│              │                                        │               │
└──────────────┴──────────────────────────────────────┴───────────────┘
```

- **Explorer (left):** the existing tree, restyled as a lightweight file explorer —
  flat hover states, a single inset accent bar for the active node, dashed guide lines.
- **Workspace (center):** a Notion-like document surface — generous whitespace, a quiet
  breadcrumb chip, content-first hierarchy.
- **AI Copilot (right / inline):** the generation + prompt panels read as a Cursor/Lovable
  copilot — the one place where the brand gradient lives.

---

## 3. Component Hierarchy

```
App
└─ MainAppShell
   ├─ Explorer (Sidebar)        ← course/module/lesson tree
   ├─ Workspace (MainWorkspace) ← breadcrumb + active editor
   │  ├─ CourseEditor
   │  ├─ ModuleEditor
   │  └─ LearningUnitWorkspace  ← content + QuizGenerationPanel (AI Copilot)
   └─ Prompt views (Content/Quiz prompt workspaces)
```

No components were added, removed, or re-parented — only restyled via theme tokens.

---

## 4. UX Improvements

- **Reduced cognitive load:** removing ambient motion + texture lets users focus on one
  task at a time (progressive disclosure preserved by the existing view switching).
- **Stronger active state:** the selected tree node uses an inset accent bar + tinted
  fill instead of competing color, so location is always obvious.
- **Clear primary action:** only AI generation uses the gradient button — a single,
  unmistakable call to action per screen.
- **Calmer focus rings:** 3px soft-indigo focus halo, accessible and quiet.
- **Motion with intent:** one gentle `rise-in` on view change; `prefers-reduced-motion`
  honored. No infinite ambient animation.

---

## 5. Design System (tokens)

Implemented in `src/main.tsx` (MUI theme) and surfaced as CSS variables in `src/index.css`.

### 6. Color Palette

| Token            | Light       | Role                                   |
|------------------|-------------|----------------------------------------|
| `--canvas`       | `#FBFBFB`   | App background (single calm neutral)   |
| `--surface`      | `#FFFFFF`   | Panels, cards, editor                  |
| `--surface-muted`| `#F6F6F7`   | Subtle fills, hovers                   |
| `--border`       | `#ECECEE`   | Hairline borders                       |
| `--border-strong`| `#E0E0E3`   | Inputs / dividers                      |
| `--text`         | `#18181B`   | Primary text                           |
| `--text-muted`   | `#71717A`   | Secondary text                         |
| `--accent`       | `#5B5BD6`   | Brand indigo (interactive)             |
| `--accent-strong`| `#4B4ACF`   | Hover / pressed                        |
| `--accent-soft`  | `#EEEEFB`   | Tinted selection fill                  |
| AI gradient      | `linear-gradient(120deg,#5B5BD6,#7C5CFF 55%,#22B8CF)` | reserved for AI CTA |
| success/warn/err | `#16A34A` / `#D97706` / `#DC2626` | semantic |

Dark mode tokens are defined in the theme (`prefers-color-scheme`-ready) using
`#0B0B0F` canvas, `#141417` surface, `#26262B` border, `#F4F4F5` text.

### 7. Typography Scale

Single family: **Inter** (system-ui fallbacks). Tight tracking on headings.

| Style | Size / Line | Weight | Tracking |
|-------|-------------|--------|----------|
| Display / h1 | 32 / 1.15 | 700 | -0.025em |
| h2 | 26 / 1.2 | 700 | -0.02em |
| h3 | 21 / 1.25 | 650 | -0.018em |
| h4 | 18 / 1.3 | 650 | -0.014em |
| h5 | 16 / 1.4 | 650 | -0.01em |
| h6 / overline label | 13 / 1.4 | 600 | 0.02em |
| body1 | 15 / 1.6 | 400 | 0 |
| body2 | 13.5 / 1.55 | 400 | 0 |
| button | 14 | 600 | 0 |

### 8. Spacing Scale

4px base grid (MUI spacing unit kept at 8 → `theme.spacing(0.5)` = 4px).
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Default panel padding 24px; section gaps 24px.

### Radii & Elevation

- Radii: `sm 8` (buttons/inputs), `md 10` (cards), `lg 12` (panels), `xl 16` (dialogs).
- Elevation: a single soft token —
  `0 1px 2px rgba(16,24,40,.04), 0 8px 24px -16px rgba(16,24,40,.18)`.

---

## 9. Component Redesign Specs

- **Buttons:** 8px radius, weight 600, no uppercase. Contained-primary = AI gradient,
  reserved for generation. Outlined = hairline border, neutral hover fill.
- **Inputs:** 8px radius, hairline border, 3px soft focus halo, white fill.
- **Cards / Paper:** 10–12px radius, hairline border, single soft shadow (no glass).
- **Tree (Explorer):** 8px hover, inset 3px accent bar + `accent-soft` fill for active.
- **Chips / breadcrumb:** quiet tinted pill, 999 radius only here (intentional).
- **Dialogs:** 16px radius, soft shadow, hairline border.
- **Tooltips:** near-black, 8px radius, 12px text.

---

## 10. React + Tailwind Implementation Notes

This codebase uses **React 19 + MUI v7 + Emotion** (not Tailwind). The idiomatic,
non-destructive way to ship this system is the **MUI theme** — which is what was done
(`src/main.tsx`). All tokens are also exposed as CSS variables in `:root` for any future
plain-CSS or Tailwind migration.

**If migrating to Tailwind later**, map these tokens to `tailwind.config` `theme.extend`:

```js
// tailwind.config.js (future migration target)
extend: {
  colors: {
    canvas: '#FBFBFB', surface: '#FFFFFF', 'surface-muted': '#F6F6F7',
    border: '#ECECEE', text: '#18181B', 'text-muted': '#71717A',
    accent: { DEFAULT: '#5B5BD6', strong: '#4B4ACF', soft: '#EEEEFB' },
  },
  borderRadius: { sm: '8px', md: '10px', lg: '12px', xl: '16px' },
  boxShadow: { soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -16px rgba(16,24,40,.18)' },
  fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
}
```

Recommended motion lib: **Framer Motion** for view transitions
(`AnimatePresence` on the workspace), keeping the reduced-motion guard.
