"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: SearchInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSubmit();
        }
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.16)] focus-within:ring-2 focus-within:ring-brand/20"
    >
      <label htmlFor="job-title" className="sr-only">
        Enter a job title
      </label>
      <input
        id="job-title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Customer Success Manager"
        disabled={isLoading}
        className="flex-1 rounded-full bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="rounded-full bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
      >
        {isLoading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
