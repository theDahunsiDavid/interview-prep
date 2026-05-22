"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  variant?: "idle" | "results";
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  variant = "idle",
}: SearchInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSubmit();
        }
      }}
      className={`flex w-full items-center gap-2 rounded-full bg-white focus-within:ring-2 focus-within:ring-brand/20 ${
        variant === "results"
          ? "flex-1 max-w-2xl border border-zinc-200 py-1.5 pl-3 pr-2"
          : "max-w-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.16)] py-2 px-3"
      }`}
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
        className={`min-w-0 flex-1 rounded-full bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 ${
          variant === "results" ? "py-1" : "py-2"
        }`}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        aria-label={isLoading ? "Generating questions" : "Generate questions"}
        className={`flex items-center gap-1.5 rounded-full bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 ${
          variant === "results" ? "px-3 py-1.5" : "px-3 py-2"
        }`}
      >
        {isLoading && (
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
            aria-hidden="true"
          />
        )}
        {isLoading ? "Generating" : "Generate"}
      </button>
    </form>
  );
}
