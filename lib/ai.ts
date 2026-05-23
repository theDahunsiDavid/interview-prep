import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModelV3 } from "@ai-sdk/provider";

// ── Provider configuration ──────────────────────────────────────────
// Primary: Groq (OpenAI-compatible API, sub-second inference)
// Fallback: Vercel AI Gateway → Claude Haiku 4.5 (OpenAI-compatible)

const groq = createOpenAICompatible({
  name: "groq",
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Gateway fallback — silently unavailable if the API key is not set.
const gateway = process.env.AI_GATEWAY_API_KEY
  ? createOpenAICompatible({
      name: "gateway",
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: "https://ai-gateway.vercel.sh/v1",
      supportsStructuredOutputs: false,
    })
  : null;

export function getModel(modelId: string) {
  return groq(modelId);
}

export function getFallbackModel(modelId: string): LanguageModelV3 | null {
  return gateway ? gateway(modelId) : null;
}

// ── Fallback helper ─────────────────────────────────────────────────
// Tries the primary function first. If it fails with a retryable error
// (timeout, connection drop, rate limit, or 503), logs a warning and
// tries the fallback. Non-retryable errors (schema mismatch, invalid
// prompt) re-throw immediately.

const RETRYABLE_PATTERNS = [
  "timeout",
  "retry",
  "fetch",
  "network",
  "unavailable",
  "demand",
  "503",
  "429",
];

function isRetryable(message: string): boolean {
  return RETRYABLE_PATTERNS.some((p) => message.includes(p));
}

export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: (() => Promise<T>) | null,
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!isRetryable(message)) {
      throw error;
    }

    if (!fallback) {
      console.warn(
        "Primary model failed (no fallback configured for %s). Try again later.",
        error,
      );
      throw error;
    }

    console.warn(
      "Primary model failed (%s). Retrying with fallback. %s",
      message,
      error,
    );
    return await fallback();
  }
}
