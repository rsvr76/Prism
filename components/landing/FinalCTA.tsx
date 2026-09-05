"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FloatingGraph } from "./animations/FloatingGraph";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-y border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-500/10 via-cyan-500/5 to-purple-500/10 dark:from-purple-950/20 dark:via-cyan-950/10 dark:to-purple-950/20">
      <FloatingGraph />
      <div className="relative mx-auto max-w-3xl px-5 py-12 md:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Ready to See Inside Your Code?</h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
          No account. No installation. Pure execution ground truth running directly in your browser.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/workbench" className="btn-base btn-primary shadow-lg shadow-purple-500/25">
            Start Learning Free <ArrowRight className="size-4" />
          </Link>
          <Link href="/library" className="btn-base btn-ghost">
            Browse Algorithm Library
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
