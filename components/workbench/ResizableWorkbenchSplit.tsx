"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GripVertical } from "lucide-react";
import { useExecutionStore } from "@/store/useExecutionStore";
import CodeEditor from "@/components/editor/CodeEditor";
import VisualizerCanvas from "@/components/visualization/VisualizerCanvas";
import ExecutionOutputTab from "@/components/debug/ExecutionOutputTab";
import AutoRevealRightPanel from "@/components/debug/AutoRevealRightPanel";

const STORAGE_KEY = "prism_workbench_split";
const MIN_PERCENT = 25;
const MAX_PERCENT = 75;
const MIN_PANEL_PX = 320;

/**
 * Calculates initial split based on code density and length.
 * Short code (<15 lines, narrow lines): 36% code / 64% visualizer
 * Long/wide code (>25 lines or max line > 65): 44% code / 56% visualizer
 * Standard code: 40% code / 60% visualizer
 */
export function calculateInitialSplit(code: string): number {
  if (!code) return 40;
  const lines = code.split(/\r?\n/);
  const lineCount = lines.length;
  const maxLineLength = Math.max(...lines.map((l) => l.trim().length), 0);

  if (lineCount < 15 && maxLineLength < 50) {
    return 36;
  }
  if (lineCount > 25 || maxLineLength > 65) {
    return 44;
  }
  return 40;
}

export default function ResizableWorkbenchSplit() {
  const code = useExecutionStore((state) => state.code);
  const isVisualizingRun = useExecutionStore((state) => state.isVisualizingRun);
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  const [splitPercent, setSplitPercent] = useState<number>(40);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "canvas">("editor");
  const hasUserAdjusted = useRef(false);

  // Auto-switch to canvas on mobile when visualization starts
  useEffect(() => {
    if (isVisualizingRun) {
      setMobileTab("canvas");
    }
  }, [isVisualizingRun]);

  // Initialize from sessionStorage or heuristic on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= MIN_PERCENT && parsed <= MAX_PERCENT) {
          setSplitPercent(parsed);
          hasUserAdjusted.current = true;
          return;
        }
      }
    } catch {
      // Storage unavailable or blocked
    }

    // Heuristic fallback if user has not manually adjusted
    const heuristic = calculateInitialSplit(code);
    setSplitPercent(heuristic);
  }, []);

  // Update heuristic when code changes, ONLY if user has never manually adjusted
  useEffect(() => {
    if (!hasUserAdjusted.current) {
      const heuristic = calculateInitialSplit(code);
      setSplitPercent(heuristic);
    }
  }, [code]);

  // Save manual split to sessionStorage
  const saveSplit = useCallback((newPercent: number) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, newPercent.toFixed(1));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Clamping helper considering minimum pixel widths
  const clampPercent = useCallback((rawPercent: number): number => {
    if (!containerRef.current) {
      return Math.min(Math.max(rawPercent, MIN_PERCENT), MAX_PERCENT);
    }

    const containerWidth = containerRef.current.clientWidth;
    if (containerWidth <= 0) {
      return Math.min(Math.max(rawPercent, MIN_PERCENT), MAX_PERCENT);
    }

    const minAllowedPct = Math.max(MIN_PERCENT, (MIN_PANEL_PX / containerWidth) * 100);
    const maxAllowedPct = Math.min(MAX_PERCENT, 100 - (MIN_PANEL_PX / containerWidth) * 100);

    if (minAllowedPct >= maxAllowedPct) {
      return 50;
    }

    return Math.min(Math.max(rawPercent, minAllowedPct), maxAllowedPct);
  }, []);

  // Pointer drag handling on divider
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    hasUserAdjusted.current = true;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const rawPct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clamped = clampPercent(rawPct);
      setSplitPercent(clamped);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        const rawPct = ((upEvent.clientX - rect.left) / rect.width) * 100;
        const clamped = clampPercent(rawPct);
        setSplitPercent(clamped);
        saveSplit(clamped);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newPct = splitPercent;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      newPct = clampPercent(splitPercent - 2);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      newPct = clampPercent(splitPercent + 2);
    } else if (e.key === "Home") {
      e.preventDefault();
      newPct = clampPercent(MIN_PERCENT);
    } else if (e.key === "End") {
      e.preventDefault();
      newPct = clampPercent(MAX_PERCENT);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      newPct = calculateInitialSplit(code);
    } else {
      return;
    }

    hasUserAdjusted.current = true;
    setSplitPercent(newPct);
    saveSplit(newPct);
  };

  // Double-click to reset to heuristic
  const handleDoubleClick = () => {
    const heuristic = calculateInitialSplit(code);
    hasUserAdjusted.current = false;
    setSplitPercent(heuristic);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Attach ResizeObserver to visualizer container to monitor layout adjustments
  useEffect(() => {
    const el = visualizerContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      // Container resized smoothly
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ "--split-left": `${splitPercent}%` } as React.CSSProperties}
      className={`flex-1 flex flex-col lg:flex-row gap-2 lg:gap-0 p-2.5 md:p-3 lg:overflow-hidden min-h-0 relative ${
        isDragging ? "select-none cursor-col-resize" : ""
      }`}
    >
      {/* Mobile/Tablet Viewport Segmented Switcher (< 1024px) */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl mb-1 shrink-0 gap-1">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            mobileTab === "editor"
              ? "bg-white dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 shadow-xs border border-slate-300 dark:border-slate-700 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab("canvas")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            mobileTab === "canvas"
              ? "bg-white dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 shadow-xs border border-slate-300 dark:border-slate-700 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Canvas
        </button>
      </div>

      {/* Left Pane: Monaco Code Editor */}
      <div
        className={`h-[500px] lg:h-full lg:overflow-hidden min-h-0 flex-col w-full lg:w-[var(--split-left)] shrink-0 ${
          mobileTab === "editor" ? "flex" : "hidden lg:flex"
        }`}
      >
        <CodeEditor />
      </div>

      {/* Desktop Resizable Divider */}
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-valuenow={Math.round(splitPercent)}
        aria-valuemin={MIN_PERCENT}
        aria-valuemax={MAX_PERCENT}
        aria-label="Resize workbench editor and visualizer panels"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        className={`hidden lg:flex items-center justify-center shrink-0 w-3 z-30 cursor-col-resize group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-sm transition-colors border-x border-slate-300/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/40 ${
          isDragging ? "bg-cyan-500/20 border-cyan-400" : "hover:bg-cyan-500/10 hover:border-cyan-400"
        }`}
        title="Drag to resize panels (Double-click to reset, Arrow keys to adjust)"
      >
        {/* Visible divider track & grip bar */}
        <div
          className={`w-1.5 h-8 rounded-full transition-all flex items-center justify-center shadow-2xs ${
            isDragging
              ? "bg-cyan-600 dark:bg-cyan-400 scale-y-125"
              : "bg-slate-400 dark:bg-slate-600 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-400"
          }`}
        >
          <GripVertical className="w-3 h-3 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Right Pane: Visualizer Canvas (HERO) */}
      <div
        ref={visualizerContainerRef}
        className={`h-[500px] lg:h-full lg:overflow-hidden min-h-0 flex-col flex-1 min-w-0 w-full ${
          mobileTab === "canvas" ? "flex" : "hidden lg:flex"
        }`}
      >
        <VisualizerCanvas />
      </div>

      {/* Small/Dynamic Output Tab between Code and Visualizer */}
      <ExecutionOutputTab />

      {/* Auto-Revealing Right Tab Drawer: AI Explainer, Tutor & Diagnostics */}
      <AutoRevealRightPanel />
    </div>
  );
}
