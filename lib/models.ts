// Model IDs — keep bare names (no provider prefix).
// When switching providers, update these to match the new provider.
// See lib/ai.ts for the full switch procedure and compatible models.

export const QUESTION_MODEL = "llama-3.3-70b-versatile" as const;
export const EVALUATION_MODEL = "llama-3.3-70b-versatile" as const;
export const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo" as const;
