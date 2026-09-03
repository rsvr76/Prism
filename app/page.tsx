"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ExecutionHeader from "@/components/controls/ExecutionHeader";
import CodeEditor from "@/components/editor/CodeEditor";
import ExecutionStatePanel from "@/components/debug/ExecutionStatePanel";
import TimelineScrubber from "@/components/debug/TimelineScrubber";
import VisualizerCanvas from "@/components/visualization/VisualizerCanvas";
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
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Parameter-based Algorithm loader */}
      <Suspense fallback={null}>
        <AlgorithmLoader />
      </Suspense>

      {/* Top Navigation & Run Controls */}
      <ExecutionHeader />

      {/* Main 3-Panel Workbench */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] gap-3 p-3 overflow-hidden min-h-0">
        {/* Left Column: Monaco Code Editor */}
        <div className="h-full overflow-hidden min-h-0">
          <CodeEditor />
        </div>

        {/* Center Column: Linked List / Structure Visualizer */}
        <div className="h-full overflow-hidden min-h-0">
          <VisualizerCanvas />
        </div>

        {/* Right Column: Execution State & Memory Inspector */}
        <div className="h-full overflow-hidden min-h-0">
          <ExecutionStatePanel />
        </div>
      </div>

      {/* Bottom Dock: Timeline Playback & Scrubber */}
      <TimelineScrubber />
    </main>
  );
}
