# 🌸 LumiNotes — Your Personal AI Learning Companion

**Learn beautifully. Understand deeply. Remember longer.**

LumiNotes is an AI-powered educational platform designed to transform ordinary study materials into personalized learning experiences.

Upload your notes, presentations, or documents and let AI help you understand complex concepts, generate study materials, practice questions, identify knowledge gaps, and prepare for exams.

Unlike traditional note-taking tools, LumiNotes aims to support the entire learning journey — from understanding a concept to mastering it.

---

## ✨ Key Features

### 📚 1. Smart Document Processing
- Upload PDF, PPTX, DOCX, and TXT files.
- Extract and organize educational content.
- Convert lengthy study materials into structured learning resources.
- Preserve references to the original document wherever possible.

### 🧠 2. AI-Powered Explanations
- Convert complex concepts into beginner-friendly explanations.
- Explain topics with practical, real-world examples.
- Support multiple explanation levels:
  - Explain Like I'm Five
  - Beginner Level
  - College Level
  - Interview Level

### 📊 3. Interactive Visual Learning
- Generate flowcharts and concept maps.
- Visualize relationships between different topics.
- Simplify complicated processes using diagrams.

### 📝 4. AI-Generated Study Materials
- Quick revision notes.
- Important definitions and key points.
- Practice questions.
- Multiple-choice questions.
- Flashcards and memory aids.

### 🎯 5. Lumi Intelligence — Personalized Learning
- Identify weak topics through quiz performance.
- Track individual learning progress.
- Detect frequently misunderstood concepts.
- Recommend topics that need additional revision.

### 🗓️ 6. Exam Countdown Mode
- Create personalized study schedules.
- Organize syllabus topics into daily goals.
- Prioritize difficult and unfinished topics.
- Track exam preparation progress.

### 🎤 7. Voice-Based Viva Practice
- Practice answering questions through voice.
- Simulate an AI examiner.
- Receive feedback on conceptual understanding.
- Identify missing points in answers.

### 💬 8. AI Doubt Solver
- Ask questions about uploaded study materials.
- Get explanations for selected paragraphs or concepts.
- Request additional examples and clarification.
- Connect answers to relevant source material.

### 🌱 9. Lumi Garden — Gamified Learning
- Track study consistency.
- Earn rewards for completing learning goals.
- Grow a virtual garden as you progress.
- Make learning more engaging through gamification.

---

## 💡 What Makes LumiNotes Different?

Most study tools focus on generating summaries, flashcards, or quizzes.

LumiNotes aims to go further by connecting these activities into a continuous learning process:

**Upload → Understand → Practice → Identify Weaknesses → Revise → Master**

The goal is not just to help students read faster, but to help them understand better and remember longer.

---

## 🛠️ Technology Stack

The planned technology stack includes:

| Component | Technology |
|---|---|
| Frontend | React.js, TypeScript |
| Styling | CSS / Tailwind CSS |
| Backend | Python, FastAPI |
| AI Integration | Google Gemini API |
| PDF Processing | PyMuPDF |
| Word Documents | python-docx |
| Presentations | python-pptx |
| Visual Diagrams | Mermaid.js / SVG |
| Version Control | Git and GitHub |

*Update this section to reflect the technologies actually used in the project.*

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- Python 3.10+
- Git
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/srinidhidhinne/LumiNotes.git
cd LumiNotes
```

### 2. Set Up the Backend

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend directory:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend:

```bash
uvicorn main:app --reload
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal to access LumiNotes.

*Adjust commands and paths to match the final project structure.*

---

## 🔐 Environment Variables

Store API keys securely using environment variables.

```env
GEMINI_API_KEY=your_api_key_here
```

**Important:** Never upload your `.env` file or expose API keys in frontend code or your public GitHub repository.

Add `.env` to `.gitignore`.

---

## 📁 Project Structure

An example structure for the project:

```text
LumiNotes/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   ├── package.json
│   └── index.html
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── document_processing/
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🔮 Future Enhancements

- Handwritten notes recognition.
- AI-powered answer evaluation.
- Collaborative study rooms.
- Personalized spaced repetition.
- Advanced learning analytics.
- Multi-language explanations.
- Downloadable revision materials.
- Adaptive AI tutoring.

---

## 🎯 Our Vision

LumiNotes aims to make quality learning more accessible, personalized, and engaging.

We believe every student learns differently. Our goal is to build a learning companion that adapts to individual needs instead of expecting every student to follow the same learning method.

**Your notes. Your pace. Your growth. 🌸**

---

## 👩‍💻 Project Information

**Project:** LumiNotes  
**Category:** Artificial Intelligence | EdTech | Personalized Learning

---

## 📄 License

This project is intended for educational and learning purposes. Add an appropriate open-source license before distributing it publicly.
