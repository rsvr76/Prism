/**
 * Test Suite: Grounded AI Step Explainer & Context Builder
 * All 23 required acceptance criteria and anti-hallucination test cases for Phase 4.
 */

import { describe, it, expect } from "vitest";
import { calculateStateDiff, buildBoundedTraceContext } from "@/lib/ai/traceContextBuilder";
import { StepExplanationSchema, ExplainStepRequestSchema } from "@/lib/ai/schemas";
import { generateStepExplanation } from "@/lib/ai/llmClient";
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

// ─── TC-01: First Frame (No Previous Diff) ───────────────────────────────────

describe("TC-01: First frame has no previous diff", () => {
  it("computes additions for all initial variables when prevFrame is null", () => {
    const frame = makeFrame({
      stepIndex: 0,
      scope: { a: 10, b: "hello" },
    });

    const diff = calculateStateDiff(frame, null);
    expect(diff.variablesAdded).toHaveLength(2);
    expect(diff.variablesChanged).toHaveLength(0);
    expect(diff.variablesRemoved).toHaveLength(0);
  });
});

// ─── TC-02 & TC-23: Changed Scalar Variable & Anti-Hallucination ──────────────

describe("TC-02 & TC-23: Changed scalar variable & anti-hallucination grounding", () => {
  it("captures exact observed transition x: 5 → 7 without hallucinating unobserved mutations", () => {
    const prevFrame = makeFrame({
      stepIndex: 0,
      line: 1,
      scope: { x: 5 },
    });
    const currentFrame = makeFrame({
      stepIndex: 1,
      line: 2,
      scope: { x: 7 },
    });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.variablesChanged).toHaveLength(1);
    expect(diff.variablesChanged[0]).toEqual({
      name: "x",
      from: "5",
      to: "7",
    });
    expect(diff.variablesAdded).toHaveLength(0);
    expect(diff.variablesRemoved).toHaveLength(0);
  });
});

// ─── TC-03: Unchanged Variable ────────────────────────────────────────────────

describe("TC-03: Unchanged variable", () => {
  it("does not report unchanged variables in diff", () => {
    const prevFrame = makeFrame({ scope: { x: 5, y: 10 } });
    const currentFrame = makeFrame({ scope: { x: 7, y: 10 } });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.variablesChanged).toHaveLength(1);
    expect(diff.variablesChanged[0].name).toBe("x");
    // y is unchanged, must not be present in variablesChanged
    expect(diff.variablesChanged.some((v) => v.name === "y")).toBe(false);
  });
});

// ─── TC-04: New Variable Added ────────────────────────────────────────────────

describe("TC-04: New variable added", () => {
  it("identifies new variable initialized in current scope", () => {
    const prevFrame = makeFrame({ scope: { a: 1 } });
    const currentFrame = makeFrame({ scope: { a: 1, b: 2 } });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.variablesAdded).toHaveLength(1);
    expect(diff.variablesAdded[0]).toEqual({ name: "b", value: "2" });
  });
});

// ─── TC-05: Removed Variable ──────────────────────────────────────────────────

describe("TC-05: Removed variable", () => {
  it("identifies variable popped or deleted from scope", () => {
    const prevFrame = makeFrame({ scope: { a: 1, temp: 99 } });
    const currentFrame = makeFrame({ scope: { a: 1 } });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.variablesRemoved).toHaveLength(1);
    expect(diff.variablesRemoved[0]).toEqual({ name: "temp", previousValue: "99" });
  });
});

// ─── TC-06: Pointer Movement ──────────────────────────────────────────────────

describe("TC-06: Pointer movement", () => {
  it("identifies index pointer transition [0] → [1]", () => {
    const prevFrame = makeFrame({ scope: { j: 0 } });
    const currentFrame = makeFrame({ scope: { j: 1 } });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.pointersMoved).toHaveLength(1);
    expect(diff.pointersMoved[0]).toEqual({
      name: "j",
      from: "[0]",
      to: "[1]",
    });
  });

  it("identifies heap object reference pointer advancement", () => {
    const prevFrame = makeFrame({
      scope: { curr: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
    });
    const currentFrame = makeFrame({
      scope: { curr: { __type__: "object_ref", id: "obj_2", className: "Node", repr: "" } },
    });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.pointersMoved).toHaveLength(1);
    expect(diff.pointersMoved[0].name).toBe("curr");
    expect(diff.pointersMoved[0].from).toContain("Node(obj_1)");
    expect(diff.pointersMoved[0].to).toContain("Node(obj_2)");
  });
});

// ─── TC-07: Heap Object Creation ──────────────────────────────────────────────

describe("TC-07: Heap object creation", () => {
  it("identifies new heap object allocation", () => {
    const prevFrame = makeFrame({ heap: {} });
    const currentFrame = makeFrame({
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: {} },
      },
    });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.heapObjectsCreated).toHaveLength(1);
    expect(diff.heapObjectsCreated[0]).toContain("Node(obj_1)");
  });
});

// ─── TC-08: Heap Field Mutation ───────────────────────────────────────────────

describe("TC-08: Heap field mutation", () => {
  it("identifies field mutation in existing heap object", () => {
    const prevFrame = makeFrame({
      heap: { obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: {} } },
    });
    const currentFrame = makeFrame({
      heap: { obj_1: { id: "obj_1", className: "Node", fields: { val: 20 }, references: {} } },
    });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.heapFieldsChanged).toHaveLength(1);
    expect(diff.heapFieldsChanged[0]).toEqual({
      objectId: "obj_1",
      field: "val",
      from: "10",
      to: "20",
    });
  });
});

// ─── TC-09: Reference Mutation ────────────────────────────────────────────────

describe("TC-09: Reference mutation", () => {
  it("identifies pointer reference rewiring (.next: None → obj_2)", () => {
    const prevFrame = makeFrame({
      heap: { obj_1: { id: "obj_1", className: "Node", fields: {}, references: {} } },
    });
    const currentFrame = makeFrame({
      heap: { obj_1: { id: "obj_1", className: "Node", fields: {}, references: { next: "obj_2" } } },
    });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.heapReferencesChanged).toHaveLength(1);
    expect(diff.heapReferencesChanged[0]).toEqual({
      objectId: "obj_1",
      pointer: "next",
      from: "None",
      to: "obj_2",
    });
  });
});

// ─── TC-10: Stdout Addition ───────────────────────────────────────────────────

describe("TC-10: Stdout addition", () => {
  it("identifies new console output lines emitted in current step", () => {
    const prevFrame = makeFrame({ stdout: ["First line"] });
    const currentFrame = makeFrame({ stdout: ["First line", "Second line"] });

    const diff = calculateStateDiff(currentFrame, prevFrame);
    expect(diff.stdoutAdded).toEqual(["Second line"]);
  });
});

// ─── TC-11: Exception State ───────────────────────────────────────────────────

describe("TC-11: Exception state", () => {
  it("detects exception event and message", () => {
    const frame = makeFrame({
      eventType: "exception",
      exception: { type: "ZeroDivisionError", message: "division by zero" },
    });

    const diff = calculateStateDiff(frame, null);
    expect(diff.exceptionOccurred).toBe(true);
  });
});

// ─── TC-12 & TC-14: Bounded Context & Truncation Marker ────────────────────────

describe("TC-12 & TC-14: Bounded context & explicit truncation markers", () => {
  it("caps excessive variables and marks isTruncated=true", () => {
    const hugeScope: Record<string, number> = {};
    for (let i = 0; i < 30; i++) hugeScope[`var_${i}`] = i;

    const frame = makeFrame({ scope: hugeScope });
    const trace = makeTrace([frame]);

    const context = buildBoundedTraceContext(trace, 0);
    expect(context).not.toBeNull();
    expect(Object.keys(context!.currentScope).length).toBeLessThanOrEqual(20);
    expect(context!.isTruncated).toBe(true);
    expect(context!.truncationReason).toContain("Scope variables capped");
  });
});

// ─── TC-13: Deterministic Context Generation ──────────────────────────────────

describe("TC-13: Deterministic context generation", () => {
  it("generates identical context given the same trace and stepIndex", () => {
    const frame = makeFrame({ scope: { a: 1, b: 2 } });
    const trace = makeTrace([frame]);

    const ctx1 = buildBoundedTraceContext(trace, 0);
    const ctx2 = buildBoundedTraceContext(trace, 0);

    expect(ctx1).toEqual(ctx2);
  });
});

// ─── TC-15: Empty Frame Handling ──────────────────────────────────────────────

describe("TC-15: Empty frame handling", () => {
  it("returns null when trace or frames are empty", () => {
    const emptyTrace: PrismTrace = {
      version: "1.0",
      code: "",
      language: "python",
      status: "IDLE",
      totalSteps: 0,
      frames: [],
      detectedStructures: [],
      metrics: { totalOperations: 0, maxStackDepth: 0, peakHeapObjects: 0, executionDurationMs: 0 },
    };

    expect(buildBoundedTraceContext(emptyTrace, 0)).toBeNull();
  });
});

// ─── TC-16: Linked-List Context ───────────────────────────────────────────────

describe("TC-16: Linked-list context", () => {
  it("identifies detected structure type as singly_linked_list in context", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10, next: null }, references: {} },
      },
    });
    const trace = makeTrace([frame]);

    const ctx = buildBoundedTraceContext(trace, 0);
    expect(ctx?.detectedStructureType).toBe("singly_linked_list");
  });
});

// ─── TC-17: Array / Sorting Context ───────────────────────────────────────────

describe("TC-17: Array context", () => {
  it("identifies detected structure type as 1d_array in context", () => {
    const frame = makeFrame({ scope: { numbers: [5, 2, 8, 1] } });
    const trace = makeTrace([frame]);

    const ctx = buildBoundedTraceContext(trace, 0);
    expect(ctx?.detectedStructureType).toBe("1d_array");
  });
});

// ─── TC-18: BST Context ───────────────────────────────────────────────────────

describe("TC-18: BST context", () => {
  it("identifies detected structure type as binary_tree in context", () => {
    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_r", className: "Node", repr: "" } },
      heap: {
        obj_r: { id: "obj_r", className: "Node", fields: { val: 8, left: null, right: null }, references: {} },
      },
    });
    const trace = makeTrace([frame]);

    const ctx = buildBoundedTraceContext(trace, 0);
    expect(ctx?.detectedStructureType).toBe("binary_tree");
  });
});

// ─── TC-19: Malformed AI Response Rejected by Zod ─────────────────────────────

describe("TC-19: Malformed AI response rejected by Zod", () => {
  it("rejects response missing required fields or with invalid types", () => {
    const invalidResponses = [
      { summary: "missing why and changes" },
      { summary: "too short", why: "ok", changes: "not an array", learningPoint: "lp" },
      { summary: "", why: "ok", changes: [], learningPoint: "lp" },
    ];

    for (const bad of invalidResponses) {
      const result = StepExplanationSchema.safeParse(bad);
      expect(result.success).toBe(false);
    }
  });
});

// ─── TC-20: Valid AI Response Accepted by Zod ─────────────────────────────────

describe("TC-20: Valid AI response accepted by Zod", () => {
  it("validates conforming structured step explanation", () => {
    const validResponse = {
      summary: "Advanced the curr pointer to the next node.",
      why: "The while loop condition evaluated to True because curr is not None.",
      changes: ["curr advanced from Node(obj_1) to Node(obj_2)"],
      dataStructureInsight: "Traversing along the .next reference chain.",
      learningPoint: "Always ensure the traversal pointer advances to prevent infinite loops.",
    };

    const result = StepExplanationSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe(validResponse.summary);
    }
  });
});

// ─── TC-21: Invalid Step Rejected ─────────────────────────────────────────────

describe("TC-21: Invalid step rejected", () => {
  it("returns null when stepIndex is out of bounds", () => {
    const frame = makeFrame({ scope: { x: 1 } });
    const trace = makeTrace([frame]);

    expect(buildBoundedTraceContext(trace, -1)).toBeNull();
    expect(buildBoundedTraceContext(trace, 5)).toBeNull();
  });
});

// ─── TC-22: Mock Provider Integration Test ────────────────────────────────────

describe("TC-22: Mock LLM client fallback generates valid grounded response", async () => {
  it("produces a Zod-valid grounded explanation for a given context", async () => {
    const frame = makeFrame({
      stepIndex: 1,
      line: 2,
      scope: { x: 7 },
    });
    const prevFrame = makeFrame({
      stepIndex: 0,
      line: 1,
      scope: { x: 5 },
    });
    const trace = makeTrace([prevFrame, frame], "x = 5\nx = 7");

    const context = buildBoundedTraceContext(trace, 1);
    expect(context).not.toBeNull();

    const explanation = await generateStepExplanation({
      context: context!,
      sourceCode: trace.code,
      provider: "mock",
    });

    expect(explanation).toBeDefined();
    expect(explanation.summary).toContain("Step 1");
    expect(explanation.changes.length).toBeGreaterThan(0);
    expect(explanation.learningPoint).toBeDefined();

    // Verify it passes Zod
    const zodCheck = StepExplanationSchema.safeParse(explanation);
    expect(zodCheck.success).toBe(true);
  });
});
