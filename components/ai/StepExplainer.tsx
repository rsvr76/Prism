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
  const stepExplanations = useExecutionStore((state) => state.stepExplanations);
  const isExplaining = useExecutionStore((state) => state.isExplaining);
  const explanationError = useExecutionStore((state) => state.explanationError);
  const explainCurrentStep = useExecutionStore((state) => state.explainCurrentStep);

  const frame = trace?.frames?.[currentStep] ?? null;
  const currentExplanation = stepExplanations[currentStep] || null;

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
    <div className="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-4 text-slate-200">
      {/* ── Top Bar: Step Marker & Action ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
            Step {currentStep}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Line <strong className="text-slate-200">{frame.line}</strong>
          </span>
        </div>

        <button
          onClick={() => explainCurrentStep()}
          disabled={isExplaining}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded transition-all ${
            isExplaining
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : currentExplanation
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30"
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
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <strong className="block font-bold">Explanation Unavailable</strong>
            <span>{explanationError}</span>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {isExplaining && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin opacity-80" />
          <p className="text-xs font-mono text-slate-400 animate-pulse">
            Diffing execution frames and synthesizing grounded explanation...
          </p>
        </div>
      )}

      {/* ── Empty Unrequested State ── */}
      {!isExplaining && !currentExplanation && !explanationError && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">Grounded Step Explainer</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Click <strong className="text-cyan-400">&quot;Explain Step&quot;</strong> to inspect what physically changed in memory on line {frame.line}.
            </p>
          </div>
        </div>
      )}

      {/* ── Structured Explanation Cards ── */}
      {!isExplaining && currentExplanation && (
        <div className="flex-1 space-y-3 min-h-0">
          {/* Summary Card */}
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What Happened</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {currentExplanation.summary}
            </p>
          </div>

          {/* Why It Happened Card */}
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Why It Happened</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentExplanation.why}
            </p>
          </div>

          {/* Observed State Changes */}
          {currentExplanation.changes.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Observed State Transitions</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300 font-mono">
                {currentExplanation.changes.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 shrink-0">▸</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Structure Insight (Optional) */}
          {currentExplanation.dataStructureInsight && (
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/40 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-300 text-xs font-mono font-bold">
                <Network className="w-3.5 h-3.5" />
                <span>Data Structure Insight</span>
              </div>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                {currentExplanation.dataStructureInsight}
              </p>
            </div>
          )}

          {/* Key Learning Point */}
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/30 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-mono font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Key Learning Point</span>
            </div>
            <p className="text-xs text-cyan-100/90 leading-relaxed">
              {currentExplanation.learningPoint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
