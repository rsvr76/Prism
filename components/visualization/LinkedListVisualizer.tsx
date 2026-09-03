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

const NODE_WIDTH = 132;
const NODE_HEIGHT = 64;
const NODE_SPACING_X = 195;
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
  const isHead = pointerLabels.some((l) => l.toLowerCase() === "head");

  return (
    <div className="relative">
      {/* Pointer labels & Head Indicator above the node */}
      {pointerLabels.length > 0 && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center gap-1.5 flex-wrap z-10">
          {pointerLabels.map((label) => {
            const isThisHead = label.toLowerCase() === "head";
            const isCurr = label.toLowerCase() === "curr" || label.toLowerCase() === "current";

            return (
              <span
                key={label}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md shadow-xs flex items-center gap-1 ${
                  isThisHead
                    ? "bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30"
                    : isCurr
                    ? "bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 ring-1 ring-cyan-400/30"
                    : "bg-slate-900/90 border border-slate-700 text-slate-300"
                }`}
              >
                {isThisHead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                {label}
              </span>
            );
          })}
        </div>
      )}

      {/* Node box: val | next */}
      <div
        className={`flex items-stretch rounded-lg border-2 overflow-hidden shadow-lg transition-all duration-200 ${
          isActive
            ? "border-cyan-400 shadow-cyan-500/25 bg-[#0a1628] ring-2 ring-cyan-400/40"
            : isHead
            ? "border-slate-600 bg-slate-900/95 hover:border-slate-500"
            : "border-slate-700/80 bg-slate-900/90 hover:border-slate-600"
        }`}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      >
        {/* Value compartment */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-700/80 px-2.5 bg-slate-950/30">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold leading-none mb-1">
            {className}
          </span>
          <span
            className={`font-mono font-bold text-base leading-none tracking-tight ${
              isActive ? "text-cyan-200" : "text-slate-100"
            }`}
          >
            {displayValue}
          </span>
        </div>

        {/* Next pointer socket */}
        <div className="w-9 flex flex-col items-center justify-center bg-slate-950/60 text-slate-400">
          <span className="text-[8px] font-mono text-slate-500 uppercase leading-none mb-0.5">next</span>
          <span className="text-xs font-mono text-cyan-400 leading-none">●</span>
        </div>
      </div>

      {/* React Flow handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-500 !border-slate-300"
        style={{ left: -5 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-cyan-200"
        style={{ right: -5 }}
      />
    </div>
  );
}

// ─── Null Terminator Node ─────────────────────────────────────────────────────

function NullNodeComponent(_props: NodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/50 shadow-sm"
      style={{ width: 72, height: NODE_HEIGHT }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-600 !border-slate-400"
        style={{ left: -5 }}
      />
      <span className="text-slate-500 font-mono text-xs font-bold tracking-wider">⏚ NULL</span>
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
        style: { stroke: isActive ? "#22d3ee" : "#64748b", strokeWidth: isActive ? 2.5 : 2 },
        markerEnd: { type: "arrowclosed" as const, color: isActive ? "#22d3ee" : "#64748b" },
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
        style: { stroke: "#475569", strokeWidth: 1.8, strokeDasharray: "4 3" },
        markerEnd: { type: "arrowclosed" as const, color: "#64748b" },
      });
    }
  });

  return { nodes, edges };
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
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
        <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-slate-900/90 border border-slate-700/80 text-cyan-400 font-bold shadow-xs">
          Singly Linked List
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          <strong className="text-white">{structureName}</strong>
          {" · "}
          {nodes.filter((n) => n.type === "linkedListNode").length} node(s)
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
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="#334155"
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

