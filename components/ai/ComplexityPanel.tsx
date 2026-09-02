"use client";

import React from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import {
  Activity,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  HardDrive,
  Info,
  RefreshCw,
} from "lucide-react";

export default function ComplexityPanel() {
  const trace = useExecutionStore((state) => state.trace);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const complexityAnalyses = useExecutionStore((state) => state.complexityAnalyses);
  const isAnalyzingComplexity = useExecutionStore((state) => state.isAnalyzingComplexity);
  const complexityError = useExecutionStore((state) => state.complexityError);
  const analyzeComplexity = useExecutionStore((state) => state.analyzeComplexity);

  const analysis = activeExecutionId ? complexityAnalyses[activeExecutionId] || null : null;

  if (!trace || !activeExecutionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6 font-mono">
        <Activity className="w-8 h-8 opacity-20" />
        <p className="text-xs text-center">
          Run your Python program to analyze<br />its Time & Space Complexity (Big-O).
        </p>
      </div>
    );
  }

  const getTimeColor = (timeClass: string) => {
    switch (timeClass) {
      case "O(1)":
      case "O(log n)":
        return "bg-emerald-950/80 border-emerald-500/40 text-emerald-400";
      case "O(n)":
      case "O(n log n)":
        return "bg-cyan-950/80 border-cyan-500/40 text-cyan-400";
      case "O(n²)":
        return "bg-amber-950/80 border-amber-500/40 text-amber-400";
      case "O(n³)":
      case "exponential":
        return "bg-rose-950/80 border-rose-500/40 text-rose-400";
      default:
        return "bg-slate-900 border-slate-700 text-slate-400";
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-4 text-slate-200 font-mono text-xs">
      {/* ── Top Bar: Action & Status ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">Big-O Complexity Analysis</span>
        </div>

        <button
          onClick={() => analyzeComplexity()}
          disabled={isAnalyzingComplexity}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isAnalyzingComplexity ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing Trace...</span>
            </>
          ) : analysis ? (
            <>
              <RefreshCw className="w-3 h-3" />
              <span>Re-Analyze</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              <span>Analyze Complexity</span>
            </>
          )}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {complexityError && (
        <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{complexityError}</span>
        </div>
      )}

      {/* ── Initial Empty Prompt ── */}
      {!analysis && !isAnalyzingComplexity && !complexityError && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-8">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-semibold text-slate-200">Grounded Complexity Engine</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculates loop repetitions, recursion stack depth, and heap scaling from your actual execution trace.
            </p>
          </div>
          <button
            onClick={() => analyzeComplexity()}
            className="mt-2 px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Compute Big-O Metrics
          </button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {isAnalyzingComplexity && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-8 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs">Extracting loop nesting and measuring execution scaling...</p>
        </div>
      )}

      {/* ── Rendered Analysis Results ── */}
      {analysis && !isAnalyzingComplexity && (
        <div className="space-y-4">
          {/* Complexity Class Badges */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Time Complexity */}
            <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${getTimeColor(analysis.timeComplexity)}`}>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider opacity-80">
                <Clock className="w-3 h-3" />
                <span>Time Complexity</span>
              </div>
              <span className="text-xl font-black mt-0.5 tracking-tight">{analysis.timeComplexity}</span>
            </div>

            {/* Space Complexity */}
            <div className="p-3 rounded-lg border bg-slate-950/80 border-slate-800 text-slate-300 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <HardDrive className="w-3 h-3" />
                <span>Space Complexity</span>
              </div>
              <span className="text-xl font-black text-slate-100 mt-0.5 tracking-tight">{analysis.spaceComplexity}</span>
            </div>

            {/* Confidence */}
            <div className="p-3 rounded-lg border bg-slate-950/80 border-slate-800 text-slate-300 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Confidence</span>
              </div>
              <span className="text-sm font-bold text-slate-200 mt-1 capitalize">{analysis.confidence}</span>
            </div>
          </div>

          {/* Pedagogical Summary */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Algorithmic Rationale</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{analysis.why}</p>
          </div>

          {/* Measured Trace Evidence */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Measured Trace Facts</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {analysis.evidence.map((ev, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold shrink-0">▸</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Total Steps:</span>
              <strong className="text-slate-200">{analysis.metrics.totalSteps}</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Max Line Repetitions:</span>
              <strong className="text-amber-400">{analysis.metrics.maxLineExecutionCount}x</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Max Stack Depth:</span>
              <strong className="text-slate-200">{analysis.metrics.maxCallStackDepth}</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Peak Heap Objects:</span>
              <strong className="text-slate-200">{analysis.metrics.peakHeapObjects}</strong>
            </div>
          </div>

          {/* Educational Caveats */}
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1 text-slate-300 font-bold">
              <Info className="w-3 h-3 text-slate-400" />
              <span>Educational Limitation & Caveats</span>
            </div>
            <ul className="space-y-0.5 pl-3 list-disc text-slate-500">
              {analysis.caveats.map((cav, idx) => (
                <li key={idx}>{cav}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
