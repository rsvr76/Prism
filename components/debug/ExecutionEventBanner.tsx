"use client";

import React from "react";
import { SemanticExecutionEvent } from "@/lib/execution/semanticEventClassifier";
import {
  Sparkles,
  GitBranch,
  Code2,
  Terminal,
  Activity,
  ArrowRightLeft,
  CheckCircle2,
  Repeat,
  AlertCircle,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface ExecutionEventBannerProps {
  event: SemanticExecutionEvent | null;
  className?: string;
}

function getCategoryIcon(category: string, isStructural: boolean) {
  switch (category) {
    case "definition":
      return <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    case "object-created":
      return <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "pointer-updated":
      return <GitBranch className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />;
    case "value-updated":
      return <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
    case "swap":
      return <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "iteration":
      return <Repeat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
    case "output":
      return <Terminal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />;
    case "error":
      return <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />;
    default:
      return isStructural ? (
        <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
      );
  }
}

function getCategoryBadgeStyle(category: string, isStructural: boolean) {
  switch (category) {
    case "definition":
      return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700/50";
    case "object-created":
    case "swap":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/50";
    case "pointer-updated":
      return "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700/50";
    case "value-updated":
      return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700/50";
    case "iteration":
    case "branch":
      return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/50";
    case "error":
      return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/50";
    default:
      return isStructural
        ? "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700/50"
        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:border-slate-800";
  }
}

export default function ExecutionEventBanner({ event, className = "" }: ExecutionEventBannerProps) {
  if (!event) return null;

  const icon = getCategoryIcon(event.category, event.isStructural);
  const badgeStyle = getCategoryBadgeStyle(event.category, event.isStructural);

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md shadow-xs transition-all select-none text-xs ${
        event.isStructural
          ? "bg-white/95 dark:bg-[#0c1322]/95 border-cyan-300/80 dark:border-cyan-500/40"
          : "bg-white/95 dark:bg-[#0c1322]/95 border-slate-200 dark:border-slate-800"
      } ${className}`}
      role="status"
      aria-label={`Execution Event: ${event.badgeLabel} at Step ${event.stepIndex + 1}`}
    >
      {/* Left: Step index & Category Pill */}
      <div className="flex items-center gap-2 shrink-0 min-w-0">
        <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Step {event.stepIndex + 1}
        </span>

        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold ${badgeStyle}`}>
          {icon}
          <span className="truncate max-w-[120px]">{event.badgeLabel}</span>
        </div>
      </div>

      {/* Middle: Concise Event Summary */}
      <div className="flex-1 min-w-0 px-1 text-slate-800 dark:text-slate-200 font-medium truncate text-xs">
        <span>{event.summary}</span>
      </div>

      {/* Right: Line Citation & Structural Tag */}
      <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono">
        {event.isStructural && (
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 text-[10px] font-semibold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Visual Mutation</span>
          </span>
        )}
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
          Line {event.line}
        </span>
      </div>
    </div>
  );
}
