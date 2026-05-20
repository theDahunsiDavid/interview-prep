"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";

type UIState = "idle" | "loading" | "results" | "answer-mode";

export default function Home() {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [jobTitle, setJobTitle] = useState("");

  function handleSubmit() {
    if (!jobTitle.trim()) return;
    setUiState("loading");
    // TODO: call server action to generate questions
  }

  const showSearch = uiState === "idle" || uiState === "loading";

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4">
      {showSearch && (
        <SearchInput
          value={jobTitle}
          onChange={setJobTitle}
          onSubmit={handleSubmit}
          isLoading={uiState === "loading"}
        />
      )}
    </main>
  );
}
