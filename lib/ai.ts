import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// ── Provider configuration ──────────────────────────────────────────
// Currently: Groq (OpenAI-compatible API, sub-second inference)
// Requires: @ai-sdk/openai-compatible
//
// HOW TO SWITCH PROVIDERS — change this file, keep lib/models.ts:
//
// ── Google Gemini ───────────────────────────────────────────────────
// npm install @ai-sdk/google
//
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// const provider = createGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
// });
// export function getModel(id: string) { return provider(id); }
//
// Models: "gemini-2.5-flash" | "gemini-2.5-flash-lite" | "gemini-3-flash"
//
// ── Vercel AI Gateway ───────────────────────────────────────────────
// (npm install ai@latest — gateway ships with the "ai" package)
//
// import { createGateway } from "ai";
// const provider = createGateway({
//   apiKey: process.env.AI_GATEWAY_API_KEY,
// });
// export function getModel(id: string) {
//   return provider(`google/${id}`);  // prefix depends on provider
// }
//
// Models: "google/gemini-3-flash" | "anthropic/claude-sonnet-4-5" | …
//
// ── Groq (current) ──────────────────────────────────────────────────
// npm install @ai-sdk/openai-compatible
//
// Requires "JSON" in the prompt when using structured output.
// ─────────────────────────────────────────────────────────────────────

const groq = createOpenAICompatible({
  name: "groq",
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export function getModel(modelId: string) {
  return groq(modelId);
}
