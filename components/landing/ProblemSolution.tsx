"use client";

import React from "react";
import { Skull, Microscope, ArrowDown, X, Check } from "lucide-react";
import { PrismVectorMark } from "@/components/branding/PrismLogo";

const PROBLEMS = [
  {
    Icon: Skull,
    title: "Static Diagrams Lie",
    body: "Textbook illustrations never match your code. They show an idealized array, not the one you just mutated.",
    pain: "You memorize a picture instead of the behaviour.",
  },
  {
    Icon: Microscope,
    title: "Raw Debuggers Overwhelm",
    body: "Memory addresses without context teach nothing. A pdb dump is raw data, not understanding.",
    pain: "You read numbers with no idea which line caused them.",
  },
];

const FIXES = [
  "Your own code runs in real Python 3, so what you see is what actually executed.",
  "Every step shows the heap memory state before and after the line that changed it.",
  "AI explanations cite your trace diff line-by-line, so nothing is hallucinated or invented.",
];

export function ProblemSolution() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white reveal max-w-2xl">
        Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400">Prism</span>?
      </h2>
      <p className="reveal mt-3 max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
        Traditional ways of learning data structures fail students. Here is what breaks, and what Prism does instead.
      </p>

      <p className="reveal mt-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rose-500 font-bold">
        <X className="size-4" aria-hidden="true" /> The Problem
      </p>

      <div className="reveal-stagger mt-3 grid gap-5 md:grid-cols-2">
        {PROBLEMS.map(({ Icon, title, body, pain }, i) => (
          <article
            key={title}
            style={{ "--delay": `${i * 120}ms` } as React.CSSProperties}
            className="glass-card border-l-4 border-l-rose-500 p-6"
          >
            <Icon className="size-6 text-rose-500/80" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{body}</p>
            <p className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 font-mono text-xs text-rose-500">
              {pain}
            </p>
          </article>
        ))}
      </div>

      <div className="reveal mt-6 flex justify-center text-slate-400">
        <ArrowDown className="size-5 animate-bounce" aria-hidden="true" />
      </div>

      <p className="reveal mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-500 font-bold">
        <Check className="size-4" aria-hidden="true" /> The Solution
      </p>

      <article className="reveal glass-card-brand mt-3 grid gap-6 p-6 md:p-8 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div>
          <PrismVectorMark className="w-8 h-8 mb-2" />
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Prism Bridges the Gap</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Real execution. Real heap memory. Grounded explanations — every pedagogical claim is read straight from your runtime trace diff.
          </p>
        </div>
        <ul className="space-y-3">
          {FIXES.map((f) => (
            <li key={f} className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export default ProblemSolution;
