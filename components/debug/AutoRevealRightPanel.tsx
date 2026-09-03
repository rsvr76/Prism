"use client";

import React, { useState } from "react";
import ExecutionStatePanel from "@/components/debug/ExecutionStatePanel";
import { Sparkles, Pin, PinOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useExecutionStore } from "@/store/useExecutionStore";

export default function AutoRevealRightPanel() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const currentStep = useExecutionStore((state) => state.currentStep);
  const trace = useExecutionStore((state) => state.trace);
  const currentFrame = trace?.frames?.[currentStep];

  const isRevealed = isHovered || isPinned;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isPinned) setIsHovered(false);
      }}
      className={`fixed right-0 top-14 bottom-14 z-40 flex items-stretch will-change-transform select-none ${
        isRevealed ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        transition: "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Peek Tab attached to the left edge of the panel */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <button
          onClick={() => {
            if (isPinned) {
              setIsPinned(false);
              setIsHovered(false);
            } else {
              setIsPinned(true);
            }
          }}
          className={`flex flex-col items-center justify-center py-3 px-1.5 rounded-l-xl border-l border-t border-b shadow-xl cursor-pointer transition-colors ${
            isRevealed
              ? "bg-cyan-500 text-white border-cyan-400 dark:bg-cyan-600"
              : "bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400"
          }`}
          title={isPinned ? "Unpin panel (auto-hide)" : "Click to pin panel open"}
          aria-label="Toggle AI and Diagnostics panel"
        >
          {isRevealed ? (
            <ChevronRight className="w-4 h-4 mb-1" />
          ) : (
            <ChevronLeft className="w-4 h-4 mb-1" />
          )}
          <Sparkles className="w-4 h-4 text-cyan-400 mb-2" />
          <span
            className="text-[10px] font-bold font-mono tracking-widest uppercase [writing-mode:vertical-lr] rotate-180"
          >
            AI &amp; Inspector
          </span>
          {currentFrame && (
            <span className="mt-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Drawer Shell */}
      <div className="w-[90vw] sm:w-[420px] md:w-[450px] lg:w-[460px] h-full flex flex-col bg-white dark:bg-[#070a13] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Drawer Header with Pin and Close Controls */}
        <div className="h-10 px-3 bg-slate-100/90 dark:bg-[#0a0f1d] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>AI Pedagogy &amp; Diagnostics</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin Toggle */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                isPinned
                  ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
              title={isPinned ? "Panel is pinned. Click to auto-hide on hover leave." : "Pin panel open"}
            >
              {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              <span>{isPinned ? "Pinned" : "Pin"}</span>
            </button>

            {/* Dismiss Button */}
            <button
              onClick={() => {
                setIsPinned(false);
                setIsHovered(false);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close panel"
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Embedded Execution State Panel */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          <ExecutionStatePanel />
        </div>
      </div>
    </div>
  );
}
