"use client";

/**
 * ArrayVisualizer
 *
 * Renders 1D array state from a specific PrismFrame with support for:
 * - Dual representation (bar heights + value cards)
 * - Semantic color states (comparing, swapping, pivot, sorted, active, normal)
 * - Subarray boundary markers (partitions / windows)
 * - Dynamic pointer badges (i, j, low, high, pivot, etc.)
 *
 * CONTRACT:
 * - Pure consumer of (frame, prevFrame, variableName)
 * - Never mutates trace
 * - Never executes Python or calls AI
 */

import React, { useMemo } from "react";
import { PrismFrame } from "@/types/trace";
import {
  deriveArrayState,
  VisualArrayElement,
  ArrayElementVisualState,
} from "@/lib/visualization/arrayStateDeriver";
import { Sparkles, CheckCircle, ArrowRightLeft, Search, Disc } from "lucide-react";

interface ArrayVisualizerProps {
  frame: PrismFrame | null;
  prevFrame: PrismFrame | null;
  variableName: string;
}

function getStateStyle(state: ArrayElementVisualState) {
  switch (state) {
    case "swapping":
      return {
        border: "border-emerald-500 shadow-md bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:shadow-emerald-500/30 dark:bg-emerald-950/70 dark:text-emerald-200",
        bar: "bg-emerald-500 dark:bg-emerald-400 shadow-emerald-500/50",
        glow: "ring-2 ring-emerald-400/60",
      };
    case "comparing":
      return {
        border: "border-amber-500 shadow-md bg-amber-50 text-amber-900 dark:border-amber-400 dark:shadow-amber-500/30 dark:bg-amber-950/70 dark:text-amber-200",
        bar: "bg-amber-500 dark:bg-amber-400 shadow-amber-500/50",
        glow: "ring-2 ring-amber-400/60",
      };
    case "pivot":
      return {
        border: "border-purple-500 shadow-md bg-purple-50 text-purple-900 dark:border-purple-400 dark:shadow-purple-500/30 dark:bg-purple-950/70 dark:text-purple-200",
        bar: "bg-purple-500 dark:bg-purple-400 shadow-purple-500/50",
        glow: "ring-2 ring-purple-400/60",
      };
    case "active":
      return {
        border: "border-cyan-500 shadow-md bg-cyan-50 text-cyan-900 dark:border-cyan-400 dark:shadow-cyan-500/20 dark:bg-cyan-950/60 dark:text-cyan-200",
        bar: "bg-cyan-500 dark:bg-cyan-400 shadow-cyan-500/40",
        glow: "ring-2 ring-cyan-400/50",
      };
    case "sorted":
      return {
        border: "border-emerald-400 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-950/30 dark:text-emerald-300",
        bar: "bg-emerald-500/80 dark:bg-emerald-500/70",
        glow: "",
      };
    default:
      return {
        border: "border-slate-300 bg-white text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100",
        bar: "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600/80 dark:hover:bg-slate-500",
        glow: "",
      };
  }
}

export default function ArrayVisualizer({
  frame,
  prevFrame,
  variableName,
}: ArrayVisualizerProps) {
  const arrayState = useMemo(() => {
    return deriveArrayState(frame, prevFrame, variableName);
  }, [frame, prevFrame, variableName]);

  if (!frame || !arrayState) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
        <Sparkles className="w-8 h-8 opacity-20" />
        <p className="text-xs font-mono text-center">
          Array state unavailable for <strong className="text-slate-400">{variableName}</strong> at this step.
        </p>
      </div>
    );
  }

  const { elements, boundaries, hasNumericValues, operationDescription, isSorted } = arrayState;

  if (elements.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
        <span className="px-3 py-1.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300">
          {variableName} = [ ] (Empty List)
        </span>
        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          No elements in array at this step.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 bg-slate-50/70 dark:bg-slate-950/60 rounded-lg overflow-hidden select-none">
      {/* ── Top Header & Status ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-cyan-700 dark:text-cyan-400 font-bold shadow-xs">
            1D Array
          </span>
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">{variableName}</strong>
            <span className="text-slate-500 ml-1.5 font-normal">
              [{elements.length} item{elements.length !== 1 ? "s" : ""}]
            </span>
          </span>

          {isSorted && elements.length > 1 && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              <span>Sorted</span>
            </span>
          )}
        </div>

        {/* Boundary Badges */}
        {boundaries.length > 0 && (
          <div className="flex items-center gap-1.5">
            {boundaries.map((b) => (
              <span
                key={b.name}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300"
              >
                {b.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Operation Alert / Action Tag ── */}
      {operationDescription && (
        <div className="my-2 px-3 py-1.5 rounded bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-mono shadow-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-slate-700 dark:text-slate-300">{operationDescription}</span>
        </div>
      )}

      {/* ── Main Dual Array View (Bars + Cards) ── */}
      <div className="flex-1 flex flex-col justify-center my-4 overflow-x-auto min-h-0">
        <div className="flex items-end justify-center gap-2.5 min-w-fit px-4 py-2">
          {elements.map((el) => {
            const style = getStateStyle(el.state);
            const inBoundary = boundaries.some(
              (b) => el.index >= b.leftIndex && el.index <= b.rightIndex
            );

            return (
              <div
                key={el.index}
                className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  inBoundary ? "opacity-100" : boundaries.length > 0 ? "opacity-40" : "opacity-100"
                }`}
                style={{ width: Math.max(40, Math.min(68, Math.floor(520 / elements.length))) }}
              >
                {/* Pointer Label Badges (Above Cell) */}
                <div className="h-6 flex items-center justify-center gap-1 flex-wrap">
                  {el.pointerLabels.map((lbl) => (
                    <span
                      key={lbl}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-400/60 text-cyan-800 dark:text-cyan-300 shadow-xs leading-none"
                    >
                      {lbl}
                    </span>
                  ))}
                </div>

                {/* Vertical Bar (Height visual for numbers) */}
                {hasNumericValues && (
                  <div className="w-full h-28 flex items-end justify-center bg-slate-200/60 dark:bg-slate-900/40 rounded-t-lg border-b border-slate-300 dark:border-slate-800 p-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${style.bar}`}
                      style={{ height: `${el.heightPercent}%`, minHeight: "6px" }}
                    />
                  </div>
                )}

                {/* Value Box Card */}
                <div
                  className={`w-full h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-200 font-mono font-bold text-sm ${style.border} ${style.glow}`}
                >
                  <span className="truncate px-1">
                    {el.value === null ? "None" : String(el.value)}
                  </span>
                </div>

                {/* Index Subscript */}
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                  [{el.index}]
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Color Legend ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 text-[10px] font-mono text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300 dark:bg-slate-700 dark:border-slate-600"></span>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
          <span className="text-amber-700 dark:text-amber-300">Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
          <span className="text-emerald-700 dark:text-emerald-300">Swapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-400"></span>
          <span className="text-purple-700 dark:text-purple-300">Pivot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
          <span className="text-cyan-700 dark:text-cyan-300">Active</span>
        </div>
      </div>
    </div>
  );
}
