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
    null,
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
      className={`flex flex-1 flex-col items-center px-4 ${
        isCentered
          ? "justify-center bg-[radial-gradient(ellipse_at_center,rgba(201,106,87,0.28)_0%,rgba(201,106,87,0.08)_45%,transparent_75%)]"
          : "pt-20 gap-8"
      }`}
    >
      <div className="flex w-full flex-col items-center gap-6 -mt-20">
        {isCentered && (
          <h1 className="font-heading text-2xl font-normal text-zinc-900 sm:text-3xl">
            Hi. What's your job title?
          </h1>
        )}

        <SearchInput
          value={jobTitle}
          onChange={setJobTitle}
          onSubmit={handleSubmit}
          isLoading={uiState === "loading"}
        />
      </div>

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
