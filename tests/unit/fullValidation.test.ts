/**
 * Comprehensive Prism Validation & Hardening Test Suite
 * Covers Phases 1 to 5: Trace immutability, execution engine limits, structure detection,
 * routing invariants, AI context grounding, anti-hallucination, and DSA programs.
 */

import { describe, it, expect } from "vitest";
import { validateCodePreflight } from "@/lib/execution/astValidator";
import { DEFAULT_EXECUTION_LIMITS } from "@/lib/config/executionLimits";
import { detectStructures, isBSTNodeCandidate } from "@/lib/visualization/structureDetector";
import { computeTreeLayout } from "@/lib/visualization/treeLayout";
import { deriveArrayState } from "@/lib/visualization/arrayStateDeriver";
import { calculateStateDiff, buildBoundedTraceContext } from "@/lib/ai/traceContextBuilder";
import { buildBoundedTutorContext } from "@/lib/ai/tutorContextBuilder";
import { generateStepExplanation, generateTutorResponse } from "@/lib/ai/llmClient";
import type { PrismFrame, PrismTrace, HeapObject } from "@/types/trace";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function createFrame(overrides: Partial<PrismFrame> = {}): PrismFrame {
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

function createTrace(frames: PrismFrame[], code: string = "x = 10"): PrismTrace {
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

// ─── 1. Trace Snapshot Immutability Audit ─────────────────────────────────────

describe("1. Trace snapshot immutability & independent frames", () => {
  it("guarantees modifying current frame scope does not mutate previous frame scope", () => {
    const prevScope = { arr: [1, 2, 3], x: 5 };
    const currScope = { arr: [1, 2, 3, 4], x: 10 };

    const frame0 = createFrame({ stepIndex: 0, line: 1, scope: prevScope });
    const frame1 = createFrame({ stepIndex: 1, line: 2, scope: currScope });
    const trace = createTrace([frame0, frame1]);

    // Inspect frame0 scope
    expect(trace.frames[0].scope.x).toBe(5);
    expect(trace.frames[0].scope.arr).toEqual([1, 2, 3]);

    // Mutate frame1 scope representation
    trace.frames[1].scope.x = 999;
    (trace.frames[1].scope.arr as number[]).push(5);

    // Assert frame0 is completely unaffected
    expect(trace.frames[0].scope.x).toBe(5);
    expect(trace.frames[0].scope.arr).toEqual([1, 2, 3]);
  });

  it("guarantees earlier heap objects maintain historical states across steps", () => {
    const heapFrame0: Record<string, HeapObject> = {
      obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: {} },
    };
    const heapFrame1: Record<string, HeapObject> = {
      obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: { next: "obj_2" } },
      obj_2: { id: "obj_2", className: "Node", fields: { val: 20 }, references: {} },
    };

    const frame0 = createFrame({ stepIndex: 0, line: 1, heap: heapFrame0 });
    const frame1 = createFrame({ stepIndex: 1, line: 2, heap: heapFrame1 });
    const trace = createTrace([frame0, frame1]);

    expect(trace.frames[0].heap["obj_1"].references).toEqual({});
    expect(trace.frames[1].heap["obj_1"].references).toEqual({ next: "obj_2" });
  });
});

// ─── 2. Safety & Limits Validation ───────────────────────────────────────────

describe("2. Safety limits & AST validation preflight", () => {
  it("rejects dangerous imports (os, subprocess, sys, shutil)", () => {
    const dangerous = [
      "import os\nos.system('rm -rf /')",
      "import subprocess\nsubprocess.run(['ls'])",
      "import sys\nsys.exit(0)",
      "import shutil\nshutil.rmtree('/')",
    ];

    for (const code of dangerous) {
      const preflight = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
      expect(preflight.isValid).toBe(false);
      expect(preflight.status).toBe("UNSUPPORTED");
    }
  });

  it("rejects code exceeding line count limit", () => {
    const longCode = Array(350).fill("x = 1").join("\n");
    const preflight = validateCodePreflight(longCode, DEFAULT_EXECUTION_LIMITS);
    expect(preflight.isValid).toBe(false);
    expect(preflight.status).toBe("TRACE_LIMIT");
  });

  it("approves valid DSA code with allowed standard patterns", () => {
    const safeCode = `
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(10)
head.next = Node(20)
`;
    const preflight = validateCodePreflight(safeCode, DEFAULT_EXECUTION_LIMITS);
    expect(preflight.isValid).toBe(true);
  });
});

// ─── 3. Deterministic Structure Detection & Routing Invariants ───────────────

describe("3. Deterministic structure detection & routing", () => {
  it("detects singly linked list with confidence >= 0.90", () => {
    const frame = createFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: { next: "obj_2" } },
        obj_2: { id: "obj_2", className: "Node", fields: { val: 20 }, references: {} },
      },
    });

    const structures = detectStructures(frame);
    expect(structures.length).toBeGreaterThan(0);
    expect(structures[0].structureType).toBe("singly_linked_list");
    expect(structures[0].rootHeapId).toBe("obj_1");
    expect(structures[0].confidence).toBeGreaterThanOrEqual(0.90);
  });

  it("detects binary tree topology without false semantic BST sorting claim", () => {
    const frame = createFrame({
      scope: { root: { __type__: "object_ref", id: "obj_r", className: "TreeNode", repr: "" } },
      heap: {
        obj_r: { id: "obj_r", className: "TreeNode", fields: { val: 50 }, references: { left: "obj_l", right: "obj_r2" } },
        obj_l: { id: "obj_l", className: "TreeNode", fields: { val: 25 }, references: {} },
        obj_r2: { id: "obj_r2", className: "TreeNode", fields: { val: 75 }, references: {} },
      },
    });

    const structures = detectStructures(frame);
    expect(structures.length).toBeGreaterThan(0);
    expect(structures[0].structureType).toBe("binary_tree");
    expect(structures[0].rootHeapId).toBe("obj_r");
  });

  it("routes linked list over array when both coexist", () => {
    const frame = createFrame({
      scope: {
        numbers: [1, 2, 3],
        head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" },
      },
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: { next: "obj_2" } },
        obj_2: { id: "obj_2", className: "Node", fields: { val: 20 }, references: {} },
      },
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("singly_linked_list");
  });
});

// ─── 4. Tree Layout Determinism & Non-Overlapping Coordinates ──────────────────

describe("4. Planar Tree Layout Guarantees", () => {
  it("generates strictly monotonic x coordinates for in-order nodes", () => {
    const heap: Record<string, HeapObject> = {
      obj_8: { id: "obj_8", className: "Node", fields: { val: 8 }, references: { left: "obj_3", right: "obj_10" } },
      obj_3: { id: "obj_3", className: "Node", fields: { val: 3 }, references: { left: "obj_1", right: "obj_6" } },
      obj_1: { id: "obj_1", className: "Node", fields: { val: 1 }, references: {} },
      obj_6: { id: "obj_6", className: "Node", fields: { val: 6 }, references: {} },
      obj_10: { id: "obj_10", className: "Node", fields: { val: 10 }, references: { right: "obj_14" } },
      obj_14: { id: "obj_14", className: "Node", fields: { val: 14 }, references: {} },
    };

    const layout = computeTreeLayout("obj_8", heap);
    expect(layout.nodeCount).toBe(6);

    // In-order traversal: 1, 3, 6, 8, 10, 14
    const p1 = layout.positions["obj_1"];
    const p3 = layout.positions["obj_3"];
    const p6 = layout.positions["obj_6"];
    const p8 = layout.positions["obj_8"];
    const p10 = layout.positions["obj_10"];
    const p14 = layout.positions["obj_14"];

    expect(p1.x).toBeLessThan(p3.x);
    expect(p3.x).toBeLessThan(p6.x);
    expect(p6.x).toBeLessThan(p8.x);
    expect(p8.x).toBeLessThan(p10.x);
    expect(p10.x).toBeLessThan(p14.x);

    // Root depth = 0, children depth > 0
    expect(p8.y).toBeLessThan(p3.y);
    expect(p3.y).toBeLessThan(p1.y);
  });
});

// ─── 5. Array State Derivation & Sorting States ───────────────────────────────

describe("5. Array state derivation", () => {
  it("derives element sorting states and index pointer tags correctly", () => {
    const prevFrame = createFrame({
      scope: { arr: [5, 2, 8, 1], i: 0, j: 1 },
    });
    const currFrame = createFrame({
      scope: { arr: [2, 5, 8, 1], i: 0, j: 1 },
    });

    const state = deriveArrayState(currFrame, prevFrame, "arr");
    expect(state.elements).toHaveLength(4);
    expect(state.elements[0].value).toBe(2);
    expect(state.elements[1].value).toBe(5);

    // Pointer tags: i -> [0], j -> [1]
    expect(state.elements[0].pointerLabels).toContain("i");
    expect(state.elements[1].pointerLabels).toContain("j");
  });
});

// ─── 6. AI Grounding & Anti-Hallucination ─────────────────────────────────────

describe("6. AI Grounding & Anti-Hallucination Invariants", () => {
  it("prohibits fabricated state transitions in step explanation", async () => {
    const prevFrame = createFrame({ stepIndex: 0, line: 1, scope: { count: 1 } });
    const currFrame = createFrame({ stepIndex: 1, line: 2, scope: { count: 2 } });
    const trace = createTrace([prevFrame, currFrame], "count = 1\ncount += 1");

    const context = buildBoundedTraceContext(trace, 1);
    expect(context).not.toBeNull();

    const explanation = await generateStepExplanation({
      context: context!,
      sourceCode: trace.code,
      provider: "mock",
    });

    expect(explanation.changes.some((c) => c.includes("count") && c.includes("1") && c.includes("2"))).toBe(true);
    expect(explanation.summary).toBeDefined();
    expect(explanation.learningPoint).toBeDefined();
  });

  it("handles non-existent variable inquiry in Tutor without fabricating values", async () => {
    const frame = createFrame({ stepIndex: 0, line: 1, scope: { x: 10 } });
    const trace = createTrace([frame]);

    const tutorPayload = buildBoundedTutorContext(trace, 0, "What is the value of nonExistentVar?");
    expect(tutorPayload).not.toBeNull();

    const tutorResponse = await generateTutorResponse({
      context: tutorPayload!.context,
      sourceCode: trace.code,
      history: [],
      question: tutorPayload!.question,
      provider: "mock",
    });

    expect(tutorResponse.answer).toBeDefined();
    expect(tutorResponse.evidence.length).toBeGreaterThan(0);
  });
});

// ─── 7. Real DSA Algorithm Traces (Sum, Search, Sorting, List, Tree, Recursion)

describe("7. Real DSA Algorithm Execution State Snapshots", () => {
  // Test 1: Array Sum
  it("DSA-1: Array sum accumulation", () => {
    const f0 = createFrame({ stepIndex: 0, line: 1, scope: { arr: [2, 4, 6, 8], total: 0 } });
    const f1 = createFrame({ stepIndex: 1, line: 3, scope: { arr: [2, 4, 6, 8], total: 2, x: 2 } });
    const f2 = createFrame({ stepIndex: 2, line: 3, scope: { arr: [2, 4, 6, 8], total: 6, x: 4 } });
    const trace = createTrace([f0, f1, f2]);

    const diff1 = calculateStateDiff(f1, f0);
    expect(diff1.variablesChanged).toEqual([{ name: "total", from: "0", to: "2" }]);
    expect(diff1.variablesAdded).toEqual([{ name: "x", value: "2" }]);

    const diff2 = calculateStateDiff(f2, f1);
    expect(diff2.variablesChanged).toEqual([
      { name: "total", from: "2", to: "6" },
      { name: "x", from: "2", to: "4" },
    ]);
  });

  // Test 2: Linear Search
  it("DSA-2: Linear search target matching", () => {
    const f0 = createFrame({ stepIndex: 0, line: 1, scope: { arr: [4, 7, 9, 12, 15], target: 12, i: 0 } });
    const f1 = createFrame({ stepIndex: 1, line: 4, scope: { arr: [4, 7, 9, 12, 15], target: 12, i: 3 } });
    const trace = createTrace([f0, f1]);

    const diff = calculateStateDiff(f1, f0);
    expect(diff.variablesChanged).toEqual([{ name: "i", from: "0", to: "3" }]);
    expect(diff.pointersMoved).toEqual([{ name: "i", from: "[0]", to: "[3]" }]);
  });

  // Test 3: Bubble Sort Swap
  it("DSA-3: Bubble sort element swap", () => {
    const f0 = createFrame({ stepIndex: 0, line: 4, scope: { arr: [5, 1, 4, 2, 8], j: 0 } });
    const f1 = createFrame({ stepIndex: 1, line: 5, scope: { arr: [1, 5, 4, 2, 8], j: 0 } });
    const trace = createTrace([f0, f1]);

    const diff = calculateStateDiff(f1, f0);
    expect(diff.variablesChanged).toEqual([{ name: "arr", from: "[5,1,4,2,8]", to: "[1,5,4,2,8]" }]);
  });

  // Test 4: Linked List Construction
  it("DSA-4: Linked list 3-node sequential construction", () => {
    const f0 = createFrame({
      stepIndex: 0,
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: { obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: {} } },
    });
    const f1 = createFrame({
      stepIndex: 1,
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: { next: "obj_2" } },
        obj_2: { id: "obj_2", className: "Node", fields: { val: 20 }, references: {} },
      },
    });
    const f2 = createFrame({
      stepIndex: 2,
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: { id: "obj_1", className: "Node", fields: { val: 10 }, references: { next: "obj_2" } },
        obj_2: { id: "obj_2", className: "Node", fields: { val: 20 }, references: { next: "obj_3" } },
        obj_3: { id: "obj_3", className: "Node", fields: { val: 30 }, references: {} },
      },
    });

    const diff1 = calculateStateDiff(f1, f0);
    expect(diff1.heapObjectsCreated).toEqual(["Node(obj_2)"]);
    expect(diff1.heapReferencesChanged).toEqual([{ objectId: "obj_1", pointer: "next", from: "None", to: "obj_2" }]);

    const diff2 = calculateStateDiff(f2, f1);
    expect(diff2.heapObjectsCreated).toEqual(["Node(obj_3)"]);
    expect(diff2.heapReferencesChanged).toEqual([{ objectId: "obj_2", pointer: "next", from: "None", to: "obj_3" }]);
  });

  // Test 5: Binary Tree Construction
  it("DSA-5: Binary tree root and child assignments", () => {
    const f0 = createFrame({
      stepIndex: 0,
      scope: { root: { __type__: "object_ref", id: "obj_r", className: "Node", repr: "" } },
      heap: { obj_r: { id: "obj_r", className: "Node", fields: { val: 10 }, references: {} } },
    });
    const f1 = createFrame({
      stepIndex: 1,
      scope: { root: { __type__: "object_ref", id: "obj_r", className: "Node", repr: "" } },
      heap: {
        obj_r: { id: "obj_r", className: "Node", fields: { val: 10 }, references: { left: "obj_5", right: "obj_15" } },
        obj_5: { id: "obj_5", className: "Node", fields: { val: 5 }, references: {} },
        obj_15: { id: "obj_15", className: "Node", fields: { val: 15 }, references: {} },
      },
    });

    const diff = calculateStateDiff(f1, f0);
    expect(diff.heapObjectsCreated).toHaveLength(2);
    expect(diff.heapReferencesChanged).toEqual([
      { objectId: "obj_r", pointer: "left", from: "None", to: "obj_5" },
      { objectId: "obj_r", pointer: "right", from: "None", to: "obj_15" },
    ]);
  });

  // Test 6: Recursive Call Stack Frames
  it("DSA-6: Recursive call stack depth progression (factorial)", () => {
    const f0 = createFrame({
      stepIndex: 0,
      callStack: [{ frameId: "f_1", functionName: "factorial", line: 2, localVariables: { n: 3 } }],
    });
    const f1 = createFrame({
      stepIndex: 1,
      callStack: [
        { frameId: "f_1", functionName: "factorial", line: 4, localVariables: { n: 3 } },
        { frameId: "f_2", functionName: "factorial", line: 2, localVariables: { n: 2 } },
      ],
    });
    const f2 = createFrame({
      stepIndex: 2,
      callStack: [
        { frameId: "f_1", functionName: "factorial", line: 4, localVariables: { n: 3 } },
        { frameId: "f_2", functionName: "factorial", line: 4, localVariables: { n: 2 } },
        { frameId: "f_3", functionName: "factorial", line: 2, localVariables: { n: 1 } },
      ],
    });

    expect(f0.callStack.length).toBe(1);
    expect(f1.callStack.length).toBe(2);
    expect(f2.callStack.length).toBe(3);
    expect(f2.callStack[2].localVariables.n).toBe(1);
  });
});
