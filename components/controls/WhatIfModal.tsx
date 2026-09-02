"use client";

import React, { useEffect, useRef } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { GitBranch, X, Play, Loader2, Sparkles, AlertCircle } from "lucide-react";
import Editor, { OnMount } from "@monaco-editor/react";

export default function WhatIfModal() {
  const isWhatIfOpen = useExecutionStore((state) => state.isWhatIfOpen);
  const whatIfDraftCode = useExecutionStore((state) => state.whatIfDraftCode);
  const whatIfParentStep = useExecutionStore((state) => state.whatIfParentStep);
  const isRunning = useExecutionStore((state) => state.isRunning);
  const trace = useExecutionStore((state) => state.trace);
  const closeWhatIfModal = useExecutionStore((state) => state.closeWhatIfModal);
  const setWhatIfDraftCode = useExecutionStore((state) => state.setWhatIfDraftCode);
  const createBranch = useExecutionStore((state) => state.createBranch);

  const parentFrame = trace?.frames?.[whatIfParentStep] || null;

  // Accessibility: Close on Escape key
  useEffect(() => {
    if (!isWhatIfOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRunning) {
        closeWhatIfModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWhatIfOpen, isRunning, closeWhatIfModal]);

  if (!isWhatIfOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-purple-950/60 border-b border-purple-800/40 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-300">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>What-If Code Branching</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-purple-300 font-normal">
                  Ref: Step {whatIfParentStep + 1}
                </span>
              </h3>
              <p className="text-[11px] text-purple-300/80">
                Modify code below to run an independent ground-truth execution branch.
              </p>
            </div>
          </div>

          <button
            onClick={closeWhatIfModal}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reference Banner */}
        <div className="px-5 py-2 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Parent State:</span>
            <span className="text-slate-300 font-semibold">Step {whatIfParentStep + 1}</span>
            {parentFrame && (
              <span className="text-amber-400">· Line {parentFrame.line} ({parentFrame.eventType})</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 italic">
            *Fresh real execution of modified program
          </span>
        </div>

        {/* Monaco Editor for Branch Code */}
        <div className="flex-1 min-h-[300px] h-[350px] bg-slate-950">
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={whatIfDraftCode}
            onChange={(val) => setWhatIfDraftCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              glyphMargin: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-t border-slate-800 text-xs">
          <div className="text-slate-400 text-[11px]">
            Original trace remains untouched and accessible at any time.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={closeWhatIfModal}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => createBranch()}
              disabled={isRunning || !whatIfDraftCode.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Execute Branch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
