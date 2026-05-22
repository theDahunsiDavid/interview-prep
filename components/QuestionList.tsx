"use client";

import type { Question } from "@/types";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  speakingQuestionId: string | null;
  onSelect: (id: string) => void;
  onReadAloud: (id: string) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  speakingQuestionId,
  onSelect,
  onReadAloud,
}: QuestionListProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={index}
          isSelected={q.id === selectedId}
          isSpeaking={q.id === speakingQuestionId}
          onSelect={() => onSelect(q.id)}
          onReadAloud={() => onReadAloud(q.id)}
        />
      ))}
    </div>
  );
}
