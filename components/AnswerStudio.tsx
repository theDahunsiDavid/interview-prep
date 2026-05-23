"use client";

import { useState, useRef, useEffect } from "react";
import SpeakerButton from "./SpeakerButton";
import { transcribeAudio } from "@/app/actions/transcribeAudio";
import { evaluateAnswer } from "@/app/actions/evaluateAnswer";
import type { Question, Attempt } from "@/types";

type RecordingStatus = "idle" | "requesting" | "recording" | "done";

interface AnswerStudioProps {
  question: Question;
  jobTitle: string;
  isSpeaking: boolean;
  onReadAloud: () => void;
  attempts: Attempt[];
  onAttemptComplete: (attempt: Attempt) => void;
}

export default function AnswerStudio({ question, jobTitle, isSpeaking, onReadAloud, attempts, onAttemptComplete }: AnswerStudioProps) {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [transcript, setTranscript] = useState<string | null>(null);
  const [transcriptStatus, setTranscriptStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const [evaluationStatus, setEvaluationStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    summary: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (attempts.length > 0) {
      const latest = attempts[attempts.length - 1];
      setTranscript(latest.transcript);
      setTranscriptStatus("done");
      setEvaluation({
        score: latest.score,
        strengths: latest.strengths,
        improvements: latest.improvements,
        summary: latest.summary,
      });
      setEvaluationStatus("done");
      setStatus("done");
    }
  }, []);

  function cleanup() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function startRecording() {
    setError(null);
    setStatus("requesting");
    abortedRef.current = false;

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError(
        "Your browser does not support audio recording. Please try Chrome, Firefox, or Edge.",
      );
      setStatus("idle");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (abortedRef.current) {
          cleanup();
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setStatus("done");
        cleanup();
        transcribe(blob);
      };

      mediaRecorder.start();
      setStatus("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      cleanup();

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError(
            "Microphone access was denied. Open your browser settings, find this site in the microphone permissions, and set it to Allow. Your browser may ask you to reload — ignore that and click Try again below instead.",
          );
        } else if (err.name === "NotFoundError") {
          setError(
            "No microphone found. Please connect a microphone and try again.",
          );
        } else {
          setError(
            "Could not access the microphone. Please check your device settings.",
          );
        }
      } else {
        setError(
          "Something went wrong while starting the recording. Please try again.",
        );
      }

      setStatus("idle");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  async function transcribe(blob: Blob) {
    setTranscriptStatus("loading");
    setTranscriptError(null);

    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    const result = await transcribeAudio(formData);

    if (result.success) {
      setTranscript(result.transcript);
      setTranscriptStatus("done");
      evaluate(result.transcript);
    } else {
      setTranscriptError(result.error);
      setTranscriptStatus("error");
    }
  }

  async function evaluate(transcriptText: string) {
    setEvaluationStatus("loading");
    setEvaluationError(null);

    const result = await evaluateAnswer(
      jobTitle,
      question.question,
      question.rationale,
      transcriptText,
    );

    if (result.success) {
      setEvaluation(result.evaluation);
      setEvaluationStatus("done");
      onAttemptComplete({
        transcript: transcriptText,
        score: result.evaluation.score,
        strengths: result.evaluation.strengths,
        improvements: result.evaluation.improvements,
        summary: result.evaluation.summary,
        timestamp: Date.now(),
      });
    } else {
      setEvaluationError(result.error);
      setEvaluationStatus("error");
    }
  }

  function resetRecording() {
    setAudioBlob(null);
    setError(null);
    setElapsed(0);
    setTranscript(null);
    setTranscriptStatus("idle");
    setTranscriptError(null);
    setEvaluation(null);
    setEvaluationStatus("idle");
    setEvaluationError(null);
    startRecording();
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      {/* Selected question */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-zinc-400">
            Selected question
          </p>
          <SpeakerButton isSpeaking={isSpeaking} onClick={onReadAloud} />
        </div>
        <p className="text-lg text-zinc-900">{question.question}</p>
      </div>

      <hr className="border-zinc-200" />

      {/* Recording controls */}
      <div className="flex flex-col gap-4">
        {(status === "requesting" || status === "recording") &&
          attempts.length > 0 &&
          (() => {
            const last = attempts[attempts.length - 1];
            return (
              <details className="rounded-md border border-zinc-200 overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-zinc-50 text-sm text-zinc-500">
                  View last attempt feedback
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-1">
                      Transcript
                    </p>
                    <p className="text-sm text-zinc-700">
                      {last.transcript}
                    </p>
                  </div>
                  {last.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1">
                        Strengths
                      </p>
                      <ul className="list-disc list-inside flex flex-col gap-1">
                        {last.strengths.map((s, j) => (
                          <li key={j} className="text-sm text-zinc-700">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {last.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-1">
                        Areas to improve
                      </p>
                      <ul className="list-disc list-inside flex flex-col gap-1">
                        {last.improvements.map((imp, j) => (
                          <li key={j} className="text-sm text-zinc-700">
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-zinc-600">{last.summary}</p>
                </div>
              </details>
            );
          })()}

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          </div>
        )}

        {status === "idle" && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              startRecording();
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {error ? (
              "Try again"
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path
                    fillRule="evenodd"
                    d="M8 6a4 4 0 1 1 8 0v3a4 4 0 0 1-8 0V6Zm-2 6a6 6 0 0 0 12 0h-1.5a4.5 4.5 0 1 0-9 0H6Z"
                    clipRule="evenodd"
                  />
                </svg>
                Record answer
              </>
            )}
          </button>
        )}

        {status === "requesting" && (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand/50 px-6 py-3 text-sm font-medium text-white cursor-not-allowed"
          >
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden="true"
            />
            Requesting microphone...
          </button>
        )}

        {status === "recording" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-medium text-zinc-700">
                Recording {formatTime(elapsed)}
              </span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-300 bg-red-50 px-6 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              Stop recording
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-600">
              Recording saved.
            </p>

            {transcriptStatus === "loading" && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span
                  className="inline-block h-4 w-4 rounded-full border-2 border-brand/30 border-t-brand animate-spin"
                  aria-hidden="true"
                />
                Transcribing your answer…
              </div>
            )}

            {transcriptStatus === "done" && transcript && (
              <div className="rounded-md bg-zinc-50 p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            )}

            {transcriptStatus === "error" && transcriptError && (
              <div className="rounded-md bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700" role="alert">
                  {transcriptError}
                </p>
              </div>
            )}

            {evaluationStatus === "loading" && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span
                  className="inline-block h-4 w-4 rounded-full border-2 border-brand/30 border-t-brand animate-spin"
                  aria-hidden="true"
                />
                Evaluating your answer…
              </div>
            )}

            {evaluationStatus === "done" && evaluation && (
              <div className="flex flex-col gap-3 rounded-md bg-zinc-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand text-lg font-semibold text-white">
                    {evaluation.score}
                  </span>
                  <span className="text-sm text-zinc-500">
                    out of 10
                  </span>
                </div>

                {evaluation.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">
                      Strengths
                    </p>
                    <ul className="list-disc list-inside flex flex-col gap-1">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-zinc-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-700 mb-1">
                      Areas to improve
                    </p>
                    <ul className="list-disc list-inside flex flex-col gap-1">
                      {evaluation.improvements.map((imp, i) => (
                        <li key={i} className="text-sm text-zinc-700">
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-zinc-600">{evaluation.summary}</p>
              </div>
            )}

            {evaluationStatus === "error" && evaluationError && (
              <div className="rounded-md bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700" role="alert">
                  {evaluationError}
                </p>
              </div>
            )}

            {attempts.length > 1 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-zinc-400">
                  Previous attempts
                </p>
                {attempts
                  .slice(0, -1)
                  .reverse()
                  .map((attempt, i) => (
                    <details
                      key={i}
                      className="rounded-md border border-zinc-200 overflow-hidden"
                    >
                      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
                          {attempt.score}
                        </span>
                        <span className="text-sm text-zinc-600">
                          {new Date(attempt.timestamp).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </summary>
                      <div className="px-4 pb-4 flex flex-col gap-3">
                        <div>
                          <p className="text-xs font-medium text-zinc-400 mb-1">
                            Transcript
                          </p>
                          <p className="text-sm text-zinc-700">
                            {attempt.transcript}
                          </p>
                        </div>
                        {attempt.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Strengths
                            </p>
                            <ul className="list-disc list-inside flex flex-col gap-1">
                              {attempt.strengths.map((s, j) => (
                                <li key={j} className="text-sm text-zinc-700">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {attempt.improvements.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-700 mb-1">
                              Areas to improve
                            </p>
                            <ul className="list-disc list-inside flex flex-col gap-1">
                              {attempt.improvements.map((imp, j) => (
                                <li key={j} className="text-sm text-zinc-700">
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-sm text-zinc-600">{attempt.summary}</p>
                      </div>
                    </details>
                  ))}
              </div>
            )}

            <button
              type="button"
              onClick={resetRecording}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              Rerecord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
