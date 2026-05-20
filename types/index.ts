export interface Question {
  id: string;
  question: string;
  rationale: string;
}

export type UIState = "idle" | "loading" | "results" | "answer-mode";

export interface Attempt {
  transcript: string;
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  timestamp: number;
}
