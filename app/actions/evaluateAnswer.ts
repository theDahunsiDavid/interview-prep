"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel, getFallbackModel, withFallback } from "@/lib/ai";
import { EVALUATION_MODEL, EVALUATION_MODEL_FALLBACK } from "@/lib/models";
import { evaluationPrompt } from "@/lib/prompts";

const evaluationSchema = z.object({
  score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Score from 1 to 10"),
  strengths: z
    .array(z.string())
    .describe("Specific strengths demonstrated in the answer"),
  improvements: z
    .array(z.string())
    .describe("Specific areas the candidate can improve"),
  summary: z
    .string()
    .describe("Plain-language summary explaining the score"),
});

type EvaluateResult =
  | {
      success: true;
      evaluation: {
        score: number;
        strengths: string[];
        improvements: string[];
        summary: string;
      };
    }
  | { success: false; error: string };

export async function evaluateAnswer(
  jobTitle: string,
  question: string,
  rationale: string,
  transcript: string,
): Promise<EvaluateResult> {
  try {
    const { system, prompt } = evaluationPrompt(
      jobTitle,
      question,
      rationale,
      transcript,
    );

    const { output } = await withFallback(
      () =>
        generateText({
          model: getModel(EVALUATION_MODEL),
          output: Output.object({ schema: evaluationSchema }),
          system,
          prompt,
        }),
      async () => {
        const fallbackModel = getFallbackModel(EVALUATION_MODEL_FALLBACK);
        if (!fallbackModel) throw new Error("Fallback model not available");
        const { text: fallbackText } = await generateText({
          model: fallbackModel,
          output: Output.text(),
          system:
            system +
            "\n\nYou must respond with valid JSON only, no markdown, no other text.",
          prompt: prompt + "\n\nRespond with valid JSON only. Do not wrap it in markdown.",
        });
        const json = fallbackText
          .replace(/```(?:json)?\s*\n?/g, "")
          .trim();
        const parsed = evaluationSchema.parse(JSON.parse(json));
        return { output: parsed };
      },
    );

    if (!output) {
      return {
        success: false,
        error:
          "The evaluation could not be completed. Please try recording again.",
      };
    }

    console.log("evaluateAnswer result:", JSON.stringify(output, null, 2));

    return {
      success: true,
      evaluation: {
        score: output.score,
        strengths: output.strengths,
        improvements: output.improvements,
        summary: output.summary,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("evaluateAnswer error:", error);

    if (message.includes("fetch") || message.includes("network")) {
      return {
        success: false,
        error:
          "Could not reach the AI service. Please check your connection and try again.",
      };
    }

    if (message.includes("timeout") || message.includes("retry")) {
      return {
        success: false,
        error: "The request timed out. Please try again.",
      };
    }

    if (
      message.includes("unavailable") ||
      message.includes("demand") ||
      message.includes("503")
    ) {
      return {
        success: false,
        error:
          "The AI model is experiencing high demand right now. Please try again in a moment.",
      };
    }

    if (message.includes("quota") || message.includes("rate")) {
      return {
        success: false,
        error:
          "The AI service is temporarily unavailable due to request limits. Please wait a moment and try again.",
      };
    }

    if (
      message.includes("no object generated") ||
      message.includes("schema") ||
      message.includes("invalid")
    ) {
      return {
        success: false,
        error: "The evaluation response was malformed. Please try again.",
      };
    }

    return {
      success: false,
      error: "Something went wrong evaluating your answer. Please try again.",
    };
  }
}
