"use client";

import React, { useEffect, useState } from "react";

const SEQ = [
  [] as number[],
  [1],
  [1, 2],
  [1, 2, 3],
];

export function LinkedListAnim() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (SEQ.length + 1)), 1400);
    return () => clearInterval(id);
  }, []);

  const nodes = SEQ[Math.min(step, SEQ.length - 1)] ?? [];

  return (
    <div className="glass-card flex h-[300px] flex-col justify-center gap-6 p-6" aria-hidden="true">
      {/* fixed-height rail so adding nodes never resizes the card */}
      <div className="flex h-16 items-center gap-2 overflow-hidden">
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">head →</span>
        {nodes.map((n, idx) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex overflow-hidden rounded-lg border border-purple-500/30 bg-slate-100 dark:bg-slate-900 font-mono text-xs ${
                idx === nodes.length - 1 ? "new-node shadow-[0_0_12px_rgba(168,85,247,0.3)]" : ""
              }`}
            >
              <span className="border-r border-purple-500/25 px-3 py-2 text-purple-600 dark:text-cyan-400 font-semibold">{n}</span>
              <span className="px-3 py-2 text-slate-500 dark:text-slate-400">next</span>
            </div>
            <svg width="34" height="12" className="shrink-0" aria-hidden="true">
              <line
                key={`${n}-${nodes.length}`}
                x1="0"
                y1="6"
                x2="30"
                y2="6"
                stroke="currentColor"
                className="text-cyan-500 pointer-arrow"
                strokeWidth="1.5"
              />
              <path d="M28 2 L34 6 L28 10" fill="none" stroke="currentColor" className="text-cyan-500" strokeWidth="1.5" />
            </svg>
          </div>
        ))}
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">null</span>
      </div>

      <pre className="h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 p-2.5 font-mono text-[11px] leading-relaxed text-purple-600 dark:text-cyan-400">
        <code>{`curr.next = Node(${nodes.length || 1})`}</code>
      </pre>
    </div>
  );
}

export default LinkedListAnim;
