"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ExecutionHeader from "@/components/controls/ExecutionHeader";
import CodeEditor from "@/components/editor/CodeEditor";
import ExecutionStatePanel from "@/components/debug/ExecutionStatePanel";
import TimelineScrubber from "@/components/debug/TimelineScrubber";
import VisualizerCanvas from "@/components/visualization/VisualizerCanvas";
import WelcomeHeroBanner from "@/components/onboarding/WelcomeHeroBanner";
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

      {/* Top Navigation & Run Controls */}
      <ExecutionHeader />

      {/* Dismissible Onboarding & Core Pipeline Banner */}
      <WelcomeHeroBanner />

      {/* Main 3-Panel Workbench */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr_1.1fr] xl:grid-cols-[0.95fr_1.7fr_1.1fr] gap-3 p-2.5 md:p-3 lg:overflow-hidden min-h-0">
        {/* Left Column: Monaco Code Editor */}
        <div className="h-[360px] lg:h-full lg:overflow-hidden min-h-0 flex flex-col">
          <CodeEditor />
        </div>

        {/* Center Column: Linked List / Structure Visualizer (HERO) */}
        <div className="h-[400px] lg:h-full lg:overflow-hidden min-h-0 flex flex-col">
          <VisualizerCanvas />
        </div>

        {/* Right Column: Execution State & Grounded AI Pedagogy */}
        <div className="h-[380px] lg:h-full lg:overflow-hidden min-h-0 flex flex-col">
          <ExecutionStatePanel />
        </div>
      </div>

      {/* Bottom Dock: Timeline Playback & Scrubber */}
      <div className="sticky bottom-0 z-30">
        <TimelineScrubber />
      </div>
    </main>
  );
}
