"use client";

import React from "react";
import { useOutputTabStore } from "@/store/useOutputTabStore";
import { useExecutionStore } from "@/store/useExecutionStore";
import { Terminal, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ExecutionOutputTab() {
  const isOpen = useOutputTabStore((state) => state.isOpen);
  const closeOutput = useOutputTabStore((state) => state.closeOutput);

  const isRunning = useExecutionStore((state) => state.isRunning);
  const status = useExecutionStore((state) => state.status);
  const errorMessage = useExecutionStore((state) => state.errorMessage);
  const trace = useExecutionStore((state) => state.trace);

  if (!isOpen) return null;

  // Get full stdout lines from the completed trace, or current step
  const stdout = trace?.frames?.[trace.frames.length - 1]?.stdout || [];
  const lineCount = stdout.length;

  // Adapt container sizing based on output magnitude
  const isCompact = lineCount <= 2 && !errorMessage;

  return (
    <div
      role="region"
      aria-label="Execution Output"
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col pointer-events-auto bg-slate-900/95 dark:bg-[#070b16]/95 backdrop-blur-md border border-slate-700/80 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 ${
        isCompact ? "w-[300px] sm:w-[340px]" : "w-[90vw] sm:w-[420px] md:w-[480px]"
      }`}
      style={{ maxHeight: "calc(100% - 32px)" }}
    >
      {/* Output Header */}
      <div className="h-9 px-3 bg-slate-800/90 dark:bg-slate-950/80 border-b border-slate-700/60 dark:border-slate-800/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Execution Output</span>
          {isRunning ? (
            <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Running...</span>
            </span>
          ) : status === "SUCCESS" ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>{lineCount} line{lineCount === 1 ? "" : "s"}</span>
            </span>
          ) : status !== "IDLE" ? (
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono">
              <AlertCircle className="w-3 h-3" />
              <span>Failed</span>
            </span>
          ) : null}
        </div>

        <button
          onClick={closeOutput}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Close output tab"
          aria-label="Close output tab"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output Body */}
      <div className="p-3 overflow-y-auto font-mono text-xs text-slate-200 space-y-1 custom-scrollbar max-h-72">
        {isRunning ? (
          <div className="flex items-center gap-2 text-slate-400 italic py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Executing Python code in Pyodide...</span>
          </div>
        ) : status !== "SUCCESS" && status !== "IDLE" && errorMessage ? (
          <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 space-y-1">
            <div className="font-bold text-[11px] uppercase tracking-wide text-rose-400">
              {status}
            </div>
            <div className="break-words text-[11px] leading-relaxed">{errorMessage}</div>
          </div>
        ) : stdout.length > 0 ? (
          stdout.map((line, idx) => (
            <div key={idx} className="flex gap-2 text-emerald-300 leading-relaxed break-words">
              <span className="text-slate-600 select-none">&gt;</span>
              <span>{line}</span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic py-2">
            &gt; Program executed successfully with no print output.
          </div>
        )}
      </div>
    </div>
  );
}
