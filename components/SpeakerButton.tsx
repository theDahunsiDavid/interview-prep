"use client";

interface SpeakerButtonProps {
  isSpeaking: boolean;
  onClick: () => void;
}

export default function SpeakerButton({
  isSpeaking,
  onClick,
}: SpeakerButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={isSpeaking ? "Stop reading" : "Read question aloud"}
      className={
        "flex-shrink-0 rounded-md p-1 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand/20 " +
        (isSpeaking
          ? "text-brand hover:text-brand"
          : "text-zinc-400 hover:text-zinc-600")
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    </button>
  );
}
