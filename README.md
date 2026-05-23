# Interview Prep

AI-powered deliberate practice for job interviews. Enter a job title, get role-specific questions, record your answers, and receive scored feedback with actionable improvements.

**[Live URL](#)** · **[Loom walkthrough](#)**

---

## Quick start

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and add your API key:

```
GROQ_API_KEY=your_key_here
```

Get a free key at [console.groq.com](https://console.groq.com) (no credit card required).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech stack

| Layer               | Choice                             | Why                                                                     |
| ------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| Framework           | Next.js 16 (App Router)            | Server actions keep API keys off the client; zero-config Vercel hosting |
| AI orchestration    | Vercel AI SDK (`ai` v6)            | Provider-agnostic — swap models in one line                             |
| Question generation | Llama 3.3 70B via Groq             | Strong reasoning and structured JSON output; free tier                  |
| Answer evaluation   | Llama 3.3 70B via Groq             | Same model, separate prompt with scoring rubric                         |
| Audio transcription | Whisper Large v3 Turbo via Groq    | Industry-standard transcription; same API key                           |
| Styling             | Tailwind CSS v4                    | Utility classes keep markup readable without switching files            |
| Audio recording     | MediaRecorder API (browser native) | No external service, no cost, works on all modern browsers              |
| Text-to-speech      | Web Speech API (browser native)    | Free, built-in, sufficient for reading 2–3 sentence questions           |
| Persistence         | localStorage                       | Survives reloads without a database, no auth required                   |
| Hosting             | Vercel                             | Free tier, automatic deploys from Git push                              |

---

## Architecture decisions

The overarching philosophy for the current architecture of this app is this: avoid unnecessary complexity.

**Single page, no routing.** The app's current scope does not require cross-session persistence or URL shareability, so adding routes for each page is unnecessary complexity. All UI states (idle, results, answer mode) live in one component with `useState`. No page reloads, no URL changes. Also, the app doesn't rely on browser history for navigation: since there are no URL changes, the browser back button just exits the app entirely. Instead, the app has its own navigation: a "← Back to questions" button moves you from answer mode to results, and a header search bar lets you start fresh with a new job title from anywhere.

**Server actions for all AI calls.** API keys live in `.env.local` on the server and never touch the browser, so all secrets are safe. Every prompt and API call runs inside `"use server"` functions. The client sends plain arguments (job title, audio file, transcript) and receives validated typed objects. It never sees raw AI output.

**localStorage over a database.** The app's current scope does not require cross-device sync or multi-session history, so a database is not needed at this stage. Local storage is used instead. Question-generation attempts survive page reloads and tab closures without a server database, schema, migrations, or auth. The shape of the stored object is `{ jobTitle, questions, uiState, selectedQuestionId, attempts }` keyed under one key. A `handleSubmit` function resets localStorage on new question generation.

**Prompt design as logic, not config.** All prompts live in `lib/prompts.ts` as functions that return `{ system, prompt }` objects. Each function accepts the runtime data (job title, transcript, rationale) and builds the prompt string. This makes prompts auditable, testable, and version-controlled. They're part of the codebase, not hidden in a database or CMS.

**Model selection per task.** Each task (e.g., question generation, audio transcription, or answer evaluation) gets its own model assignment in `lib/models.ts`. Changing a model for any task is a one-line edit. No prompt changes, no server action changes. Also, the provider is abstracted behind `lib/ai.ts` so the entire stack can switch from Groq to Gemini or Vercel AI Gateway by editing one file. This way, there is no vendor lock-in. If a particular AI model vendor (e.g., Groq) is having issues, we can easily switch to Google's Gemini or Vercel's AI Gateway by making minor edits in one file.

**Native browser APIs over paid services.** At this stage, paying for a recording service, text-to-speech (TTS) API, or client-side database adds cost, complexity, and latency with no user benefit. MediaRecorder, Web Speech, and localStorage are free and built into every modern browser, so the current implementation uses these.

---

## Project structure

```
├── app/
│   ├── page.tsx                    # Single page, all UI state and transitions
│   ├── layout.tsx                  # Root layout, fonts, metadata
│   ├── globals.css                 # Tailwind, brand tokens
│   └── actions/
│       ├── generateQuestions.ts    # Job title → 3 questions
│       ├── transcribeAudio.ts      # Audio blob → transcript
│       └── evaluateAnswer.ts      # Transcript → score + feedback
├── components/
│   ├── SearchInput.tsx             # Job title input + submit button
│   ├── IdleView.tsx                # Centered idle screen
│   ├── ResultsView.tsx             # Question list container
│   ├── QuestionList.tsx            # Vertical stack of question cards
│   ├── QuestionCard.tsx            # Single question row with TTS icon
│   ├── AnswerStudio.tsx            # Recording, transcription, evaluation
│   ├── SpeakerButton.tsx           # Reusable TTS icon button
│   └── CopyButton.tsx             # Reusable clipboard copy button
├── lib/
│   ├── ai.ts                       # Provider abstraction (currently Groq)
│   ├── models.ts                   # Model assignments per task
│   └── prompts.ts                  # All AI prompt templates
├── types/
│   └── index.ts                    # Shared TypeScript types
├── out/                            # Planning docs and commit histories
├── .env.local.example              # Environment variable documentation
└── next.config.ts                  # Next.js config (server action body limit)
```

---

## Provider switching

The app currently uses Groq. To switch providers, edit `lib/ai.ts` — the file contains commented-out configurations for Google Gemini and Vercel AI Gateway with copy-paste code and installation commands. Then update the model IDs in `lib/models.ts`. Server actions and prompts require no changes.
