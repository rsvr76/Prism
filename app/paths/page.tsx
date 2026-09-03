"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  BookOpen,
  Code2,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Award,
  Target,
  LayoutDashboard,
} from "lucide-react";
import { getAllLearningPaths } from "@/lib/content/learningPaths";
import { calculatePathProgress } from "@/lib/learning/progressManager";
import { PathProgressSummary } from "@/types/learningPath";

export default function LearningPathsPage() {
  const paths = getAllLearningPaths();
  const [progressMap, setProgressMap] = useState<Record<string, PathProgressSummary>>({});

  useEffect(() => {
    const map: Record<string, PathProgressSummary> = {};
    for (const path of paths) {
      map[path.id] = calculatePathProgress(path);
    }
    setProgressMap(map);
  }, [paths]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PRISM
              </span>
              <span className="ml-2 text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
                Learning Paths
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-medium">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Algorithm Library</span>
          </Link>
          <Link
            href="/paths"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors bg-purple-950 border border-purple-500/40 text-purple-300 font-semibold"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Learning Paths</span>
          </Link>
          <Link
            href="/practice"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Practice</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-400 text-xs font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>Guided Learning Curriculums</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Structured Learning Journeys
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Move beyond disjointed algorithm snippets. Follow an intentional, step-by-step curriculum with clear conceptual intuition, prerequisites, and live execution tracing.
          </p>
        </section>

        {/* Learning Paths Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Available Paths</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {paths.length} {paths.length === 1 ? "Curriculum" : "Curriculums"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {paths.map((path) => {
              const progress = progressMap[path.id] || { completed: 0, total: 10, percentage: 0 };
              const isStarted = progress.completed > 0;
              const isCompleted = progress.completed === progress.total && progress.total > 0;

              return (
                <article
                  key={path.id}
                  className="group rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden"
                >
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        {path.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{path.estimatedTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{path.stages.length} Stages</span>
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          <Award className="w-3 h-3" />
                          <span>Complete</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-300 mt-1">
                        {path.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {path.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Progression</span>
                        <span className="text-cyan-400 font-semibold">
                          {progress.completed} of {progress.total} lessons ({progress.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Stages Quick View */}
                  <div className="flex flex-col sm:items-end gap-4 shrink-0">
                    <Link
                      href={`/paths/${path.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all group-hover:translate-x-0.5"
                    >
                      <span>{isCompleted ? "Review Path" : isStarted ? "Resume Path" : "Start Learning"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="text-xs font-mono text-slate-500 text-left sm:text-right space-y-1">
                      <div>6 Sequential Stages:</div>
                      <div className="text-slate-400">Arrays → Lists → Search → Sort → Trees → BST</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Alternative: Non-linear catalog banner */}
        <section className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Prefer an open topic directory?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore standalone algorithms, complexity cards, and code references in our unstructured library catalog.
            </p>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Algorithm Library</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
