"use client";

import React from "react";
import {
  Tv,
  Boxes,
  Cpu,
  Check,
  X,
  Terminal,
} from "lucide-react";
import { PrismVectorMark } from "@/components/branding/PrismLogo";

interface ComparisonCard {
  icon: React.ElementType;
  badge: string;
  badgeType: "danger" | "warning" | "success";
  title: string;
  verdict: string;
  points: { type: "negative" | "positive"; text: string }[];
  accentColor: string;
}

const COMPARISONS: ComparisonCard[] = [
  {
    icon: Tv,
    badge: "Passive Lectures",
    badgeType: "danger",
    title: "Static Video Tutorials",
    verdict: "You watch idealized slides, but freeze when coding alone.",
    points: [
      { type: "negative", text: "Pre-drawn diagrams that never match your code" },
      { type: "negative", text: "Zero insight into runtime heap mutations" },
    ],
    accentColor: "border-l-rose-500 hover:border-rose-400/80",
  },
  {
    icon: Boxes,
    badge: "Pre-Baked Demos",
    badgeType: "warning",
    title: "Synthetic Visualizers",
    verdict: "Canned animations that break on your own custom logic.",
    points: [
      { type: "negative", text: "Hardcoded scripts unable to trace user code" },
      { type: "negative", text: "Disconnected from actual Python memory" },
    ],
    accentColor: "border-l-amber-500 hover:border-amber-400/80",
  },
  {
    icon: Cpu,
    badge: "Live WebAssembly",
    badgeType: "success",
    title: "Prism Ground Truth",
    verdict: "Executes real Python step by step. What you code is what you see.",
    points: [
      { type: "positive", text: "True heap pointers extracted via sys.settrace" },
      { type: "positive", text: "AI tutor grounded strictly in trace diffs" },
    ],
    accentColor: "border-l-cyan-500 ring-1 ring-cyan-500/20 hover:border-cyan-400",
  },
];

const MATRIX_PILLS = [
  { label: "Your Custom Code", status: "Native Python 3", highlight: true },
  { label: "Memory State", status: "Deterministic Heap Trace", highlight: true },
  { label: "AI Explanations", status: "Trace Diff Citations", highlight: true },
  { label: "Setup Required", status: "Zero Install (In-Browser)", highlight: false },
];

export function ProblemSolution() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      {/* Header */}
      <div className="max-w-2xl">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white reveal">
          Why{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">
            Prism
          </span>
          ?
        </h2>
        <p className="reveal mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Traditional DSA learning relies on passive videos or canned diagrams that crumble under custom code.
          Prism replaces guesswork with verifiable runtime execution.
        </p>
      </div>

      {/* 3-Card Comparison Grid */}
      <div className="reveal-stagger mt-8 grid gap-5 md:grid-cols-3">
        {COMPARISONS.map((card, i) => {
          const Icon = card.icon;
          const isPrism = card.badgeType === "success";

          return (
            <article
              key={card.title}
              style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}
              className={`glass-card relative flex flex-col justify-between p-6 border-l-4 transition-all duration-300 ${
                card.accentColor
              } ${isPrism ? "bg-cyan-500/[0.03] dark:bg-cyan-950/20 shadow-lg shadow-cyan-500/5" : ""}`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl border ${
                      card.badgeType === "danger"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        : card.badgeType === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-cyan-500/10 border-cyan-500/30 text-cyan-500 dark:text-cyan-400"
                    }`}
                  >
                    {isPrism ? (
                      <PrismVectorMark className="size-6 prism-logo" />
                    ) : (
                      <Icon className="size-5" aria-hidden="true" />
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                      card.badgeType === "danger"
                        ? "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60"
                        : card.badgeType === "warning"
                        ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60"
                        : "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700/60"
                    }`}
                  >
                    {isPrism && (
                      <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                    {card.badge}
                  </span>
                </div>

                {/* Card Title & Verdict */}
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {card.verdict}
                </p>

                {/* Feature checklist */}
                <ul className="mt-4 space-y-2.5 border-t border-slate-300 dark:border-slate-800/80 pt-4 text-xs font-mono">
                  {card.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {pt.type === "negative" ? (
                        <X className="size-3.5 shrink-0 text-rose-500 mt-0.5" aria-hidden="true" />
                      ) : (
                        <Check className="size-3.5 shrink-0 text-emerald-500 mt-0.5" aria-hidden="true" />
                      )}
                      <span
                        className={
                          pt.type === "negative"
                            ? "text-slate-500 dark:text-slate-400"
                            : "text-slate-800 dark:text-slate-200 font-medium"
                        }
                      >
                        {pt.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Micro Indicator */}
              <div className="mt-6 pt-3 border-t border-slate-300/80 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 dark:text-slate-500">Execution Model</span>
                <span
                  className={`font-semibold ${
                    isPrism
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {isPrism ? "Ground Truth" : "Simulation"}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Interactive Micro-Matrix Bar */}
      <div className="reveal mt-6 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-900/50 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          <Terminal className="size-3.5 text-cyan-500" aria-hidden="true" />
          <span>Prism Runtime Guarantee</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MATRIX_PILLS.map((pill) => (
            <div
              key={pill.label}
              className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800/70 shadow-2xs"
            >
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {pill.label}
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {pill.highlight && (
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                )}
                {pill.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemSolution;
