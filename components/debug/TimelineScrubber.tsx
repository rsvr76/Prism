"use client";

import React, { useEffect } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { Play, Pause, SkipBack, SkipForward, FastForward, GitBranch } from "lucide-react";

export default function TimelineScrubber() {
  const trace = useExecutionStore((state) => state.trace);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  const playbackSpeed = useExecutionStore((state) => state.playbackSpeed);
  const setStep = useExecutionStore((state) => state.setStep);
  const nextStep = useExecutionStore((state) => state.nextStep);
  const prevStep = useExecutionStore((state) => state.prevStep);
  const togglePlay = useExecutionStore((state) => state.togglePlay);
  const setPlaybackSpeed = useExecutionStore((state) => state.setPlaybackSpeed);
  const openWhatIfModal = useExecutionStore((state) => state.openWhatIfModal);

  const totalFrames = trace?.frames?.length || 0;

  // Handle Playback Interval
  useEffect(() => {
    if (!isPlaying || totalFrames === 0) return;

    const intervalTime = Math.round(500 / playbackSpeed);
    const timer = setInterval(() => {
      if (currentStep >= totalFrames - 1) {
        togglePlay(); // Pause at end
      } else {
        nextStep();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalFrames, playbackSpeed, nextStep, togglePlay]);

  if (!trace || totalFrames === 0) {
    return (
      <div className="h-14 flex items-center justify-between px-6 bg-white/95 dark:bg-[#0a0f1d]/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-mono select-none">
        <span>Timeline ready. Click &quot;Run Trace&quot; to begin stepping.</span>
        <span className="text-slate-400 dark:text-slate-600">0 / 0 steps</span>
      </div>
    );
  }

  return (
    <div className="h-14 flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-md select-none z-20">
      {/* Playback Controls & Speed */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={prevStep}
          disabled={currentStep <= 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 disabled:opacity-25 transition-all cursor-pointer"
          title="Step Backward"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 transition-transform active:scale-95 cursor-pointer"
          title={isPlaying ? "Pause" : "Auto Play"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={nextStep}
          disabled={currentStep >= totalFrames - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 disabled:opacity-25 transition-all cursor-pointer"
          title="Step Forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Secondary Speed Selector */}
        <div className="hidden sm:flex items-center gap-0.5 ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-mono">
          <FastForward className="w-3 h-3 text-cyan-600 dark:text-cyan-400/80 mr-0.5" />
          {[0.5, 1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                playbackSpeed === speed
                  ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber Slider */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={totalFrames - 1}
          value={currentStep}
          onChange={(e) => setStep(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800/90 rounded-lg appearance-none cursor-pointer accent-cyan-500 dark:accent-cyan-400"
        />
      </div>

      {/* Step Counter, Line Indicator, and What-If Button */}
      <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          Step <strong className="text-cyan-700 dark:text-cyan-300">{currentStep + 1}</strong> / {totalFrames}
        </span>
        <span className="hidden md:inline px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
          Line <strong className="text-amber-600 dark:text-amber-400">{trace.frames[currentStep]?.line || "-"}</strong>
        </span>

        {/* Phase 6A: What-If Branch Button */}
        <button
          onClick={() => openWhatIfModal(currentStep)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-900 dark:bg-purple-950/90 dark:hover:bg-purple-900 dark:border-purple-500/50 dark:hover:border-purple-400 dark:text-purple-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Branch execution from this step with modified code"
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>What If?</span>
        </button>
      </div>
    </div>
  );
}
