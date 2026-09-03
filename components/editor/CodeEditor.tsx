"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  Play,
  RotateCcw,
  Loader2,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useOutputTabStore } from "@/store/useOutputTabStore";

export default function CodeEditor() {
  const code = useExecutionStore((state) => state.code);
  const setCode = useExecutionStore((state) => state.setCode);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const trace = useExecutionStore((state) => state.trace);
  const runCode = useExecutionStore((state) => state.runCode);
  const reset = useExecutionStore((state) => state.reset);
  const isRunning = useExecutionStore((state) => state.isRunning);
  const status = useExecutionStore((state) => state.status);
  const errorMessage = useExecutionStore((state) => state.errorMessage);
  const { isDark } = useTheme();

  const isOutputOpen = useOutputTabStore((state) => state.isOpen);
  const openOutput = useOutputTabStore((state) => state.openOutput);
  const closeOutput = useOutputTabStore((state) => state.closeOutput);
  const toggleOutput = useOutputTabStore((state) => state.toggleOutput);

  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Sync active line highlighting with currentStep
  useEffect(() => {
    if (!editorRef.current || !trace || !trace.frames || trace.frames.length === 0) {
      if (editorRef.current && decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    const currentFrame = trace.frames[currentStep];
    if (!currentFrame || !currentFrame.line) return;

    const line = currentFrame.line;

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
      {
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "prism-active-line-highlight",
          glyphMarginClassName: "prism-active-glyph-arrow",
        },
      },
    ]);

    editorRef.current.revealLineInCenterIfOutsideViewport(line);
  }, [currentStep, trace]);

  const currentFrame = trace?.frames?.[currentStep];

  const handleExecute = async () => {
    openOutput();
    await runCode();
  };

  const handleVisualize = async () => {
    if (!trace) {
      await runCode();
    }
  };

  const hasOutputOrError =
    (trace?.frames && trace.frames.length > 0) ||
    (status !== "SUCCESS" && status !== "RUNNING" && status !== "IDLE" && errorMessage);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs dark:shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Python 3.12 Editor</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          {currentFrame?.line ? (
            <span className="text-cyan-700 dark:text-cyan-400 font-medium">Executing Line {currentFrame.line}</span>
          ) : (
            <span>Ready</span>
          )}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <Editor
          height="100%"
          language="python"
          theme={isDark ? "vs-dark" : "vs"}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            lineHeight: 22,
            lineNumbers: "on",
            glyphMargin: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* Code Editor Bottom Action Bar: 1. Execute | 2. Visualize */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0a0f1d] shrink-0 gap-2">
        {/* Action Buttons: 1st Execute, 2nd Visualize */}
        <div className="flex items-center gap-2">
          {/* Button 1: Execute (runs code and displays output in center tab) */}
          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm hover:shadow-emerald-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Execute Python code to display output"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isRunning ? "Executing..." : "Execute"}</span>
          </button>

          {/* Button 2: Visualize (runs code and renders DSA structures) */}
          <button
            onClick={handleVisualize}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-sm hover:shadow-cyan-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Visualize data structures and execution trace"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualize</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              reset();
              closeOutput();
            }}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-40"
            title="Reset Code & Execution"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Output Tab Toggle Button */}
          {hasOutputOrError && (
            <button
              onClick={toggleOutput}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                isOutputOpen
                  ? "bg-slate-800 text-emerald-300 border border-slate-700 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
              title="Toggle execution output tab"
            >
              <Terminal className="w-3 h-3 text-emerald-500" />
              <span>Output</span>
            </button>
          )}
        </div>

        {/* Execution Status / Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {status === "RUNNING" && (
            <span className="text-cyan-600 dark:text-cyan-400 animate-pulse">Running Python...</span>
          )}
          {status === "SUCCESS" && trace && (
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{trace.totalSteps} steps</span>
            </span>
          )}
          {status !== "SUCCESS" && status !== "RUNNING" && status !== "IDLE" && (
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{status}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
