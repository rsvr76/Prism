"use client";

import React, { useState, useEffect, useRef } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import {
  Activity,
  X,
  GripHorizontal,
  Clock,
  HardDrive,
  Loader2,
  Sparkles,
  BookOpen,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function FloatingComplexityCard() {
  const isComplexityOpen = useExecutionStore((state) => state.isComplexityOpen);
  const closeComplexity = useExecutionStore((state) => state.closeComplexity);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const complexityAnalyses = useExecutionStore((state) => state.complexityAnalyses);
  const isAnalyzingComplexity = useExecutionStore((state) => state.isAnalyzingComplexity);
  const complexityError = useExecutionStore((state) => state.complexityError);
  const analyzeComplexity = useExecutionStore((state) => state.analyzeComplexity);
  const trace = useExecutionStore((state) => state.trace);

  const [revealedTab, setRevealedTab] = useState<"time" | "space">("time");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Initialize position to the middle of the product viewport
  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultX = Math.max(20, Math.round((window.innerWidth - 380) / 2));
      const defaultY = Math.max(70, Math.round((window.innerHeight - 380) / 2));
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  // Auto-analyze complexity if opened without analysis
  useEffect(() => {
    if (
      isComplexityOpen &&
      activeExecutionId &&
      !complexityAnalyses[activeExecutionId] &&
      !isAnalyzingComplexity &&
      trace
    ) {
      analyzeComplexity();
    }
  }, [
    isComplexityOpen,
    activeExecutionId,
    complexityAnalyses,
    isAnalyzingComplexity,
    trace,
    analyzeComplexity,
  ]);

  if (!isComplexityOpen) return null;

  const analysis = activeExecutionId ? complexityAnalyses[activeExecutionId] || null : null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    const currentX = position?.x ?? 20;
    const currentY = position?.y ?? 70;
    dragOffset.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 360, e.clientX - dragOffset.current.x));
    const newY = Math.max(60, Math.min(window.innerHeight - 120, e.clientY - dragOffset.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already released
    }
  };

  const getTimeColor = (timeClass: string, isSelected: boolean) => {
    if (isSelected) {
      return "bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-md ring-2 ring-amber-400/50";
    }
    switch (timeClass) {
      case "O(1)":
      case "O(log n)":
        return "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100";
      case "O(n)":
      case "O(n log n)":
        return "bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-600/40 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100";
      case "O(n²)":
        return "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100";
      default:
        return "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100";
    }
  };

  const getSpaceColor = (spaceClass: string, isSelected: boolean) => {
    if (isSelected) {
      return "bg-purple-600 text-white border-purple-700 font-bold shadow-md ring-2 ring-purple-400/50";
    }
    return "bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-600/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60";
  };

  return (
    <div
      role="dialog"
      aria-label="Big-O Complexity Analysis"
      style={{
        transform: position ? `translate3d(${position.x}px, ${position.y}px, 0)` : undefined,
      }}
      className={`fixed top-0 left-0 z-40 w-[340px] sm:w-[380px] bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono select-none text-slate-800 dark:text-slate-200 transition-shadow duration-200 animate-in fade-in zoom-in-95 ${
        !position ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : ""
      }`}
    >
      {/* ── Draggable Header ── */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-10 px-3.5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Big-O Complexity
          </span>
        </div>

        <button
          onClick={closeComplexity}
          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Big-O card (X)"
          aria-label="Close Big-O Complexity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Card Content ── */}
      <div className="p-3.5 space-y-3 max-h-[75vh] overflow-y-auto custom-scrollbar">
        {/* Loading State */}
        {isAnalyzingComplexity && (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 dark:text-amber-400" />
            <p className="text-xs font-medium">Extracting loop nesting & analyzing complexity...</p>
          </div>
        )}

        {/* Error State */}
        {!isAnalyzingComplexity && complexityError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Analysis Error</span>
            </div>
            <p className="text-[11px] leading-relaxed">{complexityError}</p>
            <button
              onClick={() => analyzeComplexity()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty / Not Analyzed State */}
        {!isAnalyzingComplexity && !complexityError && !analysis && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <Activity className="w-8 h-8 text-amber-500/40" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Run or visualize Python code to compute deterministic Big-O metrics.
            </p>
            <button
              onClick={() => analyzeComplexity()}
              className="mt-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Compute Complexity
            </button>
          </div>
        )}

        {/* Rendered Dual Complexity Buttons */}
        {!isAnalyzingComplexity && !complexityError && analysis && (
          <>
            {/* Top Buttons: Strictly Time Complexity & Space Complexity */}
            <div className="grid grid-cols-2 gap-2">
              {/* Button 1: Time Complexity */}
              <button
                onClick={() => setRevealedTab("time")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${getTimeColor(
                  analysis.timeComplexity,
                  revealedTab === "time"
                )}`}
                title="Click to reveal why Time Complexity is so"
              >
                <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-wider opacity-80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Time</span>
                  </span>
                  {revealedTab === "time" && (
                    <span className="text-[9px] px-1 bg-slate-900/20 dark:bg-white/20 rounded font-black">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-lg font-black mt-1 tracking-tight">{analysis.timeComplexity}</div>
                <span className="text-[10px] opacity-75 mt-0.5">Click for explanation →</span>
              </button>

              {/* Button 2: Space Complexity */}
              <button
                onClick={() => setRevealedTab("space")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${getSpaceColor(
                  analysis.spaceComplexity,
                  revealedTab === "space"
                )}`}
                title="Click to reveal why Space Complexity is so"
              >
                <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-wider opacity-80">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    <span>Aux Space</span>
                  </span>
                  {revealedTab === "space" && (
                    <span className="text-[9px] px-1 bg-slate-900/20 dark:bg-white/20 rounded font-black">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-lg font-black mt-1 tracking-tight">{analysis.spaceComplexity}</div>
                <span className="text-[10px] opacity-75 mt-0.5">Click for explanation →</span>
              </button>
            </div>

            {/* Revealed Explanation Tab: Explaining Why It Is So */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-inner">
              {revealedTab === "time" ? (
                <>
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Why Time Complexity is {analysis.timeComplexity}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {analysis.why}
                  </p>

                  {analysis.educationalTakeaway && (
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 space-y-1">
                      <div className="flex items-center gap-1 text-indigo-800 dark:text-indigo-300 font-bold text-[10px] uppercase tracking-wide">
                        <BookOpen className="w-3 h-3" />
                        <span>Educational Takeaway</span>
                      </div>
                      <p className="text-[11px] text-indigo-950 dark:text-indigo-200 leading-relaxed">
                        {analysis.educationalTakeaway}
                      </p>
                    </div>
                  )}

                  {/* Grounded Time Evidence */}
                  <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>Trace Evidence</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>
                        • Loop Nesting Level:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {analysis.metrics?.maxLoopNesting ?? 0}
                        </strong>
                      </div>
                      <div>
                        • Max Line Execution Count:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {analysis.metrics?.maxLineExecutionCount ?? 0}x
                        </strong>
                      </div>
                      <div>
                        • Total Step Operations:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {analysis.metrics?.totalOperations ?? analysis.metrics?.totalSteps ?? 0}
                        </strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Why Space Complexity is {analysis.spaceComplexity}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {analysis.spaceComplexity === "O(1)"
                      ? "Auxiliary space is constant O(1). The algorithm operates in-place on input variables without allocating expanding arrays, hash tables, or recursive call stack frames."
                      : `Auxiliary space scales as ${analysis.spaceComplexity} due to dynamic memory allocations or call stack frames scaling proportionally with the input size.`}
                  </p>

                  {/* Grounded Space Evidence */}
                  <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>Trace Evidence</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>
                        • Peak Heap Objects:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {analysis.metrics?.peakHeapObjects ?? 0}
                        </strong>
                      </div>
                      <div>
                        • Max Call Stack Depth:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {analysis.metrics?.maxCallStackDepth ?? 1}
                        </strong>
                      </div>
                      <div>
                        • Recursive Stack:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {analysis.metrics?.isRecursive ? `Yes (${analysis.metrics.recursionDepth})` : "None (Iterative)"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
