"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  GraduationCap,
  X,
  Compass,
  CheckCircle2,
  Eye,
  HelpCircle,
} from "lucide-react";

interface WelcomeHeroBannerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = "prism_welcome_dismissed_v1";

export default function WelcomeHeroBanner({ forceOpen, onClose }: WelcomeHeroBannerProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // Default true for SSR safety
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (forceOpen !== undefined) {
      setIsDismissed(!forceOpen);
      return;
    }
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
  }, [forceOpen]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
    if (onClose) onClose();
  };

  if (!mounted || isDismissed) {
    return null;
  }

  return (
    <section
      aria-label="Welcome to Prism"
      className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 border-b border-cyan-500/30 px-4 sm:px-6 py-4 relative z-10 transition-all shadow-lg animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Core Message & Pipeline */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Core Prism Invariant</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Real Python Execution • Sandboxed • Grounded
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Write real Python. See exactly what happened. Understand why it happened.
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Prism executes genuine Python 3.12 in an in-browser WebAssembly sandbox, produces an immutable step-by-step trace, and pairs memory visualization with grounded AI pedagogical explanations.
          </p>

          {/* Visual Core Pipeline Flow */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
              Python Code
            </span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-blue-300">
              Sandboxed Execution
            </span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-300">
              PrismTrace
            </span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300">
              Visuals + Grounded AI
            </span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-200 font-bold">
              Student Understanding
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          <Link
            href="/paths/dsa-foundations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Start Learning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Try Prism</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Dismiss Welcome Banner"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
