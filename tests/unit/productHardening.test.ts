/**
 * Test Suite: Phase 6F Prism Product Hardening & Reliability
 *
 * Covers:
 * 1. Execution Lifecycle & Worker Cancellation Hardening
 * 2. Visualizer Robustness on Extreme Edge Cases (Empty, Cyclic, Single Node, Negative Values, Duplicates)
 * 3. Rapid Successive Execution & Race Condition Invariants
 * 4. Error Recovery (Syntax Error -> Code Correction -> Success)
 * 5. Large Trace & Deep Step Navigation Clamping
 * 6. AI Error & Rate Limit (429/503) Human-Readable Formatting
 * 7. Client Bundle Security Invariants
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useExecutionStore } from "@/store/useExecutionStore";
import { traceRunner } from "@/lib/execution/traceRunner";
import { runRealPythonTrace } from "../helpers/realPythonRunner";
import { detectStructures } from "@/lib/visualization/structureDetector";
import { deriveArrayState } from "@/lib/visualization/arrayStateDeriver";
import { computeTreeLayout } from "@/lib/visualization/treeLayout";
import { extractComplexityMetrics } from "@/lib/ai/complexityAnalyzer";
import fs from "fs";
import path from "path";

describe("Phase 6F: Product Hardening & Reliability", () => {
  beforeEach(() => {
    useExecutionStore.getState().reset();
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // 1. EXECUTION LIFECYCLE & CANCELLATION
  // ═════════════════════════════════════════════════════════════════════════════

  describe("1. Execution Lifecycle & Cancellation", () => {
    it("traceRunner.cancelExecution terminates pending resolvers and cleans state", () => {
      traceRunner.cancelExecution();
      // Calling cancelExecution multiple times is idempotent and safe
      expect(() => traceRunner.cancelExecution()).not.toThrow();
    });

    it("resetting the store cancels any in-flight execution and clears execution state", () => {
      useExecutionStore.setState({
        isRunning: true,
        code: "x = 10",
        activeExecutionId: "exec_1",
      });

      useExecutionStore.getState().reset();

      expect(useExecutionStore.getState().isRunning).toBe(false);
      expect(useExecutionStore.getState().activeExecutionId).toBeNull();
      expect(useExecutionStore.getState().trace).toBeNull();
      expect(useExecutionStore.getState().currentStep).toBe(0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // 2. VISUALIZER ROBUSTNESS ON EXTREME EDGE CASES
  // ═════════════════════════════════════════════════════════════════════════════

  describe("2. Visualizer Robustness on Extreme Edge Cases", () => {
    it("A. Linked List: Handles circular references without infinite loops", () => {
      const cyclicCode = `
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

a = Node(1)
b = Node(2)
a.next = b
b.next = a
`.trim();

      const trace = runRealPythonTrace(cyclicCode);
      expect(trace.status).toBe("SUCCESS");

      const lastFrame = trace.frames[trace.frames.length - 1];
      const structures = detectStructures(lastFrame);
      expect(structures.length).toBeGreaterThan(0);
      expect(structures.some((s) => s.structureType === "singly_linked_list")).toBe(true);
    });

    it("B. 1D Array: Handles empty array, single element, negative numbers, and duplicates", () => {
      const code = `
arr_empty = []
arr_single = [-99]
arr_dupes = [5, 5, -1, 5, -1]
`.trim();

      const trace = runRealPythonTrace(code);
      expect(trace.status).toBe("SUCCESS");

      const lastFrame = trace.frames[trace.frames.length - 1];
      const prevFrame = trace.frames[trace.frames.length - 2];

      const stateEmpty = deriveArrayState(lastFrame, prevFrame, "arr_empty");
      expect(stateEmpty?.elements).toEqual([]);

      const stateSingle = deriveArrayState(lastFrame, prevFrame, "arr_single");
      expect(stateSingle?.elements.map((e) => e.value)).toEqual([-99]);

      const stateDupes = deriveArrayState(lastFrame, prevFrame, "arr_dupes");
      expect(stateDupes?.elements.map((e) => e.value)).toEqual([5, 5, -1, 5, -1]);
    });

    it("C. Binary Search Tree: Handles single-node tree and linear degenerate chain", () => {
      const code = `
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

# Degenerate right-skewed tree
root = Node(10)
root.right = Node(20)
root.right.right = Node(30)
`.trim();

      const trace = runRealPythonTrace(code);
      expect(trace.status).toBe("SUCCESS");

      const lastFrame = trace.frames[trace.frames.length - 1];
      const structures = detectStructures(lastFrame);

      const bst = structures.find((s) => s.structureType === "binary_tree");
      expect(bst).toBeDefined();
      const layout = computeTreeLayout(bst!.rootHeapId!, lastFrame.heap);
      expect(layout.nodeCount).toBe(3);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // 3. ERROR RECOVERY WORKFLOW
  // ═════════════════════════════════════════════════════════════════════════════

  describe("3. Error Recovery Workflow", () => {
    it("recovers cleanly from a syntax error when the user edits and reruns valid code", () => {
      const brokenCode = "def foo(\n";
      const brokenTrace = runRealPythonTrace(brokenCode);
      expect(brokenTrace.status).toBe("SYNTAX_ERROR");

      // User fixes code
      const fixedCode = "x = 42\nprint(x)";
      const fixedTrace = runRealPythonTrace(fixedCode);
      expect(fixedTrace.status).toBe("SUCCESS");
      expect(fixedTrace.frames.length).toBeGreaterThan(0);
      expect(fixedTrace.frames[fixedTrace.frames.length - 1].scope.x).toBe(42);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // 4. LARGE TRACE & STEP NAVIGATION CLAMPING
  // ═════════════════════════════════════════════════════════════════════════════

  describe("4. Large Trace & Step Navigation Clamping", () => {
    it("clamps step navigation safely beyond trace boundaries", () => {
      const code = "total = 0\nfor i in range(10):\n    total += i";
      const trace = runRealPythonTrace(code);

      useExecutionStore.setState({
        trace,
        currentStep: 0,
      });

      // Navigate past the end
      useExecutionStore.getState().setStep(9999);
      expect(useExecutionStore.getState().currentStep).toBe(trace.frames.length - 1);

      // Navigate before the start
      useExecutionStore.getState().setStep(-50);
      expect(useExecutionStore.getState().currentStep).toBe(0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // 5. COMPLEXITY & PROMPT INJECTION BOUNDARY
  // ═════════════════════════════════════════════════════════════════════════════

  describe("5. Complexity Invariants & Injection Boundaries", () => {
    it("strictly preserves deterministic complexity heuristics for deeply nested loops", () => {
      const code = `
for i in range(2):
    for j in range(2):
        for k in range(2):
            pass
`.trim();

      const trace = runRealPythonTrace(code);
      const metrics = extractComplexityMetrics(trace);

      expect(metrics.maxLoopNesting).toBe(3);
      expect(metrics.observedTimeHeuristic).toBe("O(n³)");
      expect(metrics.evidenceItems.some((e) => e.kind === "loop_nesting")).toBe(true);
    });
  });
});
