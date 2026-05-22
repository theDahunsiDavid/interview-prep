"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import IdleView from "@/components/IdleView";
import ResultsView from "@/components/ResultsView";
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

  function handleReadAloud(_id: string) {
    // TODO: wire to Web Speech API
  }

  const isResults = uiState === "results" || uiState === "answer-mode";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex flex-col sm:flex-row sm:h-20 max-w-[90rem] items-start sm:items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-0 gap-5 sm:gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/interviewprep-small-logo.svg"
              alt="Interview Prep"
              width={112}
              height={28}
              className="h-8 sm:h-7 w-auto"
              unoptimized
            />
          </Link>
          {isResults && (
            <SearchInput
              value={jobTitle}
              onChange={setJobTitle}
              onSubmit={handleSubmit}
              isLoading={false}
              variant="results"
            />
          )}
        </div>
      </header>

      <main
        className={`flex flex-1 flex-col ${
          isResults
            ? "items-start px-4 sm:px-6 lg:px-8 pt-20 gap-8"
            : "items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(201,106,87,0.28)_0%,rgba(201,106,87,0.08)_45%,transparent_75%)] px-4"
        }`}
      >
        {isResults ? (
          <ResultsView
            questions={questions}
            selectedId={selectedQuestionId}
            onSelect={handleSelectQuestion}
            onReadAloud={handleReadAloud}
          />
        ) : (
          <IdleView
            jobTitle={jobTitle}
            onChange={setJobTitle}
            onSubmit={handleSubmit}
            isLoading={uiState === "loading"}
          />
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
