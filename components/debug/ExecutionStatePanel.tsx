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

  const [activeTab, setActiveTab] = useState<"scope" | "ai" | "tutor" | "complexity" | "stack" | "heap" | "stdout">("scope");

  const currentFrame = trace?.frames?.[currentStep] || null;
  const cacheKey = activeExecutionId ? `${activeExecutionId}_step_${currentStep}` : `step_${currentStep}`;
  const hasExplanation = !!stepExplanations[cacheKey];
  const activeTutorMsgs = (activeExecutionId && tutorMessages[activeExecutionId]) || [];
  const hasTutorMessages = activeTutorMsgs.length > 0;
  const hasComplexity = !!(activeExecutionId && complexityAnalyses[activeExecutionId]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab("scope")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "scope"
                ? "bg-slate-800 text-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Variable className="w-3.5 h-3.5" />
            <span>Variables</span>
            {currentFrame && (
              <span className="text-[10px] px-1 bg-slate-900 rounded text-slate-400">
                {Object.keys(currentFrame.scope).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "ai"
                ? "bg-slate-800 text-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Explainer</span>
            {hasExplanation && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "tutor"
                ? "bg-slate-800 text-purple-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Tutor</span>
            {hasTutorMessages && (
              <span className="text-[10px] px-1 bg-purple-950 text-purple-300 rounded font-bold">
                {activeTutorMsgs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("complexity")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "complexity"
                ? "bg-slate-800 text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Big-O</span>
            {hasComplexity && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stack")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "stack"
                ? "bg-slate-800 text-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Call Stack</span>
            {currentFrame && (
              <span className="text-[10px] px-1 bg-slate-900 rounded text-slate-400">
                {currentFrame.callStack.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("heap")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "heap"
                ? "bg-slate-800 text-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Heap Objects</span>
            {currentFrame && (
              <span className="text-[10px] px-1 bg-slate-900 rounded text-slate-400">
                {Object.keys(currentFrame.heap).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stdout")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === "stdout"
                ? "bg-slate-800 text-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
            {currentFrame && currentFrame.stdout.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            )}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 hidden xl:block">
          {currentFrame?.description || "Awaiting Execution"}
        </div>
      </div>

      {/* Error Alert Banner if any */}
      {status !== "SUCCESS" && status !== "RUNNING" && status !== "IDLE" && errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/80 border-b border-rose-800/80 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
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
          <div className="h-full flex items-center justify-center text-slate-600 text-xs font-mono">
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
                      className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <span className="text-cyan-300 font-semibold">{name}</span>
                      <span className="text-slate-200">
                        {isObjectRef(val) ? (
                          <span className="text-purple-400 font-bold underline cursor-help">
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
                            ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200 font-bold"
                            : "bg-slate-950/60 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{frameInfo.functionName}()</span>
                          <span className="text-[10px] opacity-70">Line {frameInfo.line}</span>
                        </div>
                        {frameInfo.localVariables && Object.keys(frameInfo.localVariables).length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[11px] font-normal text-slate-300 space-y-0.5">
                            {Object.entries(frameInfo.localVariables).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-slate-400">{k}:</span>
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
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <span className="text-purple-400 font-bold">{obj.className}</span>
                        <span className="text-[10px] text-slate-500">{id}</span>
                      </div>

                      {/* Fields */}
                      <div className="text-xs space-y-1">
                        <div className="text-slate-500 uppercase text-[10px] font-bold">Fields:</div>
                        {Object.entries(obj.fields).length === 0 ? (
                          <div className="text-slate-600 italic">None</div>
                        ) : (
                          Object.entries(obj.fields).map(([k, v]) => (
                            <div key={k} className="flex justify-between pl-2">
                              <span className="text-slate-400">.{k}</span>
                              <span className="text-emerald-400">{JSON.stringify(v)}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Pointer References */}
                      <div className="text-xs space-y-1">
                        <div className="text-slate-500 uppercase text-[10px] font-bold">References:</div>
                        {Object.entries(obj.references).length === 0 ? (
                          <div className="text-slate-600 italic">None</div>
                        ) : (
                          Object.entries(obj.references).map(([ptr, targetId]) => (
                            <div key={ptr} className="flex justify-between pl-2 text-cyan-300">
                              <span>.{ptr} &rarr;</span>
                              <span className="text-purple-300 font-bold">{targetId}</span>
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
