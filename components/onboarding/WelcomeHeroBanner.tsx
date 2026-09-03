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
      className="bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-4 py-2 relative z-10 transition-all shadow-sm animate-fade-in-subtle"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Core Message */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="truncate">
            <span className="font-semibold text-slate-100">
              Write real Python. See exactly what happened. Understand why it happened.
            </span>
            <span className="text-slate-400 hidden lg:inline ml-2 text-[11px] font-mono">
              Pyodide 3.12 WebAssembly · sys.settrace · Grounded Pedagogy
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/paths/dsa-foundations"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-sm"
          >
            <Compass className="w-3 h-3" />
            <span>Start Learning</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Code2 className="w-3 h-3" />
            <span>Try Prism</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Dismiss Welcome Banner"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
