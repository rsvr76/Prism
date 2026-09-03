"use client";

/**
 * TutorDrawer Component
 *
 * Interactive AI Tutor Q&A grounded strictly in the Prism execution trace.
 * Supports multi-turn contextual discussion with real-time step synchronization.
 */

import React, { useState, useRef, useEffect } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import {
  MessageSquareQuote,
  Send,
  Trash2,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const STARTER_PROMPTS = [
  "Why did this happen?",
  "Explain this step simply",
  "What changed in memory?",
  "What do these variables represent?",
];

export default function TutorDrawer() {
  const trace = useExecutionStore((state) => state.trace);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const activeExecutionId = useExecutionStore((state) => state.activeExecutionId);
  const tutorMessages = useExecutionStore((state) => state.tutorMessages);
  const isTutorResponding = useExecutionStore((state) => state.isTutorResponding);
  const tutorError = useExecutionStore((state) => state.tutorError);
  const sendTutorQuestion = useExecutionStore((state) => state.sendTutorQuestion);
  const clearTutorMessages = useExecutionStore((state) => state.clearTutorMessages);

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const frame = trace?.frames?.[currentStep] ?? null;
  const currentMessages = (activeExecutionId && tutorMessages[activeExecutionId]) || [];

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isTutorResponding]);

  const handleSend = async (questionText: string) => {
    const text = questionText.trim();
    if (!text || isTutorResponding) return;
    setInputVal("");
    await sendTutorQuestion(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputVal);
    }
  };

  if (!trace || !frame) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6">
        <MessageSquareQuote className="w-8 h-8 opacity-20" />
        <p className="text-xs font-mono text-center">
          Run your code to ask the AI Tutor<br />about the execution trace.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden p-3 space-y-3 text-slate-800 dark:text-slate-200 font-mono text-xs">
      {/* ── Top Bar: Step Marker & Clear Button ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] rounded bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Grounded in Step {currentStep}</span>
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400">
            Line <strong className="text-slate-900 dark:text-slate-200">{frame.line}</strong>
          </span>
        </div>

        {currentMessages.length > 0 && (
          <button
            onClick={() => clearTutorMessages()}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* ── Chat Messages Stream ── */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {/* Empty State with Starter Prompts */}
        {currentMessages.length === 0 && !isTutorResponding && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-6">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Prism AI Tutor</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask any question about how memory, variables, or pointers behave at Step {currentStep}.
              </p>
            </div>

            {/* Quick Starter Chips */}
            <div className="w-full max-w-sm space-y-1.5 pt-2 text-left">
              <p className="text-[10px] uppercase font-bold text-slate-500 pl-1">Suggested Questions:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-900 dark:bg-slate-950/60 dark:hover:bg-purple-950/40 dark:border-slate-800 dark:hover:border-purple-800/60 dark:text-slate-300 dark:hover:text-purple-200 text-xs transition-colors flex items-center justify-between group shadow-2xs cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <HelpCircle className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 text-purple-600 dark:text-purple-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rendered Messages */}
        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`space-y-1.5 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            {/* User Message Bubble */}
            {msg.role === "user" ? (
              <div className="inline-block max-w-[85%] p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-950 dark:bg-cyan-950/70 dark:border-cyan-800/50 dark:text-cyan-100 text-left shadow-2xs">
                <p className="text-xs leading-relaxed">{msg.text}</p>
                <div className="text-[9px] text-cyan-700/80 dark:text-cyan-400/60 mt-1 text-right">
                  Asked at Step {msg.stepIndex}
                </div>
              </div>
            ) : (
              /* Tutor Response Card */
              <div className="inline-block w-full p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-[11px] font-bold pb-1 border-b border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prism Explains</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Step {msg.stepIndex}
                  </span>
                </div>

                {/* Main Answer */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {msg.text}
                </p>

                {/* Observed Trace Evidence */}
                {msg.responseObj?.evidence && msg.responseObj.evidence.length > 0 && (
                  <div className="p-2 rounded bg-white border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Observed in Execution (Trace Evidence)</span>
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300">
                      {msg.responseObj.evidence.map((ev, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-600 dark:text-emerald-400 shrink-0">▸</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Learning Point */}
                {msg.responseObj?.learningPoint && (
                  <div className="p-2 rounded bg-purple-100/70 border border-purple-200 text-purple-900 dark:bg-purple-950/30 dark:border-purple-800/30 dark:text-purple-200 flex items-start gap-1.5 text-[11px]">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{msg.responseObj.learningPoint}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading Bubble */}
        {isTutorResponding && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-2 text-left">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing execution trace at Step {currentStep}...</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {tutorError && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
            <div>
              <strong className="block font-bold">Tutor Error</strong>
              <span>{tutorError}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ── */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTutorResponding}
          placeholder={`Ask about Step ${currentStep} (e.g. Why did x change?)...`}
          className="flex-1 bg-white border border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:border-purple-500 focus:outline-none rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50"
        />
        <button
          onClick={() => handleSend(inputVal)}
          disabled={isTutorResponding || !inputVal.trim()}
          className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm cursor-pointer"
        >
          {isTutorResponding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}
