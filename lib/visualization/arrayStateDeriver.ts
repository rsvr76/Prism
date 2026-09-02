/**
 * Prism Array State Deriver
 *
 * Deterministically derives visual array elements, element states
 * (comparing, swapping, pivot, sorted, active, normal), pointers,
 * and subarray boundaries from an immutable PrismFrame.
 *
 * CONTRACT:
 * - Pure function of (frame, prevFrame, variableName).
 * - Never mutates trace.
 * - Never executes code or calls AI.
 * - Same frame(s) produce identical output.
 */

import { PrismFrame, SerializedValue } from "@/types/trace";

export type ArrayElementVisualState =
  | "normal"
  | "comparing"
  | "swapping"
  | "pivot"
  | "sorted"
  | "active";

export interface VisualArrayElement {
  index: number;
  value: number | string | boolean | null;
  state: ArrayElementVisualState;
  pointerLabels: string[];
  heightPercent: number;
}

export interface ArrayBoundary {
  name: string;
  leftIndex: number;
  rightIndex: number;
}

export interface DerivedArrayState {
  variableName: string;
  elements: VisualArrayElement[];
  boundaries: ArrayBoundary[];
  hasNumericValues: boolean;
  minValue: number;
  maxValue: number;
  operationDescription?: string;
  isSorted: boolean;
}

// Variables often used as pivot values or indices
const PIVOT_VARS = ["pivot", "pivot_idx", "pivot_index", "p_idx", "p"];

// Variables often used as index boundaries
const BOUNDARY_PAIRS: Array<[string, string, string]> = [
  ["low", "high", "Partition"],
  ["left", "right", "Window"],
  ["start", "end", "Slice"],
  ["l", "r", "Range"],
];

/**
 * Extract array elements from a frame's scope or active stack frame.
 */
function extractRawArray(frame: PrismFrame, variableName: string): SerializedValue[] | null {
  // Check scope
  if (frame.scope && variableName in frame.scope) {
    const val = frame.scope[variableName];
    if (Array.isArray(val)) return val;
  }

  // Check top stack frame local variables
  if (frame.callStack && frame.callStack.length > 0) {
    const topStack = frame.callStack[frame.callStack.length - 1];
    if (topStack.localVariables && variableName in topStack.localVariables) {
      const val = topStack.localVariables[variableName];
      if (Array.isArray(val)) return val;
    }
  }

  return null;
}

/**
 * Extract all numeric variables from scope and top stack frame that point to valid array indices.
 */
function extractIndexPointers(
  frame: PrismFrame,
  arrayLength: number
): Map<number, string[]> {
  const indexMap = new Map<number, string[]>();
  if (arrayLength === 0) return indexMap;

  const combinedVars: Record<string, SerializedValue> = { ...frame.scope };
  if (frame.callStack && frame.callStack.length > 0) {
    const topStack = frame.callStack[frame.callStack.length - 1];
    if (topStack.localVariables) {
      Object.assign(combinedVars, topStack.localVariables);
    }
  }

  // Also check activePointers on frame
  if (frame.activePointers) {
    for (const ptr of frame.activePointers) {
      if (ptr.targetArrayIndex !== undefined && ptr.targetArrayIndex >= 0 && ptr.targetArrayIndex < arrayLength) {
        const existing = indexMap.get(ptr.targetArrayIndex) || [];
        if (!existing.includes(ptr.name)) existing.push(ptr.name);
        indexMap.set(ptr.targetArrayIndex, existing);
      }
    }
  }

  for (const [varName, val] of Object.entries(combinedVars)) {
    // Only consider integer variables as potential index pointers
    if (typeof val === "number" && Number.isInteger(val)) {
      if (val >= 0 && val < arrayLength) {
        // Exclude variables that are clearly values or lengths
        if (varName.toLowerCase() === "len" || varName.toLowerCase() === "n" || varName.toLowerCase() === "total" || varName.toLowerCase() === "sum") {
          continue;
        }
        const existing = indexMap.get(val) || [];
        if (!existing.includes(varName)) {
          existing.push(varName);
        }
        indexMap.set(val, existing);
      }
    }
  }

  return indexMap;
}

/**
 * Check if the raw array is sorted in ascending order.
 */
function checkIsSorted(arr: SerializedValue[]): boolean {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i];
    const b = arr[i + 1];
    if (typeof a === "number" && typeof b === "number") {
      if (a > b) return false;
    } else if (typeof a === "string" && typeof b === "string") {
      if (a.localeCompare(b) > 0) return false;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Derive the full array visualization state from a frame and optional previous frame.
 */
export function deriveArrayState(
  frame: PrismFrame | null,
  prevFrame: PrismFrame | null,
  variableName: string
): DerivedArrayState | null {
  if (!frame) return null;

  const rawArray = extractRawArray(frame, variableName);
  if (rawArray === null) return null;

  const prevArray = prevFrame ? extractRawArray(prevFrame, variableName) : null;

  // 1. Numerical analysis for bar heights
  const numericValues = rawArray.filter((v): v is number => typeof v === "number");
  const hasNumericValues = numericValues.length === rawArray.length && rawArray.length > 0;

  const minValue = hasNumericValues ? Math.min(...numericValues) : 0;
  const maxValue = hasNumericValues ? Math.max(...numericValues) : 1;
  const range = maxValue - minValue || 1;

  // 2. Index pointers mapping (e.g. index 2 -> ["j", "j+1"])
  const indexPointers = extractIndexPointers(frame, rawArray.length);

  // 3. Find pivot indices
  const pivotIndices = new Set<number>();
  for (const pVar of PIVOT_VARS) {
    const pVal = frame.scope[pVar];
    if (typeof pVal === "number") {
      // Is it an index?
      if (Number.isInteger(pVal) && pVal >= 0 && pVal < rawArray.length) {
        pivotIndices.add(pVal);
      }
      // Or is it a value matching an element?
      if (hasNumericValues) {
        rawArray.forEach((el, idx) => {
          if (el === pVal && indexPointers.has(idx)) {
            pivotIndices.add(idx);
          }
        });
      }
    }
  }

  // 4. Detect swapped indices between prevFrame and current frame
  const swappedIndices = new Set<number>();
  if (prevArray && prevArray.length === rawArray.length) {
    const changedIndices: number[] = [];
    for (let idx = 0; idx < rawArray.length; idx++) {
      if (rawArray[idx] !== prevArray[idx]) {
        changedIndices.push(idx);
      }
    }
    if (changedIndices.length === 2) {
      // Swap detected!
      swappedIndices.add(changedIndices[0]);
      swappedIndices.add(changedIndices[1]);
    }
  }

  // 5. Detect comparing indices (e.g., active loop pointers j and j+1)
  const comparingIndices = new Set<number>();
  if (frame.scope.j !== undefined && typeof frame.scope.j === "number") {
    const j = frame.scope.j;
    if (j >= 0 && j < rawArray.length) {
      comparingIndices.add(j);
      if (j + 1 < rawArray.length) {
        comparingIndices.add(j + 1);
      }
    }
  }

  // 6. Check sorted state
  const isSorted = checkIsSorted(rawArray);

  // 7. Assemble visual elements
  const elements: VisualArrayElement[] = rawArray.map((val, index) => {
    const pointerLabels = indexPointers.get(index) || [];

    // Calculate height percentage (normalized to [15%..100%] so 0/negative values are visible)
    let heightPercent = 50;
    if (hasNumericValues) {
      const normalized = ( (val as number) - minValue) / range;
      heightPercent = Math.round(15 + normalized * 85);
    }

    // Determine state priority:
    // 1. Swapping
    // 2. Pivot
    // 3. Comparing
    // 4. Active pointer
    // 5. Sorted (if whole array is sorted)
    // 6. Normal
    let state: ArrayElementVisualState = "normal";

    if (swappedIndices.has(index)) {
      state = "swapping";
    } else if (pivotIndices.has(index)) {
      state = "pivot";
    } else if (comparingIndices.has(index)) {
      state = "comparing";
    } else if (pointerLabels.length > 0) {
      state = "active";
    } else if (isSorted && rawArray.length > 1) {
      state = "sorted";
    }

    return {
      index,
      value: (typeof val === "number" || typeof val === "string" || typeof val === "boolean" || val === null)
        ? val
        : String(val),
      state,
      pointerLabels,
      heightPercent,
    };
  });

  // 8. Extract Boundaries (e.g. low/high, left/right)
  const boundaries: ArrayBoundary[] = [];
  for (const [leftKey, rightKey, label] of BOUNDARY_PAIRS) {
    const leftVal = frame.scope[leftKey];
    const rightVal = frame.scope[rightKey];

    if (
      typeof leftVal === "number" &&
      typeof rightVal === "number" &&
      Number.isInteger(leftVal) &&
      Number.isInteger(rightVal) &&
      leftVal >= 0 &&
      rightVal < rawArray.length &&
      leftVal <= rightVal
    ) {
      boundaries.push({
        name: `${label} [${leftVal}..${rightVal}]`,
        leftIndex: leftVal,
        rightIndex: rightVal,
      });
      break; // Single primary boundary pair is usually sufficient
    }
  }

  // 9. Operation description text
  let operationDescription: string | undefined = undefined;
  if (swappedIndices.size === 2) {
    const [a, b] = Array.from(swappedIndices);
    operationDescription = `Swapped ${variableName}[${a}] (${prevArray?.[a]}) ↔ ${variableName}[${b}] (${prevArray?.[b]})`;
  } else if (comparingIndices.size === 2) {
    const [a, b] = Array.from(comparingIndices);
    operationDescription = `Comparing ${variableName}[${a}] (${rawArray[a]}) vs ${variableName}[${b}] (${rawArray[b]})`;
  } else if (pivotIndices.size > 0) {
    const p = Array.from(pivotIndices)[0];
    operationDescription = `Pivot set at ${variableName}[${p}] (${rawArray[p]})`;
  }

  return {
    variableName,
    elements,
    boundaries,
    hasNumericValues,
    minValue,
    maxValue,
    operationDescription,
    isSorted,
  };
}
