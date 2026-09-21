"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code2, Play, ArrowRight, Terminal, Layers, Sparkles } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";

const WORKBENCH_SNIPPETS = [
  {
    id: "arrays",
    title: "Dynamic Array & Traversal",
    visType: "1D Array",
    complexity: "O(n)",
    code: `# Dynamic Array Operations
numbers = [10, 25, 40, 55, 70]
numbers[1] = 99  # In-place update: O(1)
numbers.append(85)  # Amortized O(1)

total = 0
for x in numbers:  # Traversal: O(n)
    total += x
print("Sum:", total)`,
  },
  {
    id: "linked-list",
    title: "Singly Linked List Traversal",
    visType: "Linked List",
    complexity: "O(n)",
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(10)
head.next = Node(20)
head.next.next = Node(30)

curr = head
while curr:
    print(curr.val)
    curr = curr.next`,
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort Algorithm",
    visType: "1D Array Swaps",
    complexity: "O(n²)",
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
];

export default function HomeWorkbenchCard() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeSnippet = WORKBENCH_SNIPPETS[selectedIdx];

  return (
    <SpotlightCard className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header with Title & Snippet Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive Quick Workbench
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Real Python 3 WebAssembly Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {WORKBENCH_SNIPPETS.map((snippet, idx) => (
              <button
                key={snippet.id}
                onClick={() => setSelectedIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedIdx === idx
                    ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {snippet.visType}
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview Frame */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#070a13] p-3 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500/80" />
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              <span className="ml-1 font-semibold text-slate-600 dark:text-slate-400">{activeSnippet.title}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold">
              {activeSnippet.complexity}
            </span>
          </div>
          <pre className="text-slate-800 dark:text-slate-200 leading-5 overflow-x-auto max-h-48 text-[11px]">
            {activeSnippet.code}
          </pre>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>Synchronized AST micro-step execution</span>
        </span>

        <Link
          href="/workbench"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-semibold shadow-xs hover:shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span>Launch in Workbench</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </SpotlightCard>
  );
}
