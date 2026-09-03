"use client";

import React, { useEffect } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { GitBranch, X, Play, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function WhatIfModal() {
  const isWhatIfOpen = useExecutionStore((state) => state.isWhatIfOpen);
  const whatIfDraftCode = useExecutionStore((state) => state.whatIfDraftCode);
  const whatIfParentStep = useExecutionStore((state) => state.whatIfParentStep);
  const isRunning = useExecutionStore((state) => state.isRunning);
  const trace = useExecutionStore((state) => state.trace);
  const closeWhatIfModal = useExecutionStore((state) => state.closeWhatIfModal);
  const setWhatIfDraftCode = useExecutionStore((state) => state.setWhatIfDraftCode);
  const createBranch = useExecutionStore((state) => state.createBranch);
  const { isDark } = useTheme();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 font-mono">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-purple-100/80 dark:bg-purple-950/60 border-b border-purple-200 dark:border-purple-800/40 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-200/80 dark:bg-purple-900/60 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>What-If Code Branching</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-300 font-normal">
                  Ref: Step {whatIfParentStep + 1}
                </span>
              </h3>
              <p className="text-[11px] text-purple-800 dark:text-purple-300/80">
                Modify code below to run an independent ground-truth execution branch.
              </p>
            </div>
          </div>

          <button
            onClick={closeWhatIfModal}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reference Banner */}
        <div className="px-5 py-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Parent State:</span>
            <span className="text-slate-800 dark:text-slate-300 font-semibold">Step {whatIfParentStep + 1}</span>
            {parentFrame && (
              <span className="text-amber-600 dark:text-amber-400">· Line {parentFrame.line} ({parentFrame.eventType})</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 italic">
            *Fresh real execution of modified program
          </span>
        </div>

        {/* Monaco Editor for Branch Code */}
        <div className="flex-1 min-h-[300px] h-[350px] bg-white dark:bg-slate-950">
          <Editor
            height="100%"
            language="python"
            theme={isDark ? "vs-dark" : "vs"}
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
        <div className="flex items-center justify-between px-5 py-3 bg-slate-100/90 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-600 dark:text-slate-400 text-[11px]">
            Original trace remains untouched and accessible at any time.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={closeWhatIfModal}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => createBranch()}
              disabled={isRunning || !whatIfDraftCode.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
