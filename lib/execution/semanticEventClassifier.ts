/**
 * Prism Semantic Execution Event Classifier
 *
 * Ground-truth, deterministic classifier that analyzes consecutive PrismFrame
 * states alongside the executed line to categorize execution steps.
 *
 * PRINCIPLES:
 * 1. REAL EXECUTION = SOURCE OF TRUTH (Derives purely from immutable trace diffs).
 * 2. Conservative: If evidence is ambiguous, defaults to 'no-visible-state-change'. Never guesses.
 * 3. Never re-executes user code.
 * 4. Never calls an LLM.
 * 5. Structural vs Non-Structural: Separates events that modify DSA topology
 *    from semantic micro-events (definitions, scalar updates, prints, returns).
 */

import { PrismFrame, PrismTrace, DetectedStructure, SerializedValue, ObjectReference } from "@/types/trace";
import { detectStructures, getMergedScope } from "@/lib/visualization/structureDetector";

export type SemanticEventCategory =
  | "definition"
  | "function-enter"
  | "function-return"
  | "object-created"
  | "pointer-updated"
  | "value-updated"
  | "collection-updated"
  | "comparison"
  | "swap"
  | "iteration"
  | "branch"
  | "output"
  | "error"
  | "no-visible-state-change";

export interface SemanticExecutionEvent {
  stepIndex: number;
  line: number;
  codeSnippet: string;
  category: SemanticEventCategory;
  badgeLabel: string;
  summary: string;
  isStructural: boolean;
  affectedVariables: string[];
}

function isObjectRef(val: SerializedValue | undefined): val is ObjectReference {
  return (
    typeof val === "object" &&
    val !== null &&
    "__type__" in val &&
    (val as ObjectReference).__type__ === "object_ref"
  );
}

function formatVal(v: SerializedValue | undefined): string {
  if (v === undefined) return "undefined";
  if (v === null) return "None";
  if (isObjectRef(v)) return v.className || v.repr || "Object";
  if (Array.isArray(v)) {
    if (v.length > 5) return `[${v.slice(0, 5).join(", ")}, …] (${v.length} items)`;
    return `[${v.join(", ")}]`;
  }
  if (typeof v === "object") return "{…}";
  return String(v);
}

/**
 * Classifies a single execution step by diffing frame against prevFrame.
 * Deterministic and conservative.
 */
export function classifySemanticEvent(
  frame: PrismFrame,
  prevFrame: PrismFrame | null,
  sourceCode?: string
): SemanticExecutionEvent {
  const line = frame.line;
  const stepIndex = frame.stepIndex;

  // Extract source line if provided
  let codeSnippet = "";
  if (sourceCode) {
    const lines = sourceCode.split(/\r?\n/);
    if (line >= 1 && line <= lines.length) {
      codeSnippet = lines[line - 1].trim();
    }
  }

  // 1. Exception / Error
  if (frame.exception) {
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "error",
      badgeLabel: "Exception",
      summary: `${frame.exception.type}: ${frame.exception.message}`,
      isStructural: false,
      affectedVariables: [],
    };
  }

  // 2. Class & Function Definitions (Keyword check + scope inspection)
  if (codeSnippet.startsWith("class ")) {
    const className = codeSnippet.replace(/^class\s+([A-Za-z0-9_]+).*/, "$1");
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "definition",
      badgeLabel: "Class Defined",
      summary: `Defined class ${className}`,
      isStructural: false,
      affectedVariables: [className],
    };
  }

  if (codeSnippet.startsWith("def ")) {
    const fnName = codeSnippet.replace(/^def\s+([A-Za-z0-9_]+).*/, "$1");
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "definition",
      badgeLabel: "Function Defined",
      summary: `Defined function ${fnName}()`,
      isStructural: false,
      affectedVariables: [fnName],
    };
  }

  // 3. Stdout Output Generation
  if (prevFrame && frame.stdout && prevFrame.stdout && frame.stdout.length > prevFrame.stdout.length) {
    const newOutputs = frame.stdout.slice(prevFrame.stdout.length);
    const lastOutput = newOutputs[newOutputs.length - 1] ?? "";
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "output",
      badgeLabel: "Output Produced",
      summary: `Printed: "${lastOutput.trim().slice(0, 60)}"`,
      isStructural: false,
      affectedVariables: [],
    };
  }

  // 4. Function Call Entry
  const prevStackLen = prevFrame?.callStack?.length ?? 0;
  const currStackLen = frame.callStack?.length ?? 0;
  if ((prevFrame && currStackLen > prevStackLen) || frame.eventType === "call") {
    const topFrame = frame.callStack?.[frame.callStack.length - 1];
    const fnName = topFrame?.functionName || "function";
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "function-enter",
      badgeLabel: "Function Entered",
      summary: `Entered ${fnName}()`,
      isStructural: false,
      affectedVariables: [],
    };
  }

  // 5. Function Return
  if ((prevFrame && currStackLen < prevStackLen) || frame.eventType === "return") {
    const returnedFrom = prevFrame?.callStack?.[prevFrame.callStack.length - 1]?.functionName || "function";
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "function-return",
      badgeLabel: "Function Returned",
      summary: `Returned from ${returnedFrom}()`,
      isStructural: false,
      affectedVariables: [],
    };
  }

  // 6. Heap Diff: Object Creation or Mutation
  if (prevFrame) {
    const prevHeap = prevFrame.heap || {};
    const currHeap = frame.heap || {};
    const prevHeapKeys = Object.keys(prevHeap);
    const currHeapKeys = Object.keys(currHeap);

    // 6a. New object allocated on heap
    const newHeapIds = currHeapKeys.filter((id) => !prevHeap[id]);
    if (newHeapIds.length > 0) {
      const createdObj = currHeap[newHeapIds[0]];
      const isDsaNode = /node|tree|list/i.test(createdObj.className);
      return {
        stepIndex,
        line,
        codeSnippet,
        category: "object-created",
        badgeLabel: isDsaNode ? "Node Instantiated" : "Object Created",
        summary: `Created ${createdObj.className} in memory`,
        isStructural: isDsaNode,
        affectedVariables: [createdObj.id],
      };
    }

    // 6b. Pointer/Reference updated on an existing heap object
    for (const id of currHeapKeys) {
      const oldObj = prevHeap[id];
      const newObj = currHeap[id];
      if (!oldObj || !newObj) continue;

      const oldRefs = oldObj.references || {};
      const newRefs = newObj.references || {};

      for (const [refName, targetId] of Object.entries(newRefs)) {
        if (oldRefs[refName] !== targetId) {
          const targetObj = currHeap[targetId];
          const targetLabel = targetObj ? `${targetObj.className}(${targetId})` : targetId;
          return {
            stepIndex,
            line,
            codeSnippet,
            category: "pointer-updated",
            badgeLabel: "Pointer Linked",
            summary: `Updated .${refName} → ${targetLabel}`,
            isStructural: true,
            affectedVariables: [id, targetId],
          };
        }
      }

      // Check for severed pointer (reference was present in old, now gone or None)
      for (const [refName] of Object.entries(oldRefs)) {
        if (!(refName in newRefs)) {
          return {
            stepIndex,
            line,
            codeSnippet,
            category: "pointer-updated",
            badgeLabel: "Pointer Cleared",
            summary: `Cleared .${refName} → None`,
            isStructural: true,
            affectedVariables: [id],
          };
        }
      }

      // 6c. Primitive field updated on a heap object (e.g. self.val = val)
      const oldFields = oldObj.fields || {};
      const newFields = newObj.fields || {};
      for (const [fieldName, newVal] of Object.entries(newFields)) {
        const oldVal = oldFields[fieldName];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          return {
            stepIndex,
            line,
            codeSnippet,
            category: "value-updated",
            badgeLabel: "Field Updated",
            summary: `Set .${fieldName} = ${formatVal(newVal)}`,
            isStructural: false,
            affectedVariables: [fieldName],
          };
        }
      }
    }
  }

  // 7. Scope Diff: Variables Added or Modified
  if (prevFrame) {
    const prevScope = getMergedScope(prevFrame);
    const currScope = getMergedScope(frame);

    // Identify changed or newly added variables
    for (const [varName, curVal] of Object.entries(currScope)) {
      if (varName.startsWith("__")) continue; // Skip Python dunder internals
      const oldVal = prevScope[varName];

      if (JSON.stringify(oldVal) !== JSON.stringify(curVal)) {
        // Variable pointing to a heap object (e.g. curr = head, curr = curr.next)
        if (isObjectRef(curVal)) {
          const isPointerUpdate = /head|curr|tail|prev|next|slow|fast|root|node|left|right/i.test(varName);
          return {
            stepIndex,
            line,
            codeSnippet,
            category: "pointer-updated",
            badgeLabel: isPointerUpdate ? "Pointer Shifted" : "Reference Assigned",
            summary: `${varName} → ${curVal.className || "Node"}`,
            isStructural: isPointerUpdate,
            affectedVariables: [varName],
          };
        }

        // Array / List assignment or mutation
        if (Array.isArray(curVal)) {
          const wasArray = Array.isArray(oldVal);
          const isSameLength = wasArray && (oldVal as unknown[]).length === curVal.length;

          // Check if this looks like a swap (same elements, two positions swapped)
          if (wasArray && isSameLength) {
            let diffCount = 0;
            for (let i = 0; i < curVal.length; i++) {
              if (curVal[i] !== (oldVal as unknown[])[i]) diffCount++;
            }
            if (diffCount === 2) {
              return {
                stepIndex,
                line,
                codeSnippet,
                category: "swap",
                badgeLabel: "Array Swap",
                summary: `Swapped elements in ${varName}`,
                isStructural: true,
                affectedVariables: [varName],
              };
            }
          }

          return {
            stepIndex,
            line,
            codeSnippet,
            category: "collection-updated",
            badgeLabel: "Array Updated",
            summary: `${varName} updated to ${formatVal(curVal)}`,
            isStructural: true,
            affectedVariables: [varName],
          };
        }

        // Scalar variable updated (e.g. total += curr.val, i += 1)
        return {
          stepIndex,
          line,
          codeSnippet,
          category: "value-updated",
          badgeLabel: "Variable Updated",
          summary: `${varName} = ${formatVal(curVal)}`,
          isStructural: false,
          affectedVariables: [varName],
        };
      }
    }
  }

  // 8. Control Flow / Iteration (when line is a loop header or branch)
  if (codeSnippet.startsWith("for ") || codeSnippet.startsWith("while ")) {
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "iteration",
      badgeLabel: "Loop Condition",
      summary: `Evaluating loop: ${codeSnippet.slice(0, 45)}`,
      isStructural: false,
      affectedVariables: [],
    };
  }

  if (codeSnippet.startsWith("if ") || codeSnippet.startsWith("elif ") || codeSnippet.startsWith("else:")) {
    return {
      stepIndex,
      line,
      codeSnippet,
      category: "branch",
      badgeLabel: "Branch Evaluated",
      summary: `Branch condition: ${codeSnippet.slice(0, 45)}`,
      isStructural: false,
      affectedVariables: [],
    };
  }

  // 9. Conservative Default: If trace evidence does not conclusively show mutation
  return {
    stepIndex,
    line,
    codeSnippet,
    category: "no-visible-state-change",
    badgeLabel: "Executed Line",
    summary: codeSnippet ? `Executed: ${codeSnippet.slice(0, 50)}` : `Execution step ${stepIndex + 1}`,
    isStructural: false,
    affectedVariables: [],
  };
}

/**
 * Resolves the effective structural state that must remain rendered for a given step.
 *
 * CRITICAL INVARIANT:
 * For step K, scans backwards (K, K-1, ..., 0) to find the latest step that had
 * a valid detected DSA structure.
 *
 * Returns:
 * - structuralStep: the step number whose structural snapshot should be rendered
 * - structure: the detected structure definition
 * - frame: the frame containing the latest structural snapshot
 * - isDirectMatch: true if current step K directly has the structure
 *
 * Returns null ONLY if no structure has EVER been instantiated anywhere up to step K.
 */
export interface EffectiveStructuralState {
  structuralStep: number;
  structure: DetectedStructure;
  structuralFrame: PrismFrame;
  isDirectMatch: boolean;
}

export function resolveEffectiveStructuralState(
  trace: PrismTrace | null,
  currentStep: number
): EffectiveStructuralState | null {
  if (!trace || !trace.frames || trace.frames.length === 0) return null;
  if (currentStep < 0 || currentStep >= trace.frames.length) return null;

  // Scan backwards from currentStep down to 0
  for (let s = currentStep; s >= 0; s--) {
    const pastFrame = trace.frames[s];
    if (!pastFrame) continue;

    const detected = detectStructures(pastFrame);
    if (detected.length === 0) continue;

    const candidate = detected[0];

    // For linked list or binary tree, ensure its root object exists in heap
    if (
      candidate.structureType === "singly_linked_list" ||
      candidate.structureType === "binary_tree"
    ) {
      const curFrame = trace.frames[currentStep];
      const rootExists =
        (candidate.rootHeapId && curFrame.heap && curFrame.heap[candidate.rootHeapId]) ||
        (candidate.rootHeapId && pastFrame.heap && pastFrame.heap[candidate.rootHeapId]);

      if (rootExists) {
        return {
          structuralStep: s,
          structure: candidate,
          structuralFrame: pastFrame,
          isDirectMatch: s === currentStep,
        };
      }
    } else if (candidate.structureType === "1d_array") {
      // For array, ensure the array variable exists
      const curFrame = trace.frames[currentStep];
      const curScope = getMergedScope(curFrame);
      const pastScope = getMergedScope(pastFrame);
      const arrayExists = Array.isArray(curScope[candidate.variableName]) || Array.isArray(pastScope[candidate.variableName]);

      if (arrayExists) {
        return {
          structuralStep: s,
          structure: candidate,
          structuralFrame: pastFrame,
          isDirectMatch: s === currentStep,
        };
      }
    }
  }

  return null;
}
