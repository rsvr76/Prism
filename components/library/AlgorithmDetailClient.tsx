"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Code2,
  ArrowLeft,
  Play,
  Copy,
  Check,
  Clock,
  HardDrive,
  Eye,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Menu,
} from "lucide-react";
import { AlgorithmDefinition } from "@/types/content";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";

interface AlgorithmDetailClientProps {
  algorithm: AlgorithmDefinition;
}

export default function AlgorithmDetailClient({ algorithm }: AlgorithmDetailClientProps) {
  const router = useRouter();
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);
  const toggleDrawer = useNavDrawerStore((state) => state.toggleDrawer);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(algorithm.pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const handleTryInPrism = () => {
    loadAlgorithmCode(algorithm.name, algorithm.pythonCode);
    router.push(`/?algo=${algorithm.slug}`);
  };

  const isDataStructure = algorithm.category === "data-structures";
  const isBeginner = algorithm.difficulty === "Beginner";

  const getVisualizationLabel = (target: string) => {
    switch (target) {
      case "1d_array":
        return "1D Array Visualizer";
      case "singly_linked_list":
        return "Linked List Visualizer";
      case "binary_tree":
        return "BST / Tree Visualizer";
      default:
        return "Structure Visualizer";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between gap-3 px-4 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-20 shadow-xs select-none">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDrawer}
            aria-label="Navigation menu"
            className="p-2 -ml-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                PRISM
              </h1>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono tracking-wider uppercase leading-none mt-1">
                DSA Learning Environment
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Breadcrumb & Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link
              href="/library"
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Library</span>
            </Link>
            <span>/</span>
            <span className="capitalize">{algorithm.category.replace("-", " ")}</span>
            <span>/</span>
            <span className="text-cyan-300 font-semibold">{algorithm.name}</span>
          </div>

          {/* Primary Try in Prism Button */}
          <button
            onClick={handleTryInPrism}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Try in Prism</span>
          </button>
        </div>

        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                isDataStructure
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/30"
                  : "bg-purple-950/80 text-purple-300 border-purple-500/30"
              }`}
            >
              {isDataStructure ? "Data Structure" : "Algorithm"}
            </span>
            <span
              className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                isBeginner
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-950/80 text-amber-400 border-amber-500/30"
              }`}
            >
              {algorithm.difficulty}
            </span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>{getVisualizationLabel(algorithm.visualizationType)}</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            {algorithm.name}
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            {algorithm.description}
          </p>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {algorithm.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* 2-Column Educational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          {/* Left Column: Conceptual Breakdown */}
          <div className="space-y-6">
            {/* What This Does */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <Lightbulb className="w-4 h-4" />
                <span>What This Does</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {algorithm.whatItDoes}
              </p>
            </section>

            {/* How It Works */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>How It Works</span>
              </div>
              <ol className="space-y-2.5 text-sm text-slate-300">
                {algorithm.howItWorks.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Complexity Analysis */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <Clock className="w-4 h-4" />
                <span>Complexity Analysis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Time Complexity */}
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Time Complexity</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <div className="text-slate-300">Best: <span className="text-emerald-400 font-bold">{algorithm.timeComplexity.best}</span></div>
                    <div className="text-slate-300">Average: <span className="text-amber-400 font-bold">{algorithm.timeComplexity.average}</span></div>
                    <div className="text-slate-300">Worst: <span className="text-rose-400 font-bold">{algorithm.timeComplexity.worst}</span></div>
                  </div>
                  {algorithm.timeComplexity.explanation && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                      {algorithm.timeComplexity.explanation}
                    </p>
                  )}
                </div>

                {/* Space Complexity */}
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-semibold">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    <span>Space Complexity</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <div className="text-slate-300">Worst Case: <span className="text-purple-300 font-bold">{algorithm.spaceComplexity.worst}</span></div>
                  </div>
                  {algorithm.spaceComplexity.explanation && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                      {algorithm.spaceComplexity.explanation}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Prerequisites */}
            {algorithm.prerequisites.length > 0 && (
              <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-md space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Prerequisites
                </h4>
                <div className="flex flex-wrap gap-2">
                  {algorithm.prerequisites.map((prereq, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium"
                    >
                      ✓ {prereq}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* What to Watch in Prism */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <Eye className="w-4 h-4" />
                <span>What to Watch in Prism</span>
              </div>
              <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                {algorithm.whatToWatch.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-cyan-400 font-bold shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Ask Prism AI Tutor Prompts */}
            <section className="bg-gradient-to-br from-purple-950/20 to-slate-900/70 border border-purple-500/20 rounded-xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>Ask Prism AI Tutor</span>
              </div>
              <p className="text-xs text-slate-400">
                Once loaded in the workbench, step through execution and try asking the AI Tutor:
              </p>
              <div className="space-y-2">
                {algorithm.suggestedTutorQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-mono flex items-start gap-2"
                  >
                    <span className="text-purple-400">💬</span>
                    <span>&quot;{q}&quot;</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Code Implementation & Launch CTA */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Code Box */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Python 3 Implementation</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer border border-slate-800"
                  title="Copy code"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[500px]">
                <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre">
                  <code>{algorithm.pythonCode}</code>
                </pre>
              </div>

              {/* Bottom CTA within Code Box */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
                <button
                  onClick={handleTryInPrism}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Open & Run in Workbench</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Loads this code into Monaco editor, initializes memory tracing, and prepares real execution.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
