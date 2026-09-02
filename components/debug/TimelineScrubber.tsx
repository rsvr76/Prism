"use client";

import React, { useEffect } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { Play, Pause, SkipBack, SkipForward, FastForward } from "lucide-react";

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
      <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 font-mono">
        <span>Timeline ready. Click &quot;Run Trace&quot; to begin stepping.</span>
        <span>0 / 0 steps</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-950/90 border-t border-slate-800 shadow-lg">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevStep}
          disabled={currentStep <= 0}
          className="p-2 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
          title="Step Backward"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
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
          className="p-2 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
          title="Step Forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 ml-3 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono">
          <FastForward className="w-3 h-3 text-cyan-400" />
          {[0.5, 1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                playbackSpeed === speed
                  ? "bg-cyan-500/20 text-cyan-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
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
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Step Counter & Line Indicator */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          Step <strong className="text-cyan-400">{currentStep + 1}</strong> / {totalFrames}
        </span>
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          Line <strong className="text-amber-400">{trace.frames[currentStep]?.line || "-"}</strong>
        </span>
      </div>
    </div>
  );
}
