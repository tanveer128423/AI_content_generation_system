# Content Generation Engine

A React-based frontend application for creating Learning Units and MCQ questions using AI-powered content generation with LangChain and Google Gemini.

## 🚀 Features

- **Course Management**: Define course name, outcomes, and high-level description
- **Module Organization**: Create and manage course modules
- **Learning Unit Generation**: AI-powered learning content creation
- **MCQ Question Generation**: Automatic generation of multiple-choice questions with difficulty levels
- **White-box Prompts**: All prompts are visible and editable within the application
- **File-based State**: Save and load all data from JSON files (no backend required)
- **Handlebars Templating**: Dynamic prompt compilation with context data

## 📋 Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Google Gemini API Key

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd content_generation_engine
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🧪 Running Tests

```bash
npm test
```

## 📁 Project Structure

```
content_generation_engine/
├── src/
│   ├── ai/
│   │   └── generate.js           # AI generation with LangChain
│   ├── components/
│   │   ├── CourseInput.jsx       # Course level inputs
│   │   └── FileOperations.jsx    # Save/Load functionality
│   ├── context/
│   │   └── ContentContext.jsx    # Global state management
│   ├── data/
│   │   └── data.json             # Initial state & prompts
│   ├── utils/
│   │   ├── handlebarsCompiler.js # Template compiler
│   │   ├── fileOperations.js     # File save/load
│   │   └── validationUtils.js    # Input validation
│   ├── App.jsx
│   └── main.jsx
├── tests/
├── package.json
└── README.md
```

## 💾 Data Structure

All application state is stored in a single JSON file with the following structure:

```json
{
  "metadata": {
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "version": "1.0.0"
  },
  "course": {
    "name": "Course Name",
    "outcomes": ["outcome1", "outcome2"],
    "hld": "High-level description"
  },
  "modules": [
    {
      "id": "module_id",
      "name": "Module Name",
      "description": "Description",
      "learning_units": [...]
    }
  ],
  "prompts": {
    "learning_unit": {
      "system_prompt": "...",
      "user_prompt": "..."
    },
    "questions": {
      "system_prompt": "...",
      "user_prompt": "..."
    }
  }
}
```

## 🎯 Development Roadmap

### Week 1
- [x] Project setup
- [x] Core utilities (Handlebars, file operations)
- [x] AI integration with LangChain
- [x] Context provider
- [x] File operations UI
- [x] Course input component
- [ ] Module management
- [ ] Learning unit input
- [ ] LU generation

### Week 2
- [ ] Question configuration
- [ ] Question generation
- [ ] Prompt editor
- [ ] Content preview
- [ ] Export functionality
- [ ] Testing suite

## 🧩 Key Technologies

- **React 19**: UI framework
- **Vite**: Build tool
- **LangChain**: Complete LLM orchestration framework
- **Google Gemini (via LangChain)**: AI model
- **Handlebars**: Template engine
- **Zod**: Schema validation for structured outputs
- **Material-UI**: Component library

## 📝 Usage Guide

1. **Start by defining course information**
   - Enter course name, outcomes, and HLD
   - Save the course data

2. **Create modules** (Coming soon)
   - Add modules with names and descriptions

3. **Add learning units** (Coming soon)
   - Define LU details, artifacts, and guidance
   - Generate AI-powered content

4. **Generate questions** (Coming soon)
   - Configure question distribution
   - Generate MCQs with explanations

5. **Save your work**
   - Use "Save to File" to export all data
   - Load previously saved files anytime

## 🔒 Privacy & Security

- All data is stored locally in your browser and JSON files
- No backend server or database
- API keys are stored in environment variables (never committed)
- Generated content belongs to you

## 🤝 Contributing

This is a hiring assessment project. The candidate should:
- Follow clean code principles
- Write tests for new features
- Document complex logic
- Maintain consistent code style

## 📄 License

Private project for hiring assessment.

## 🆘 Support

For issues or questions, contact the project maintainer.

---

**Built with ❤️ using React, LangChain, and Google Gemini**
