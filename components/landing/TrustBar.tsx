"use client";

import React from "react";

const STACK = [
  "Python 3.12",
  "WebAssembly",
  "Gemini 2.5",
  "Monaco Editor",
  "React 19",
  "Next.js 15",
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 dark:border-slate-800/60 bg-slate-50/60 dark:bg-[#0a0f1d]/40 py-5">
      <div className="reveal-stagger mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5">
        <span className="text-xs uppercase tracking-widest font-mono text-slate-500 dark:text-slate-400">
          Built with:
        </span>
        {STACK.map((name, i) => (
          <span
            key={name}
            style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}
            className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 transition-colors hover:text-purple-600 dark:hover:text-cyan-400 cursor-default"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
