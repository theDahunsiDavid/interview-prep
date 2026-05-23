"use client";

import type { Question } from "@/types";
import SpeakerButton from "./SpeakerButton";

interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  isSpeaking: boolean;
  onSelect: () => void;
  onReadAloud: () => void;
}

export default function QuestionCard({
  question,
  index,
  isSelected,
  isSpeaking,
  onSelect,
  onReadAloud,
}: QuestionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex w-full cursor-pointer flex-col rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? "border-brand bg-brand/5"
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-400">
          Question {index + 1}
        </span>
        <SpeakerButton isSpeaking={isSpeaking} onClick={onReadAloud} />
      </div>
      <span className="text-base text-zinc-900">{question.question}</span>
    </div>
  );
}
