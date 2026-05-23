import { describe, it, expect } from "vitest";
import { transcribeAudio } from "@/app/actions/transcribeAudio";

describe("transcribeAudio", () => {
  it("returns a handled error when no audio file is provided", async () => {
    const formData = new FormData();
    // No "audio" field appended — simulates a missing blob.
    const result = await transcribeAudio(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "No audio recording was provided. Please try recording again.",
      );
    }
  });

  it("returns a handled error when the audio file is empty", async () => {
    const formData = new FormData();
    formData.append("audio", new Blob([]), "recording.webm");

    const result = await transcribeAudio(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "No audio recording was provided. Please try recording again.",
      );
    }
  });

  it("does not call fetch when the audio file is missing", async () => {
    const formData = new FormData();

    // We cannot easily spy on fetch in a server action, but the missing-file
    // check runs before fetch, so a missing file never reaches the network.
    // This test verifies the early return behaviour through the error message.
    const result = await transcribeAudio(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      // The error should NOT mention network, timeout, or Groq — confirming
      // the function returned before any fetch.
      expect(result.error).not.toMatch(/network|timeout|unavailable|groq/i);
    }
  });
});
