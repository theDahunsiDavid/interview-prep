"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import QuestionList from "@/components/QuestionList";
import { generateQuestions } from "@/app/actions/generateQuestions";
import type { Question, UIState } from "@/types";

export default function Home() {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!jobTitle.trim()) return;
    setError(null);
    setUiState("loading");

    const result = await generateQuestions(jobTitle.trim());

    if (result.success) {
      setQuestions(result.questions);
      setSelectedQuestionId(null);
      setUiState("results");
    } else {
      setError(result.error);
      setUiState("idle");
    }
  }

  function handleSelectQuestion(id: string) {
    setSelectedQuestionId(id);
    setUiState("answer-mode");
  }

  function handleReadAloud(id: string) {
    // TODO: wire to Web Speech API
  }

  const isCentered = uiState === "idle" || uiState === "loading";

  return (
    <main
      className={`flex min-h-svh flex-col items-center px-4 ${
        isCentered ? "justify-center" : "pt-8 gap-8"
      }`}
    >
      <SearchInput
        value={jobTitle}
        onChange={setJobTitle}
        onSubmit={handleSubmit}
        isLoading={uiState === "loading"}
      />

      {uiState === "loading" && (
        <p className="text-sm text-zinc-500" role="status">
          Generating questions…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {(uiState === "results" || uiState === "answer-mode") && (
        <QuestionList
          questions={questions}
          selectedId={selectedQuestionId}
          onSelect={handleSelectQuestion}
          onReadAloud={handleReadAloud}
        />
      )}
    </main>
  );
}
