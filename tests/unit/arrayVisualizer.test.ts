/**
 * Test Suite: Array Visualizer & State Deriver
 * All 15 required acceptance criteria test cases for Phase 3B.
 */

import { describe, it, expect } from "vitest";
import { deriveArrayState } from "@/lib/visualization/arrayStateDeriver";
import { detectStructures } from "@/lib/visualization/structureDetector";
import type { PrismFrame, HeapObject } from "@/types/trace";

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

// ─── TC-01: Empty Array ───────────────────────────────────────────────────────

describe("TC-01: Empty array", () => {
  it("derives valid state with 0 elements for an empty list", () => {
    const frame = makeFrame({ scope: { arr: [] } });
    const state = deriveArrayState(frame, null, "arr");

    expect(state).not.toBeNull();
    expect(state?.elements).toHaveLength(0);
    expect(state?.isSorted).toBe(true);
    expect(state?.variableName).toBe("arr");
  });
});

// ─── TC-02: Single-Element Array ──────────────────────────────────────────────

describe("TC-02: Single-element array", () => {
  it("derives valid state with 1 element and isSorted=true", () => {
    const frame = makeFrame({ scope: { nums: [42] } });
    const state = deriveArrayState(frame, null, "nums");

    expect(state).not.toBeNull();
    expect(state?.elements).toHaveLength(1);
    expect(state?.elements[0].value).toBe(42);
    expect(state?.elements[0].index).toBe(0);
    expect(state?.isSorted).toBe(true);
  });
});

// ─── TC-03: Normal Integer Array ──────────────────────────────────────────────

describe("TC-03: Normal integer array", () => {
  it("derives correct elements, indices, and min/max values", () => {
    const frame = makeFrame({ scope: { numbers: [5, 2, 8, 1, 4] } });
    const state = deriveArrayState(frame, null, "numbers");

    expect(state).not.toBeNull();
    expect(state?.elements).toHaveLength(5);
    expect(state?.elements.map((e) => e.value)).toEqual([5, 2, 8, 1, 4]);
    expect(state?.minValue).toBe(1);
    expect(state?.maxValue).toBe(8);
    expect(state?.isSorted).toBe(false);
  });
});

// ─── TC-04: Array with Duplicates ─────────────────────────────────────────────

describe("TC-04: Array with duplicates", () => {
  it("preserves duplicate values across distinct indices", () => {
    const frame = makeFrame({ scope: { arr: [3, 1, 3, 2, 3] } });
    const state = deriveArrayState(frame, null, "arr");

    expect(state?.elements).toHaveLength(5);
    expect(state?.elements[0].value).toBe(3);
    expect(state?.elements[2].value).toBe(3);
    expect(state?.elements[4].value).toBe(3);
    expect(state?.elements[0].index).toBe(0);
    expect(state?.elements[2].index).toBe(2);
    expect(state?.elements[4].index).toBe(4);
  });
});

// ─── TC-05: Array containing Negative Values ──────────────────────────────────

describe("TC-05: Array containing negative values", () => {
  it("calculates correct min/max and positive heightPercent for negative numbers", () => {
    const frame = makeFrame({ scope: { arr: [-10, -5, 0, 5, 10] } });
    const state = deriveArrayState(frame, null, "arr");

    expect(state?.minValue).toBe(-10);
    expect(state?.maxValue).toBe(10);
    expect(state?.elements[0].heightPercent).toBeGreaterThanOrEqual(15);
    expect(state?.elements[4].heightPercent).toBe(100);
    expect(state?.isSorted).toBe(true);
  });
});

// ─── TC-06: Frame-specific Array State ────────────────────────────────────────

describe("TC-06: Frame-specific array state", () => {
  it("derives distinct states for different execution frames", () => {
    const frame1 = makeFrame({ stepIndex: 1, scope: { arr: [5, 2, 8] } });
    const frame2 = makeFrame({ stepIndex: 2, scope: { arr: [2, 5, 8] } });

    const state1 = deriveArrayState(frame1, null, "arr");
    const state2 = deriveArrayState(frame2, null, "arr");

    expect(state1?.elements[0].value).toBe(5);
    expect(state2?.elements[0].value).toBe(2);
    expect(state1?.isSorted).toBe(false);
    expect(state2?.isSorted).toBe(true);
  });
});

// ─── TC-07: Index Preservation ────────────────────────────────────────────────

describe("TC-07: Index preservation", () => {
  it("guarantees every element index matches its position exactly", () => {
    const frame = makeFrame({ scope: { arr: [100, 200, 300, 400] } });
    const state = deriveArrayState(frame, null, "arr");

    state?.elements.forEach((el, idx) => {
      expect(el.index).toBe(idx);
    });
  });
});

// ─── TC-08: Backward Time Travel ──────────────────────────────────────────────

describe("TC-08: Backward time travel (immutability)", () => {
  it("extracting an earlier frame gives unchanged historical state without re-execution", () => {
    const frameEarly = makeFrame({ stepIndex: 0, scope: { arr: [4, 3, 2, 1] } });
    const frameLate = makeFrame({ stepIndex: 10, scope: { arr: [1, 2, 3, 4] } });

    const stateLate = deriveArrayState(frameLate, null, "arr");
    expect(stateLate?.elements.map((e) => e.value)).toEqual([1, 2, 3, 4]);

    // Go backward
    const stateEarly = deriveArrayState(frameEarly, null, "arr");
    expect(stateEarly?.elements.map((e) => e.value)).toEqual([4, 3, 2, 1]);
  });
});

// ─── TC-09: Missing Array State ───────────────────────────────────────────────

describe("TC-09: Missing array state", () => {
  it("returns null gracefully when variable does not exist in frame", () => {
    const frame = makeFrame({ scope: { otherVar: 123 } });
    const state = deriveArrayState(frame, null, "arr");
    expect(state).toBeNull();
  });
});

// ─── TC-10: Linked-List Regression ────────────────────────────────────────────

describe("TC-10: Linked list detection is preserved and prioritized", () => {
  it("prioritizes linked lists when both linked list and array exist in the frame", () => {
    const frame = makeFrame({
      scope: {
        head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" },
        numbers: [1, 2, 3],
      },
      heap: {
        obj_1: {
          id: "obj_1",
          className: "Node",
          fields: { val: 10, next: null },
          references: {},
        },
      },
    });

    const structures = detectStructures(frame);
    expect(structures.length).toBeGreaterThanOrEqual(2);
    // Linked list must be first (highest priority / confidence)
    expect(structures[0].structureType).toBe("singly_linked_list");
    expect(structures[1].structureType).toBe("1d_array");
  });
});

// ─── TC-11: Comparison State ──────────────────────────────────────────────────

describe("TC-11: Comparison state detection", () => {
  it("marks comparing state on elements pointed to by loop index j and j+1", () => {
    const frame = makeFrame({
      scope: {
        arr: [5, 2, 8, 1],
        j: 1, // comparing arr[1] and arr[2]
      },
    });

    const state = deriveArrayState(frame, null, "arr");
    expect(state?.elements[1].state).toBe("comparing");
    expect(state?.elements[2].state).toBe("comparing");
    expect(state?.elements[0].state).toBe("normal");
    expect(state?.operationDescription).toContain("Comparing");
  });
});

// ─── TC-12: Swap State ────────────────────────────────────────────────────────

describe("TC-12: Swap state detection", () => {
  it("identifies swapped elements by comparing with prevFrame", () => {
    const prevFrame = makeFrame({
      stepIndex: 4,
      scope: { arr: [5, 2, 8, 1] },
    });
    const currentFrame = makeFrame({
      stepIndex: 5,
      scope: { arr: [2, 5, 8, 1] }, // indices 0 and 1 swapped
    });

    const state = deriveArrayState(currentFrame, prevFrame, "arr");
    expect(state?.elements[0].state).toBe("swapping");
    expect(state?.elements[1].state).toBe("swapping");
    expect(state?.elements[2].state).toBe("normal");
    expect(state?.operationDescription).toContain("Swapped");
  });
});

// ─── TC-13: Pivot State ───────────────────────────────────────────────────────

describe("TC-13: Pivot state detection", () => {
  it("marks pivot element when pivot index is in scope", () => {
    const frame = makeFrame({
      scope: {
        arr: [7, 2, 1, 6],
        pivot: 3, // index 3 is pivot
      },
    });

    const state = deriveArrayState(frame, null, "arr");
    expect(state?.elements[3].state).toBe("pivot");
    expect(state?.operationDescription).toContain("Pivot");
  });
});

// ─── TC-14: Sorted State ──────────────────────────────────────────────────────

describe("TC-14: Sorted state detection", () => {
  it("marks elements as sorted when the whole array is in ascending order", () => {
    const frame = makeFrame({
      scope: { arr: [1, 2, 3, 4, 5] },
    });

    const state = deriveArrayState(frame, null, "arr");
    expect(state?.isSorted).toBe(true);
    expect(state?.elements[0].state).toBe("sorted");
    expect(state?.elements[4].state).toBe("sorted");
  });
});

// ─── TC-15: Subarray Boundary State ───────────────────────────────────────────

describe("TC-15: Subarray boundary detection", () => {
  it("extracts partition / window boundaries when low/high or left/right are present", () => {
    const frame = makeFrame({
      scope: {
        arr: [7, 2, 1, 6, 8, 5],
        low: 0,
        high: 3,
      },
    });

    const state = deriveArrayState(frame, null, "arr");
    expect(state?.boundaries).toHaveLength(1);
    expect(state?.boundaries[0].leftIndex).toBe(0);
    expect(state?.boundaries[0].rightIndex).toBe(3);
    expect(state?.boundaries[0].name).toContain("Partition");
  });
});
