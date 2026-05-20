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
      className="flex w-full max-w-xl gap-2"
    >
      <label htmlFor="job-title" className="sr-only">
        Enter a job title
      </label>
      <input
        id="job-title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Customer Success Manager"
        disabled={isLoading}
        className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="rounded-lg bg-brand px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
