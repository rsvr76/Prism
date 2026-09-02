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
  Controls,
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
        className="!w-2 !h-2 !bg-slate-500 !border-slate-400"
        style={{ top: -4 }}
      />

      {/* Floating Pointer Badges (Above Node) */}
      {pointerLabels.length > 0 && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 min-w-max z-10">
          {pointerLabels.map((lbl) => (
            <span
              key={lbl}
              className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-cyan-500/25 border border-cyan-400/60 text-cyan-300 shadow-md shadow-cyan-500/20"
            >
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Circular / Rounded Tree Node Box */}
      <div
        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-200 shadow-lg ${
          isActive
            ? "border-cyan-400 bg-cyan-950/80 shadow-cyan-500/40 ring-2 ring-cyan-400/50 scale-105"
            : "border-slate-600 bg-slate-900/90 hover:border-slate-500"
        }`}
      >
        <span className="text-[8px] font-mono text-slate-500 uppercase leading-none">
          {className}
        </span>
        <span
          className={`font-mono font-bold text-sm leading-tight truncate max-w-[48px] px-1 text-center ${
            isActive ? "text-cyan-200" : "text-slate-100"
          }`}
        >
          {displayValue}
        </span>
      </div>

      {/* Bottom Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-500 !border-slate-400"
        style={{ bottom: -4 }}
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
        style: { stroke: leftActive ? "#22d3ee" : "#64748b", strokeWidth: 1.5 },
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
        style: { stroke: rightActive ? "#22d3ee" : "#64748b", strokeWidth: 1.5 },
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
        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-700 text-purple-400 font-bold">
          Binary Search Tree
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          <strong className="text-cyan-400">{structureName}</strong>
          {" · "}
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e293b"
        />
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          position="bottom-right"
          className="!bg-slate-900 !border-slate-800"
        />
      </ReactFlow>
    </div>
  );
}
