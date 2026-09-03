"use client";

import React from "react";
import Link from "next/link";
import { useExecutionStore } from "@/store/useExecutionStore";
import {
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Menu,
  Compass,
} from "lucide-react";
import WhatIfModal from "@/components/controls/WhatIfModal";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";

// Quick Starter Python Code Presets for common DSA concepts
export const PRESETS = [
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

print("Total sum:", total)`,
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
];

export default function ExecutionHeader() {
  const isRunning = useExecutionStore((state) => state.isRunning);
  const status = useExecutionStore((state) => state.status);
  const trace = useExecutionStore((state) => state.trace);
  const runCode = useExecutionStore((state) => state.runCode);
  const reset = useExecutionStore((state) => state.reset);
  const setCode = useExecutionStore((state) => state.setCode);

  const executions = useExecutionStore((state) => state.executions);
  const executionIds = useExecutionStore((state) => state.executionIds);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const switchExecution = useExecutionStore((state) => state.switchExecution);
  const loadedAlgorithmTitle = useExecutionStore((state) => state.loadedAlgorithmTitle);
  const loadedLessonContext = useExecutionStore((state) => state.loadedLessonContext);
  const toggleDrawer = useNavDrawerStore((state) => state.toggleDrawer);

  const getStatusBadge = () => {
    switch (status) {
      case "SUCCESS":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Executed ({trace?.totalSteps} steps)</span>
          </div>
        );
      case "RUNNING":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-xs font-mono animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Tracing Execution...</span>
          </div>
        );
      case "SYNTAX_ERROR":
      case "RUNTIME_ERROR":
      case "TIMEOUT":
      case "TRACE_LIMIT":
      case "RECURSION_LIMIT":
      case "OUTPUT_LIMIT":
      case "UNSUPPORTED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed: {status}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Ready</span>
          </div>
        );
    }
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between gap-3 px-4 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-xs z-20 select-none">
        {/* Left Side: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDrawer}
            aria-label="Navigation menu"
            className="p-2 -ml-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                PRISM
              </h1>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono tracking-wider uppercase leading-none mt-1">
                DSA Learning Environment
              </p>
            </div>
          </Link>

          {/* Active Lesson or Algorithm Context Badges */}
          {loadedLessonContext ? (
            <Link
              href={`/paths/${loadedLessonContext.pathSlug}/${loadedLessonContext.lessonSlug}`}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:text-purple-900 hover:border-purple-300 dark:hover:text-purple-200 dark:hover:border-purple-400 text-xs font-mono transition-colors shrink-0"
              title="Return to Guided Lesson"
            >
              <Compass className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span className="text-slate-500 dark:text-slate-400">Lesson:</span>
              <span className="font-semibold text-purple-800 dark:text-purple-200 truncate max-w-[140px]">{loadedLessonContext.lessonTitle}</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 underline ml-1">Return →</span>
            </Link>
          ) : loadedAlgorithmTitle ? (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-mono shrink-0">
              <span className="text-slate-500 dark:text-slate-400">Loaded:</span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-200 truncate max-w-[140px]">{loadedAlgorithmTitle}</span>
            </div>
          ) : null}

          {/* Phase 6A: Branch Switcher Tabs */}
          {executionIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 p-1 rounded-lg font-mono text-xs overflow-x-auto max-w-xs shrink-0">
              {executionIds.map((id) => {
                const exec = executions[id];
                if (!exec) return null;

                const isActive = activeExecutionId === id;
                const isBranch = exec.type === "branch";

                return (
                  <button
                    key={id}
                    onClick={() => switchExecution(id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      isActive
                        ? isBranch
                          ? "bg-purple-100 text-purple-900 border border-purple-300 font-bold dark:bg-purple-900 dark:text-purple-200 dark:border-purple-400"
                          : "bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-400"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isBranch && <GitBranch className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                    <span>{exec.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />
        </div>
      </header>

      {/* Mount What-If Branch Modal */}
      <WhatIfModal />
    </>
  );
}
