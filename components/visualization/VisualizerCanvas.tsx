"use client";

/**
 * VisualizerCanvas
 *
 * Routes from detected structures to the correct visualizer component.
 * Consumes PrismTrace + currentStep from the store.
 *
 * ROUTING PRIORITY:
 * 1. singly_linked_list -> LinkedListVisualizer
 * 2. 1d_array -> ArrayVisualizer
 * 3. binary_tree -> BSTVisualizer
 * 4. otherwise -> Informative Empty State
 *
 * CONTRACT:
 * - Pure consumer: no execution, no AI
 * - Derives all visual state from trace.frames[currentStep]
 * - Trace frames are immutable — never mutated here
 */

import React, { useMemo } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { detectStructures } from "@/lib/visualization/structureDetector";
import LinkedListVisualizer from "@/components/visualization/LinkedListVisualizer";
import ArrayVisualizer from "@/components/visualization/ArrayVisualizer";
import BSTVisualizer from "@/components/visualization/BSTVisualizer";
import { Layers } from "lucide-react";

function NoStructureState({ hasTrace }: { hasTrace: boolean }) {
  if (!hasTrace) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
        <Layers className="w-10 h-10 opacity-20" />
        <p className="text-xs font-mono text-center">
          Run your code to visualize<br />data structures here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
      <Layers className="w-10 h-10 opacity-20" />
      <p className="text-xs font-mono text-center text-slate-500">
        No supported structure detected<br />at this execution step.
      </p>
      <p className="text-[10px] font-mono text-slate-600 text-center">
        Supported: Linked lists, Arrays, Binary Search Trees
      </p>
    </div>
  );
}

export default function VisualizerCanvas() {
  const trace = useExecutionStore((state) => state.trace);
  const currentStep = useExecutionStore((state) => state.currentStep);

  const frame = trace?.frames?.[currentStep] ?? null;
  const prevFrame = currentStep > 0 && trace?.frames ? trace.frames[currentStep - 1] : null;

  const detectedStructures = useMemo(() => {
    if (!frame) return [];
    return detectStructures(frame);
  }, [frame]);

  // Deterministic routing priority: linked list > array > binary tree
  // We check for primary structure
  const primaryStructure = detectedStructures[0] ?? null;

  if (!frame || !primaryStructure) {
    return (
      <div className="w-full h-full bg-slate-950/40 rounded-lg border border-slate-800/60">
        <NoStructureState hasTrace={!!trace} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950/40 rounded-lg border border-slate-800/60 overflow-hidden">
      {primaryStructure.structureType === "singly_linked_list" && primaryStructure.rootHeapId && (
        <LinkedListVisualizer
          frame={frame}
          rootHeapId={primaryStructure.rootHeapId}
          structureName={primaryStructure.variableName}
        />
      )}

      {primaryStructure.structureType === "1d_array" && (
        <ArrayVisualizer
          frame={frame}
          prevFrame={prevFrame}
          variableName={primaryStructure.variableName}
        />
      )}

      {primaryStructure.structureType === "binary_tree" && primaryStructure.rootHeapId && (
        <BSTVisualizer
          frame={frame}
          rootHeapId={primaryStructure.rootHeapId}
          structureName={primaryStructure.variableName}
        />
      )}
    </div>
  );
}
