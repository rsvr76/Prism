"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ExecutionHeader from "@/components/controls/ExecutionHeader";
import ResizableWorkbenchSplit from "@/components/workbench/ResizableWorkbenchSplit";
import TimelineScrubber from "@/components/debug/TimelineScrubber";
import { useExecutionStore } from "@/store/useExecutionStore";
import { getAlgorithmBySlug } from "@/lib/content/algorithms";
import { getLessonBySlug } from "@/lib/content/learningPaths";

function AlgorithmLoader() {
  const searchParams = useSearchParams();
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);
  const lastLoadedKey = useRef<string | null>(null);

  useEffect(() => {
    const algoSlug = searchParams.get("algo") || searchParams.get("example");
    const lessonSlug = searchParams.get("lesson");
    const pathSlug = searchParams.get("path") || "dsa-foundations";
    const cacheKey = `${algoSlug || ""}:${lessonSlug || ""}`;

    if (algoSlug && cacheKey !== lastLoadedKey.current) {
      const algo = getAlgorithmBySlug(algoSlug);
      if (algo) {
        lastLoadedKey.current = cacheKey;
        let lessonContext: { pathSlug: string; lessonSlug: string; lessonTitle: string } | null = null;
        if (lessonSlug) {
          const lookup = getLessonBySlug(pathSlug, lessonSlug);
          if (lookup) {
            lessonContext = {
              pathSlug: lookup.path.slug,
              lessonSlug: lookup.lesson.slug,
              lessonTitle: lookup.lesson.title,
            };
          }
        }
        loadAlgorithmCode(algo.name, algo.pythonCode, lessonContext);
      }
    }
  }, [searchParams, loadAlgorithmCode]);

  return null;
}

export default function PrismWorkbench() {
  return (
    <main className="flex flex-col min-h-screen lg:h-screen w-screen overflow-y-auto lg:overflow-hidden bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100">
      {/* Parameter-based Algorithm loader */}
      <Suspense fallback={null}>
        <AlgorithmLoader />
      </Suspense>

      {/* Top Navigation & Controls */}
      <ExecutionHeader />

      {/* Main Resizable 2-Screen Workbench: Left = Code, Right = Visualizer */}
      <ResizableWorkbenchSplit />

      {/* Bottom Dock: Timeline Playback & Scrubber */}
      <div className="sticky bottom-0 z-30">
        <TimelineScrubber />
      </div>
    </main>
  );
}
