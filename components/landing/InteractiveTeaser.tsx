"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

type Algo = "bubble" | "binary" | "list";

const ALGOS: { id: Algo; label: string; code: string[]; steps: string[][] }[] = [
  {
    id: "bubble",
    label: "Bubble Sort",
    code: [
      "def bubble_sort(arr):",
      "    n = len(arr)",
      "    for i in range(n):",
      "        for j in range(n - i - 1):",
      "            if arr[j] > arr[j+1]:",
      "                arr[j], arr[j+1] = arr[j+1], arr[j]",
    ],
    steps: [
      ["64", "34", "25", "12", "22", "11"],
      ["34", "25", "12", "22", "11", "64"],
      ["25", "12", "22", "11", "34", "64"],
      ["12", "22", "11", "25", "34", "64"],
      ["11", "12", "22", "25", "34", "64"],
    ],
  },
  {
    id: "binary",
    label: "Binary Search",
    code: [
      "def binary_search(arr, target):",
      "    lo, hi = 0, len(arr) - 1",
      "    while lo <= hi:",
      "        mid = (lo + hi) // 2",
      "        if arr[mid] == target: return mid",
      "        lo, hi = mid + 1, hi",
    ],
    steps: [
      ["3", "8", "12", "19", "25", "31"],
      ["·", "·", "·", "19", "25", "31"],
      ["·", "·", "·", "·", "25", "31"],
      ["·", "·", "·", "·", "25", "·"],
      ["✓", "found 25 at index 4", "", "", "", ""],
    ],
  },
  {
    id: "list",
    label: "Linked List Insert",
    code: [
      "def insert(head, val):",
      "    curr = head",
      "    while curr.next:",
      "        curr = curr.next",
      "    curr.next = Node(val)",
      "    return head",
    ],
    steps: [
      ["1", "→", "null", "", "", ""],
      ["1", "→", "2", "→", "null", ""],
      ["1", "→", "2", "→", "3", "→ null"],
      ["1", "→", "2", "→", "3", "→ 7"],
      ["✓", "4 nodes linked", "", "", "", ""],
    ],
  },
];

export function InteractiveTeaser() {
  const [algo, setAlgo] = useState<Algo>("bubble");
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = ALGOS.find((a) => a.id === algo)!;
  const done = step >= current.steps.length - 1 && !running;

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const run = () => {
    if (timer.current) clearInterval(timer.current);
    setStep(0);
    setRunning(true);
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= current.steps.length - 1) {
          if (timer.current) clearInterval(timer.current);
          setRunning(false);
          return s;
        }
        return s + 1;
      });
    }, 700);
  };

  const codeLine = Math.min(step + 1, current.code.length - 1);

  return (
    <section id="teaser" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-20">
      <h2 className="text-section reveal font-bold text-slate-900 dark:text-white">Try It Now.</h2>
      <p className="reveal mt-3 max-w-xl text-slate-600 dark:text-slate-400">
        A preview of execution step navigation. The full Pyodide execution engine, AST validator, and interactive memory canvas load in the Workbench.
      </p>

      <div className="reveal glass-card mt-8 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            Select an algorithm:
            <select
              value={algo}
              onChange={(e) => {
                setAlgo(e.target.value as Algo);
                setStep(0);
                setRunning(false);
                if (timer.current) clearInterval(timer.current);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {ALGOS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={run}
            className="btn-base btn-primary text-xs md:text-sm shadow-md shadow-purple-500/20"
          >
            <Play className="size-4" /> {running ? "Running…" : "Run Demo"}
          </button>
        </div>

        <div className="grid md:grid-cols-2">
          <pre className="border-b border-slate-200 dark:border-slate-800 p-4 font-mono text-[11px] leading-6 md:border-b-0 md:border-r bg-slate-50/40 dark:bg-slate-950/40">
            {current.code.map((l, i) => (
              <div
                key={i}
                className={`-mx-1 overflow-x-auto rounded px-1.5 transition-colors ${
                  running && i === codeLine
                    ? "bg-purple-500/20 text-purple-700 dark:text-cyan-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="mr-3 text-slate-400 dark:text-slate-500">
                  {running && i === codeLine ? "►" : " "}
                </span>
                {l}
              </div>
            ))}
          </pre>

          <div className="flex flex-col items-center justify-center gap-4 p-6 bg-slate-50/10 dark:bg-transparent">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {(current.steps[step] ?? []).filter(Boolean).map((cell, i) => (
                <span
                  key={`${step}-${i}`}
                  className={`min-w-9 rounded-md border px-3 py-2 text-center font-mono text-xs transition-all duration-300 ${
                    done
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "border-purple-500/25 bg-white dark:bg-slate-800 text-purple-700 dark:text-cyan-300 font-semibold shadow-sm"
                  }`}
                >
                  {cell}
                </span>
              ))}
            </div>
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              step {step + 1} of {current.steps.length}
            </p>
          </div>
        </div>

        {done && step > 0 && (
          <div className="new-node border-t border-slate-200 dark:border-slate-800 bg-purple-500/10 dark:bg-purple-950/20 px-4 py-4 text-center">
            <Link
              href="/workbench"
              className="btn-base btn-primary shadow-lg shadow-purple-500/20"
            >
              Open Full Interactive Workbench <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default InteractiveTeaser;
