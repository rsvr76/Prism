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
import { detectStructures, getMergedScope } from "@/lib/visualization/structureDetector";
import { DetectedStructure } from "@/types/trace";
import LinkedListVisualizer from "@/components/visualization/LinkedListVisualizer";
import ArrayVisualizer from "@/components/visualization/ArrayVisualizer";
import BSTVisualizer from "@/components/visualization/BSTVisualizer";
import { Layers, AlertTriangle, Code2, FastForward, Sparkles } from "lucide-react";

interface NoStructureStateProps {
  hasTrace: boolean;
  isDefiningCode?: boolean;
  upcomingStructure?: { structure: DetectedStructure; firstStep: number } | null;
  currentLine?: number;
  onFastForward?: () => void;
}

function NoStructureState({
  hasTrace,
  isDefiningCode,
  upcomingStructure,
  currentLine,
  onFastForward,
}: NoStructureStateProps) {
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
            Click &quot;Visualize&quot; below the editor to run and inspect data structures here.
          </p>
        </div>
      </div>
    );
  }

  if (isDefiningCode && upcomingStructure) {
    const structTypeLabel =
      upcomingStructure.structure.structureType === "singly_linked_list"
        ? "Singly Linked List"
        : upcomingStructure.structure.structureType === "binary_tree"
        ? "Binary Search Tree"
        : "1D Array";

    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3.5 p-8 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-xs">
          <Code2 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold mb-1">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>Upcoming: {structTypeLabel}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Defining Classes &amp; Functions
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Python is currently executing definition statements {currentLine ? `(Line ${currentLine})` : ""}.
            The interactive visualizer will activate automatically as soon as instances are allocated in memory.
          </p>
        </div>

        {onFastForward && (
          <button
            onClick={onFastForward}
            className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm hover:shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Fast-Forward to Step {upcomingStructure.firstStep + 1}</span>
          </button>
        )}
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
  const isVisualizing = useExecutionStore((state) => state.isVisualizing);
  const setStep = useExecutionStore((state) => state.setStep);

  const frame = isVisualizing && trace?.frames?.[currentStep] ? trace.frames[currentStep] : null;
  const prevFrame = isVisualizing && currentStep > 0 && trace?.frames ? trace.frames[currentStep - 1] : null;

  // 1. Current frame detection
  const detectedStructures = useMemo(() => {
    if (!frame) return [];
    return detectStructures(frame);
  }, [frame]);

  // 2. Persistent Structure Resolution:
  // If current frame has a detected structure, use it.
  // Otherwise, scan backwards through past frames (currentStep - 1 down to 0).
  // If a past frame had a detected structure whose root/variable is still alive in the current frame, retain it!
  const activeStructure = useMemo<DetectedStructure | null>(() => {
    if (!frame) return null;
    if (detectedStructures.length > 0) {
      return detectedStructures[0];
    }
    if (!trace?.frames) return null;

    for (let i = currentStep - 1; i >= 0; i--) {
      const pastFrame = trace.frames[i];
      if (!pastFrame) continue;
      const pastDetected = detectStructures(pastFrame);
      if (pastDetected.length === 0) continue;

      const candidate = pastDetected[0];
      if (
        candidate.structureType === "singly_linked_list" ||
        candidate.structureType === "binary_tree"
      ) {
        if (candidate.rootHeapId && frame.heap && frame.heap[candidate.rootHeapId]) {
          return candidate;
        }
      } else if (candidate.structureType === "1d_array") {
        const mergedScope = getMergedScope(frame);
        if (Array.isArray(mergedScope[candidate.variableName])) {
          return candidate;
        }
      }
    }

    return null;
  }, [frame, detectedStructures, trace, currentStep]);

  // 3. Scan forward for upcoming structure if before first instantiation
  const upcomingStructure = useMemo(() => {
    if (activeStructure || !trace?.frames) return null;
    for (let i = currentStep + 1; i < trace.frames.length; i++) {
      const futureFrame = trace.frames[i];
      if (!futureFrame) continue;
      const futureDetected = detectStructures(futureFrame);
      if (futureDetected.length > 0) {
        return {
          structure: futureDetected[0],
          firstStep: i,
        };
      }
    }
    return null;
  }, [activeStructure, trace, currentStep]);

  if (!isVisualizing || !frame || !activeStructure) {
    return (
      <div className="w-full h-full bg-white dark:bg-[#0a0f1d] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-lg">
        <NoStructureState
          hasTrace={isVisualizing && !!trace}
          isDefiningCode={Boolean(upcomingStructure)}
          upcomingStructure={upcomingStructure}
          currentLine={frame?.line}
          onFastForward={upcomingStructure ? () => setStep(upcomingStructure.firstStep) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-[#0a0f1d] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-lg relative">
      {trace?.status === "TRACE_LIMIT" && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700/80 text-[11px] font-mono text-amber-800 dark:text-amber-300 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Execution capped at 1,000 steps</span>
        </div>
      )}

      {activeStructure.structureType === "singly_linked_list" && activeStructure.rootHeapId && (
        <LinkedListVisualizer
          frame={frame}
          rootHeapId={activeStructure.rootHeapId}
          structureName={activeStructure.variableName}
        />
      )}

      {activeStructure.structureType === "1d_array" && (
        <ArrayVisualizer
          frame={frame}
          prevFrame={prevFrame}
          variableName={activeStructure.variableName}
        />
      )}

      {activeStructure.structureType === "binary_tree" && activeStructure.rootHeapId && (
        <BSTVisualizer
          frame={frame}
          rootHeapId={activeStructure.rootHeapId}
          structureName={activeStructure.variableName}
        />
      )}
    </div>
  );
}
