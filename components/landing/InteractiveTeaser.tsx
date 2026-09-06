"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Play } from "lucide-react";

type Algo = "bubble" | "binary" | "list";

interface TeaserStepBubble {
  arr: number[];
  comparing: number[];
  swapped: boolean;
  sorted: number[];
  desc: string;
}

interface TeaserStepBinary {
  arr: number[];
  lo: number;
  hi: number;
  mid: number;
  found: boolean;
  desc: string;
}

interface TeaserStepList {
  nodes: number[];
  currIdx: number;
  newNode?: number;
  desc: string;
}

const ALGOS = [
  {
    id: "bubble" as Algo,
    slug: "bubble-sort",
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
      {
        arr: [64, 34, 25, 12, 22],
        comparing: [0, 1] as [number, number],
        swapped: false,
        sorted: [],
        desc: "Compare arr[0] (64) > arr[1] (34)",
      },
      {
        arr: [34, 64, 25, 12, 22],
        comparing: [1, 2] as [number, number],
        swapped: true,
        sorted: [],
        desc: "Swapped! 64 bubbles up rightward",
      },
      {
        arr: [34, 25, 12, 22, 64],
        comparing: [0, 1] as [number, number],
        swapped: false,
        sorted: [4],
        desc: "64 locked into sorted position",
      },
      {
        arr: [25, 12, 22, 34, 64],
        comparing: [1, 2] as [number, number],
        swapped: false,
        sorted: [3, 4],
        desc: "34 locked into sorted position",
      },
      {
        arr: [12, 22, 25, 34, 64],
        comparing: [] as [],
        swapped: false,
        sorted: [0, 1, 2, 3, 4],
        desc: "All elements sorted in O(n²) time!",
      },
    ] as TeaserStepBubble[],
  },
  {
    id: "binary" as Algo,
    slug: "binary-search",
    label: "Binary Search",
    code: [
      "def binary_search(arr, target):",
      "    lo, hi = 0, len(arr) - 1",
      "    while lo <= hi:",
      "        mid = (lo + hi) // 2",
      "        if arr[mid] == target: return mid",
      "        lo, hi = mid + 1, hi",
    ],
    target: 25,
    steps: [
      {
        arr: [3, 8, 12, 19, 25, 31],
        lo: 0,
        hi: 5,
        mid: 2,
        found: false,
        desc: "mid=2 (12) < 25: eliminate left half",
      },
      {
        arr: [3, 8, 12, 19, 25, 31],
        lo: 3,
        hi: 5,
        mid: 4,
        found: true,
        desc: "mid=4 (25) == target 25: MATCH FOUND!",
      },
      {
        arr: [3, 8, 12, 19, 25, 31],
        lo: 4,
        hi: 4,
        mid: 4,
        found: true,
        desc: "Return index 4 in O(log n) time",
      },
    ] as TeaserStepBinary[],
  },
  {
    id: "list" as Algo,
    slug: "linked-list",
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
      {
        nodes: [10, 20, 30],
        currIdx: 0,
        desc: "curr = head (pointing to Node 10)",
      },
      {
        nodes: [10, 20, 30],
        currIdx: 1,
        desc: "curr = curr.next (advances to Node 20)",
      },
      {
        nodes: [10, 20, 30],
        currIdx: 2,
        desc: "curr reaches tail Node 30 (curr.next is None)",
      },
      {
        nodes: [10, 20, 30, 40],
        currIdx: 2,
        newNode: 40,
        desc: "curr.next = Node(40): new node linked in heap!",
      },
    ] as TeaserStepList[],
  },
];

export function InteractiveTeaser() {
  const router = useRouter();
  const [algoIndex, setAlgoIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [inView, setInView] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = ALGOS[algoIndex]!;
  const totalSteps = current.steps.length;

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

  // 2. Automatic stepping & algorithm cycling
  useEffect(() => {
    if (!inView) return;

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
      }, 950);
    } else {
      // Hold on the completed step (1800ms) before cycling to the next algorithm
      transitionTimer.current = setTimeout(() => {
        setAlgoIndex((prev) => (prev + 1) % ALGOS.length);
        setStep(0);
      }, 1800);
    }

    return () => {
      if (stepTimer.current) clearTimeout(stepTimer.current);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [inView, algoIndex, step]);

  // Handle User Topic Switch: immediately reset and start auto-running the new topic
  const handleSelectAlgo = (id: Algo) => {
    if (stepTimer.current) clearTimeout(stepTimer.current);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);

    const idx = ALGOS.findIndex((a) => a.id === id);
    if (idx !== -1) {
      setAlgoIndex(idx);
    }
    setStep(0);
    setIsAutoPlaying(true);
    setRunning(true);
  };

  // Requirement 1: Run Demo opens our main page (Workbench) with that algorithm's code
  const handleOpenWorkbench = () => {
    router.push(`/workbench?algo=${current.slug}`);
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

      <div className="reveal glass-card mt-6 overflow-hidden p-0 border border-slate-300 dark:border-slate-800 shadow-md">
        {/* Teaser Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
              Select an algorithm:
              <select
                value={current.id}
                onChange={(e) => handleSelectAlgo(e.target.value as Algo)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
              >
                {ALGOS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Live Mode Indicator Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
              <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Live Visualizer Preview
            </span>
          </div>

          {/* Requirement 1: Run Demo opens full Workbench with this algorithm */}
          <button
            type="button"
            onClick={handleOpenWorkbench}
            className="btn-base btn-primary text-xs md:text-sm shadow-md shadow-purple-500/20 border border-purple-400 flex items-center gap-1.5 cursor-pointer"
            title="Open in full Workbench with real Python execution"
          >
            <Play className="size-4 fill-white" />
            <span>Run Demo</span>
            <ArrowRight className="size-3.5 ml-0.5" />
          </button>
        </div>

        {/* Code & Real DSA Visualizer Split */}
        <div className="grid md:grid-cols-2">
          {/* Left: Code Stepper */}
          <pre className="border-b border-slate-300 dark:border-slate-800 p-4 font-mono text-[11px] leading-6 md:border-b-0 md:border-r bg-slate-50/40 dark:bg-slate-950/40 overflow-x-auto">
            {current.code.map((l, i) => (
              <div
                key={i}
                className={`-mx-1 rounded px-1.5 transition-colors ${
                  running && i === codeLine
                    ? "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-semibold border-l-2 border-cyan-500"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="mr-3 text-slate-400 dark:text-slate-500 select-none">
                  {running && i === codeLine ? "►" : " "}
                </span>
                {l}
              </div>
            ))}
          </pre>

          {/* Right: Original DSA Visualizer Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/30 dark:bg-slate-900/20 min-h-[260px]">
            {/* 1. Bubble Sort Visualizer */}
            {current.id === "bubble" && (
              <div className="w-full flex flex-col items-center gap-5">
                {(() => {
                  const stepData = (current.steps as TeaserStepBubble[])[step] || current.steps[0] as TeaserStepBubble;
                  return (
                    <>
                      <div className="flex flex-wrap items-end justify-center gap-2 pt-6 pb-2">
                        {stepData.arr.map((val, idx) => {
                          const isComparing = stepData.comparing.includes(idx);
                          const isSorted = stepData.sorted.includes(idx);

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1.5">
                              {/* Pointer label above */}
                              <div className="h-5 flex items-center justify-center">
                                {isComparing && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-bold shadow-xs animate-bounce">
                                    {idx === stepData.comparing[0] ? "j" : "j+1"}
                                  </span>
                                )}
                              </div>

                              {/* Array Element Card */}
                              <div
                                className={`w-11 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold shadow-sm transition-all duration-300 ${
                                  isSorted
                                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 scale-105 shadow-emerald-500/10"
                                    : isComparing
                                    ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 scale-110 shadow-amber-500/20"
                                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                }`}
                              >
                                {val}
                              </div>

                              {/* Index subscript */}
                              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                [{idx}]
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Transition description */}
                      <div className="text-center space-y-1">
                        <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {stepData.desc}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          step {step + 1} of {totalSteps}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* 2. Binary Search Visualizer */}
            {current.id === "binary" && (
              <div className="w-full flex flex-col items-center gap-5">
                {(() => {
                  const stepData = (current.steps as TeaserStepBinary[])[step] || current.steps[0] as TeaserStepBinary;
                  return (
                    <>
                      <div className="flex flex-wrap items-end justify-center gap-2 pt-6 pb-2">
                        {stepData.arr.map((val, idx) => {
                          const isLo = idx === stepData.lo;
                          const isHi = idx === stepData.hi;
                          const isMid = idx === stepData.mid;
                          const inRange = idx >= stepData.lo && idx <= stepData.hi;
                          const isTarget = stepData.found && isMid;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1.5">
                              {/* Pointer badges above */}
                              <div className="h-5 flex items-center justify-center gap-0.5">
                                {isMid && (
                                  <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold shadow-xs">
                                    mid
                                  </span>
                                )}
                                {isLo && !isMid && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-500 text-white font-mono text-[9px] font-bold shadow-xs">
                                    lo
                                  </span>
                                )}
                                {isHi && !isMid && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-500 text-white font-mono text-[9px] font-bold shadow-xs">
                                    hi
                                  </span>
                                )}
                              </div>

                              {/* Array Element Card */}
                              <div
                                className={`w-11 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold shadow-sm transition-all duration-300 ${
                                  isTarget
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 scale-110 shadow-emerald-500/25 ring-2 ring-emerald-400/50"
                                    : isMid
                                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-800 dark:text-cyan-300 scale-105 shadow-cyan-500/15"
                                    : inRange
                                    ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                    : "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-40"
                                }`}
                              >
                                {val}
                              </div>

                              {/* Index subscript */}
                              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                [{idx}]
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Transition description */}
                      <div className="text-center space-y-1">
                        <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {stepData.desc}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          target: 25 · step {step + 1} of {totalSteps}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* 3. Linked List Insert Visualizer */}
            {current.id === "list" && (
              <div className="w-full flex flex-col items-center gap-5 overflow-x-auto py-2">
                {(() => {
                  const stepData = (current.steps as TeaserStepList[])[step] || current.steps[0] as TeaserStepList;
                  return (
                    <>
                      <div className="flex items-center gap-2 pt-6 pb-2 min-w-max">
                        {stepData.nodes.map((val, idx) => {
                          const isHead = idx === 0;
                          const isCurr = idx === stepData.currIdx;
                          const isNew = val === stepData.newNode;

                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex flex-col items-center gap-1.5">
                                {/* Pointer badge above */}
                                <div className="h-5 flex items-center justify-center gap-1">
                                  {isHead && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-bold shadow-xs">
                                      head
                                    </span>
                                  )}
                                  {isCurr && (
                                    <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold shadow-xs">
                                      curr
                                    </span>
                                  )}
                                </div>

                                {/* Linked List Node Compartment: [ val | next ] */}
                                <div
                                  className={`flex rounded-lg border-2 overflow-hidden shadow-sm transition-all duration-300 ${
                                    isNew
                                      ? "bg-purple-500/10 border-purple-500 text-purple-800 dark:text-purple-300 scale-105 shadow-purple-500/20"
                                      : isCurr
                                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-800 dark:text-cyan-300 shadow-cyan-500/20"
                                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                  }`}
                                >
                                  <div className="px-3 py-2 font-mono text-sm font-bold border-r border-slate-300 dark:border-slate-700">
                                    {val}
                                  </div>
                                  <div className="px-2 py-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                    •
                                  </div>
                                </div>

                                {/* Heap Object Label */}
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                  Node({val})
                                </span>
                              </div>

                              {/* Directional SVG pointer arrow */}
                              <svg width="28" height="14" className="shrink-0" aria-hidden="true">
                                <line
                                  x1="0"
                                  y1="7"
                                  x2="22"
                                  y2="7"
                                  stroke="currentColor"
                                  className="text-cyan-500"
                                  strokeWidth="2"
                                />
                                <polygon
                                  points="22,3 28,7 22,11"
                                  fill="currentColor"
                                  className="text-cyan-500"
                                />
                              </svg>
                            </div>
                          );
                        })}

                        {/* None terminal */}
                        <div className="flex flex-col items-center gap-1.5 pt-5">
                          <span className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold shadow-2xs">
                            None
                          </span>
                        </div>
                      </div>

                      {/* Transition description */}
                      <div className="text-center space-y-1">
                        <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {stepData.desc}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          step {step + 1} of {totalSteps}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveTeaser;
