"use client";

import React, { useState } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { ObjectReference, SerializedValue } from "@/types/trace";
import { Layers, Variable, Database, Terminal, AlertCircle, Sparkles } from "lucide-react";
import StepExplainer from "@/components/ai/StepExplainer";

function isObjectRef(val: SerializedValue): val is ObjectReference {
  return typeof val === "object" && val !== null && "__type__" in val && (val as ObjectReference).__type__ === "object_ref";
}

export default function ExecutionStatePanel() {
  const trace = useExecutionStore((state) => state.trace);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const status = useExecutionStore((state) => state.status);
  const errorMessage = useExecutionStore((state) => state.errorMessage);
  const stepExplanations = useExecutionStore((state) => state.stepExplanations);

  const [activeTab, setActiveTab] = useState<"scope" | "stack" | "heap" | "stdout" | "ai">("scope");

  const currentFrame = trace?.frames?.[currentStep] || null;
  const hasExplanation = !!stepExplanations[currentStep];

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
      {errorMessage && (
        <div className="flex items-start gap-2.5 px-4 py-2.5 bg-rose-950/40 border-b border-rose-500/30 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-400">[{status}]</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Tab Content Body */}
      <div className="flex-1 overflow-hidden font-mono text-xs">
        {!currentFrame ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-4">
            <Layers className="w-8 h-8 opacity-40" />
            <p>Run code to inspect runtime state.</p>
          </div>
        ) : (
          <>
            {/* AI Explainer Tab */}
            {activeTab === "ai" && <StepExplainer />}

            {/* Scope Variables Table */}
            {activeTab === "scope" && (
              <div className="h-full p-4 overflow-y-auto space-y-2">
                {Object.keys(currentFrame.scope).length === 0 ? (
                  <p className="text-slate-500 italic">No variables in current scope.</p>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-slate-950/50">
                    {Object.entries(currentFrame.scope).map(([varName, val]) => (
                      <div key={varName} className="flex items-center justify-between px-3 py-2">
                        <span className="text-cyan-400 font-semibold">{varName}</span>
                        <div className="text-right">
                          {isObjectRef(val) ? (
                            <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                              {String(val.className)} ({String(val.id)})
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium">
                              {JSON.stringify(val)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Call Stack Frame View */}
            {activeTab === "stack" && (
              <div className="h-full p-4 overflow-y-auto space-y-2">
                {currentFrame.callStack.map((frame, idx) => (
                  <div
                    key={frame.frameId + idx}
                    className={`p-3 rounded border transition-colors ${
                      idx === currentFrame.callStack.length - 1
                        ? "bg-cyan-950/30 border-cyan-500/50 text-cyan-200"
                        : "bg-slate-950/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm">
                        {frame.functionName}()
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                        Line {frame.line}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Locals: {Object.keys(frame.localVariables).join(", ") || "none"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Heap Objects Inspection */}
            {activeTab === "heap" && (
              <div className="h-full p-4 overflow-y-auto space-y-3">
                {Object.keys(currentFrame.heap).length === 0 ? (
                  <p className="text-slate-500 italic">No heap objects allocated.</p>
                ) : (
                  Object.entries(currentFrame.heap).map(([objId, obj]) => (
                    <div
                      key={objId}
                      className="p-3 rounded bg-slate-950/60 border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-bold">
                          {obj.className}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {obj.id}
                        </span>
                      </div>

                      {/* Fields */}
                      <div className="text-xs space-y-1 mb-2">
                        <div className="text-slate-500 uppercase text-[10px] font-bold">Fields:</div>
                        {Object.entries(obj.fields).length === 0 ? (
                          <div className="text-slate-600 italic">None</div>
                        ) : (
                          Object.entries(obj.fields).map(([k, v]) => (
                            <div key={k} className="flex justify-between pl-2">
                              <span className="text-slate-300">{k}:</span>
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
