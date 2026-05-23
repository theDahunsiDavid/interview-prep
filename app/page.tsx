"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import IdleView from "@/components/IdleView";
import ResultsView from "@/components/ResultsView";
import AnswerStudio from "@/components/AnswerStudio";
import { generateQuestions } from "@/app/actions/generateQuestions";
import type { Question, UIState, Attempt } from "@/types";

export default function Home() {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [speakingQuestionId, setSpeakingQuestionId] = useState<string | null>(
    null,
  );

  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>({});

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("interview-prep-state");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.jobTitle && saved.questions?.length) {
          setJobTitle(saved.jobTitle);
          setQuestions(saved.questions);
          setUiState(saved.uiState || "results");
          if (saved.selectedQuestionId) {
            setSelectedQuestionId(saved.selectedQuestionId);
          }
          if (saved.attempts) {
            setAttempts(saved.attempts);
          }
        }
      }
    } catch {
      // Corrupted localStorage data — fall through to idle.
    }
    setHydrated(true);
  }, []);

  const previousUIState = useRef<UIState>("idle");

  async function handleSubmit() {
    const title = jobTitle.trim();
    if (!title) return;
    previousUIState.current = uiState;
    window.speechSynthesis.cancel();
    setSpeakingQuestionId(null);
    setError(null);
    setUiState("loading");

    const result = await generateQuestions(jobTitle.trim());

    if (result.success) {
      setQuestions(result.questions);
      setSelectedQuestionId(null);
      setUiState("results");

      try {
        localStorage.setItem(
          "interview-prep-state",
          JSON.stringify({
            jobTitle: title,
            questions: result.questions,
            uiState: "results",
            selectedQuestionId: null,
            attempts: {},
          }),
        );
      } catch {
        // localStorage full or unavailable — app still works.
      }
    } else {
      setError(result.error);
      setUiState("idle");
    }
  }

  function handleSelectQuestion(id: string) {
    setSelectedQuestionId(id);
    setUiState("answer-mode");

    try {
      localStorage.setItem(
        "interview-prep-state",
        JSON.stringify({
          jobTitle,
          questions,
          uiState: "answer-mode",
          selectedQuestionId: id,
          attempts,
        }),
      );
    } catch {
      // localStorage full or unavailable — app still works.
    }
  }

  function handleAttemptComplete(questionId: string, attempt: Attempt) {
    setAttempts((prev) => {
      const updated = {
        ...prev,
        [questionId]: [...(prev[questionId] || []), attempt],
      };
      try {
        localStorage.setItem(
          "interview-prep-state",
          JSON.stringify({
            jobTitle,
            questions,
            uiState,
            selectedQuestionId,
            attempts: updated,
          }),
        );
      } catch {
        // localStorage full or unavailable — app still works.
      }
      return updated;
    });
  }

  function handleReadAloud(id: string) {
    if (speakingQuestionId === id) {
      window.speechSynthesis.cancel();
      setSpeakingQuestionId(null);
      return;
    }

    const question = questions.find((q) => q.id === id);
    if (!question) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.onstart = () => setSpeakingQuestionId(id);
    utterance.onend = () => setSpeakingQuestionId(null);
    utterance.onerror = () => setSpeakingQuestionId(null);

    window.speechSynthesis.speak(utterance);
  }

  function handleReset() {
    window.speechSynthesis.cancel();
    setSpeakingQuestionId(null);
    setJobTitle("");
    setQuestions([]);
    setSelectedQuestionId(null);
    setAttempts({});
    setError(null);
    setUiState("idle");
    localStorage.removeItem("interview-prep-state");
  }

  const loadingFromResults =
    uiState === "loading" &&
    (previousUIState.current === "results" ||
      previousUIState.current === "answer-mode");

  const showHeaderSearch =
    uiState === "results" ||
    uiState === "answer-mode" ||
    loadingFromResults;

  const useIdleLayout =
    uiState === "idle" ||
    (uiState === "loading" && !loadingFromResults);

  const selectedQuestion = questions.find(
    (q) => q.id === selectedQuestionId,
  );

  if (!hydrated) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white">
          <div className="mx-auto flex flex-col sm:flex-row sm:h-20 max-w-[90rem] items-start sm:items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-0 gap-5 sm:gap-8">
            <Link href="/" className="flex items-center" onClick={(e) => { e.preventDefault(); handleReset(); }}>
              <Image
                src="/interviewprep-small-logo.svg"
                alt="Interview Prep"
                width={112}
                height={28}
                className="h-8 sm:h-7 w-auto"
                priority
                unoptimized
              />
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-start px-4 sm:px-6 lg:px-8 pt-20" />
      </>
    );
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${showHeaderSearch ? "bg-white" : ""}`}>
        <div className="mx-auto flex flex-col sm:flex-row sm:h-20 max-w-[90rem] items-start sm:items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-0 gap-5 sm:gap-8">
          <Link href="/" className="flex items-center" onClick={(e) => { e.preventDefault(); handleReset(); }}>
            <Image
              src="/interviewprep-small-logo.svg"
              alt="Interview Prep"
              width={112}
              height={28}
              className="h-8 sm:h-7 w-auto"
              priority
              unoptimized
            />
          </Link>
          {showHeaderSearch && (
            <SearchInput
              value={jobTitle}
              onChange={setJobTitle}
              onSubmit={handleSubmit}
              isLoading={loadingFromResults}
              variant="results"
            />
          )}
        </div>
      </header>

      <main
        onClick={() => {
          if (uiState === "results") {
            setSelectedQuestionId(null);
          }
        }}
        className={`flex flex-1 flex-col ${
          useIdleLayout
            ? "items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(201,106,87,0.28)_0%,rgba(201,106,87,0.08)_45%,transparent_75%)] px-4"
            : "items-start px-4 sm:px-6 lg:px-8 pt-28 sm:pt-20 pb-8 gap-8"
        }`}
      >
        {loadingFromResults ? (
          <div className="mx-auto max-w-[90rem] w-full flex items-center justify-center py-20">
            <span
              className="inline-block h-6 w-6 rounded-full border-[3px] border-brand/30 border-t-brand animate-spin"
              aria-label="Generating questions"
            />
          </div>
        ) : uiState === "idle" || uiState === "loading" ? (
          <IdleView
            jobTitle={jobTitle}
            onChange={setJobTitle}
            onSubmit={handleSubmit}
            isLoading={uiState === "loading"}
          />
        ) : uiState === "results" ? (
          <ResultsView
            questions={questions}
            selectedId={selectedQuestionId}
            speakingQuestionId={speakingQuestionId}
            onSelect={handleSelectQuestion}
            onReadAloud={handleReadAloud}
          />
        ) : selectedQuestion ? (
          <div className="mx-auto max-w-[90rem] w-full flex flex-col gap-6 mt-8 lg:px-42">
            <button
              type="button"
              onClick={() => {
                setUiState("results");
                try {
                  localStorage.setItem(
                    "interview-prep-state",
                    JSON.stringify({
                      jobTitle,
                      questions,
                      uiState: "results",
                      selectedQuestionId,
                      attempts,
                    }),
                  );
                } catch {
                  // localStorage full or unavailable.
                }
              }}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors self-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to questions
            </button>
            <AnswerStudio
              key={selectedQuestion.id}
              question={selectedQuestion}
              jobTitle={jobTitle}
              isSpeaking={selectedQuestion.id === speakingQuestionId}
              onReadAloud={() => handleReadAloud(selectedQuestion.id)}
              attempts={attempts[selectedQuestion.id] || []}
              onAttemptComplete={(attempt) =>
                handleAttemptComplete(selectedQuestion.id, attempt)
              }
            />
          </div>
        ) : null}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
