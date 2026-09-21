"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useExecutionStore } from "@/store/useExecutionStore";
import { ObjectReference, SerializedValue } from "@/types/trace";
import {
  Layers,
  Variable,
  Database,
  Terminal,
  AlertCircle,
  Sparkles,
  MessageSquareQuote,
  Compass,
  ArrowRight,
} from "lucide-react";
import StepExplainer from "@/components/ai/StepExplainer";
import TutorDrawer from "@/components/ai/TutorDrawer";
import { DSA_FOUNDATIONS_PATH } from "@/lib/content/learningPaths";
import { ALL_CHALLENGES } from "@/lib/content/challenges";
import { getAlgorithmBySlug } from "@/lib/content/algorithms";

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
  const code = useExecutionStore((state) => state.code);
  const loadedAlgorithmTitle = useExecutionStore((state) => state.loadedAlgorithmTitle);
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);

  const [activeTab, setActiveTab] = useState<"scope" | "ai" | "tutor" | "recommendations" | "stack" | "heap" | "stdout">("ai");

  const currentFrame = trace?.frames?.[currentStep] || null;
  const cacheKey = activeExecutionId ? `${activeExecutionId}_step_${currentStep}` : `step_${currentStep}`;
  const hasExplanation = !!stepExplanations[cacheKey];
  const activeTutorMsgs = (activeExecutionId && tutorMessages[activeExecutionId]) || [];
  const hasTutorMessages = activeTutorMsgs.length > 0;

  // Derive Contextual Recommendations
  const contextTopic = useMemo(() => {
    const lower = (code + " " + (loadedAlgorithmTitle || "")).toLowerCase();
    if (lower.includes("bubble") || lower.includes("sort")) return "sorting";
    if (lower.includes("tree") || lower.includes("left") || lower.includes("right") || lower.includes("bst")) return "trees";
    if (lower.includes("node") || lower.includes("head") || lower.includes("next")) return "lists";
    return "arrays";
  }, [code, loadedAlgorithmTitle]);

  const recommendedLesson = useMemo(() => {
    const allLessons = DSA_FOUNDATIONS_PATH.stages.flatMap((s) => s.lessons);
    if (contextTopic === "sorting") {
      return allLessons.find((l) => l.slug.includes("bubble") || l.slug.includes("sort")) || allLessons[2] || allLessons[0];
    }
    if (contextTopic === "trees") {
      return allLessons.find((l) => l.slug.includes("tree")) || allLessons[3] || allLessons[0];
    }
    if (contextTopic === "lists") {
      return allLessons.find((l) => l.slug.includes("linked-list")) || allLessons[1] || allLessons[0];
    }
    return allLessons[0];
  }, [contextTopic]);

  const recommendedChallenge = useMemo(() => {
    if (contextTopic === "sorting") {
      return ALL_CHALLENGES.find((c) => c.topic === "sorting") || ALL_CHALLENGES[0];
    }
    if (contextTopic === "trees") {
      return ALL_CHALLENGES.find((c) => c.topic === "trees") || ALL_CHALLENGES[0];
    }
    if (contextTopic === "lists") {
      return ALL_CHALLENGES.find((c) => c.topic === "linked-lists") || ALL_CHALLENGES[0];
    }
    return ALL_CHALLENGES[0];
  }, [contextTopic]);

  const comparisonAlgo = useMemo(() => {
    if (contextTopic === "sorting") {
      return {
        slug: "selection-sort",
        title: "Selection Sort",
        description: "Compare quadratic passes: observe how selection sort minimizes swap writes compared to bubble sort.",
      };
    }
    if (contextTopic === "trees") {
      return {
        slug: "binary-search-tree",
        title: "Binary Search Tree",
        description: "Compare unconstrained binary trees against ordered search trees where left is less than root and right is greater.",
      };
    }
    if (contextTopic === "lists") {
      return {
        slug: "array",
        title: "Dynamic Array",
        description: "Compare node pointer traversals against contiguous memory direct index access.",
      };
    }
    return {
      slug: "linked-list",
      title: "Singly Linked List",
      description: "Compare contiguous index memory against dynamic pointer chains with zero shifting penalty.",
    };
  }, [contextTopic]);

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
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "recommendations"
                ? "bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-500/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Recommendations</span>
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
        ) : activeTab === "recommendations" ? (
          <div className="h-full overflow-y-auto space-y-3 pr-1 font-mono text-xs">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Contextual Learning Feed</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Recommendations tailored to your active code and execution trace.
              </p>
            </div>

            {/* 1. Guided Lesson Card */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Guided Lesson
                </span>
                <span className="text-[10px] text-slate-400">DSA Foundations</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {recommendedLesson.title}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {recommendedLesson.subtitle}
              </p>
              <div className="pt-1">
                <Link
                  href={`/paths/dsa-foundations/${recommendedLesson.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                >
                  <span>Open Guided Lesson</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. Practice Challenge Card */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Practice Challenge
                </span>
                <span className="text-[10px] text-slate-400">{recommendedChallenge.difficulty}</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {recommendedChallenge.title}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {recommendedChallenge.description}
              </p>
              <div className="pt-1">
                <Link
                  href={`/practice/${recommendedChallenge.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                >
                  <span>Launch Challenge</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 3. Next Experiment / Comparison */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Comparison Experiment
                </span>
                <span className="text-[10px] text-slate-400">Step Invariant</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {comparisonAlgo.title}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {comparisonAlgo.description}
              </p>
              <button
                onClick={() => {
                  const target = getAlgorithmBySlug(comparisonAlgo.slug);
                  if (target) {
                    loadAlgorithmCode(target.name, target.pythonCode);
                  }
                }}
                className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-[11px] cursor-pointer shadow-2xs transition-colors"
              >
                <span>Load {comparisonAlgo.title}</span>
              </button>
            </div>
          </div>
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
