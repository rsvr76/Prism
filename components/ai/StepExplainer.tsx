"use client";

/**
 * StepExplainer Component
 *
 * Displays factual, grounded AI explanations for the current execution step.
 * Strictly derives context from trace.frames[currentStep].
 * Cached per step index.
 */

import React from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Network,
  GraduationCap,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function StepExplainer() {
  const trace = useExecutionStore((state) => state.trace);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const stepExplanations = useExecutionStore((state) => state.stepExplanations);
  const isExplaining = useExecutionStore((state) => state.isExplaining);
  const explanationError = useExecutionStore((state) => state.explanationError);
  const explainCurrentStep = useExecutionStore((state) => state.explainCurrentStep);

  const frame = trace?.frames?.[currentStep] ?? null;
  const cacheKey = activeExecutionId ? `${activeExecutionId}_step_${currentStep}` : `step_${currentStep}`;
  const currentExplanation = stepExplanations[cacheKey] || null;

  if (!trace || !frame) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
        <Sparkles className="w-8 h-8 opacity-20" />
        <p className="text-xs font-mono text-center">
          Run your code and select a step<br />to view AI explanations.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-4 text-slate-800 dark:text-slate-200">
      {/* ── Top Bar: Step Marker & Action ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-bold">
            Step {currentStep}
          </span>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Line <strong className="text-slate-900 dark:text-slate-200">{frame.line}</strong>
          </span>
        </div>

        <button
          onClick={() => explainCurrentStep()}
          disabled={isExplaining}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
            isExplaining
              ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
              : currentExplanation
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700"
              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
          }`}
        >
          {isExplaining ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : currentExplanation ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-explain</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain Step</span>
            </>
          )}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {explanationError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
          <div>
            <strong className="block font-bold">Explanation Unavailable</strong>
            <span>{explanationError}</span>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {isExplaining && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin opacity-80" />
          <p className="text-xs font-mono text-slate-600 dark:text-slate-400 animate-pulse">
            Diffing execution frames and synthesizing grounded explanation...
          </p>
        </div>
      )}

      {/* ── Empty Unrequested State ── */}
      {!isExplaining && !currentExplanation && !explanationError && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Grounded Step Explainer</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
              Click <strong className="text-cyan-700 dark:text-cyan-400">&quot;Explain Step&quot;</strong> to inspect what physically changed in memory on line {frame.line}.
            </p>
          </div>
        </div>
      )}

      {/* ── Structured Explanation Cards ── */}
      {!isExplaining && currentExplanation && (
        <div className="flex-1 space-y-3.5 min-h-0">
          {/* SECTION 1: OBSERVED (Deterministic Execution Trace) */}
          <div className="rounded-lg bg-emerald-50/70 border border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-500/30 overflow-hidden shadow-2xs">
            <div className="px-3 py-1.5 bg-emerald-100/70 dark:bg-emerald-950/40 border-b border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>OBSERVED IN EXECUTION</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-semibold dark:bg-emerald-950 dark:border-emerald-500/40 dark:text-emerald-300">
                Trace Truth
              </span>
            </div>

            <div className="p-3 space-y-2">
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                <span className="text-slate-500 dark:text-slate-400">Step {currentStep}: </span>
                <span className="text-slate-900 dark:text-white font-semibold">Executed Line {frame.line}</span>
              </div>

              {currentExplanation.changes.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-950/60 p-2.5 rounded-md border border-slate-200 dark:border-slate-800/80">
                  {currentExplanation.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">▸</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No variables mutated at this execution step.</p>
              )}
            </div>
          </div>

          {/* SECTION 2: EXPLAINED (Pedagogical Insight) */}
          <div className="rounded-lg bg-purple-50/70 border border-purple-200 dark:bg-purple-950/15 dark:border-purple-500/30 overflow-hidden shadow-2xs space-y-0">
            <div className="px-3 py-1.5 bg-purple-100/70 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 text-xs font-mono font-bold uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>EXPLAINED BY PRISM AI</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 font-mono font-semibold dark:bg-purple-950 dark:border-purple-500/40 dark:text-purple-300">
                Pedagogy
              </span>
            </div>

            <div className="p-3 space-y-3">
              {/* Summary / What Happened */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 text-xs font-mono font-bold">
                  <span>What Happened (Summary)</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {currentExplanation.summary}
                </p>
              </div>

              {/* Why It Happened */}
              <div className="space-y-1 pt-2 border-t border-purple-200 dark:border-purple-900/40">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Why It Happened</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {currentExplanation.why}
                </p>
              </div>

              {/* Data Structure Insight (Optional) */}
              {currentExplanation.dataStructureInsight && (
                <div className="p-2.5 rounded-md bg-purple-100/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 text-[11px] font-mono font-bold">
                    <Network className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Data Structure Insight</span>
                  </div>
                  <p className="text-xs text-purple-950 dark:text-purple-200/90 leading-relaxed font-sans">
                    {currentExplanation.dataStructureInsight}
                  </p>
                </div>
              )}

              {/* Key Learning Point */}
              <div className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 text-[11px] font-mono font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Key Learning Point</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {currentExplanation.learningPoint}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
