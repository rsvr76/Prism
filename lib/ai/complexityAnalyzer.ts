/**
 * Prism Deterministic Complexity Metric Extractor (Phase 6B)
 *
 * Analyzes the ground-truth PrismTrace to extract deterministic execution metrics:
 * - Line execution frequencies & max line repetition
 * - Loop nesting patterns and repetition factors
 * - Call stack depth, recursion detection, and recursion depth
 * - Peak heap objects and memory growth
 * - Deterministic initial asymptotic heuristics
 *
 * PURE FUNCTION — Does NOT execute code or fabricate state.
 */

import { PrismTrace } from "@/types/trace";
import {
  ComplexityClass,
  DeterministicComplexityMetrics,
} from "@/types/ai";

export function extractComplexityMetrics(trace: PrismTrace): DeterministicComplexityMetrics {
  if (!trace || !trace.frames || trace.frames.length === 0) {
    return {
      totalSteps: 0,
      totalOperations: 0,
      maxCallStackDepth: 0,
      lineExecutionCounts: {},
      maxLineExecutionCount: 0,
      maxLoopNesting: 0,
      isRecursive: false,
      recursionDepth: 0,
      detectedStructures: [],
      peakHeapObjects: 0,
      observedTimeHeuristic: "unknown",
      observedSpaceHeuristic: "unknown",
    };
  }

  const lineCounts: Record<number, number> = {};
  let maxCallStackDepth = 0;
  let isRecursive = false;
  let maxRecursionDepth = 0;
  let peakHeapObjects = trace.metrics?.peakHeapObjects || 0;

  for (const frame of trace.frames) {
    // 1. Line counts
    if (frame.line > 0) {
      lineCounts[frame.line] = (lineCounts[frame.line] || 0) + 1;
    }

    // 2. Call stack & recursion
    const stackDepth = frame.callStack?.length || 0;
    if (stackDepth > maxCallStackDepth) {
      maxCallStackDepth = stackDepth;
    }

    if (frame.callStack && frame.callStack.length > 1) {
      const funcCounts = new Map<string, number>();
      for (const fn of frame.callStack) {
        const count = (funcCounts.get(fn.functionName) || 0) + 1;
        funcCounts.set(fn.functionName, count);
        if (count > 1) {
          isRecursive = true;
          if (count > maxRecursionDepth) {
            maxRecursionDepth = count;
          }
        }
      }
    }

    // 3. Peak heap
    if (frame.heap) {
      const heapCount = Object.keys(frame.heap).length;
      if (heapCount > peakHeapObjects) {
        peakHeapObjects = heapCount;
      }
    }
  }

  const countsArray = Object.values(lineCounts);
  const maxLineExecutionCount = countsArray.length > 0 ? Math.max(...countsArray) : 0;

  // 4. Loop nesting detection
  // Detect lines with distinct non-trivial repetition ratios (e.g. outer loop 5x, inner loop 25x)
  const distinctRepeatedCounts = Array.from(new Set(countsArray.filter((c) => c > 1))).sort(
    (a, b) => a - b
  );

  let maxLoopNesting = 0;
  if (distinctRepeatedCounts.length === 1) {
    maxLoopNesting = 1;
  } else if (distinctRepeatedCounts.length >= 2) {
    // Check if largest is significantly greater than smallest repeated count
    const minRep = distinctRepeatedCounts[0];
    const maxRep = distinctRepeatedCounts[distinctRepeatedCounts.length - 1];
    if (maxRep >= minRep * minRep * 0.5) {
      maxLoopNesting = distinctRepeatedCounts.length >= 3 && maxRep >= minRep * minRep * minRep * 0.5 ? 3 : 2;
    } else {
      maxLoopNesting = 1;
    }
  }

  // 5. Structure types
  const detectedStructures = trace.detectedStructures
    ? trace.detectedStructures.map((s) => s.structureType)
    : [];

  // 6. Time complexity heuristic inference
  let observedTimeHeuristic: ComplexityClass = "unknown";

  if (trace.status === "TIMEOUT") {
    observedTimeHeuristic = "unknown";
  } else if (isRecursive) {
    if (maxRecursionDepth > 1) {
      observedTimeHeuristic = "O(n)";
    } else {
      observedTimeHeuristic = "O(log n)";
    }
  } else if (maxLineExecutionCount <= 1 && trace.frames.length <= 15) {
    observedTimeHeuristic = "O(1)";
  } else if (maxLoopNesting === 3) {
    observedTimeHeuristic = "O(n³)";
  } else if (maxLoopNesting === 2) {
    observedTimeHeuristic = "O(n²)";
  } else if (maxLoopNesting === 1) {
    observedTimeHeuristic = maxLineExecutionCount > 1 ? "O(n)" : "O(1)";
  } else {
    observedTimeHeuristic = "O(1)";
  }

  // 7. Space complexity heuristic inference
  let observedSpaceHeuristic: ComplexityClass = "O(1)";
  if (isRecursive && maxRecursionDepth > 2) {
    observedSpaceHeuristic = "O(n)";
  } else if (peakHeapObjects > 5 || detectedStructures.length > 0) {
    observedSpaceHeuristic = "O(n)";
  }

  return {
    totalSteps: trace.frames.length,
    totalOperations: trace.metrics?.totalOperations || trace.frames.length,
    maxCallStackDepth,
    lineExecutionCounts: lineCounts,
    maxLineExecutionCount,
    maxLoopNesting,
    isRecursive,
    recursionDepth: maxRecursionDepth,
    detectedStructures,
    peakHeapObjects,
    observedTimeHeuristic,
    observedSpaceHeuristic,
  };
}
