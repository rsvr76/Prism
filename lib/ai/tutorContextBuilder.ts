/**
 * Prism AI Tutor Context Builder
 *
 * Constructs a bounded, trace-grounded context for interactive student Q&A.
 * Reuses the deterministic frame diffing and safety bounds from traceContextBuilder.
 */

import { PrismTrace } from "@/types/trace";
import { BoundedTraceContext, TutorRequest } from "@/types/ai";
import { buildBoundedTraceContext } from "./traceContextBuilder";

export const MAX_TUTOR_HISTORY = 10;
export const MAX_MESSAGE_TEXT_LENGTH = 500;
export const MAX_QUESTION_LENGTH = 800;

export interface BoundedTutorPayload {
  question: string;
  stepIndex: number;
  totalSteps: number;
  sourceCode: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  context: BoundedTraceContext;
}

/**
 * Clean and truncate message string.
 */
function truncateText(text: string, maxLen: number = MAX_MESSAGE_TEXT_LENGTH): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 3) + "...";
}

/**
 * Build bounded Tutor payload from trace, step, question, and raw history.
 */
export function buildBoundedTutorContext(
  trace: PrismTrace,
  stepIndex: number,
  question: string,
  rawHistory: Array<{ role: "user" | "assistant"; text: string }> = []
): BoundedTutorPayload | null {
  if (!trace || !trace.frames || trace.frames.length === 0) return null;
  if (stepIndex < 0 || stepIndex >= trace.frames.length) return null;

  const baseContext = buildBoundedTraceContext(trace, stepIndex);
  if (!baseContext) return null;

  const cleanQuestion = truncateText(question, MAX_QUESTION_LENGTH);

  // Bound conversation history to last MAX_TUTOR_HISTORY messages
  let isHistoryTruncated = false;
  let slicedHistory = rawHistory;

  if (rawHistory.length > MAX_TUTOR_HISTORY) {
    isHistoryTruncated = true;
    slicedHistory = rawHistory.slice(-MAX_TUTOR_HISTORY);
  }

  const boundedHistory = slicedHistory.map((msg) => ({
    role: msg.role,
    text: truncateText(msg.text),
  }));

  const context: BoundedTraceContext = {
    ...baseContext,
    isTruncated: baseContext.isTruncated || isHistoryTruncated,
    truncationReason: [
      baseContext.truncationReason,
      isHistoryTruncated ? `Conversation history capped to last ${MAX_TUTOR_HISTORY} messages` : "",
    ]
      .filter(Boolean)
      .join("; "),
  };

  return {
    question: cleanQuestion,
    stepIndex,
    totalSteps: trace.frames.length,
    sourceCode: trace.code,
    history: boundedHistory,
    context,
  };
}
