"use client";

import type { Question } from "@/types";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReadAloud: (id: string) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onReadAloud,
}: QuestionListProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          isSelected={q.id === selectedId}
          onSelect={() => onSelect(q.id)}
          onReadAloud={() => onReadAloud(q.id)}
        />
      ))}
    </div>
  );
}
