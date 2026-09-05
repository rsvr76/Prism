"use client";

import React, { useEffect, useRef, useState } from "react";

type Frame = {
  values: number[];
  compare: [number, number] | null;
  sortedFrom: number;
  swapped: boolean;
};

const SEED = [38, 72, 14, 90, 26, 58, 8, 66, 44, 22, 81, 33];

function buildFrames(input: number[]): Frame[] {
  const arr = [...input];
  const frames: Frame[] = [];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      const swapped = arr[j]! > arr[j + 1]!;
      if (swapped) {
        const t = arr[j]!;
        arr[j] = arr[j + 1]!;
        arr[j + 1] = t;
      }
      frames.push({
        values: [...arr],
        compare: [j, j + 1],
        sortedFrom: n - i,
        swapped,
      });
    }
  }
  frames.push({ values: [...arr], compare: null, sortedFrom: 0, swapped: false });
  return frames;
}

const FRAMES = buildFrames(SEED);
const MAX = Math.max(...SEED);

export function SortingBars() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIndex(FRAMES.length - 1);
      return;
    }
    const last = index === FRAMES.length - 1;
    timer.current = setTimeout(
      () => setIndex(last ? 0 : index + 1),
      last ? 2000 : 120
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index]);

  const frame = FRAMES[index]!;
  const [i, j] = frame.compare ?? [-1, -1];
  const done = frame.compare === null;

  return (
    <div className="space-y-4">
      <div
        className="glass-card flex h-[300px] items-end gap-1.5 p-5 sm:gap-2 sm:p-6"
        aria-hidden="true"
      >
        {frame.values.map((v, idx) => {
          const comparing = idx === i || idx === j;
          const sorted = done || (frame.sortedFrom > 0 && idx >= frame.sortedFrom);
          return (
            <div
              key={idx}
              data-state={sorted ? "sorted" : comparing ? "comparing" : "idle"}
              className={`flex-1 rounded-t-sm transition-all duration-300 ${
                sorted
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  : comparing
                    ? "bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    : "bg-purple-500/60 dark:bg-purple-600/60"
              }`}
              style={{ height: `${(v / MAX) * 100}%` }}
            />
          );
        })}
      </div>

      {/* Step card sits below the chart so it never covers the bars */}
      <div className="rounded-xl border border-purple-500/25 dark:border-purple-500/20 bg-white/90 dark:bg-slate-900/90 p-3.5 font-mono text-[11px] leading-relaxed shadow-lg shadow-purple-500/5 dark:shadow-black/40 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-500 dark:text-slate-400">
          <span>
            Step {index + 1} of {FRAMES.length}
          </span>
          <span className="text-emerald-500 font-semibold">● live trace</span>
        </div>
        <p className="text-purple-600 dark:text-cyan-400 font-semibold">
          arr[{Math.max(i, 0)}] ↔ arr[{Math.max(j, 0)}]
        </p>
        <p className="text-slate-700 dark:text-slate-200">
          {done
            ? "array sorted, 0 inversions remain"
            : frame.swapped
              ? `swap: ${frame.values[j]!} < ${frame.values[i]!}`
              : `hold: ${frame.values[i]!} ≤ ${frame.values[j]!}`}
        </p>
        <p className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-500 dark:text-slate-400">
          <span className="text-purple-600 dark:text-purple-400 font-semibold">Prism explains:</span> bubble pass{" "}
          {Math.min(FRAMES.length - 1, index) < FRAMES.length - 1 ? "in progress" : "complete"}.
        </p>
      </div>
    </div>
  );
}

export default SortingBars;
