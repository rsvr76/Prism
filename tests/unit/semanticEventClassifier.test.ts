/**
 * Test Suite: Semantic Execution Event Classifier & Persistent Structural Resolver
 *
 * Verifies:
 * 1. Conservative deterministic classification of execution frames
 * 2. Distinction between structural animations and non-structural semantic events
 * 3. Fallback to 'no-visible-state-change' when trace evidence is ambiguous
 * 4. Backward retention of structural state across non-structural steps (def, return, loops, scalar updates)
 */

import { describe, it, expect } from "vitest";
import {
  classifySemanticEvent,
  resolveEffectiveStructuralState,
  SemanticExecutionEvent,
} from "@/lib/execution/semanticEventClassifier";
import type { PrismFrame, PrismTrace, HeapObject } from "@/types/trace";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFrame(overrides: Partial<PrismFrame> = {}): PrismFrame {
  return {
    stepIndex: 0,
    line: 1,
    eventType: "line",
    description: "test frame",
    callStack: [{ functionName: "<module>", fileName: "main.py", line: 1 }],
    scope: {},
    heap: {},
    activePointers: [],
    stdout: [],
    ...overrides,
  };
}

function makeNode(id: string, val: number, nextId: string | null = null): HeapObject {
  return {
    id,
    className: "ListNode",
    fields: { val },
    references: nextId ? { next: nextId } : {},
  };
}

function makeTrace(frames: PrismFrame[]): PrismTrace {
  return {
    version: "1.0",
    code: "",
    language: "python",
    status: "SUCCESS",
    totalSteps: frames.length,
    frames,
    detectedStructures: [],
    metrics: {
      totalOperations: frames.length,
      maxStackDepth: 1,
      peakHeapObjects: 0,
      executionDurationMs: 0,
    },
  };
}

// ─── Classification Tests ────────────────────────────────────────────────────

describe("Semantic Event Classifier: Definitions & Declarations", () => {
  it("classifies class definition lines as non-structural definitions", () => {
    const frame = makeFrame({ stepIndex: 0, line: 1 });
    const source = "class ListNode:\n    def __init__(self, val=0):\n        self.val = val";
    const event = classifySemanticEvent(frame, null, source);

    expect(event.category).toBe("definition");
    expect(event.badgeLabel).toBe("Class Defined");
    expect(event.isStructural).toBe(false);
    expect(event.affectedVariables).toContain("ListNode");
  });

  it("classifies function definition lines as non-structural definitions", () => {
    const frame = makeFrame({ stepIndex: 1, line: 4 });
    const source = "class ListNode:\n    pass\n\ndef reverseList(head):\n    prev = None";
    const event = classifySemanticEvent(frame, null, source);

    expect(event.category).toBe("definition");
    expect(event.badgeLabel).toBe("Function Defined");
    expect(event.isStructural).toBe(false);
    expect(event.affectedVariables).toContain("reverseList");
  });
});

describe("Semantic Event Classifier: Function Entry & Return", () => {
  it("classifies function entry on call stack expansion", () => {
    const prevFrame = makeFrame({
      stepIndex: 2,
      callStack: [{ functionName: "<module>", fileName: "main.py", line: 5 }],
    });
    const currFrame = makeFrame({
      stepIndex: 3,
      callStack: [
        { functionName: "<module>", fileName: "main.py", line: 5 },
        { functionName: "reverseList", fileName: "main.py", line: 1 },
      ],
      eventType: "call",
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("function-enter");
    expect(event.summary).toContain("reverseList");
    expect(event.isStructural).toBe(false);
  });

  it("classifies function return on stack pop or return eventType", () => {
    const prevFrame = makeFrame({
      stepIndex: 10,
      callStack: [
        { functionName: "<module>", fileName: "main.py", line: 5 },
        { functionName: "helper", fileName: "main.py", line: 3 },
      ],
    });
    const currFrame = makeFrame({
      stepIndex: 11,
      callStack: [{ functionName: "<module>", fileName: "main.py", line: 5 }],
      eventType: "return",
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("function-return");
    expect(event.summary).toContain("helper");
    expect(event.isStructural).toBe(false);
  });
});

describe("Semantic Event Classifier: Object Instantiation & Heap Mutation", () => {
  it("identifies DSA node instantiation as a structural object-created event", () => {
    const prevFrame = makeFrame({ stepIndex: 1, heap: {} });
    const currFrame = makeFrame({
      stepIndex: 2,
      heap: { obj_1: makeNode("obj_1", 42) },
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("object-created");
    expect(event.isStructural).toBe(true);
    expect(event.badgeLabel).toBe("Node Instantiated");
    expect(event.affectedVariables).toContain("obj_1");
  });

  it("identifies pointer linking on heap objects as structural pointer-updated", () => {
    const prevFrame = makeFrame({
      stepIndex: 3,
      heap: {
        obj_1: makeNode("obj_1", 10),
        obj_2: makeNode("obj_2", 20),
      },
    });
    const currFrame = makeFrame({
      stepIndex: 4,
      heap: {
        obj_1: makeNode("obj_1", 10, "obj_2"),
        obj_2: makeNode("obj_2", 20),
      },
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("pointer-updated");
    expect(event.isStructural).toBe(true);
    expect(event.badgeLabel).toBe("Pointer Linked");
    expect(event.summary).toContain(".next");
  });

  it("identifies primitive field assignment (e.g. self.val = val) as non-structural value-updated", () => {
    const prevFrame = makeFrame({
      stepIndex: 2,
      heap: {
        obj_1: { id: "obj_1", className: "ListNode", fields: { val: 0 }, references: {} },
      },
    });
    const currFrame = makeFrame({
      stepIndex: 3,
      heap: {
        obj_1: { id: "obj_1", className: "ListNode", fields: { val: 99 }, references: {} },
      },
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("value-updated");
    expect(event.isStructural).toBe(false);
    expect(event.summary).toContain(".val = 99");
  });
});

describe("Semantic Event Classifier: Pointers, Arrays, and Scalars in Scope", () => {
  it("identifies pointer navigation in scope (curr = curr.next)", () => {
    const prevFrame = makeFrame({
      stepIndex: 4,
      scope: {
        curr: { __type__: "object_ref", id: "obj_1", className: "ListNode", repr: "ListNode(1)" },
      },
      heap: {
        obj_1: makeNode("obj_1", 1, "obj_2"),
        obj_2: makeNode("obj_2", 2),
      },
    });
    const currFrame = makeFrame({
      stepIndex: 5,
      scope: {
        curr: { __type__: "object_ref", id: "obj_2", className: "ListNode", repr: "ListNode(2)" },
      },
      heap: {
        obj_1: makeNode("obj_1", 1, "obj_2"),
        obj_2: makeNode("obj_2", 2),
      },
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("pointer-updated");
    expect(event.badgeLabel).toBe("Pointer Shifted");
    expect(event.isStructural).toBe(true);
    expect(event.affectedVariables).toContain("curr");
  });

  it("identifies array element swaps in scope", () => {
    const prevFrame = makeFrame({
      stepIndex: 3,
      scope: { nums: [3, 1, 2] },
    });
    const currFrame = makeFrame({
      stepIndex: 4,
      scope: { nums: [1, 3, 2] },
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("swap");
    expect(event.badgeLabel).toBe("Array Swap");
    expect(event.isStructural).toBe(true);
  });

  it("identifies scalar variable updates as non-structural", () => {
    const prevFrame = makeFrame({
      stepIndex: 2,
      scope: { count: 0 },
    });
    const currFrame = makeFrame({
      stepIndex: 3,
      scope: { count: 1 },
    });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("value-updated");
    expect(event.isStructural).toBe(false);
    expect(event.summary).toBe("count = 1");
  });
});

describe("Semantic Event Classifier: Loops, Branches, Stdout, Errors", () => {
  it("classifies loop constructs from source snippet", () => {
    const frame = makeFrame({ stepIndex: 5, line: 1 });
    const event = classifySemanticEvent(frame, null, "while curr is not None:\n    total += curr.val");

    expect(event.category).toBe("iteration");
    expect(event.badgeLabel).toBe("Loop Condition");
    expect(event.isStructural).toBe(false);
  });

  it("classifies branches from source snippet", () => {
    const frame = makeFrame({ stepIndex: 6, line: 1 });
    const event = classifySemanticEvent(frame, null, "if target == curr.val:\n    return True");

    expect(event.category).toBe("branch");
    expect(event.badgeLabel).toBe("Branch Evaluated");
    expect(event.isStructural).toBe(false);
  });

  it("classifies stdout prints", () => {
    const prevFrame = makeFrame({ stepIndex: 1, stdout: [] });
    const currFrame = makeFrame({ stepIndex: 2, stdout: ["Output line 1\n"] });

    const event = classifySemanticEvent(currFrame, prevFrame);
    expect(event.category).toBe("output");
    expect(event.summary).toContain("Output line 1");
  });

  it("classifies exceptions as errors", () => {
    const frame = makeFrame({
      stepIndex: 8,
      exception: { type: "IndexError", message: "list index out of range" },
    });

    const event = classifySemanticEvent(frame, null);
    expect(event.category).toBe("error");
    expect(event.badgeLabel).toBe("Exception");
    expect(event.summary).toContain("IndexError");
  });

  it("conservatively falls back to no-visible-state-change if evidence is ambiguous", () => {
    const prevFrame = makeFrame({ stepIndex: 2 });
    const currFrame = makeFrame({ stepIndex: 3 });

    const event = classifySemanticEvent(currFrame, prevFrame, "x = x");
    expect(event.category).toBe("no-visible-state-change");
    expect(event.badgeLabel).toBe("Executed Line");
    expect(event.isStructural).toBe(false);
  });
});

// ─── Effective Structural State Resolver Tests ───────────────────────────────

describe("Effective Structural State Resolver: Persistent Visualizer State", () => {
  it("returns null when trace is null or has no frames", () => {
    expect(resolveEffectiveStructuralState(null, 0)).toBeNull();
    const emptyTrace = makeTrace([]);
    expect(resolveEffectiveStructuralState(emptyTrace, 0)).toBeNull();
  });

  it("returns null when no structure has ever been created up to currentStep", () => {
    const trace = makeTrace([
      makeFrame({ stepIndex: 0, line: 1 }), // def foo():
      makeFrame({ stepIndex: 1, line: 2, scope: { a: 1 } }), // a = 1
    ]);

    expect(resolveEffectiveStructuralState(trace, 0)).toBeNull();
    expect(resolveEffectiveStructuralState(trace, 1)).toBeNull();
  });

  it("returns isDirectMatch: true when the current step has a detected structure", () => {
    const trace = makeTrace([
      makeFrame({ stepIndex: 0, line: 1 }),
      makeFrame({
        stepIndex: 1,
        line: 2,
        scope: { head: { __type__: "object_ref", id: "obj_1", className: "ListNode", repr: "" } },
        heap: { obj_1: makeNode("obj_1", 10) },
      }),
    ]);

    const state = resolveEffectiveStructuralState(trace, 1);
    expect(state).not.toBeNull();
    expect(state?.isDirectMatch).toBe(true);
    expect(state?.structuralStep).toBe(1);
    expect(state?.structure.structureType).toBe("singly_linked_list");
  });

  it("persists previous structural state when current step is a non-structural line (e.g. return or scalar update)", () => {
    const trace = makeTrace([
      makeFrame({ stepIndex: 0, line: 1 }), // class Node
      makeFrame({
        stepIndex: 1,
        line: 5,
        scope: { head: { __type__: "object_ref", id: "obj_1", className: "ListNode", repr: "" } },
        heap: { obj_1: makeNode("obj_1", 10) },
      }), // head = ListNode(10)
      makeFrame({
        stepIndex: 2,
        line: 6,
        scope: {
          head: { __type__: "object_ref", id: "obj_1", className: "ListNode", repr: "" },
          total: 0,
        },
        heap: { obj_1: makeNode("obj_1", 10) },
      }), // total = 0 (head still in scope -> direct match)
      makeFrame({
        stepIndex: 3,
        line: 7,
        scope: {
          total: 10,
        },
        heap: {}, // Empty heap at step 3 -> triggers backward scan to step 2
      }), // return total (backward retention)
    ]);

    // Step 2 has head in scope -> directly detected
    const stateAtStep2 = resolveEffectiveStructuralState(trace, 2);
    expect(stateAtStep2).not.toBeNull();
    expect(stateAtStep2?.structuralStep).toBe(2);
    expect(stateAtStep2?.isDirectMatch).toBe(true);
    expect(stateAtStep2?.structure.structureType).toBe("singly_linked_list");

    // Step 3 does not have head in scope, but retains Step 2's structure
    const stateAtStep3 = resolveEffectiveStructuralState(trace, 3);
    expect(stateAtStep3).not.toBeNull();
    expect(stateAtStep3?.structuralStep).toBe(2);
    expect(stateAtStep3?.isDirectMatch).toBe(false);
    expect(stateAtStep3?.structure.structureType).toBe("singly_linked_list");
  });

  it("persists array state when advancing to loop or scalar statement", () => {
    const trace = makeTrace([
      makeFrame({
        stepIndex: 0,
        line: 1,
        scope: { nums: [1, 2, 3, 4] },
      }), // nums = [1, 2, 3, 4]
      makeFrame({
        stepIndex: 1,
        line: 2,
        scope: { nums: [1, 2, 3, 4], i: 0 },
      }), // i = 0
    ]);

    const stateAtStep1 = resolveEffectiveStructuralState(trace, 1);
    expect(stateAtStep1).not.toBeNull();
    expect(stateAtStep1?.structure.structureType).toBe("1d_array");
  });
});
