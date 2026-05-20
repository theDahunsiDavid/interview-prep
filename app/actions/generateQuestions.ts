"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { QUESTION_MODEL } from "@/lib/models";
import { questionGenerationPrompt } from "@/lib/prompts";
import type { Question } from "@/types";

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z
        .string()
        .describe("The interview question text shown to the user"),
      rationale: z
        .string()
        .describe(
          "Why this question is relevant to the role — not shown to the user, used for auditing"
        ),
    })
  ),
});

type GenerateQuestionsResult =
  | { success: true; questions: Question[] }
  | { success: false; error: string };

export async function generateQuestions(
  jobTitle: string
): Promise<GenerateQuestionsResult> {
  try {
    const { system, prompt } = questionGenerationPrompt(jobTitle);

    const { output } = await generateText({
      model: getModel(QUESTION_MODEL),
      output: Output.object({ schema: questionsSchema }),
      system,
      prompt,
    });

    console.log("Raw model response:", JSON.stringify(output.questions, null, 2));

    if (!output.questions || output.questions.length === 0) {
      return {
        success: false,
        error: "No questions were generated. Please try a different job title.",
      };
    }

    const questions: Question[] = output.questions.map((q) => ({
      id: crypto.randomUUID(),
      ...q,
    }));

    return { success: true, questions };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    // Log the full error on the server for debugging
    console.error("generateQuestions error:", error);

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
          "The AI model is experiencing high demand right now. Please try again in a moment, or switch to a less busy model.",
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
      message.includes("model") &&
      (message.includes("not found") || message.includes("not supported"))
    ) {
      return {
        success: false,
        error:
          "The AI model is not available. Please try again or contact support.",
      };
    }

    if (
      message.includes("no object generated") ||
      message.includes("schema") ||
      message.includes("invalid")
    ) {
      return {
        success: false,
        error:
          "The AI response was malformed. Please try again.",
      };
    }

    return {
      success: false,
      error: "Something went wrong generating questions. Please try again.",
    };
  }
}
