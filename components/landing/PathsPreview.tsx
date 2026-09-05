"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PATHS = [
  {
    id: "dsa-foundations",
    dot: "bg-emerald-500",
    level: "Beginner",
    title: "DSA Foundations",
    meta: "6 stages · 10 lessons",
    cta: "Start Path",
  },
  {
    id: "trees-graphs",
    dot: "bg-amber-500",
    level: "Intermediate",
    title: "Trees & Graphs",
    meta: "4 stages · 8 lessons",
    cta: "Preview Path",
  },
  {
    id: "dynamic-programming",
    dot: "bg-rose-500",
    level: "Advanced",
    title: "Dynamic Programming",
    meta: "5 stages · 12 lessons",
    cta: "Preview Path",
  },
];

export function PathsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white reveal">
        Guided Learning Paths
      </h2>
      <p className="reveal mt-3 max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
        Structured curriculum sequences that build intuitions from memory array indexing to recursive tree traversal.
      </p>

      <div className="reveal-stagger mt-8 flex snap-x gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
        {PATHS.map((p, i) => (
          <article
            key={p.id}
            style={{ "--delay": `${i * 120}ms` } as React.CSSProperties}
            className="glass-card min-w-[16rem] flex-1 snap-start p-6 flex flex-col justify-between"
          >
            <div>
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className={`size-2.5 rounded-full ${p.dot}`} aria-hidden="true" />
                {p.level}
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{p.meta}</p>
            </div>
            <Link
              href={`/paths/${p.id}`}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-cyan-400 hover:text-purple-700 dark:hover:text-cyan-300 transition-colors"
            >
              {p.cta} <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PathsPreview;
