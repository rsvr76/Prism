"use client";

import React from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import Link from "next/link";
import {
  Play,
  RotateCcw,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  GitBranch,
  BookOpen,
  Code2,
  Compass,
  Target,
  LayoutDashboard,
} from "lucide-react";
import WhatIfModal from "./WhatIfModal";

const PRESETS = [
  {
    name: "Linked List Traversal",
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(10)
head.next = Node(20)
head.next.next = Node(30)

total = 0
curr = head
while curr:
    total += curr.val
    curr = curr.next

print("Sum:", total)`,
  },
  {
    name: "Recursive Factorial",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(4)
print("Factorial(4) =", result)`,
  },
  {
    name: "Bubble Sort",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [5, 2, 8, 1, 4]
sorted_arr = bubble_sort(numbers)
print("Sorted:", sorted_arr)`,
  },
  {
    name: "Circular Linked List",
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

a = Node(1)
b = Node(2)
a.next = b
b.next = a  # Circular reference

print("Circular reference created:", a.val, "->", a.next.val, "->", a.next.next.val)`,
  },
  {
    name: "Binary Search Tree",
    code: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# Build BST: 8 -> (3 -> 1, 6), (10 -> None, 14)
root = Node(8)
root.left = Node(3)
root.right = Node(10)
root.left.left = Node(1)
root.left.right = Node(6)
root.right.right = Node(14)

# In-order traversal
def inorder(node):
    if not node:
        return []
    return inorder(node.left) + [node.value] + inorder(node.right)

values = inorder(root)
print("Inorder traversal:", values)`,
  },
];

export default function ExecutionHeader() {
  const isRunning = useExecutionStore((state) => state.isRunning);
  const status = useExecutionStore((state) => state.status);
  const trace = useExecutionStore((state) => state.trace);
  const runCode = useExecutionStore((state) => state.runCode);
  const reset = useExecutionStore((state) => state.reset);
  const setCode = useExecutionStore((state) => state.setCode);

  // Phase 6A: Execution history & branch switching
  const executions = useExecutionStore((state) => state.executions);
  const executionIds = useExecutionStore((state) => state.executionIds);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const switchExecution = useExecutionStore((state) => state.switchExecution);
  const loadedAlgorithmTitle = useExecutionStore((state) => state.loadedAlgorithmTitle);
  const loadedLessonContext = useExecutionStore((state) => state.loadedLessonContext);

  const getStatusBadge = () => {
    switch (status) {
      case "SUCCESS":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Executed ({trace?.totalSteps} steps)</span>
          </div>
        );
      case "RUNNING":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Tracing Execution...</span>
          </div>
        );
      case "SYNTAX_ERROR":
      case "RUNTIME_ERROR":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-400 text-xs font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
      case "TIMEOUT":
      case "TRACE_LIMIT":
      case "RECURSION_LIMIT":
      case "OUTPUT_LIMIT":
      case "UNSUPPORTED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        );
    }
  };

  return (
    <>
      <header className="h-14 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20 gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              PRISM
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase leading-none mt-1">
              DSA Learning Environment
            </p>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 p-1 rounded-lg text-xs font-medium shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-all bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Algorithm Library</span>
          </Link>
          <Link
            href="/paths"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Learning Paths</span>
          </Link>
          <Link
            href="/practice"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Practice</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Active Lesson or Algorithm Context Badges */}
        {loadedLessonContext ? (
          <Link
            href={`/paths/${loadedLessonContext.pathSlug}/${loadedLessonContext.lessonSlug}`}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-purple-200 hover:border-purple-400 text-xs font-mono transition-colors shrink-0"
            title="Return to Guided Lesson"
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Lesson:</span>
            <span className="font-semibold text-purple-200 truncate max-w-[140px]">{loadedLessonContext.lessonTitle}</span>
            <span className="text-[10px] text-purple-400 underline ml-1">Return →</span>
          </Link>
        ) : loadedAlgorithmTitle ? (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono shrink-0">
            <span className="text-slate-400">Loaded:</span>
            <span className="font-semibold text-cyan-200 truncate max-w-[140px]">{loadedAlgorithmTitle}</span>
          </div>
        ) : null}

        {/* Phase 6A: Branch Switcher Tabs */}
        {executionIds.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/90 p-1 rounded-lg font-mono text-xs overflow-x-auto max-w-xs shrink-0">
            {executionIds.map((id) => {
              const exec = executions[id];
              if (!exec) return null;
              const isActive = id === activeExecutionId;
              const isBranch = exec.type === "branch";

              return (
                <button
                  key={id}
                  onClick={() => switchExecution(id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? isBranch
                        ? "bg-purple-900/80 border border-purple-500/50 text-purple-200 font-bold shadow-xs"
                        : "bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 font-bold shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {isBranch ? (
                    <GitBranch className="w-3 h-3 text-purple-400 shrink-0" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                  )}
                  <span>{exec.label}</span>
                  {exec.trace && (
                    <span className="text-[10px] opacity-70">
                      ({exec.trace.totalSteps})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Preset Selector & Run Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Preset Selector */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Preset</span>
            <select
              className="bg-slate-900/90 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono cursor-pointer"
              onChange={(e) => {
                const selected = PRESETS.find((p) => p.name === e.target.value);
                if (selected) {
                  setCode(selected.code);
                  reset();
                }
              }}
            >
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Badge */}
          <div className="hidden md:block">
            {getStatusBadge()}
          </div>

          {/* Run Trace CTA */}
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Trace</span>
          </button>

          {/* Reset button */}
          <button
            onClick={reset}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-40"
            title="Reset All Executions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mount What-If Branch Modal */}
      <WhatIfModal />
    </>
  );
}
