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
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3.5 p-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-xs">
          <Layers className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
            Interactive Visualizer Canvas
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Run your code to visualize data structures here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 p-6">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-xs">
        <Layers className="w-5 h-5" />
      </div>
      <p className="text-xs font-mono text-center text-slate-700 dark:text-slate-400">
        No supported structure detected at this execution step.
      </p>
      <p className="text-[11px] font-mono text-slate-500 text-center">
        Supported structures: Singly Linked Lists, 1D Arrays, Binary Search Trees
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
      <div className="w-full h-full bg-white dark:bg-[#0a0f1d] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-lg">
        <NoStructureState hasTrace={!!trace} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-[#0a0f1d] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-lg relative">
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
