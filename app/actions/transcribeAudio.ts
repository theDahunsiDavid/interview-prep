"use server";

import { TRANSCRIPTION_MODEL } from "@/lib/models";

type TranscribeResult =
  | { success: true; transcript: string }
  | { success: false; error: string };

export async function transcribeAudio(
  formData: FormData,
): Promise<TranscribeResult> {
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile || audioFile.size === 0) {
    return {
      success: false,
      error: "No audio recording was provided. Please try recording again.",
    };
  }

  const groqFormData = new FormData();
  groqFormData.append("file", audioFile, "recording.webm");
  groqFormData.append("model", TRANSCRIPTION_MODEL);
  groqFormData.append("response_format", "json");

  try {
    console.log(
      "transcribeAudio: sending",
      "file:",
      audioFile.name,
      "type:",
      audioFile.type,
      "size:",
      `${(audioFile.size / 1024).toFixed(1)} KB`,
    );

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: groqFormData,
        signal: AbortSignal.timeout(120000),
      },
    );

    if (!response.ok) {
      console.log(
        "transcribeAudio: response",
        response.status,
        response.statusText,
      );
      if (response.status === 413) {
        return {
          success: false,
          error: "The recording is too long. Please record a shorter answer.",
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error:
            "The transcription service is busy. Please wait a moment and try again.",
        };
      }
      if (response.status === 503) {
        return {
          success: false,
          error:
            "The transcription model is temporarily unavailable. Please try again later.",
        };
      }
      return {
        success: false,
        error: "Something went wrong transcribing your answer. Please try again.",
      };
    }

    const data = await response.json();

    if (!data.text || !data.text.trim()) {
      return {
        success: false,
        error: "The transcription returned no text. Please try recording again.",
      };
    }

    return { success: true, transcript: data.text.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("transcribeAudio error:", error);

    const isTimeout =
      message.includes("timeout") ||
      message.includes("retry") ||
      (error instanceof Error &&
        "cause" in error &&
        typeof (error as { cause?: unknown }).cause === "object" &&
        (error as { cause: { code?: string } }).cause?.code === "ETIMEDOUT");

    if (isTimeout) {
      return {
        success: false,
        error: "The request timed out. Please try again.",
      };
    }

    if (message.includes("fetch") || message.includes("network")) {
      return {
        success: false,
        error:
          "Could not reach the transcription service. Please check your connection.",
      };
    }

    return {
      success: false,
      error: "Something went wrong transcribing your answer. Please try again.",
    };
  }
}
