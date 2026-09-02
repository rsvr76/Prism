/**
 * Test Suite: Binary Search Tree (BST) Visualizer & Detector
 * All 18 required acceptance criteria test cases for Phase 3C.
 */

import { describe, it, expect } from "vitest";
import { detectStructures, isBSTNodeCandidate, getScopePointersToHeapId } from "@/lib/visualization/structureDetector";
import { computeTreeLayout, getTreeChildId } from "@/lib/visualization/treeLayout";
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

function makeTreeNode(
  id: string,
  val: unknown,
  leftId: string | null = null,
  rightId: string | null = null
): HeapObject {
  const references: Record<string, string> = {};
  const fields: Record<string, any> = { val };

  if (leftId) references.left = leftId;
  else fields.left = null;

  if (rightId) references.right = rightId;
  else fields.right = null;

  return {
    id,
    className: "Node",
    fields,
    references,
  };
}

// ─── TC-01: Empty Tree ────────────────────────────────────────────────────────

describe("TC-01: Empty tree", () => {
  it("detectStructures returns no tree when heap is empty", () => {
    const frame = makeFrame({ heap: {} });
    const structures = detectStructures(frame);
    const trees = structures.filter((s) => s.structureType === "binary_tree");
    expect(trees).toHaveLength(0);
  });
});

// ─── TC-02: Single-Node Tree ──────────────────────────────────────────────────

describe("TC-02: Single-node tree", () => {
  it("detects single-node BST with root in scope", () => {
    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_root", className: "Node", repr: "" } },
      heap: {
        obj_root: makeTreeNode("obj_root", 10),
      },
    });

    const structures = detectStructures(frame);
    expect(structures.length).toBeGreaterThanOrEqual(1);
    expect(structures[0].structureType).toBe("binary_tree");
    expect(structures[0].rootHeapId).toBe("obj_root");
  });
});

// ─── TC-03: Three-Node BST (Root, Left, Right) ────────────────────────────────

describe("TC-03: Three-node BST", () => {
  it("detects balanced 3-node BST (8 -> 3, 10)", () => {
    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_8", className: "Node", repr: "" } },
      heap: {
        obj_8: makeTreeNode("obj_8", 8, "obj_3", "obj_10"),
        obj_3: makeTreeNode("obj_3", 3),
        obj_10: makeTreeNode("obj_10", 10),
      },
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("binary_tree");
    expect(structures[0].rootHeapId).toBe("obj_8");

    const layout = computeTreeLayout("obj_8", frame.heap);
    expect(layout.nodeCount).toBe(3);
    // In-order traversal of BST: left (3) < root (8) < right (10)
    expect(layout.positions["obj_3"].x).toBeLessThan(layout.positions["obj_8"].x);
    expect(layout.positions["obj_8"].x).toBeLessThan(layout.positions["obj_10"].x);
  });
});

// ─── TC-04: Multi-Level BST (3+ levels) ───────────────────────────────────────

describe("TC-04: Multi-level BST", () => {
  it("computes coordinates and detects 5-node 3-level BST", () => {
    const frame = makeFrame({
      scope: { bst: { __type__: "object_ref", id: "obj_8", className: "Node", repr: "" } },
      heap: {
        obj_8: makeTreeNode("obj_8", 8, "obj_3", "obj_10"),
        obj_3: makeTreeNode("obj_3", 3, "obj_1", "obj_6"),
        obj_10: makeTreeNode("obj_10", 10),
        obj_1: makeTreeNode("obj_1", 1),
        obj_6: makeTreeNode("obj_6", 6),
      },
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("binary_tree");

    const layout = computeTreeLayout("obj_8", frame.heap);
    expect(layout.nodeCount).toBe(5);

    // In-order x coordinates strictly monotonic: 1 < 3 < 6 < 8 < 10
    expect(layout.positions["obj_1"].x).toBeLessThan(layout.positions["obj_3"].x);
    expect(layout.positions["obj_3"].x).toBeLessThan(layout.positions["obj_6"].x);
    expect(layout.positions["obj_6"].x).toBeLessThan(layout.positions["obj_8"].x);
    expect(layout.positions["obj_8"].x).toBeLessThan(layout.positions["obj_10"].x);
  });
});

// ─── TC-05: Left-Only Child (Left Skewed) ─────────────────────────────────────

describe("TC-05: Left-only child (skewed left)", () => {
  it("handles left-skewed tree without overlapping nodes", () => {
    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_3", className: "Node", repr: "" } },
      heap: {
        obj_3: makeTreeNode("obj_3", 3, "obj_2", null),
        obj_2: makeTreeNode("obj_2", 2, "obj_1", null),
        obj_1: makeTreeNode("obj_1", 1, null, null),
      },
    });

    const layout = computeTreeLayout("obj_3", frame.heap);
    expect(layout.nodeCount).toBe(3);
    expect(layout.positions["obj_1"].x).toBeLessThan(layout.positions["obj_2"].x);
    expect(layout.positions["obj_2"].x).toBeLessThan(layout.positions["obj_3"].x);
  });
});

// ─── TC-06: Right-Only Child (Right Skewed) ───────────────────────────────────

describe("TC-06: Right-only child (skewed right)", () => {
  it("handles right-skewed tree without overlapping nodes", () => {
    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_1", className: "Node", repr: "" } },
      heap: {
        obj_1: makeTreeNode("obj_1", 1, null, "obj_2"),
        obj_2: makeTreeNode("obj_2", 2, null, "obj_3"),
        obj_3: makeTreeNode("obj_3", 3, null, null),
      },
    });

    const layout = computeTreeLayout("obj_1", frame.heap);
    expect(layout.nodeCount).toBe(3);
    expect(layout.positions["obj_1"].x).toBeLessThan(layout.positions["obj_2"].x);
    expect(layout.positions["obj_2"].x).toBeLessThan(layout.positions["obj_3"].x);
  });
});

// ─── TC-07: Missing Left Child ────────────────────────────────────────────────

describe("TC-07: Missing left child", () => {
  it("correctly identifies null left child and renders right child", () => {
    const node = makeTreeNode("obj_10", 10, null, "obj_20");
    expect(getTreeChildId(node, ["left"])).toBeNull();
    expect(getTreeChildId(node, ["right"])).toBe("obj_20");
  });
});

// ─── TC-08: Missing Right Child ───────────────────────────────────────────────

describe("TC-08: Missing right child", () => {
  it("correctly identifies null right child and renders left child", () => {
    const node = makeTreeNode("obj_20", 20, "obj_10", null);
    expect(getTreeChildId(node, ["left"])).toBe("obj_10");
    expect(getTreeChildId(node, ["right"])).toBeNull();
  });
});

// ─── TC-09: Root Detection from Scope ─────────────────────────────────────────

describe("TC-09: Root detection from scope variable name", () => {
  it("picks variable named 'root' as the tree root", () => {
    const frame = makeFrame({
      scope: {
        root: { __type__: "object_ref", id: "obj_r", className: "Node", repr: "" },
        temp: { __type__: "object_ref", id: "obj_c", className: "Node", repr: "" },
      },
      heap: {
        obj_r: makeTreeNode("obj_r", 50, "obj_c", null),
        obj_c: makeTreeNode("obj_c", 25),
      },
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("binary_tree");
    expect(structures[0].rootHeapId).toBe("obj_r");
  });
});

// ─── TC-10: Root Detection from Topology (In-Degree Zero) ─────────────────────

describe("TC-10: Root detection from topology (no scope variable named root)", () => {
  it("infers root by finding in-degree zero candidate node", () => {
    const frame = makeFrame({
      scope: {
        my_tree: { __type__: "object_ref", id: "obj_top", className: "Node", repr: "" },
      },
      heap: {
        obj_top: makeTreeNode("obj_top", 100, "obj_left", "obj_right"),
        obj_left: makeTreeNode("obj_left", 50),
        obj_right: makeTreeNode("obj_right", 150),
      },
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("binary_tree");
    expect(structures[0].rootHeapId).toBe("obj_top");
  });
});

// ─── TC-11: Pointer Resolution ────────────────────────────────────────────────

describe("TC-11: Pointer resolution to BST node", () => {
  it("resolves scope variables pointing to tree nodes", () => {
    const frame = makeFrame({
      scope: {
        root: { __type__: "object_ref", id: "obj_8", className: "Node", repr: "" },
        curr: { __type__: "object_ref", id: "obj_3", className: "Node", repr: "" },
        target: { __type__: "object_ref", id: "obj_3", className: "Node", repr: "" },
      },
      heap: {
        obj_8: makeTreeNode("obj_8", 8, "obj_3", null),
        obj_3: makeTreeNode("obj_3", 3),
      },
    });

    const pointersTo3 = getScopePointersToHeapId(frame, "obj_3");
    expect(pointersTo3).toContain("curr");
    expect(pointersTo3).toContain("target");
    expect(pointersTo3).not.toContain("root");
  });
});

// ─── TC-12: Traversal Without Infinite Recursion ──────────────────────────────

describe("TC-12: Traversal on deep tree capped safely", () => {
  it("handles deep 50-level tree without recursion errors", () => {
    const heap: Record<string, HeapObject> = {};
    for (let i = 0; i < 50; i++) {
      const id = `obj_${i}`;
      const nextId = i < 49 ? `obj_${i + 1}` : null;
      heap[id] = makeTreeNode(id, i, null, nextId);
    }

    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_0", className: "Node", repr: "" } },
      heap,
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("binary_tree");

    const layout = computeTreeLayout("obj_0", heap);
    expect(layout.nodeCount).toBe(50);
  });
});

// ─── TC-13: Circular / Malformed Reference Safety ─────────────────────────────

describe("TC-13: Circular / malformed reference safety", () => {
  it("does not infinite-loop when tree contains a cyclic reference", () => {
    const frame = makeFrame({
      scope: { root: { __type__: "object_ref", id: "obj_a", className: "Node", repr: "" } },
      heap: {
        obj_a: makeTreeNode("obj_a", 1, "obj_b", null),
        obj_b: makeTreeNode("obj_b", 2, "obj_a", null), // cyclic back to a
      },
    });

    // computeTreeLayout must terminate safely
    const layout = computeTreeLayout("obj_a", frame.heap);
    expect(layout.nodeCount).toBe(2);
    expect(layout.positions["obj_a"]).toBeDefined();
    expect(layout.positions["obj_b"]).toBeDefined();
  });
});

// ─── TC-14: Stable Node IDs ───────────────────────────────────────────────────

describe("TC-14: Stable node IDs", () => {
  it("preserves exact heap object IDs in layout results", () => {
    const heap = {
      obj_14023948: makeTreeNode("obj_14023948", 50, "obj_14023999", null),
      obj_14023999: makeTreeNode("obj_14023999", 25),
    };

    const layout = computeTreeLayout("obj_14023948", heap);
    expect(Object.keys(layout.positions)).toEqual(["obj_14023999", "obj_14023948"]);
  });
});

// ─── TC-15: Frame-Specific Tree State ─────────────────────────────────────────

describe("TC-15: Frame-specific tree state", () => {
  it("reflects node addition across consecutive frames", () => {
    const frame1 = makeFrame({
      stepIndex: 1,
      scope: { root: { __type__: "object_ref", id: "obj_8", className: "Node", repr: "" } },
      heap: {
        obj_8: makeTreeNode("obj_8", 8),
      },
    });

    const frame2 = makeFrame({
      stepIndex: 2,
      scope: { root: { __type__: "object_ref", id: "obj_8", className: "Node", repr: "" } },
      heap: {
        obj_8: makeTreeNode("obj_8", 8, "obj_3", null),
        obj_3: makeTreeNode("obj_3", 3),
      },
    });

    const layout1 = computeTreeLayout("obj_8", frame1.heap);
    const layout2 = computeTreeLayout("obj_8", frame2.heap);

    expect(layout1.nodeCount).toBe(1);
    expect(layout2.nodeCount).toBe(2);
  });
});

// ─── TC-16: Linked-List Regression ────────────────────────────────────────────

describe("TC-16: Linked-list code is still detected as singly_linked_list", () => {
  it("classifies objects with only next as singly_linked_list and not binary_tree", () => {
    const frame = makeFrame({
      scope: { head: { __type__: "object_ref", id: "obj_node1", className: "Node", repr: "" } },
      heap: {
        obj_node1: {
          id: "obj_node1",
          className: "Node",
          fields: { val: 10 },
          references: { next: "obj_node2" },
        },
        obj_node2: {
          id: "obj_node2",
          className: "Node",
          fields: { val: 20, next: null },
          references: {},
        },
      },
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("singly_linked_list");
  });
});

// ─── TC-17: Array Regression ──────────────────────────────────────────────────

describe("TC-17: Array code is still detected as 1d_array", () => {
  it("classifies scope lists as 1d_array", () => {
    const frame = makeFrame({
      scope: { numbers: [10, 20, 30, 40] },
      heap: {},
    });

    const structures = detectStructures(frame);
    expect(structures[0].structureType).toBe("1d_array");
  });
});

// ─── TC-18: Candidate Recognition Helper ──────────────────────────────────────

describe("TC-18: isBSTNodeCandidate helper", () => {
  it("identifies objects with left/right and value fields", () => {
    const validBST = makeTreeNode("obj_1", 42, null, null);
    expect(isBSTNodeCandidate(validBST)).toBe(true);

    const linkedListOnly = {
      id: "obj_ll",
      className: "Node",
      fields: { val: 10, next: null },
      references: {},
    };
    expect(isBSTNodeCandidate(linkedListOnly)).toBe(false);
  });
});
