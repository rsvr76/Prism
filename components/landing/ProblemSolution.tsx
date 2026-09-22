"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Code2,
  Network,
  GitBranch,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Cpu,
  Lock,
  Layers,
  Activity,
  Zap,
} from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BorderBeam from "@/components/ui/BorderBeam";

interface Dimension {
  id: string;
  tabLabel: string;
  icon: React.ElementType;
  copycat: {
    badge: string;
    headline: string;
    flaws: string[];
    simulatedUi: {
      type: "code" | "pointers" | "branching" | "ai";
      tag: string;
      message: string;
    };
  };
  prism: {
    badge: string;
    headline: string;
    strengths: string[];
    previewUi: {
      type: "code" | "pointers" | "branching" | "ai";
      highlightText: string;
      meta: string;
    };
  };
}

const DIMENSIONS: Dimension[] = [
  {
    id: "custom-code",
    tabLabel: "Custom Python Code",
    icon: Code2,
    copycat: {
      badge: "The 100 Copycat Sites",
      headline: "Hardcoded Presets Only",
      flaws: [
        "Locked to author's 5 preset numbers (e.g. [5, 2, 8, 1, 4])",
        "Crashes on custom classes, recursive helpers, or imports",
        "Fake DOM scripts with zero real Python interpreter",
      ],
      simulatedUi: {
        type: "code",
        tag: "SIMULATION · NO PYTHON RUNTIME",
        message: "🔒 Input Locked: Editing disabled for custom logic.\n⚠️ Error: Custom class Node() not supported by visualizer engine.",
      },
    },
    prism: {
      badge: "Prism Ground Truth Engine",
      headline: "Native WebAssembly Python 3.12",
      strengths: [
        "Executes any valid Python 3 code in-browser via Pyodide WebAssembly",
        "True lexical scopes, call frames, and dynamic variable mutations",
        "0ms server latency, 100% offline, zero install required",
      ],
      previewUi: {
        type: "code",
        highlightText: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(10)\nhead.next = Node(25)  # Real Python classes & heap!`,
        meta: "● In-Browser WASM · ~1.2ms Execution",
      },
    },
  },
  {
    id: "heap-pointers",
    tabLabel: "Real Memory & Pointers",
    icon: Network,
    copycat: {
      badge: "The 100 Copycat Sites",
      headline: "Optical CSS Animations",
      flaws: [
        "Animates CSS translate on <div> boxes with no memory model",
        "Cannot detect memory addresses, cycles, or pointer swaps",
        "Diagrams break when nodes are dynamically deleted or rewired",
      ],
      simulatedUi: {
        type: "pointers",
        tag: "STATIC DOM BOXES",
        message: "⚠️ Optical illusion: Nodes are CSS div cards.\nZero heap addresses. Cannot verify pointer mutations.",
      },
    },
    prism: {
      badge: "Prism Ground Truth Engine",
      headline: "Deterministic Heap Memory Graphs",
      strengths: [
        "Native sys.settrace extracts exact pointer chains & id() addresses",
        "Deterministic detector recognizes Linked Lists, Arrays & Trees",
        "Safe against circular references, degenerate trees, and edge cases",
      ],
      previewUi: {
        type: "pointers",
        highlightText: "[Node 10 | 0x7fa1] ──► [Node 25 | 0x7fa8] ──► [Node 40 | 0x7fb0]",
        meta: "● Extracted via sys.settrace · Real Heap id()",
      },
    },
  },
  {
    id: "time-travel",
    tabLabel: "Time Travel & What-If",
    icon: GitBranch,
    copycat: {
      badge: "The 100 Copycat Sites",
      headline: "Rigid Linear Player",
      flaws: [
        "Forward-only playback; stepping back forces full page reload",
        "Cannot edit code at step 12 and simulate an alternative path",
        "Passive video-like experience that punishes experimentation",
      ],
      simulatedUi: {
        type: "branching",
        tag: "ONE-WAY SCRUBBER",
        message: "⚠️ Stepping backward not supported.\nTo restart, reload the webpage and watch from step 1.",
      },
    },
    prism: {
      badge: "Prism Ground Truth Engine",
      headline: "Bidirectional Time Travel & Branching",
      strengths: [
        "Scrub backward & forward with sub-millisecond precision",
        "What-If Branching: Fork execution at step N and explore code variants",
        "Original trace remains intact while testing hypotheses in parallel",
      ],
      previewUi: {
        type: "branching",
        highlightText: "◄ Step 7 of 18 ► [0.5x Speed]\n🌿 Active Branch: exec_branch_1 (Forked at step 7)",
        meta: "● Parallel Execution Epochs Isolated",
      },
    },
  },
  {
    id: "ai-grounding",
    tabLabel: "Trace-Grounded AI",
    icon: Sparkles,
    copycat: {
      badge: "The 100 Copycat Sites",
      headline: "Hallucinating Generic Chatbots",
      flaws: [
        "LLM has no access to actual memory; guesses what code might do",
        "Hallucinates loop iterations and fabricates runtime states",
        "Provides generic textbook regurgitation instead of custom help",
      ],
      simulatedUi: {
        type: "ai",
        tag: "UNGROUNDED CHATBOT",
        message: "🤖 'Bubble sort is an O(n²) algorithm. In your code, it might sort some items, maybe?'\n⚠️ Warning: No access to runtime memory state.",
      },
    },
    prism: {
      badge: "Prism Ground Truth Engine",
      headline: "100% Trace-Grounded Pedagogy",
      strengths: [
        "AI Tutor is fed ground-truth execution trace diffs from WebAssembly",
        "Cites exact line numbers: 'Line 6: swapped 64 & 34 because 64 > 34'",
        "User code is treated strictly as passive data against prompt injections",
      ],
      previewUi: {
        type: "ai",
        highlightText: "[Grounded Step Citation · Line 6]\n'arr[1] (64) bubbled past arr[2] (25) because 64 > 25.\nInner loop index j=1. Outer pass 0 of 4.'",
        meta: "● Verified Trace Diff Grounding · 0% Hallucination",
      },
    },
  },
];

const GUARANTEE_PILLS = [
  { label: "Your Custom Code", status: "Native Python 3.12", detail: "Runs any arbitrary Python in-browser via Pyodide WASM" },
  { label: "Memory State", status: "Deterministic Heap Trace", detail: "Exact pointer graphs extracted with sys.settrace" },
  { label: "AI Explanations", status: "Trace Diff Citations", detail: "Grounded in verifiable WebAssembly execution facts" },
  { label: "Zero Setup", status: "100% In-Browser", detail: "No pip installs, no Docker containers, no backend servers" },
];

export function ProblemSolution() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeDim = DIMENSIONS[activeIdx];

  // Auto-cycle dimensions every 8s unless user is interacting
  useEffect(() => {
    if (!isAutoCycling) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % DIMENSIONS.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoCycling]);

  const handleSelectDimension = (idx: number) => {
    setActiveIdx(idx);
    setIsAutoCycling(false); // Pause auto-cycling once user clicks
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 space-y-10 selection:bg-cyan-500/30">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>BEYOND THE 100 COPYCAT SITES</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Why{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">
            Prism
          </span>
          ?
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Over 100 visualizers show canned animations hardcoded for 5 preset numbers.
          Prism is a real WebAssembly execution engine that traces and renders <span className="font-semibold text-slate-800 dark:text-slate-200">your actual custom Python code</span>.
        </p>
      </div>

      {/* Interactive Dimension Selector Bar */}
      <div
        role="tablist"
        aria-label="Architectural Comparison Dimensions"
        className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 backdrop-blur-md max-w-3xl mx-auto shadow-xs"
      >
        {DIMENSIONS.map((dim, idx) => {
          const Icon = dim.icon;
          const isActive = idx === activeIdx;

          return (
            <button
              key={dim.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`comparison-panel-${dim.id}`}
              onClick={() => handleSelectDimension(idx)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-300 dark:border-slate-700 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}`} />
              <span>{dim.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Asymmetric Comparative Studio */}
      <div
        id={`comparison-panel-${activeDim.id}`}
        role="tabpanel"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Left Side (5 cols): The 100 Copycat Visualizers (The Simulated Facade) */}
        <div className="lg:col-span-5 rounded-2xl border border-rose-300/60 dark:border-rose-900/40 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between shadow-xs opacity-90 transition-all duration-300">
          <div className="space-y-5">
            {/* Header Tag */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-900">
                <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>{activeDim.copycat.badge}</span>
              </span>

              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Simulation Only
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">
                {activeDim.copycat.headline}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Rigid, hardcoded demonstrations that collapse the moment you test your own edge cases.
              </p>
            </div>

            {/* Simulated UI Box demonstrating the flaw */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-400 font-bold tracking-wider uppercase">
                <span>{activeDim.copycat.simulatedUi.tag}</span>
                <span className="text-rose-500 dark:text-rose-400">STATUS: FAILED</span>
              </div>
              <pre className="text-rose-800 dark:text-rose-300 whitespace-pre-wrap text-[11px] leading-relaxed bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
                {activeDim.copycat.simulatedUi.message}
              </pre>
            </div>

            {/* List of concrete flaws */}
            <ul className="space-y-2.5 pt-2">
              {activeDim.copycat.flaws.map((flaw, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" />
                  </div>
                  <span>{flaw}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Execution Model:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">Rigid Optical Simulation</span>
          </div>
        </div>

        {/* Right Side (7 cols - HERO): Prism Ground Truth Engine */}
        <SpotlightCard
          className="lg:col-span-7 rounded-2xl border border-cyan-400/80 dark:border-cyan-500/40 bg-white dark:bg-[#0d1322] p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-cyan-500/10 relative overflow-hidden transition-all duration-300"
          spotlightColor="rgba(6, 182, 212, 0.16)"
        >
          {/* Animated Traveling Border Beam */}
          <BorderBeam size={260} duration={6} colorFrom="#06b6d4" colorTo="#a855f7" />

          <div className="space-y-6">
            {/* Header Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>{activeDim.prism.badge}</span>
              </span>

              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>100% Deterministic Runtime</span>
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeDim.prism.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Every frame, variable, and pointer is derived directly from ground-truth Python execution steps in your browser.
              </p>
            </div>

            {/* Live Interactive Engine Preview Container */}
            <div className="rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-900 text-slate-100 p-4 sm:p-5 font-mono text-xs space-y-3 shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium pl-1">Prism WebAssembly VM</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-semibold">{activeDim.prism.previewUi.meta}</span>
              </div>

              {/* Code / Visual Representation */}
              <pre className="text-cyan-300 whitespace-pre-wrap text-[11px] sm:text-xs leading-relaxed overflow-x-auto py-1 font-mono">
                {activeDim.prism.previewUi.highlightText}
              </pre>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                <span>Micro-Steps Traced: <strong className="text-emerald-400 font-bold">18 Statements</strong></span>
                <span>Heap Identity: <strong className="text-cyan-300 font-bold">sys.settrace active</strong></span>
              </div>
            </div>

            {/* List of Concrete Ground-Truth Capabilities */}
            <div className="space-y-2.5 pt-1">
              {activeDim.prism.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Row with Direct Workbench Link */}
          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
              <span>Ready to test with your own code?</span>
            </div>

            <Link
              href="/workbench"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 transition-all cursor-pointer group"
            >
              <span>Launch Live Workbench</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </SpotlightCard>
      </div>

      {/* Prism Runtime Guarantee Command Matrix */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/50 p-5 sm:p-6 backdrop-blur-md shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>PRISM RUNTIME GUARANTEES</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Zero Simulation · 100% Ground Truth
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GUARANTEE_PILLS.map((pill) => (
            <div
              key={pill.label}
              className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-2xs space-y-1 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {pill.label}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {pill.status}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight pt-0.5">
                {pill.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemSolution;
