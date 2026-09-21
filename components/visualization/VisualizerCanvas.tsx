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
 * - Trace frames are immutable: never mutated here
 */

import React, { useMemo, useState } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { detectStructures, getMergedScope } from "@/lib/visualization/structureDetector";
import { DetectedStructure, PrismFrame } from "@/types/trace";
import LinkedListVisualizer from "@/components/visualization/LinkedListVisualizer";
import ArrayVisualizer from "@/components/visualization/ArrayVisualizer";
import BSTVisualizer from "@/components/visualization/BSTVisualizer";
import { Layers, AlertTriangle, Code2, FastForward, Sparkles, Play, GitBranch, X } from "lucide-react";
import {
  classifySemanticEvent,
  resolveEffectiveStructuralState,
  SemanticExecutionEvent,
} from "@/lib/execution/semanticEventClassifier";
import ExecutionEventBanner from "@/components/debug/ExecutionEventBanner";
import { getAlgorithmBySlug } from "@/lib/content/algorithms";

const STARTER_OPPORTUNITY_CARDS = [
  {
    slug: "array",
    title: "Dynamic Arrays",
    badge: "O(1) Access",
    description: "Observe physical RAM index calculations and sequential element traversal in real time.",
  },
  {
    slug: "linked-list",
    title: "Singly Linked Lists",
    badge: "Pointer Chaining",
    description: "Inspect node instantiation, pointer references, and heap object allocations.",
  },
  {
    slug: "bubble-sort",
    title: "Bubble Sort",
    badge: "O(n^2) Sorting",
    description: "Watch adjacent comparisons, swap operations, and ordered partition boundaries.",
  },
  {
    slug: "binary-search-tree",
    title: "Binary Search Tree",
    badge: "Hierarchical Nodes",
    description: "Explore recursive branching and left and right subtree ordering invariants.",
  },
];

interface NoStructureStateProps {
  hasTrace: boolean;
  isDefiningCode?: boolean;
  upcomingStructure?: { structure: DetectedStructure; firstStep: number } | null;
  currentLine?: number;
  onFastForward?: () => void;
  onSelectOpportunity?: (slug: string) => void;
}

function NoStructureState({
  hasTrace,
  isDefiningCode,
  upcomingStructure,
  currentLine,
  onFastForward,
  onSelectOpportunity,
}: NoStructureStateProps) {
  if (!hasTrace) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3.5 p-6 overflow-y-auto">
        <div className="text-center space-y-1 max-w-md">
          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-xs mb-1">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Interactive Visualizer Canvas
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Click &quot;Visualize&quot; below the editor to run and inspect data structures here.
          </p>
        </div>

        {/* 4 Starter Opportunity Cards */}
        <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
          {STARTER_OPPORTUNITY_CARDS.map((card) => (
            <div
              key={card.slug}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#070d18]/60 hover:border-cyan-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {card.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 shrink-0">
                    {card.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {card.description}
                </p>
              </div>
              <button
                onClick={() => onSelectOpportunity?.(card.slug)}
                className="mt-2.5 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Play className="w-3 h-3 fill-current text-cyan-600 dark:text-cyan-400" />
                <span>Load &amp; Run</span>
              </button>
            </div>
          ))}
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
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);
  const visualizeCode = useExecutionStore((state) => state.visualizeCode);
  const openWhatIfModal = useExecutionStore((state) => state.openWhatIfModal);
  const openComplexity = useExecutionStore((state) => state.openComplexity);
  const [showTip, setShowTip] = useState(true);

  const handleSelectOpportunity = async (slug: string) => {
    const algo = getAlgorithmBySlug(slug);
    if (algo) {
      loadAlgorithmCode(algo.name, algo.pythonCode);
      try {
        await visualizeCode();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const frame = isVisualizing && trace?.frames?.[currentStep] ? trace.frames[currentStep] : null;
  const prevFrame = isVisualizing && currentStep > 0 && trace?.frames ? trace.frames[currentStep - 1] : null;

  // 1. Classify current execution event (deterministic, conservative)
  const semanticEvent = useMemo<SemanticExecutionEvent | null>(() => {
    if (!frame) return null;
    return classifySemanticEvent(frame, prevFrame, trace?.code);
  }, [frame, prevFrame, trace?.code]);

  // 2. Resolve Effective Structural State:
  // Persistent Structural State Guarantee:
  // For any step, scan backwards to retain the latest valid structural snapshot.
  // Visualizer NEVER blanks or unmounts during non-structural steps.
  const effectiveState = useMemo(() => {
    if (!isVisualizing || !trace) return null;
    return resolveEffectiveStructuralState(trace, currentStep);
  }, [isVisualizing, trace, currentStep]);

  // 3. Construct effective frame merging structural snapshot with current step scope/pointers
  const effectiveFrame = useMemo<PrismFrame | null>(() => {
    if (!frame) return null;
    if (!effectiveState) return frame;
    if (effectiveState.isDirectMatch) return frame;

    return {
      ...effectiveState.structuralFrame,
      activePointers: frame.activePointers && frame.activePointers.length > 0 ? frame.activePointers : effectiveState.structuralFrame.activePointers,
      scope: { ...effectiveState.structuralFrame.scope, ...frame.scope },
      line: frame.line,
      stepIndex: frame.stepIndex,
      stdout: frame.stdout,
      exception: frame.exception,
    };
  }, [frame, effectiveState]);

  // 4. Scan forward for upcoming structure if before first instantiation
  const upcomingStructure = useMemo(() => {
    if (effectiveState || !trace?.frames) return null;
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
  }, [effectiveState, trace, currentStep]);

  if (!isVisualizing || !frame || !effectiveState) {
    return (
      <div className="w-full h-full bg-white dark:bg-[#0a0f1d] rounded-xl border border-slate-300 dark:border-slate-800/80 overflow-hidden shadow-sm dark:shadow-lg relative">
        {semanticEvent && (
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20">
            <ExecutionEventBanner event={semanticEvent} />
          </div>
        )}
        <NoStructureState
          hasTrace={isVisualizing && !!trace}
          isDefiningCode={Boolean(upcomingStructure)}
          upcomingStructure={upcomingStructure}
          currentLine={frame?.line}
          onFastForward={upcomingStructure ? () => setStep(upcomingStructure.firstStep) : undefined}
          onSelectOpportunity={handleSelectOpportunity}
        />
      </div>
    );
  }

  const activeStructure = effectiveState.structure;
  const renderFrame = effectiveFrame || frame;

  return (
    <div className="w-full h-full bg-white dark:bg-[#0a0f1d] rounded-xl border border-slate-300 dark:border-slate-800/80 overflow-hidden shadow-sm dark:shadow-lg relative">
      {/* Top Banner: Compact Semantic Execution Event */}
      {semanticEvent && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20">
          <ExecutionEventBanner event={semanticEvent} />
        </div>
      )}

      {trace?.status === "TRACE_LIMIT" && (
        <div className="absolute top-12 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700/80 text-[11px] font-mono text-amber-800 dark:text-amber-300 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Execution capped at 1,000 steps</span>
        </div>
      )}

      {/* In-Execution Contextual Opportunity Card */}
      {showTip && trace?.status === "SUCCESS" && currentStep >= 4 && (
        <div className="absolute bottom-3 right-3 z-20 max-w-xs p-3 rounded-xl bg-white/95 dark:bg-[#0a0f1d]/95 border border-cyan-500/30 dark:border-cyan-500/40 shadow-lg backdrop-blur-md">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>{currentStep >= (trace.totalSteps - 2) ? "Complexity Insights" : "What-If Branch"}</span>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded cursor-pointer"
              title="Dismiss suggestion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-2">
            {currentStep >= (trace.totalSteps - 2)
              ? "Trace complete. Inspect empirical Big-O metrics and loop nesting analysis."
              : `Step ${currentStep + 1} reached. Branch from here to test alternative code paths.`}
          </p>
          <div className="flex items-center gap-2">
            {currentStep >= (trace.totalSteps - 2) ? (
              <button
                onClick={openComplexity}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-medium shadow-2xs cursor-pointer transition-colors"
              >
                <span>Analyze Big-O</span>
              </button>
            ) : (
              <button
                onClick={() => openWhatIfModal(currentStep)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-mono text-[11px] font-medium shadow-2xs cursor-pointer transition-colors"
              >
                <GitBranch className="w-3 h-3" />
                <span>Branch at Step {currentStep + 1}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {activeStructure.structureType === "singly_linked_list" && activeStructure.rootHeapId && (
        <LinkedListVisualizer
          frame={renderFrame}
          rootHeapId={activeStructure.rootHeapId}
          structureName={activeStructure.variableName}
        />
      )}

      {activeStructure.structureType === "1d_array" && (
        <ArrayVisualizer
          frame={renderFrame}
          prevFrame={prevFrame}
          variableName={activeStructure.variableName}
        />
      )}

      {activeStructure.structureType === "binary_tree" && activeStructure.rootHeapId && (
        <BSTVisualizer
          frame={renderFrame}
          rootHeapId={activeStructure.rootHeapId}
          structureName={activeStructure.variableName}
        />
      )}
    </div>
  );
}
