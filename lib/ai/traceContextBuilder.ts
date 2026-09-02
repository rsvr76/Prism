/**
 * Prism Trace Context Builder
 *
 * Deterministically constructs a bounded, factual AI context by diffing
 * current and previous execution frames from an immutable PrismTrace.
 *
 * CONTRACT:
 * - Pure function of (trace, currentStep)
 * - Never executes Python or calls the LLM
 * - Never mutates trace
 * - Deterministic output with explicit safety bounds
 */

import { PrismFrame, PrismTrace, SerializedValue, HeapObject } from "@/types/trace";
import { BoundedTraceContext, StateDiff } from "@/types/ai";
import { detectStructures } from "@/lib/visualization/structureDetector";

// ─── Safety Bounds ────────────────────────────────────────────────────────────

const MAX_VARIABLES = 20;
const MAX_HEAP_OBJECTS = 15;
const MAX_FIELDS_PER_OBJECT = 10;
const MAX_STDOUT_LINES = 10;
const MAX_STRING_LENGTH = 150;

/**
 * Truncate strings to a deterministic limit.
 */
function truncateString(str: string, maxLen: number = MAX_STRING_LENGTH): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

/**
 * Serialize a single value into a clean, human-readable string representation.
 */
function serializeValueToString(val: SerializedValue | undefined): string {
  if (val === undefined) return "undefined";
  if (val === null) return "None";
  if (typeof val === "object") {
    if ("__type__" in val && val.__type__ === "object_ref") {
      return `${val.className}(id=${val.id})`;
    }
    return truncateString(JSON.stringify(val));
  }
  return truncateString(String(val));
}

/**
 * Calculate the exact state transition between previous and current frames.
 */
export function calculateStateDiff(
  currentFrame: PrismFrame,
  prevFrame: PrismFrame | null
): StateDiff {
  const diff: StateDiff = {
    variablesAdded: [],
    variablesRemoved: [],
    variablesChanged: [],
    pointersMoved: [],
    heapObjectsCreated: [],
    heapFieldsChanged: [],
    heapReferencesChanged: [],
    stdoutAdded: [],
    exceptionOccurred: currentFrame.eventType === "exception" || !!currentFrame.exception,
  };

  const currScope = currentFrame.scope || {};
  const prevScope = prevFrame?.scope || {};

  // 1. Variable Additions & Changes
  for (const [varName, currVal] of Object.entries(currScope)) {
    const currStr = serializeValueToString(currVal);
    if (!(varName in prevScope)) {
      diff.variablesAdded.push({ name: varName, value: currStr });
    } else {
      const prevStr = serializeValueToString(prevScope[varName]);
      if (currStr !== prevStr) {
        diff.variablesChanged.push({ name: varName, from: prevStr, to: currStr });
      }
    }
  }

  // 2. Variable Removals
  for (const [varName, prevVal] of Object.entries(prevScope)) {
    if (!(varName in currScope)) {
      diff.variablesRemoved.push({
        name: varName,
        previousValue: serializeValueToString(prevVal),
      });
    }
  }

  // 3. Pointer Movements (integer index pointers or heap pointers)
  for (const [varName, currVal] of Object.entries(currScope)) {
    const prevVal = prevScope[varName];
    const currIsInt = typeof currVal === "number" && Number.isInteger(currVal);
    const prevIsInt = typeof prevVal === "number" && Number.isInteger(prevVal);

    if (currIsInt && prevIsInt && currVal !== prevVal) {
      diff.pointersMoved.push({
        name: varName,
        from: `[${prevVal}]`,
        to: `[${currVal}]`,
      });
    } else if (
      typeof currVal === "object" &&
      currVal !== null &&
      "__type__" in currVal &&
      typeof prevVal === "object" &&
      prevVal !== null &&
      "__type__" in prevVal
    ) {
      if (currVal.id !== prevVal.id) {
        diff.pointersMoved.push({
          name: varName,
          from: `${prevVal.className}(${prevVal.id})`,
          to: `${currVal.className}(${currVal.id})`,
        });
      }
    }
  }

  // 4. Heap Objects & Reference Mutations
  const currHeap = currentFrame.heap || {};
  const prevHeap = prevFrame?.heap || {};

  for (const [objId, currObj] of Object.entries(currHeap)) {
    if (!(objId in prevHeap)) {
      diff.heapObjectsCreated.push(`${currObj.className || "Object"}(${objId})`);
    } else {
      const prevObj = prevHeap[objId];
      // Check field mutations
      for (const [fieldName, fieldVal] of Object.entries(currObj.fields || {})) {
        const currFieldStr = serializeValueToString(fieldVal);
        const prevFieldStr = serializeValueToString(prevObj.fields?.[fieldName]);
        if (currFieldStr !== prevFieldStr) {
          diff.heapFieldsChanged.push({
            objectId: objId,
            field: fieldName,
            from: prevFieldStr,
            to: currFieldStr,
          });
        }
      }
      // Check reference/pointer mutations (e.g. .next, .left, .right)
      for (const [refName, refTargetId] of Object.entries(currObj.references || {})) {
        const prevRefTarget = prevObj.references?.[refName] || "None";
        const currRefTarget = refTargetId || "None";
        if (currRefTarget !== prevRefTarget) {
          diff.heapReferencesChanged.push({
            objectId: objId,
            pointer: refName,
            from: prevRefTarget,
            to: currRefTarget,
          });
        }
      }
    }
  }

  // 5. Stdout added
  const currStdout = currentFrame.stdout || [];
  const prevStdoutLen = prevFrame?.stdout?.length || 0;
  if (currStdout.length > prevStdoutLen) {
    diff.stdoutAdded = currStdout.slice(prevStdoutLen);
  }

  return diff;
}

/**
 * Extract active line source code from complete source string.
 */
function extractLineCode(code: string, line: number): string | undefined {
  if (!code || line <= 0) return undefined;
  const lines = code.split("\n");
  if (line <= lines.length) {
    return lines[line - 1].trim();
  }
  return undefined;
}

/**
 * Build the bounded, factual context for an execution step.
 */
export function buildBoundedTraceContext(
  trace: PrismTrace,
  stepIndex: number
): BoundedTraceContext | null {
  if (!trace || !trace.frames || trace.frames.length === 0) return null;
  if (stepIndex < 0 || stepIndex >= trace.frames.length) return null;

  const currentFrame = trace.frames[stepIndex];
  const prevFrame = stepIndex > 0 ? trace.frames[stepIndex - 1] : null;

  let isTruncated = false;
  const truncationReasons: string[] = [];

  // 1. Current Scope (bounded)
  const currentScope: Record<string, string> = {};
  const scopeEntries = Object.entries(currentFrame.scope || {});
  if (scopeEntries.length > MAX_VARIABLES) {
    isTruncated = true;
    truncationReasons.push(`Scope variables capped at ${MAX_VARIABLES}`);
  }
  for (const [k, v] of scopeEntries.slice(0, MAX_VARIABLES)) {
    currentScope[k] = serializeValueToString(v);
  }

  // 2. Previous Scope (bounded)
  let previousScope: Record<string, string> | undefined = undefined;
  if (prevFrame) {
    previousScope = {};
    for (const [k, v] of Object.entries(prevFrame.scope || {}).slice(0, MAX_VARIABLES)) {
      previousScope[k] = serializeValueToString(v);
    }
  }

  // 3. State Diff
  const diff = calculateStateDiff(currentFrame, prevFrame);

  // 4. Heap Summary (bounded)
  const heapSummary: string[] = [];
  const heapEntries = Object.entries(currentFrame.heap || {});
  if (heapEntries.length > MAX_HEAP_OBJECTS) {
    isTruncated = true;
    truncationReasons.push(`Heap objects capped at ${MAX_HEAP_OBJECTS}`);
  }
  for (const [objId, obj] of heapEntries.slice(0, MAX_HEAP_OBJECTS)) {
    const fieldsStr = Object.entries(obj.fields || {})
      .slice(0, MAX_FIELDS_PER_OBJECT)
      .map(([f, val]) => `${f}=${serializeValueToString(val)}`)
      .join(", ");
    const refsStr = Object.entries(obj.references || {})
      .map(([r, target]) => `.${r}→${target || "None"}`)
      .join(", ");
    const parts = [fieldsStr, refsStr].filter(Boolean).join(" | ");
    heapSummary.push(`${obj.className || "Object"}(${objId}): { ${parts} }`);
  }

  // 5. Active Pointers
  const activePointers: string[] = [];
  for (const [varName, val] of Object.entries(currentFrame.scope || {})) {
    if (typeof val === "number" && Number.isInteger(val)) {
      activePointers.push(`${varName}=[${val}]`);
    } else if (typeof val === "object" && val !== null && "__type__" in val) {
      activePointers.push(`${varName}→${val.className}(${val.id})`);
    }
  }

  // 6. Stdout (bounded)
  const stdout = (currentFrame.stdout || []).slice(-MAX_STDOUT_LINES);

  // 7. Detected structure type
  const structures = detectStructures(currentFrame);
  const detectedStructureType = structures[0]?.structureType;

  // 8. Active source code line
  const activeLineSource = extractLineCode(trace.code, currentFrame.line);

  // 9. Call stack info
  const callStackDepth = currentFrame.callStack?.length || 1;
  const callStackTop = currentFrame.callStack?.[currentFrame.callStack.length - 1]?.functionName || "<module>";

  return {
    stepIndex,
    line: currentFrame.line,
    eventType: currentFrame.eventType,
    description: currentFrame.description || `Line ${currentFrame.line}`,
    activeLineSource,
    currentScope,
    previousScope,
    diff,
    callStackDepth,
    callStackTop,
    heapSummary: heapSummary.length > 0 ? heapSummary : undefined,
    activePointers,
    stdout: stdout.length > 0 ? stdout : undefined,
    newStdout: diff.stdoutAdded.length > 0 ? diff.stdoutAdded : undefined,
    exception: currentFrame.exception || null,
    detectedStructureType,
    isTruncated,
    truncationReason: isTruncated ? truncationReasons.join("; ") : undefined,
  };
}
