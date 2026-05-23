// Model IDs — keep bare names (no provider prefix).
// When switching providers, update these to match the new provider.
// See lib/ai.ts for the full switch procedure and compatible models.

export const QUESTION_MODEL = "llama-3.3-70b-versatile" as const;
export const EVALUATION_MODEL = "llama-3.3-70b-versatile" as const;
export const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo" as const;

// ── Fallback models (Vercel AI Gateway → Claude Haiku 4.5) ─────────
// Used automatically if Groq is unavailable. Requires
// AI_GATEWAY_API_KEY in .env.local.
// Gateway model IDs use provider/model-name format.

export const QUESTION_MODEL_FALLBACK = "anthropic/claude-haiku-4-5" as const;
export const EVALUATION_MODEL_FALLBACK = "anthropic/claude-haiku-4-5" as const;
