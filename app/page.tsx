"use client";

import React from "react";
import ExecutionHeader from "@/components/controls/ExecutionHeader";
import CodeEditor from "@/components/editor/CodeEditor";
import ExecutionStatePanel from "@/components/debug/ExecutionStatePanel";
import TimelineScrubber from "@/components/debug/TimelineScrubber";
import VisualizerCanvas from "@/components/visualization/VisualizerCanvas";

export default function PrismWorkbench() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
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
