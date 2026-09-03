"use client";

import React, { useState } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { ObjectReference, SerializedValue } from "@/types/trace";
import { Layers, Variable, Database, Terminal, AlertCircle, Sparkles, MessageSquareQuote, Activity } from "lucide-react";
import StepExplainer from "@/components/ai/StepExplainer";
import TutorDrawer from "@/components/ai/TutorDrawer";
import ComplexityPanel from "@/components/ai/ComplexityPanel";

function isObjectRef(val: SerializedValue): val is ObjectReference {
  return typeof val === "object" && val !== null && "__type__" in val && (val as ObjectReference).__type__ === "object_ref";
}

export default function ExecutionStatePanel() {
  const trace = useExecutionStore((state) => state.trace);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const status = useExecutionStore((state) => state.status);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const errorMessage = useExecutionStore((state) => state.errorMessage);
  const stepExplanations = useExecutionStore((state) => state.stepExplanations);
  const tutorMessages = useExecutionStore((state) => state.tutorMessages);
  const complexityAnalyses = useExecutionStore((state) => state.complexityAnalyses);

  const [activeTab, setActiveTab] = useState<"scope" | "ai" | "tutor" | "complexity" | "stack" | "heap" | "stdout">("ai");

  const currentFrame = trace?.frames?.[currentStep] || null;
  const cacheKey = activeExecutionId ? `${activeExecutionId}_step_${currentStep}` : `step_${currentStep}`;
  const hasExplanation = !!stepExplanations[cacheKey];
  const activeTutorMsgs = (activeExecutionId && tutorMessages[activeExecutionId]) || [];
  const hasTutorMessages = activeTutorMsgs.length > 0;
  const hasComplexity = !!(activeExecutionId && complexityAnalyses[activeExecutionId]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs dark:shadow-lg">
      {/* Tab Navigation: Divided into Primary Learning and Diagnostics */}
      <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Primary Learning Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-cyan-100 text-cyan-800 font-bold border border-cyan-300 shadow-xs dark:bg-cyan-950/90 dark:text-cyan-300 dark:border-cyan-500/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>AI Explainer</span>
            {hasExplanation && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "tutor"
                ? "bg-purple-100 text-purple-800 font-bold border border-purple-300 shadow-xs dark:bg-purple-950/90 dark:text-purple-300 dark:border-purple-500/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>AI Tutor</span>
            {hasTutorMessages && (
              <span className="text-[10px] px-1 bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded font-bold">
                {activeTutorMsgs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("complexity")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "complexity"
                ? "bg-amber-100 text-amber-800 font-bold border border-amber-300 shadow-xs dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-500/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Big-O</span>
            {hasComplexity && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            )}
          </button>
        </div>

        {/* Secondary Diagnostics (Scope, Stack, Heap, Console) */}
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-950/60 p-0.5 rounded-md border border-slate-300 dark:border-slate-800/60">
          <button
            onClick={() => setActiveTab("scope")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
              activeTab === "scope"
                ? "bg-white text-cyan-800 font-semibold shadow-xs dark:bg-slate-800 dark:text-cyan-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Variable className="w-3 h-3" />
            <span>Variables</span>
            {currentFrame && (
              <span className="text-[9px] px-1 bg-slate-100 dark:bg-slate-900 rounded text-slate-500 dark:text-slate-400">
                {Object.keys(currentFrame.scope).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stack")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
              activeTab === "stack"
                ? "bg-white text-cyan-800 font-semibold shadow-xs dark:bg-slate-800 dark:text-cyan-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Call Stack</span>
            {currentFrame && (
              <span className="text-[9px] px-1 bg-slate-100 dark:bg-slate-900 rounded text-slate-500 dark:text-slate-400">
                {currentFrame.callStack.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("heap")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
              activeTab === "heap"
                ? "bg-white text-cyan-800 font-semibold shadow-xs dark:bg-slate-800 dark:text-cyan-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Database className="w-3 h-3" />
            <span>Heap Objects</span>
          </button>

          <button
            onClick={() => setActiveTab("stdout")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
              activeTab === "stdout"
                ? "bg-white text-cyan-800 font-semibold shadow-xs dark:bg-slate-800 dark:text-cyan-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Console</span>
            {currentFrame && currentFrame.stdout.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Banner if any */}
      {status !== "SUCCESS" && status !== "RUNNING" && status !== "IDLE" && errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
          <span className="font-semibold">{status}:</span>
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="flex-1 p-3 overflow-hidden">
        {activeTab === "ai" ? (
          <StepExplainer />
        ) : activeTab === "tutor" ? (
          <TutorDrawer />
        ) : activeTab === "complexity" ? (
          <ComplexityPanel />
        ) : !currentFrame ? (
          <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-600 text-xs font-mono">
            No active frame data. Click &quot;Run Trace&quot; to execute.
          </div>
        ) : (
          <>
            {/* Scope Variables Tab */}
            {activeTab === "scope" && (
              <div className="h-full overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                {Object.keys(currentFrame.scope).length === 0 ? (
                  <div className="text-slate-500 italic p-2">No variables currently in local scope.</div>
                ) : (
                  Object.entries(currentFrame.scope).map(([name, val]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 hover:border-slate-300 dark:bg-slate-950/60 dark:border-slate-800/80 dark:hover:border-slate-700 transition-colors"
                    >
                      <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{name}</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {isObjectRef(val) ? (
                          <span className="text-purple-600 dark:text-purple-400 font-bold underline cursor-help">
                            {val.className} ({val.id})
                          </span>
                        ) : (
                          JSON.stringify(val)
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Call Stack Tab */}
            {activeTab === "stack" && (
              <div className="h-full overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                {currentFrame.callStack.length === 0 ? (
                  <div className="text-slate-500 italic p-2">&lt;module&gt; (Global Frame)</div>
                ) : (
                  currentFrame.callStack
                    .slice()
                    .reverse()
                    .map((frameInfo, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded border ${
                          idx === 0
                            ? "bg-cyan-50 border-cyan-300 text-cyan-900 font-bold dark:bg-cyan-950/40 dark:border-cyan-500/50 dark:text-cyan-200"
                            : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/60 dark:border-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{frameInfo.functionName}()</span>
                          <span className="text-[10px] opacity-70">Line {frameInfo.line}</span>
                        </div>
                        {frameInfo.localVariables && Object.keys(frameInfo.localVariables).length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/60 text-[11px] font-normal text-slate-600 dark:text-slate-300 space-y-0.5">
                            {Object.entries(frameInfo.localVariables).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">{k}:</span>
                                <span>{JSON.stringify(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Heap Objects Tab */}
            {activeTab === "heap" && (
              <div className="h-full overflow-y-auto space-y-3 pr-1 font-mono text-xs">
                {Object.keys(currentFrame.heap).length === 0 ? (
                  <div className="text-slate-500 italic p-2">No custom objects allocated in heap.</div>
                ) : (
                  Object.entries(currentFrame.heap).map(([id, obj]) => (
                    <div
                      key={id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-purple-700 dark:text-purple-400 font-bold">{obj.className}</span>
                        <span className="text-[10px] text-slate-500">{id}</span>
                      </div>

                      {/* Fields */}
                      <div className="text-xs space-y-1">
                        <div className="text-slate-500 uppercase text-[10px] font-bold">Fields:</div>
                        {Object.entries(obj.fields).length === 0 ? (
                          <div className="text-slate-500 dark:text-slate-600 italic">None</div>
                        ) : (
                          Object.entries(obj.fields).map(([k, v]) => (
                            <div key={k} className="flex justify-between pl-2">
                              <span className="text-slate-500 dark:text-slate-400">.{k}</span>
                              <span className="text-emerald-700 dark:text-emerald-400">{JSON.stringify(v)}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Pointer References */}
                      <div className="text-xs space-y-1">
                        <div className="text-slate-500 uppercase text-[10px] font-bold">References:</div>
                        {Object.entries(obj.references).length === 0 ? (
                          <div className="text-slate-500 dark:text-slate-600 italic">None</div>
                        ) : (
                          Object.entries(obj.references).map(([ptr, targetId]) => (
                            <div key={ptr} className="flex justify-between pl-2 text-cyan-700 dark:text-cyan-300">
                              <span>.{ptr} &rarr;</span>
                              <span className="text-purple-700 dark:text-purple-300 font-bold">{targetId}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Console Output Tab */}
            {activeTab === "stdout" && (
              <div className="h-full bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs overflow-y-auto">
                {currentFrame.stdout.length === 0 ? (
                  <span className="text-slate-600 italic">&gt; No output generated yet.</span>
                ) : (
                  currentFrame.stdout.map((line, idx) => (
                    <div key={idx} className="text-slate-200">
                      <span className="text-slate-600 select-none mr-2">&gt;</span>
                      {line}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
