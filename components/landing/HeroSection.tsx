"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Hexagon } from "lucide-react";
import { SortingBars } from "./animations/SortingBars";

const PHRASES = [
  "Write Real Python.",
  "See Exactly What Happened.",
  "Understand Why It Happened.",
  "DSA Learning, Reimagined.",
];

function useTypewriter() {
  const [text, setText] = useState("");
  const [phrase, setPhrase] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const full = PHRASES[phrase]!;
    if (!erasing && text === full) {
      const t = setTimeout(() => setErasing(true), 1800);
      return () => clearTimeout(t);
    }
    if (erasing && text === "") {
      setErasing(false);
      setPhrase((p) => (p + 1) % PHRASES.length);
      return;
    }
    const t = setTimeout(
      () => setText(erasing ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1)),
      erasing ? 30 : 55
    );
    return () => clearTimeout(t);
  }, [text, erasing, phrase]);

  return text;
}

export function HeroSection() {
  const typed = useTypewriter();

  return (
    <section className="relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3.5 py-1.5 text-xs font-medium tracking-wide">
            <Hexagon className="size-3.5 text-cyan-500" aria-hidden="true" />
            <span className="shimmer-text font-semibold">Execution-Grounded DSA Learning</span>
          </span>

          <h1 className="text-hero mt-6 min-h-[2.4em] font-bold">
            <span aria-live="polite" className="gradient-text">
              {typed}
            </span>
            <span className="typewriter-cursor" aria-hidden="true" />
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Prism runs your code in a real Python 3 sandbox, records every memory mutation step by
            step, and explains exactly why it happened — no simulations, no guesswork.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/workbench" className="btn-base btn-primary shadow-lg shadow-purple-500/25">
              Start Learning Free <ArrowRight className="size-4" />
            </Link>
            <a href="#teaser" className="btn-base btn-ghost">
              Try Quick Demo <Play className="size-4" />
            </a>
          </div>

          <p className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            <span>✦ Zero Account Needed</span>
            <span aria-hidden="true">·</span>
            <span>✦ Runs In-Browser (Pyodide)</span>
            <span aria-hidden="true">·</span>
            <span>✦ 100% Free & Open Source</span>
          </p>
        </div>

        <div className="pb-4 lg:pb-0">
          <SortingBars />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
