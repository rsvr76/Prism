"use client";

import React from "react";
import NumberTicker from "@/components/ui/NumberTicker";

const STATS = [
  { label: "Verified Algorithms", value: 56, suffix: "+" },
  { label: "Deterministic Tracing", value: 100, suffix: "%" },
  { label: "Unit Tests Passing", value: 327, suffix: " Tests" },
  { label: "AI Hallucination", value: 0, suffix: "%" },
];

const STACK = [
  "Python 3.12",
  "WebAssembly",
  "Monaco Editor",
  "React Flow",
  "React 19",
  "Next.js 15",
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0f1d]/60 backdrop-blur-md py-6 space-y-5">
      {/* Live Platform Metric Tickers */}
      <div className="mx-auto max-w-6xl px-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              <NumberTicker value={stat.value} suffix={stat.suffix} />
            </div>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mt-0.5">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tech Stack Ribbon */}
      <div className="reveal-stagger mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2.5 px-5 pt-1 border-t border-slate-100 dark:border-slate-800/40">
        <span className="text-xs uppercase tracking-widest font-mono text-slate-400 dark:text-slate-500 font-semibold">
          Built with:
        </span>
        {STACK.map((name, i) => (
          <span
            key={name}
            style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}
            className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 cursor-default"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
