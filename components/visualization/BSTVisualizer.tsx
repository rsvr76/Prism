"use client";

/**
 * BSTVisualizer
 *
 * Renders Binary Search Tree / Binary Tree state from a specific PrismFrame
 * using React Flow and deterministic planar in-order tree layout.
 *
 * CONTRACT:
 * - Pure consumer of (frame, rootHeapId, structureName)
 * - Derives all coordinates from computeTreeLayout()
 * - Never executes Python or calls AI
 * - Never mutates trace frames
 */

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PrismFrame, HeapObject } from "@/types/trace";
import {
  getScopePointersToHeapId,
  getNodeDisplayValue,
} from "@/lib/visualization/structureDetector";
import { computeTreeLayout, getTreeChildId } from "@/lib/visualization/treeLayout";
import { Network } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

const LEFT_ATTRS = ["left", "left_child", "leftChild"];
const RIGHT_ATTRS = ["right", "right_child", "rightChild"];

// ─── Custom BST Node Component ────────────────────────────────────────────────

interface BSTNodeData {
  displayValue: string;
  className: string;
  pointerLabels: string[];
  isActive: boolean;
  [key: string]: unknown;
}

function BSTNodeComponent({ data }: NodeProps<Node<BSTNodeData>>) {
  const { displayValue, className, pointerLabels, isActive } = data;

  return (
    <div className="relative flex flex-col items-center">
      {/* Top Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-slate-300"
        style={{ top: -5 }}
      />

      {/* Floating Pointer Badges (Above Node) */}
      {pointerLabels.length > 0 && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 min-w-max z-10">
          {pointerLabels.map((lbl) => (
            <span
              key={lbl}
              className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-400/60 text-cyan-800 dark:text-cyan-300 shadow-xs"
            >
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Circular / Rounded Tree Node Box */}
      <div
        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-200 shadow-xs ${
          isActive
            ? "border-cyan-500 bg-cyan-50/90 shadow-md ring-2 ring-cyan-400/50 scale-105 dark:border-cyan-400 dark:bg-[#0a1628] dark:shadow-cyan-500/30"
            : "border-slate-300 bg-white hover:border-slate-400 shadow-xs dark:border-slate-600/90 dark:bg-slate-900/90 dark:hover:border-slate-500"
        }`}
      >
        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold leading-none mb-0.5">
          {className}
        </span>
        <span
          className={`font-mono font-bold text-sm leading-tight truncate max-w-[54px] px-1 text-center ${
            isActive
              ? "text-cyan-800 dark:text-cyan-200"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {displayValue}
        </span>
      </div>

      {/* Bottom Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-purple-500 dark:!bg-purple-400 !border-purple-300 dark:!border-purple-200"
        style={{ bottom: -5 }}
      />
    </div>
  );
}

const nodeTypes = {
  bstNode: BSTNodeComponent,
};

// ─── Graph Builder ────────────────────────────────────────────────────────────

function buildTreeGraph(
  frame: PrismFrame,
  rootHeapId: string
): { nodes: Node[]; edges: Edge[] } {
  const heap = frame.heap;
  const layout = computeTreeLayout(rootHeapId, heap);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const [nodeId, pos] of Object.entries(layout.positions)) {
    const obj: HeapObject | undefined = heap[nodeId];
    if (!obj) continue;

    const pointerLabels = getScopePointersToHeapId(frame, nodeId);
    const isActive = pointerLabels.length > 0;

    nodes.push({
      id: nodeId,
      type: "bstNode",
      position: { x: pos.x, y: pos.y },
      data: {
        displayValue: getNodeDisplayValue(obj),
        className: obj.className || "Node",
        pointerLabels,
        isActive,
      },
      draggable: false,
    });

    // Left child edge
    const leftChildId = getTreeChildId(obj, LEFT_ATTRS);
    if (leftChildId && layout.positions[leftChildId]) {
      const leftActive = getScopePointersToHeapId(frame, leftChildId).length > 0;
      edges.push({
        id: `e-${nodeId}-L-${leftChildId}`,
        source: nodeId,
        target: leftChildId,
        type: "smoothstep",
        label: "L",
        labelStyle: { fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.8 },
        labelBgPadding: [2, 2],
        labelBgBorderRadius: 2,
        animated: leftActive,
        style: { stroke: leftActive ? "#22d3ee" : "#64748b", strokeWidth: leftActive ? 2.5 : 2 },
        markerEnd: { type: "arrowclosed" as const, color: leftActive ? "#22d3ee" : "#64748b" },
      });
    }

    // Right child edge
    const rightChildId = getTreeChildId(obj, RIGHT_ATTRS);
    if (rightChildId && layout.positions[rightChildId]) {
      const rightActive = getScopePointersToHeapId(frame, rightChildId).length > 0;
      edges.push({
        id: `e-${nodeId}-R-${rightChildId}`,
        source: nodeId,
        target: rightChildId,
        type: "smoothstep",
        label: "R",
        labelStyle: { fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.8 },
        labelBgPadding: [2, 2],
        labelBgBorderRadius: 2,
        animated: rightActive,
        style: { stroke: rightActive ? "#22d3ee" : "#64748b", strokeWidth: rightActive ? 2.5 : 2 },
        markerEnd: { type: "arrowclosed" as const, color: rightActive ? "#22d3ee" : "#64748b" },
      });
    }
  }

  return { nodes, edges };
}

// ─── Main BST Visualizer Component ────────────────────────────────────────────

interface BSTVisualizerProps {
  frame: PrismFrame;
  rootHeapId: string;
  structureName: string;
}

export default function BSTVisualizer({
  frame,
  rootHeapId,
  structureName,
}: BSTVisualizerProps) {
  const { isDark } = useTheme();
  const { nodes, edges } = useMemo(
    () => buildTreeGraph(frame, rootHeapId),
    [frame, rootHeapId]
  );

  if (nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
        <Network className="w-8 h-8 opacity-20" />
        <p className="text-xs font-mono">Tree &quot;{structureName}&quot; has no nodes at this step.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Structure Header Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-white/95 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-purple-700 dark:text-purple-400 font-bold shadow-xs">
          Binary Search Tree
        </span>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <strong className="text-cyan-700 dark:text-cyan-400">{structureName}</strong>
          {" · "}
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color={isDark ? "#334155" : "#cbd5e1"}
        />
      </ReactFlow>
    </div>
  );
}
