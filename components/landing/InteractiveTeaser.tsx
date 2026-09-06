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
  const [algoIndex, setAlgoIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [hasUserOverridden, setHasUserOverridden] = useState(false);
  const [inView, setInView] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = ALGOS[algoIndex]!;
  const done = step >= current.steps.length - 1;

  // 1. Detect when teaser section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Automatic stepping & algorithm cycling when scrolled into view (unless user took over)
  useEffect(() => {
    if (!inView || hasUserOverridden) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    setIsAutoPlaying(true);
    setRunning(true);

    const currentAlgo = ALGOS[algoIndex]!;
    if (step < currentAlgo.steps.length - 1) {
      stepTimer.current = setTimeout(() => {
        setStep((s) => s + 1);
      }, 750);
    } else {
      // Hold on the completed step (1500ms) before cycling to the next algorithm
      transitionTimer.current = setTimeout(() => {
        setAlgoIndex((prev) => (prev + 1) % ALGOS.length);
        setStep(0);
      }, 1500);
    }

    return () => {
      if (stepTimer.current) clearTimeout(stepTimer.current);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [inView, hasUserOverridden, algoIndex, step]);

  // 3. User-enabled stepping when user manually triggers "Run Demo"
  useEffect(() => {
    if (!hasUserOverridden || !running) return;

    const currentAlgo = ALGOS[algoIndex]!;
    if (step < currentAlgo.steps.length - 1) {
      stepTimer.current = setTimeout(() => {
        setStep((s) => s + 1);
      }, 700);
    } else {
      setRunning(false);
    }

    return () => {
      if (stepTimer.current) clearTimeout(stepTimer.current);
    };
  }, [hasUserOverridden, running, algoIndex, step]);

  // Handle User Click on "Run Demo": immediately stop auto-play and run user demo
  const handleUserRun = () => {
    if (stepTimer.current) clearTimeout(stepTimer.current);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setHasUserOverridden(true);
    setIsAutoPlaying(false);
    setStep(0);
    setRunning(true);
  };

  // Handle User Selection in dropdown: immediately stop auto-play and switch topic
  const handleSelectAlgo = (id: Algo) => {
    if (stepTimer.current) clearTimeout(stepTimer.current);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setHasUserOverridden(true);
    setIsAutoPlaying(false);
    setRunning(false);
    const idx = ALGOS.findIndex((a) => a.id === id);
    if (idx !== -1) {
      setAlgoIndex(idx);
    }
    setStep(0);
  };

  const codeLine = Math.min(step + 1, current.code.length - 1);

  return (
    <section
      id="teaser"
      ref={sectionRef}
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 md:py-16"
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white reveal">
        Interactive Algorithm Teaser
      </h2>
      <p className="reveal mt-3 max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
        Step through execution states in real-time. In the full Workbench, Prism runs real Python 3 code with interactive memory visualizers.
      </p>

      <div className="reveal glass-card mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              Select an algorithm:
              <select
                value={current.id}
                onChange={(e) => handleSelectAlgo(e.target.value as Algo)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 shadow-2xs outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {ALGOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Mode Indicator Badge */}
            {isAutoPlaying && !hasUserOverridden ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Auto-Playing Preview
              </span>
            ) : hasUserOverridden ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-700 dark:text-purple-300 font-semibold">
                <span className="size-1.5 rounded-full bg-purple-500" />
                Interactive Mode
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleUserRun}
            className="btn-base btn-primary text-xs md:text-sm shadow-md shadow-purple-500/20"
          >
            <Play className="size-4" /> {running && hasUserOverridden ? "Running…" : "Run Demo"}
          </button>
        </div>

        <div className="grid md:grid-cols-2">
          <pre className="border-b border-slate-300 dark:border-slate-800 p-4 font-mono text-[11px] leading-6 md:border-b-0 md:border-r border-slate-300 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
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
                  key={`${algoIndex}-${step}-${i}`}
                  className={`min-w-9 rounded-md border px-3 py-2 text-center font-mono text-xs transition-all duration-300 ${
                    done
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "border-purple-300 dark:border-purple-500/30 bg-white dark:bg-slate-800 text-purple-800 dark:text-cyan-300 font-semibold shadow-xs"
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
          <div className="new-node border-t border-slate-300 dark:border-slate-800 bg-purple-500/10 dark:bg-purple-950/20 px-4 py-4 text-center">
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
