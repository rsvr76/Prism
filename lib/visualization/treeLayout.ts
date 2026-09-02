/**
 * Prism Deterministic Tree Layout Calculator
 *
 * Computes deterministic 2D canvas coordinates (x, y) for binary tree nodes.
 * Uses an in-order planar embedding guarantee:
 * - In-order traversal assigns monotonically increasing x-coordinates
 * - Depth assigns y-coordinates
 * - Guarantees zero overlapping nodes and zero edge collisions for binary search trees
 * - Visited set prevents infinite recursion on cyclic or malformed trees
 */

import { HeapObject } from "@/types/trace";

export interface TreeNodePosition {
  x: number;
  y: number;
}

export interface TreeLayoutResult {
  positions: Record<string, TreeNodePosition>;
  width: number;
  height: number;
  nodeCount: number;
}

const LEFT_ATTRS = ["left", "left_child", "leftChild"];
const RIGHT_ATTRS = ["right", "right_child", "rightChild"];

const HORIZONTAL_SPACING = 85;
const VERTICAL_SPACING = 80;
const PADDING_X = 50;
const PADDING_Y = 50;

/**
 * Extract child heap ID from a node given attribute candidates.
 */
export function getTreeChildId(node: HeapObject, attrs: string[]): string | null {
  for (const attr of attrs) {
    if (attr in node.references && node.references[attr]) {
      return node.references[attr];
    }
  }
  return null;
}

/**
 * Calculate deterministic coordinates for all reachable nodes in a binary tree.
 */
export function computeTreeLayout(
  rootId: string,
  heap: Record<string, HeapObject>,
  maxNodes: number = 200
): TreeLayoutResult {
  const positions: Record<string, TreeNodePosition> = {};
  const visited = new Set<string>();
  let inOrderIndex = 0;
  let maxDepth = 0;

  function traverse(nodeId: string | null, depth: number) {
    if (!nodeId || visited.has(nodeId) || visited.size >= maxNodes) return;
    const node = heap[nodeId];
    if (!node) return;

    visited.add(nodeId);
    if (depth > maxDepth) maxDepth = depth;

    const leftId = getTreeChildId(node, LEFT_ATTRS);
    const rightId = getTreeChildId(node, RIGHT_ATTRS);

    // Left subtree
    if (leftId && !visited.has(leftId)) {
      traverse(leftId, depth + 1);
    }

    // Current node (in-order placement)
    const x = inOrderIndex * HORIZONTAL_SPACING + PADDING_X;
    const y = depth * VERTICAL_SPACING + PADDING_Y;
    positions[nodeId] = { x, y };
    inOrderIndex++;

    // Right subtree
    if (rightId && !visited.has(rightId)) {
      traverse(rightId, depth + 1);
    }
  }

  if (rootId && heap[rootId]) {
    traverse(rootId, 0);
  }

  const nodeCount = visited.size;
  const width = Math.max(200, inOrderIndex * HORIZONTAL_SPACING + PADDING_X * 2);
  const height = Math.max(150, (maxDepth + 1) * VERTICAL_SPACING + PADDING_Y * 2);

  return {
    positions,
    width,
    height,
    nodeCount,
  };
}
