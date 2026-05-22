"use client";

import SearchInput from "./SearchInput";

interface IdleViewProps {
  jobTitle: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function IdleView({
  jobTitle,
  onChange,
  onSubmit,
  isLoading,
}: IdleViewProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6 -mt-20">
      <h1 className="font-heading text-2xl font-normal text-zinc-900 sm:text-3xl">
        Hi. What&apos;s your job title?
      </h1>
      <SearchInput
        value={jobTitle}
        onChange={onChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        variant="idle"
      />
    </div>
  );
}
