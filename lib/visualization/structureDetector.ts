/**
 * Prism Structure Detector
 *
 * Deterministic, heuristic-based detector that inspects a PrismFrame's heap
 * to identify data structure topologies:
 * 1. Singly Linked Lists
 * 2. Binary Search Trees / Binary Trees
 * 3. 1D Arrays
 *
 * CONTRACT:
 * - Input: a single PrismFrame (from trace.frames[currentStep])
 * - Output: DetectedStructure[] — what structures are present at this step
 * - NEVER executes Python, invokes AI, or mutates trace data
 * - Deterministic: same frame always produces same output
 */

import { PrismFrame, HeapObject, DetectedStructure, SerializedValue, ObjectReference } from "@/types/trace";

// Attribute names recognized for linked lists & trees
const NEXT_ATTRS = ["next", "nxt", "next_node", "nextNode"];
const LEFT_ATTRS = ["left", "left_child", "leftChild"];
const RIGHT_ATTRS = ["right", "right_child", "rightChild"];
const VALUE_ATTRS = ["val", "value", "data", "key", "item", "datum"];

// Variable names commonly representing root pointers
const LIST_HEAD_VARS = ["head", "start", "first", "sentinel"];
const TREE_ROOT_VARS = ["root", "tree", "bst", "t", "r"];
const ARRAY_NAMES = ["arr", "array", "nums", "numbers", "list", "items", "data", "sorted_arr", "elements", "values", "A", "B"];

// Minimum confidence threshold to report a detected structure
const MIN_CONFIDENCE = 0.6;

function isObjectRef(val: SerializedValue): val is ObjectReference {
  return (
    typeof val === "object" &&
    val !== null &&
    "__type__" in val &&
    (val as ObjectReference).__type__ === "object_ref"
  );
}

/**
 * Merges variables from all frames across the call stack and current scope.
 * Ensures data structures defined in caller or module frames (e.g. head, arr, root)
 * remain visible while execution steps into helper functions or constructors (__init__).
 */
export function getMergedScope(frame: PrismFrame): Record<string, SerializedValue> {
  const merged: Record<string, SerializedValue> = {};
  if (frame.callStack && frame.callStack.length > 0) {
    for (const stackFrame of frame.callStack) {
      const vars = stackFrame.localVariables || stackFrame.locals;
      if (vars) {
        Object.assign(merged, vars);
      }
    }
  }
  Object.assign(merged, frame.scope);
  return merged;
}

// ─── Binary Tree Candidate Detection ──────────────────────────────────────────

/**
 * A heap object qualifies as a binary tree node candidate if:
 * 1. It has left or right in references/fields
 * 2. It has a value field
 */
export function isBSTNodeCandidate(obj: HeapObject): boolean {
  const hasLeft =
    LEFT_ATTRS.some((attr) => attr in obj.references) ||
    LEFT_ATTRS.some((attr) => attr in obj.fields && obj.fields[attr] === null);

  const hasRight =
    RIGHT_ATTRS.some((attr) => attr in obj.references) ||
    RIGHT_ATTRS.some((attr) => attr in obj.fields && obj.fields[attr] === null);

  const hasValue = VALUE_ATTRS.some((attr) => attr in obj.fields);

  return (hasLeft || hasRight) && hasValue;
}

/**
 * A heap object qualifies as a linked list node candidate if:
 * 1. It is NOT a tree node (no left/right)
 * 2. It has a next reference/field
 * 3. It has a value field
 */
function isLinkedListNodeCandidate(obj: HeapObject): boolean {
  if (isBSTNodeCandidate(obj)) return false;

  const hasNextRef =
    NEXT_ATTRS.some((attr) => attr in obj.references) ||
    NEXT_ATTRS.some((attr) => attr in obj.fields);
  const isNamedNode = Boolean(
    obj.className && /node|listnode/i.test(obj.className) && !/tree|bst/i.test(obj.className)
  );
  const hasValueField = VALUE_ATTRS.some((attr) => attr in obj.fields);
  return (hasNextRef || isNamedNode) && hasValueField;
}

// ─── Linked List Helpers ──────────────────────────────────────────────────────

function followNextChain(
  startId: string,
  heap: Record<string, HeapObject>,
  maxNodes: number = 200
): { chain: string[]; isCircular: boolean } {
  const chain: string[] = [];
  const visited = new Set<string>();
  let currentId: string | null = startId;

  while (currentId && chain.length < maxNodes) {
    if (visited.has(currentId)) {
      return { chain, isCircular: true };
    }
    const obj: HeapObject | undefined = heap[currentId as string];
    if (!obj) break;
    visited.add(currentId);
    chain.push(currentId);

    let nextId: string | null = null;
    for (const attr of NEXT_ATTRS) {
      if (attr in obj.references) {
        nextId = obj.references[attr] ?? null;
        break;
      }
      if (attr in obj.fields && obj.fields[attr] === null) {
        nextId = null;
        break;
      }
    }
    currentId = nextId;
  }
  return { chain, isCircular: false };
}

function findLinkedListRoot(
  frame: PrismFrame,
  candidateIds: Set<string>
): string | undefined {
  const scope = getMergedScope(frame);
  for (const headVar of [...LIST_HEAD_VARS, "root", "node", "curr"]) {
    const scopeVal = scope[headVar];
    if (isObjectRef(scopeVal) && candidateIds.has(scopeVal.id)) {
      return scopeVal.id;
    }
  }
  const pointedTo = new Set<string>();
  for (const id of candidateIds) {
    const obj = frame.heap[id];
    if (!obj) continue;
    for (const attr of NEXT_ATTRS) {
      const ref = obj.references[attr];
      if (ref) pointedTo.add(ref);
    }
  }
  for (const id of candidateIds) {
    if (!pointedTo.has(id)) return id;
  }
  return candidateIds.values().next().value;
}

function detectLinkedLists(frame: PrismFrame): DetectedStructure[] {
  const heap = frame.heap;
  if (!heap || Object.keys(heap).length === 0) return [];

  const candidateIds = new Set<string>();
  for (const [id, obj] of Object.entries(heap)) {
    if (isLinkedListNodeCandidate(obj)) candidateIds.add(id);
  }
  if (candidateIds.size === 0) return [];

  const assignedToChain = new Set<string>();
  const chains: Array<{ rootId: string; chainIds: string[]; isCircular: boolean }> = [];

  const root = findLinkedListRoot(frame, candidateIds);
  if (!root) return [];

  const { chain, isCircular } = followNextChain(root, heap);
  const validChain = chain.filter((id) => candidateIds.has(id));
  for (const id of validChain) assignedToChain.add(id);
  if (validChain.length > 0) chains.push({ rootId: root, chainIds: validChain, isCircular });

  for (const id of candidateIds) {
    if (assignedToChain.has(id)) continue;
    const { chain: subChain, isCircular: subCircular } = followNextChain(id, heap);
    const validSub = subChain.filter((cid) => candidateIds.has(cid));
    if (validSub.length > 0) {
      for (const cid of validSub) assignedToChain.add(cid);
      chains.push({ rootId: id, chainIds: validSub, isCircular: subCircular });
    }
  }

  const scope = getMergedScope(frame);
  const results: DetectedStructure[] = [];
  for (const { rootId, chainIds, isCircular } of chains) {
    if (chainIds.length === 0) continue;
    let confidence = chainIds.length >= 2 ? 0.95 : 0.90;
    for (const headVar of LIST_HEAD_VARS) {
      const scopeVal = scope[headVar];
      if (isObjectRef(scopeVal) && scopeVal.id === rootId) {
        confidence = Math.min(1.0, confidence + 0.05);
        break;
      }
    }
    if (confidence < MIN_CONFIDENCE) continue;

    let variableName = "linkedList";
    for (const [varName, val] of Object.entries(scope)) {
      if (isObjectRef(val) && val.id === rootId) {
        variableName = varName;
        break;
      }
    }

    results.push({
      variableName,
      structureType: "singly_linked_list",
      rootHeapId: rootId,
      confidence,
    });
  }
  return results;
}

// ─── Binary Tree Detection ────────────────────────────────────────────────────

function findTreeRoot(
  frame: PrismFrame,
  candidateIds: Set<string>
): string | undefined {
  const scope = getMergedScope(frame);
  // Priority 1: Scope variables explicitly named root, tree, bst
  for (const rootVar of TREE_ROOT_VARS) {
    const scopeVal = scope[rootVar];
    if (isObjectRef(scopeVal) && candidateIds.has(scopeVal.id)) {
      return scopeVal.id;
    }
  }

  // Priority 2: In-degree zero analysis
  // Find a candidate node that is NOT referenced as any other candidate's left or right
  const pointedTo = new Set<string>();
  for (const id of candidateIds) {
    const obj = frame.heap[id];
    if (!obj) continue;
    for (const attr of [...LEFT_ATTRS, ...RIGHT_ATTRS]) {
      const ref = obj.references[attr];
      if (ref) pointedTo.add(ref);
    }
  }

  for (const id of candidateIds) {
    if (!pointedTo.has(id)) return id;
  }

  return candidateIds.values().next().value;
}

function traverseTreeNodes(
  rootId: string,
  heap: Record<string, HeapObject>,
  maxNodes: number = 200
): Set<string> {
  const visited = new Set<string>();
  const queue: string[] = [rootId];

  while (queue.length > 0 && visited.size < maxNodes) {
    const currId = queue.shift()!;
    if (visited.has(currId)) continue;
    visited.add(currId);

    const node = heap[currId];
    if (!node) continue;

    for (const attr of [...LEFT_ATTRS, ...RIGHT_ATTRS]) {
      const childId = node.references[attr];
      if (childId && !visited.has(childId) && heap[childId]) {
        queue.push(childId);
      }
    }
  }

  return visited;
}

function detectBinaryTrees(frame: PrismFrame): DetectedStructure[] {
  const heap = frame.heap;
  if (!heap || Object.keys(heap).length === 0) return [];

  const candidateIds = new Set<string>();
  for (const [id, obj] of Object.entries(heap)) {
    if (isBSTNodeCandidate(obj)) {
      candidateIds.add(id);
    }
  }
  if (candidateIds.size === 0) return [];

  const rootId = findTreeRoot(frame, candidateIds);
  if (!rootId) return [];

  const treeNodeIds = traverseTreeNodes(rootId, heap);
  if (treeNodeIds.size === 0) return [];

  const scope = getMergedScope(frame);
  let confidence = treeNodeIds.size >= 2 ? 0.95 : 0.90;
  for (const rootVar of TREE_ROOT_VARS) {
    const scopeVal = scope[rootVar];
    if (isObjectRef(scopeVal) && scopeVal.id === rootId) {
      confidence = Math.min(1.0, confidence + 0.04);
      break;
    }
  }

  let variableName = "root";
  for (const [varName, val] of Object.entries(scope)) {
    if (isObjectRef(val) && val.id === rootId) {
      variableName = varName;
      break;
    }
  }

  return [
    {
      variableName,
      structureType: "binary_tree",
      rootHeapId: rootId,
      confidence,
    },
  ];
}

// ─── 1D Array Detection ───────────────────────────────────────────────────────

function detectArrays(frame: PrismFrame): DetectedStructure[] {
  const results: DetectedStructure[] = [];
  const activeScope = getMergedScope(frame);

  for (const [varName, val] of Object.entries(activeScope)) {
    if (!Array.isArray(val)) continue;

    const allPrimitive = val.every(
      (el) =>
        typeof el === "number" ||
        typeof el === "string" ||
        typeof el === "boolean" ||
        el === null
    );
    if (!allPrimitive) continue;

    let confidence = 0.80;
    if (val.length >= 2) confidence = 0.85;
    else if (val.length === 1) confidence = 0.75;
    else confidence = 0.70;

    if (ARRAY_NAMES.includes(varName.toLowerCase())) {
      confidence = Math.min(0.88, confidence + 0.02);
    }

    results.push({
      variableName: varName,
      structureType: "1d_array",
      confidence,
    });
  }
  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function detectStructures(frame: PrismFrame): DetectedStructure[] {
  if (!frame) return [];
  const linkedLists = detectLinkedLists(frame);
  const binaryTrees = detectBinaryTrees(frame);
  const arrays = detectArrays(frame);

  const nonArrayVars = new Set([
    ...linkedLists.map((s) => s.variableName),
    ...binaryTrees.map((s) => s.variableName),
  ]);
  const filteredArrays = arrays.filter((a) => !nonArrayVars.has(a.variableName));

  // Deterministic priority ordering:
  // 1. Singly Linked List (confidence 0.90..1.0)
  // 2. Binary Tree (confidence 0.90..0.99)
  // 3. 1D Array (confidence 0.70..0.88)
  return [...linkedLists, ...binaryTrees, ...filteredArrays].sort(
    (a, b) => b.confidence - a.confidence
  );
}

export function getScopePointersToHeapId(frame: PrismFrame, heapId: string): string[] {
  const names: string[] = [];
  const scope = getMergedScope(frame);
  for (const [varName, val] of Object.entries(scope)) {
    if (isObjectRef(val) && val.id === heapId) {
      if (!names.includes(varName)) names.push(varName);
    }
  }
  return names;
}

export function getLinkedListChain(
  rootHeapId: string,
  heap: Record<string, HeapObject>
): { chain: string[]; isCircular: boolean } {
  return followNextChain(rootHeapId, heap);
}

export function getNodeDisplayValue(obj: HeapObject): string {
  for (const attr of VALUE_ATTRS) {
    if (attr in obj.fields) {
      const v = obj.fields[attr];
      return v === null ? "null" : String(v);
    }
  }
  return obj.className ?? "?";
}
