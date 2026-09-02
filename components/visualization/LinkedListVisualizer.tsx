"use client";

/**
 * LinkedListVisualizer
 *
 * Renders the linked list state from a specific PrismFrame using React Flow.
 * Consumes: trace.frames[currentStep]
 *
 * CONTRACT:
 * - Derives visual state purely from PrismFrame — no execution, no AI
 * - Uses stable execution-local heap IDs (obj_<id>) as React Flow node IDs
 * - Renders current frame state ONLY — does NOT track history itself
 * - Does NOT mutate trace frames
 */

import React, { useMemo, useCallback } from "react";
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
  getLinkedListChain,
  getScopePointersToHeapId,
  getNodeDisplayValue,
} from "@/lib/visualization/structureDetector";

// ─── Node Layout Constants ────────────────────────────────────────────────────

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const NODE_SPACING_X = 180;
const INITIAL_X = 60;
const INITIAL_Y = 120;
const NULL_NODE_ID = "__prism_null__";

// ─── Custom Linked List Node ──────────────────────────────────────────────────

interface LinkedListNodeData {
  displayValue: string;
  pointerLabels: string[];  // scope variable names pointing to this node (e.g. ["head", "curr"])
  isActive: boolean;        // whether this node is the "current" active node in this frame
  className: string;
  isCircularBack?: boolean; // true for circular list's last node (its next wraps to head)
  [key: string]: unknown;
}

function LinkedListNodeComponent({ data }: NodeProps<Node<LinkedListNodeData>>) {
  const { displayValue, pointerLabels, isActive, className } = data;

  return (
    <div className="relative">
      {/* Pointer labels above the node */}
      {pointerLabels.length > 0 && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center gap-1 flex-wrap">
          {pointerLabels.map((label) => (
            <span
              key={label}
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Node box: val | next */}
      <div
        className={`flex items-stretch h-[${NODE_HEIGHT}px] rounded-md border-2 overflow-hidden shadow-lg transition-all ${
          isActive
            ? "border-cyan-400 shadow-cyan-500/30 bg-cyan-950/60"
            : "border-slate-600 bg-slate-800/80"
        }`}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      >
        {/* Value compartment */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-600/60 px-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase leading-none mb-1">
            {className}
          </span>
          <span
            className={`font-mono font-bold text-sm leading-none ${
              isActive ? "text-cyan-200" : "text-slate-100"
            }`}
          >
            {displayValue}
          </span>
        </div>

        {/* Next pointer compartment */}
        <div className="w-8 flex items-center justify-center bg-slate-900/40">
          <span className="text-[9px] font-mono text-slate-500">→</span>
        </div>
      </div>

      {/* React Flow handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-500 !border-slate-400"
        style={{ left: -4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-slate-500 !border-slate-400"
        style={{ right: -4 }}
      />
    </div>
  );
}

// ─── Null Terminator Node ─────────────────────────────────────────────────────

function NullNodeComponent(_props: NodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded border-2 border-dashed border-slate-600 bg-slate-900/40"
      style={{ width: 64, height: NODE_HEIGHT }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-600 !border-slate-500"
        style={{ left: -4 }}
      />
      <span className="text-slate-500 font-mono text-xs font-bold">⏚ NULL</span>
    </div>
  );
}

const nodeTypes = {
  linkedListNode: LinkedListNodeComponent,
  nullNode: NullNodeComponent,
};

// ─── Frame → React Flow Nodes & Edges ─────────────────────────────────────────

function buildGraphFromFrame(
  frame: PrismFrame,
  rootHeapId: string
): { nodes: Node[]; edges: Edge[] } {
  const heap = frame.heap;
  const { chain, isCircular } = getLinkedListChain(rootHeapId, heap);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Identify which heap object is the "active" one based on scope pointers
  // Active = pointed to by the most scope variables (head/curr/etc)
  const pointerCountPerNode = new Map<string, number>();
  for (const id of chain) {
    const labels = getScopePointersToHeapId(frame, id);
    pointerCountPerNode.set(id, labels.length);
  }

  chain.forEach((heapId, index) => {
    const obj: HeapObject | undefined = heap[heapId];
    if (!obj) return;

    const x = INITIAL_X + index * NODE_SPACING_X;
    const y = INITIAL_Y;
    const pointerLabels = getScopePointersToHeapId(frame, heapId);
    const isActive = pointerLabels.length > 0;

    nodes.push({
      id: heapId,
      type: "linkedListNode",
      position: { x, y },
      data: {
        displayValue: getNodeDisplayValue(obj),
        pointerLabels,
        isActive,
        className: obj.className,
      },
      draggable: false,
    });

    // Edge to next node
    const nextHeapId = obj.references["next"] ?? obj.references["nxt"] ?? obj.references["next_node"] ?? null;

    if (nextHeapId && chain.includes(nextHeapId)) {
      // Normal next edge
      edges.push({
        id: `e-${heapId}->${nextHeapId}`,
        source: heapId,
        target: nextHeapId,
        type: "smoothstep",
        animated: isActive,
        style: { stroke: isActive ? "#22d3ee" : "#475569", strokeWidth: 1.5 },
        markerEnd: { type: "arrowclosed" as const, color: isActive ? "#22d3ee" : "#475569" },
      });
    } else if (nextHeapId && isCircular) {
      // Circular back edge — skip for simplicity in Phase 3A layout
    } else {
      // Next is null — edge to NULL terminator node
      const nullNodeId = `${NULL_NODE_ID}_${heapId}`;
      const nullX = x + NODE_SPACING_X;

      nodes.push({
        id: nullNodeId,
        type: "nullNode",
        position: { x: nullX, y },
        data: {},
        draggable: false,
      });

      edges.push({
        id: `e-${heapId}->null`,
        source: heapId,
        target: nullNodeId,
        type: "smoothstep",
        style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: "4 2" },
        markerEnd: { type: "arrowclosed" as const, color: "#475569" },
      });
    }
  });

  return { nodes, edges };
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
      <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="6" cy="12" r="3" strokeWidth="1.5" />
        <circle cx="18" cy="12" r="3" strokeWidth="1.5" />
        <line x1="9" y1="12" x2="15" y2="12" strokeWidth="1.5" strokeDasharray="2 1" />
      </svg>
      <p className="text-xs font-mono">{message}</p>
    </div>
  );
}

// ─── Main Visualizer Component ────────────────────────────────────────────────

interface LinkedListVisualizerProps {
  frame: PrismFrame;
  rootHeapId: string;
  structureName: string;
}

export default function LinkedListVisualizer({
  frame,
  rootHeapId,
  structureName,
}: LinkedListVisualizerProps) {
  const { nodes, edges } = useMemo(
    () => buildGraphFromFrame(frame, rootHeapId),
    [frame, rootHeapId]
  );

  if (nodes.length === 0) {
    return <EmptyState message={`Linked list "${structureName}" has no nodes at this step`} />;
  }

  return (
    <div className="w-full h-full relative">
      {/* Structure label */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-900 border border-slate-700 text-slate-400">
          Linked List
        </span>
        <span className="text-[11px] font-mono text-slate-500">
          <strong className="text-cyan-400">{structureName}</strong>
          {" · "}
          {nodes.filter((n) => n.type === "linkedListNode").length} node(s)
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
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
