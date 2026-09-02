"use client";

import React from "react";
import ExecutionHeader from "@/components/controls/ExecutionHeader";
import CodeEditor from "@/components/editor/CodeEditor";
import ExecutionStatePanel from "@/components/debug/ExecutionStatePanel";
import TimelineScrubber from "@/components/debug/TimelineScrubber";

export default function PrismWorkbench() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Navigation & Run Controls */}
      <ExecutionHeader />

      {/* Main Split Workbench (Editor on Left, Debugger State on Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left Column: Monaco Code Editor */}
        <div className="h-full overflow-hidden">
          <CodeEditor />
        </div>

        {/* Right Column: Execution State & Memory Inspector */}
        <div className="h-full overflow-hidden">
          <ExecutionStatePanel />
        </div>
      </div>

      {/* Bottom Dock: Timeline Playback & Scrubber */}
      <TimelineScrubber />
    </main>
  );
}
