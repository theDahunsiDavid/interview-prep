"use client";

import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onReadAloud: () => void;
}

export default function QuestionCard({
  question,
  isSelected,
  onSelect,
  onReadAloud,
}: QuestionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? "border-brand bg-brand/5"
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <span className="flex-1 text-base text-zinc-900">
        {question.question}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReadAloud();
        }}
        aria-label="Read question aloud"
        className="flex-shrink-0 rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      </button>
    </div>
  );
}
