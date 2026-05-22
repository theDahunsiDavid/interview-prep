"use client";

import type { Question } from "@/types";
import QuestionList from "./QuestionList";

interface ResultsViewProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReadAloud: (id: string) => void;
}

export default function ResultsView({
  questions,
  selectedId,
  onSelect,
  onReadAloud,
}: ResultsViewProps) {
  return (
    <div className="mx-auto max-w-[90rem] flex flex-col items-center lg:items-start gap-6 mt-6 sm:mt-0 lg:pl-42 w-full">
      <QuestionList
        questions={questions}
        selectedId={selectedId}
        onSelect={onSelect}
        onReadAloud={onReadAloud}
      />
    </div>
  );
}
