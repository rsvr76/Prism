/**
 * Test Suite: Phase 5 Interactive AI Tutor Drawer
 * Covers context construction, bounded history, grounding rules, anti-prediction,
 * Zod schemas, trace correctness, and mock provider integration.
 */

import { describe, it, expect } from "vitest";
import { buildBoundedTutorContext } from "@/lib/ai/tutorContextBuilder";
import { formatTutorUserPrompt } from "@/lib/ai/tutorGroundingPrompt";
import { TutorRequestSchema, TutorResponseSchema } from "@/lib/ai/schemas";
import { generateTutorResponse } from "@/lib/ai/llmClient";
import type { PrismFrame, PrismTrace } from "@/types/trace";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function makeFrame(overrides: Partial<PrismFrame> = {}): PrismFrame {
  return {
    stepIndex: 0,
    line: 1,
    eventType: "line",
    description: "test frame",
    callStack: [],
    scope: {},
    heap: {},
    activePointers: [],
    stdout: [],
    ...overrides,
  };
}

function makeTrace(frames: PrismFrame[], code: string = "x = 5\nx = 7"): PrismTrace {
  return {
    version: "1.0",
    code,
    language: "python",
    status: "SUCCESS",
    totalSteps: frames.length,
    frames,
    detectedStructures: [],
    metrics: {
      totalOperations: frames.length,
      maxStackDepth: 1,
      peakHeapObjects: 0,
      executionDurationMs: 5,
    },
  };
}

// ─── A. Tutor Context Construction ────────────────────────────────────────────

describe("A. Tutor context construction", () => {
  it("includes current step, active line, variables, and diff in tutor context", () => {
    const prevFrame = makeFrame({ stepIndex: 0, line: 1, scope: { x: 5 } });
    const currFrame = makeFrame({ stepIndex: 1, line: 2, scope: { x: 7, y: 10 } });
    const trace = makeTrace([prevFrame, currFrame]);

    const tutorPayload = buildBoundedTutorContext(trace, 1, "Why did x change to 7?");
    expect(tutorPayload).not.toBeNull();
    expect(tutorPayload!.stepIndex).toBe(1);
    expect(tutorPayload!.question).toBe("Why did x change to 7?");
    expect(tutorPayload!.context.currentScope).toEqual({ x: "7", y: "10" });
    expect(tutorPayload!.context.diff.variablesChanged).toEqual([{ name: "x", from: "5", to: "7" }]);
    expect(tutorPayload!.context.diff.variablesAdded).toEqual([{ name: "y", value: "10" }]);
  });

  it("caps conversation history to MAX_TUTOR_HISTORY (10) messages and marks isTruncated", () => {
    const frame = makeFrame({ scope: { a: 1 } });
    const trace = makeTrace([frame]);

    const longHistory = Array.from({ length: 15 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      text: `Message ${i}`,
    }));

    const tutorPayload = buildBoundedTutorContext(trace, 0, "Question?", longHistory);
    expect(tutorPayload).not.toBeNull();
    expect(tutorPayload!.history).toHaveLength(10);
    expect(tutorPayload!.history[0].text).toBe("Message 5");
    expect(tutorPayload!.context.isTruncated).toBe(true);
    expect(tutorPayload!.context.truncationReason).toContain("Conversation history capped");
  });

  it("returns null for out-of-bounds stepIndex or empty trace", () => {
    const frame = makeFrame({ scope: { a: 1 } });
    const trace = makeTrace([frame]);

    expect(buildBoundedTutorContext(trace, -1, "test")).toBeNull();
    expect(buildBoundedTutorContext(trace, 5, "test")).toBeNull();

    const emptyTrace = makeTrace([]);
    expect(buildBoundedTutorContext(emptyTrace, 0, "test")).toBeNull();
  });
});

// ─── B. Grounding & Anti-Prediction ────────────────────────────────────────────

describe("B. Grounding & Anti-Prediction rules", () => {
  it("prohibits future prediction when asked about future iterations", async () => {
    const frame = makeFrame({ stepIndex: 2, line: 15, scope: { i: 2, total: 3 } });
    const trace = makeTrace([frame]);

    const tutorPayload = buildBoundedTutorContext(trace, 0, "What will happen in the future after next loop?");
    expect(tutorPayload).not.toBeNull();

    const response = await generateTutorResponse({
      context: tutorPayload!.context,
      sourceCode: trace.code,
      history: [],
      question: tutorPayload!.question,
      provider: "mock",
    });

    expect(response.answer).toContain("only explains observed execution");
    expect(response.evidence.length).toBeGreaterThan(0);
  });

  it("correctly cites trace evidence for specific variable inquiry", async () => {
    const prevFrame = makeFrame({ stepIndex: 0, line: 1, scope: { total: 0 } });
    const currFrame = makeFrame({ stepIndex: 1, line: 2, scope: { total: 10 } });
    const trace = makeTrace([prevFrame, currFrame]);

    const tutorPayload = buildBoundedTutorContext(trace, 1, "What is the value of total now?");
    const response = await generateTutorResponse({
      context: tutorPayload!.context,
      sourceCode: trace.code,
      history: [],
      question: tutorPayload!.question,
      provider: "mock",
    });

    expect(response.answer).toContain("total");
    expect(response.answer).toContain("10");
    expect(response.evidence.some((e) => e.includes("total"))).toBe(true);
  });
});

// ─── C. Zod Request & Response Validation ──────────────────────────────────────

describe("C. Zod Request & Response Schema Validation", () => {
  it("validates conforming TutorRequest payload", () => {
    const frame = makeFrame({ scope: { x: 5 } });
    const trace = makeTrace([frame]);
    const payload = buildBoundedTutorContext(trace, 0, "Why is x 5?", [
      { role: "user", text: "Hello" },
      { role: "assistant", text: "Hi, I am Prism Tutor." },
    ]);

    const parseResult = TutorRequestSchema.safeParse(payload);
    expect(parseResult.success).toBe(true);
  });

  it("rejects invalid or empty question in TutorRequest", () => {
    const frame = makeFrame({ scope: { x: 5 } });
    const trace = makeTrace([frame]);
    const payload = buildBoundedTutorContext(trace, 0, "");

    const parseResult = TutorRequestSchema.safeParse(payload);
    expect(parseResult.success).toBe(false);
  });

  it("validates conforming structured TutorResponse", () => {
    const validResponse = {
      answer: "The node pointer was rewired to point to Node(20).",
      evidence: ["Line 16: head.next = Node(20)", "Heap allocation Node(obj_2)"],
      learningPoint: "Pointer assignments mutate references without copying node values.",
    };

    const parseResult = TutorResponseSchema.safeParse(validResponse);
    expect(parseResult.success).toBe(true);
  });

  it("rejects malformed TutorResponse missing required evidence", () => {
    const badResponse = {
      answer: "Valid answer here.",
      evidence: [], // min 1 required
    };

    const parseResult = TutorResponseSchema.safeParse(badResponse);
    expect(parseResult.success).toBe(false);
  });
});

// ─── D. Multi-Turn Conversation Formatting ────────────────────────────────────

describe("D. Multi-turn conversation prompt formatting", () => {
  it("formats recent conversation turns into prompt for contextual reference", () => {
    const frame = makeFrame({ stepIndex: 3, line: 12, scope: { curr: 2 } });
    const trace = makeTrace([frame]);
    const payload = buildBoundedTutorContext(trace, 0, "Why did that happen?", [
      { role: "user", text: "What is curr?" },
      { role: "assistant", text: "curr is an integer pointer at index 2." },
    ]);

    const prompt = formatTutorUserPrompt(
      payload!.context,
      trace.code,
      payload!.history,
      payload!.question
    );

    expect(prompt).toContain("Student: What is curr?");
    expect(prompt).toContain("Prism Tutor: curr is an integer pointer at index 2.");
    expect(prompt).toContain('STUDENT QUESTION:\n"Why did that happen?"');
  });
});

// ─── E. DSA Trace Correctness Questions ────────────────────────────────────────

describe("E. DSA Trace Correctness Questions", () => {
  it("answers linked list pointer rewiring based on real heap transition", async () => {
    const prevFrame = makeFrame({
      stepIndex: 1,
      heap: { obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: {} } },
    });
    const currFrame = makeFrame({
      stepIndex: 2,
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: { next: "obj_2" } },
        obj_2: { id: "obj_2", className: "Node", fields: { val: 20 }, references: {} },
      },
    });
    const trace = makeTrace([prevFrame, currFrame]);

    const tutorPayload = buildBoundedTutorContext(trace, 1, "Why did this node point to the next node?");
    const response = await generateTutorResponse({
      context: tutorPayload!.context,
      sourceCode: trace.code,
      history: [],
      question: tutorPayload!.question,
      provider: "mock",
    });

    expect(response.answer).toBeDefined();
    expect(response.evidence.some((e) => e.includes("References") || e.includes("obj_1"))).toBe(true);
  });

  it("answers array sorting partition question based on active bounds", async () => {
    const frame = makeFrame({
      scope: { arr: [1, 5, 3], low: 0, high: 2, pivot: 3 },
    });
    const trace = makeTrace([frame]);

    const tutorPayload = buildBoundedTutorContext(trace, 0, "What does pivot represent?");
    const response = await generateTutorResponse({
      context: tutorPayload!.context,
      sourceCode: trace.code,
      history: [],
      question: tutorPayload!.question,
      provider: "mock",
    });

    expect(response.answer).toContain("pivot");
    expect(response.answer).toContain("3");
  });

  it("answers exception question strictly from trace error state", async () => {
    const frame = makeFrame({
      eventType: "exception",
      exception: { type: "IndexError", message: "list index out of range" },
    });
    const trace = makeTrace([frame]);

    const tutorPayload = buildBoundedTutorContext(trace, 0, "Why did the code crash?");
    expect(tutorPayload!.context.exception).toEqual({
      type: "IndexError",
      message: "list index out of range",
    });

    const response = await generateTutorResponse({
      context: tutorPayload!.context,
      sourceCode: trace.code,
      history: [],
      question: tutorPayload!.question,
      provider: "mock",
    });

    expect(response.answer).toBeDefined();
    expect(response.evidence.length).toBeGreaterThan(0);
  });
});
