# AI Learning Content Generator

Generate structured learning material and assessment quizzes from a topic using Google Gemini. The application helps educators, trainers, and students quickly create learning units with editable AI-generated content.

**Live Demo:** https://ai-content-generation-system.vercel.app/

**Portfolio:** https://khalid-tanveer.vercel.app

---

## Overview

AI Learning Content Generator is a web application that automates the creation of educational content using Large Language Models. Users can define a learning topic, customize prompts, generate lesson content, and create quizzes from the generated material.

The application also supports saving workspaces, editing generated content, and using a personal Gemini API key without storing any user data.

---

## Features

### Content Generation

* Generate structured learning units from any topic
* AI-generated explanations and educational content
* Markdown-based content editing and preview
* Customizable prompt templates

### Quiz Generation

* Generate quizzes directly from learning content
* Multiple question generation workflows
* Editable quiz output before export

### Workspace Management

* Save and reload learning workspaces
* Continue editing previously generated content
* Preserve project state during development

### Developer Features

* Bring Your Own Gemini API Key (BYOK)
* Responsive Material UI interface
* Modular React architecture
* Stateless application design

---

## Architecture

```text
          User Input
               │
               ▼
      Prompt Configuration
               │
               ▼
       LangChain Pipeline
               │
               ▼
      Google Gemini API
               │
               ▼
     Generated Learning Unit
               │
        ┌──────┴──────┐
        ▼             ▼
 Markdown Preview   Quiz Generator
```

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Material UI

### AI & Prompt Engineering

* LangChain
* Google Gemini API

### Development

* npm
* ESLint

---

## Project Structure

```text
AI-Learning-Content-Generator
├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── services
│   ├── utils
│   └── assets
├── public
└── package.json
```

---

## Workflow

1. Enter a learning topic.
2. Configure or customize the AI prompt.
3. Generate a structured learning unit.
4. Review and edit the generated content.
5. Generate quizzes from the lesson.
6. Save the workspace for future editing.

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm
* Google Gemini API Key

---

### Installation

```bash
git clone <repository-url>

cd AI-Learning-Content-Generator

npm install
```

Create a `.env` file and add your Gemini API key.

```env
VITE_GEMINI_API_KEY=your_api_key
```

Start the development server.

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
npm run preview
```

---

## Design Decisions

### Bring Your Own API Key

Users can provide their own Gemini API key, allowing them to use the application without requiring a backend-managed key.

### Editable AI Output

Generated content is intended to be reviewed and modified before use instead of being treated as final output.

### Markdown-Based Content

Learning material is generated in Markdown, making it easy to preview, edit, and export.

### Modular Architecture

The application separates UI, prompt management, and AI interactions into reusable components for easier maintenance.

---

## Technical Challenges

* Designing prompts that consistently generate structured educational content
* Producing quizzes that align with generated lessons
* Maintaining consistent formatting across different AI responses
* Building an editable workflow instead of a one-time content generator
* Managing API failures and invalid responses gracefully

---

## Future Improvements

* Multiple AI provider support
* Export to PDF and DOCX
* Interactive flashcards
* Difficulty-level customization
* Learning progress tracking
* Content version history
* Collaborative editing

---

## Security

* User API keys are never stored
* No generated content is persisted unless explicitly saved
* Client-side API key handling
* Stateless application architecture

---

## Author

**Mohammad Khalid Tanveer**

Portfolio: https://khalid-tanveer.vercel.app

GitHub: https://github.com/tanveer128423

LinkedIn: https://www.linkedin.com/in/khalid-tanveer-04165b309/
