/**
 * Test Suite: Structure Detector
 * 10 test cases for Phase 3A acceptance criteria.
 */

import { describe, it, expect } from "vitest";
import { detectStructures, getLinkedListChain, getScopePointersToHeapId, getNodeDisplayValue } from "@/lib/visualization/structureDetector";
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

function makeNode(id: string, val: unknown, nextId: string | null): HeapObject {
  return {
    id,
    className: "Node",
    fields: { val: val as number },
    references: nextId !== null ? { next: nextId } : {},
  };
}

function makeNodeWithNullField(id: string, val: unknown): HeapObject {
  return {
    id,
    className: "Node",
    fields: { val: val as number, next: null },
    references: {},
  };
}

// ─── TC-01: Simple linked list (3 nodes) ──────────────────────────────────────

describe("TC-01: Simple 3-node linked list", () => {
  it("detects a singly linked list with 3 nodes", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: makeNode("obj_1", 10, "obj_2"),
        obj_2: makeNode("obj_2", 20, "obj_3"),
        obj_3: makeNodeWithNullField("obj_3", 30),
      },
    });

    const result = detectStructures(frame);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].structureType).toBe("singly_linked_list");
    expect(result[0].rootHeapId).toBe("obj_1");
    expect(result[0].confidence).toBeGreaterThanOrEqual(0.9);
  });
});

// ─── TC-02: Empty linked list (no heap objects) ────────────────────────────────

describe("TC-02: Empty linked list (empty heap)", () => {
  it("returns empty array when heap is empty", () => {
    const frame = makeFrame({ heap: {} });
    const result = detectStructures(frame);
    expect(result).toHaveLength(0);
  });
});

// ─── TC-03: Single-node list ───────────────────────────────────────────────────

describe("TC-03: Single-node linked list", () => {
  it("detects a single-node list with confidence >= 0.6", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: { obj_1: makeNodeWithNullField("obj_1", 42) },
    });

    const result = detectStructures(frame);
    const linked = result.filter((s) => s.structureType === "singly_linked_list");
    expect(linked.length).toBeGreaterThanOrEqual(1);
    expect(linked[0].confidence).toBeGreaterThanOrEqual(0.6);
  });
});

// ─── TC-04: Multi-node list (5 nodes) ────────────────────────────────────────

describe("TC-04: Multi-node linked list (5 nodes)", () => {
  it("traverses and detects a 5-node chain correctly", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: makeNode("obj_1", 1, "obj_2"),
        obj_2: makeNode("obj_2", 2, "obj_3"),
        obj_3: makeNode("obj_3", 3, "obj_4"),
        obj_4: makeNode("obj_4", 4, "obj_5"),
        obj_5: makeNodeWithNullField("obj_5", 5),
      },
    });

    const result = detectStructures(frame);
    expect(result[0].structureType).toBe("singly_linked_list");
    expect(result[0].rootHeapId).toBe("obj_1");

    // Verify chain traversal
    const { chain } = getLinkedListChain("obj_1", frame.heap);
    expect(chain).toEqual(["obj_1", "obj_2", "obj_3", "obj_4", "obj_5"]);
  });
});

// ─── TC-05: None/NULL next pointer ────────────────────────────────────────────

describe("TC-05: Node with explicit null next field", () => {
  it("correctly treats null next field as list terminator", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_a", className: "Node", repr: "" } },
      heap: {
        obj_a: makeNode("obj_a", 100, "obj_b"),
        obj_b: makeNodeWithNullField("obj_b", 200),
      },
    });

    const { chain, isCircular } = getLinkedListChain("obj_a", frame.heap);
    expect(chain).toEqual(["obj_a", "obj_b"]);
    expect(isCircular).toBe(false);
  });
});

// ─── TC-06: Circular linked list ──────────────────────────────────────────────

describe("TC-06: Circular linked list", () => {
  it("detects circular reference and does not infinite-loop", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_a", className: "Node", repr: "" } },
      heap: {
        obj_a: makeNode("obj_a", 1, "obj_b"),
        obj_b: makeNode("obj_b", 2, "obj_a"), // circular back to obj_a
      },
    });

    const { chain, isCircular } = getLinkedListChain("obj_a", frame.heap);
    expect(isCircular).toBe(true);
    expect(chain.length).toBe(2); // stops before revisiting
    expect(chain).toContain("obj_a");
    expect(chain).toContain("obj_b");

    // detectStructures must not hang
    const result = detectStructures(frame);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});

// ─── TC-07: Multiple unrelated objects in heap ────────────────────────────────

describe("TC-07: Multiple unrelated heap objects", () => {
  it("only detects objects that form a linked list topology", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: makeNode("obj_1", 10, "obj_2"),
        obj_2: makeNodeWithNullField("obj_2", 20),
        // A completely unrelated object with no next/val
        obj_x: {
          id: "obj_x",
          className: "SomeOtherClass",
          fields: { color: "red" },
          references: {},
        },
      },
    });

    const result = detectStructures(frame);
    const linked = result.filter((s) => s.structureType === "singly_linked_list");
    expect(linked.length).toBe(1);
    expect(linked[0].rootHeapId).toBe("obj_1");
  });
});

// ─── TC-08: Stable object IDs ─────────────────────────────────────────────────

describe("TC-08: Stable object IDs", () => {
  it("uses heap object IDs as node IDs (not memory addresses or sequential)", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_140482345", className: "Node", repr: "" } },
      heap: {
        obj_140482345: makeNode("obj_140482345", 99, "obj_140482678"),
        obj_140482678: makeNodeWithNullField("obj_140482678", 88),
      },
    });

    const result = detectStructures(frame);
    expect(result[0].rootHeapId).toBe("obj_140482345");

    const { chain } = getLinkedListChain("obj_140482345", frame.heap);
    expect(chain[0]).toBe("obj_140482345");
    expect(chain[1]).toBe("obj_140482678");
  });
});

// ─── TC-09: Frame-specific state ─────────────────────────────────────────────

describe("TC-09: Frame-specific state detection", () => {
  it("detects different structures depending on which frame is provided", () => {
    const frameWithList = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: { obj_1: makeNodeWithNullField("obj_1", 1) },
    });

    const frameWithoutList = makeFrame({
      scope: { x: 42, y: "hello" },
      heap: {},
    });

    const resultWith = detectStructures(frameWithList);
    const resultWithout = detectStructures(frameWithoutList);

    expect(resultWith.length).toBeGreaterThanOrEqual(1);
    expect(resultWithout.length).toBe(0);
  });
});

// ─── TC-10: No infinite traversal guarantee ───────────────────────────────────

describe("TC-10: No infinite traversal on pathological input", () => {
  it("stops at maxNodes=200 on a very long chain without hanging", () => {
    const heap: Record<string, HeapObject> = {};
    for (let i = 0; i < 250; i++) {
      const id = `obj_${i}`;
      const nextId = i < 249 ? `obj_${i + 1}` : null;
      heap[id] = makeNode(id, i, nextId);
    }
    // last node needs null field since no next in references
    heap["obj_249"] = makeNodeWithNullField("obj_249", 249);

    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_0", className: "Node", repr: "" } },
      heap,
    });

    const { chain } = getLinkedListChain("obj_0", heap);
    // maxNodes is 200, so chain should stop at 200 regardless of actual length
    expect(chain.length).toBeLessThanOrEqual(200);
    // Must complete without error
    const result = detectStructures(frame);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Utility function tests ────────────────────────────────────────────────────

describe("getScopePointersToHeapId", () => {
  it("returns variable names pointing to a specific heap id", () => {
    const frame = makeFrame({
      scope: {
        head: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" },
        curr: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" },
        prev: { __type__: "object_ref", id: "obj_2", className: "Node", repr: "" },
      },
      heap: {},
    });

    const names = getScopePointersToHeapId(frame, "obj_1");
    expect(names).toContain("head");
    expect(names).toContain("curr");
    expect(names).not.toContain("prev");
  });
});

describe("getNodeDisplayValue", () => {
  it("returns val field when present", () => {
    const obj: HeapObject = { id: "x", className: "Node", fields: { val: 42 }, references: {} };
    expect(getNodeDisplayValue(obj)).toBe("42");
  });

  it("falls back to className when no value field found", () => {
    const obj: HeapObject = { id: "x", className: "Edge", fields: {}, references: {} };
    expect(getNodeDisplayValue(obj)).toBe("Edge");
  });
});
