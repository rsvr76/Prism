"use client";

import React from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { Play, RotateCcw, Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

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
];

export default function ExecutionHeader() {
  const isRunning = useExecutionStore((state) => state.isRunning);
  const status = useExecutionStore((state) => state.status);
  const trace = useExecutionStore((state) => state.trace);
  const runCode = useExecutionStore((state) => state.runCode);
  const reset = useExecutionStore((state) => state.reset);
  const setCode = useExecutionStore((state) => state.setCode);

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
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-950 border-b border-slate-800 shadow-md">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            PRISM
          </h1>
          <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
            Phase 2: Execution & Tracing Engine
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Preset:</span>
        <select
          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
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

      {/* Status Badge & Controls */}
      <div className="flex items-center gap-3">
        {getStatusBadge()}

        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>Run Trace</span>
        </button>

        <button
          onClick={reset}
          disabled={isRunning}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Reset State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
