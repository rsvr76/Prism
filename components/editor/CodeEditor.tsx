"use client";

import React, { useRef, useEffect, useState } from "react";
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
import { traceRunner } from "@/lib/execution/traceRunner";
import { getAllAlgorithms } from "@/lib/content/algorithms";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "arrays", label: "Arrays" },
  { id: "lists", label: "Linked Lists" },
  { id: "sorting", label: "Sorting" },
  { id: "trees", label: "Trees" },
  { id: "recursion", label: "Recursion" },
] as const;

export default function CodeEditor() {
  const code = useExecutionStore((state) => state.code);
  const setCode = useExecutionStore((state) => state.setCode);
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const trace = useExecutionStore((state) => state.trace);
  const isVisualizing = useExecutionStore((state) => state.isVisualizing);
  const executeCode = useExecutionStore((state) => state.executeCode);
  const visualizeCode = useExecutionStore((state) => state.visualizeCode);
  const reset = useExecutionStore((state) => state.reset);
  const isRunning = useExecutionStore((state) => state.isRunning);
  const isExecuting = useExecutionStore((state) => state.isExecuting);
  const isVisualizingRun = useExecutionStore((state) => state.isVisualizingRun);
  const status = useExecutionStore((state) => state.status);
  const errorMessage = useExecutionStore((state) => state.errorMessage);
  const { isDark } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const isOutputOpen = useOutputTabStore((state) => state.isOpen);
  const openOutput = useOutputTabStore((state) => state.openOutput);
  const closeOutput = useOutputTabStore((state) => state.closeOutput);
  const toggleOutput = useOutputTabStore((state) => state.toggleOutput);

  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const handleVisualizeRef = useRef<() => void>(() => {});

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to visualize
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleVisualizeRef.current();
    });
  };

  // Pre-warm Pyodide execution Web Worker in the background as soon as editor mounts
  useEffect(() => {
    traceRunner.init();
  }, []);

  // Sync active line highlighting with currentStep ONLY during visualization
  useEffect(() => {
    if (!editorRef.current || !isVisualizing || !trace || !trace.frames || trace.frames.length === 0) {
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
  }, [currentStep, trace, isVisualizing]);

  const currentFrame = trace?.frames?.[currentStep];

  const handleExecute = async () => {
    openOutput();
    try {
      await executeCode();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVisualize = async () => {
    closeOutput();
    try {
      await visualizeCode();
    } catch (err) {
      console.error(err);
    }
  };

  handleVisualizeRef.current = handleVisualize;

  const allAlgorithms = getAllAlgorithms();
  const filteredAlgorithms = allAlgorithms.filter((algo) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "arrays") {
      return algo.id === "ds-array" || algo.tags.includes("indexing") || algo.tags.includes("searching") || algo.visualizationType === "1d_array";
    }
    if (selectedCategory === "lists") {
      return algo.id === "ds-linked-list" || algo.tags.includes("pointers") || algo.visualizationType === "singly_linked_list";
    }
    if (selectedCategory === "sorting") {
      return algo.tags.includes("sorting") || algo.name.toLowerCase().includes("sort");
    }
    if (selectedCategory === "trees") {
      return algo.visualizationType === "binary_tree" || algo.tags.includes("tree") || algo.id === "ds-binary-tree";
    }
    if (selectedCategory === "recursion") {
      return algo.tags.includes("recursion") || algo.tags.includes("recursive");
    }
    return true;
  });

  const hasOutputOrError =
    (trace?.frames && trace.frames.length > 0) ||
    (status !== "SUCCESS" && status !== "RUNNING" && status !== "IDLE" && errorMessage);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0a0f1d] border border-slate-300 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 dark:bg-slate-900/70 border-b border-slate-300 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Python 3.12 Editor</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-200/60 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400 border border-slate-300/80 dark:border-slate-700/60">
            Ctrl+Enter to Run
          </span>
          {isVisualizing && currentFrame?.line ? (
            <span className="text-cyan-700 dark:text-cyan-400 font-medium">Executing Line {currentFrame.line}</span>
          ) : (
            <span>Ready</span>
          )}
        </div>
      </div>

      {/* Preset Category Filters & Snippet Selector Bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/90 dark:bg-[#070d18]/90 border-b border-slate-300 dark:border-slate-800/60 overflow-x-auto no-scrollbar text-xs shrink-0">
        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
          Presets:
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-500/40"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="h-3 w-px bg-slate-300 dark:bg-slate-800 mx-1 shrink-0" />
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {filteredAlgorithms.slice(0, 6).map((algo) => (
            <button
              key={algo.id}
              onClick={() => {
                loadAlgorithmCode(algo.name, algo.pythonCode);
              }}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
              title={`Load ${algo.name} code`}
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <Editor
          height="100%"
          language="python"
          theme={isDark ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            glyphMargin: true,
            folding: false,
            lineDecorationsWidth: 12,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        />
      </div>

      {/* Code Editor Bottom Action Bar: 1. Execute | 2. Visualize */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-t border-slate-300 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0a0f1d] shrink-0 gap-2">
        {/* Action Buttons: 1st Execute, 2nd Visualize */}
        <div className="flex items-center gap-2">
          {/* Button 1: Execute (runs code and displays output in center tab) */}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-700/50 shadow-xs hover:shadow-emerald-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Execute Python code to display output"
          >
            {isExecuting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isExecuting ? "Executing..." : "Execute"}</span>
          </button>

          {/* Button 2: Visualize (runs code and renders DSA structures) */}
          <button
            onClick={handleVisualize}
            disabled={isVisualizingRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs border border-cyan-700/50 shadow-xs hover:shadow-cyan-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Visualize data structures and execution trace"
          >
            {isVisualizingRun ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>{isVisualizingRun ? "Visualizing..." : "Visualize"}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              reset();
              closeOutput();
            }}
            disabled={isExecuting && isVisualizingRun}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
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
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-400 font-semibold dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700 shadow-2xs"
                  : "bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs"
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
            <span className="text-cyan-600 dark:text-cyan-400 animate-pulse">
              {traceRunner.isWorkerReady() ? "Running Python..." : "Initializing Python..."}
            </span>
          )}
          {status === "SUCCESS" && trace && (
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isVisualizing ? `${trace.totalSteps} steps` : "Executed"}</span>
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
