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
  Award,
  Target,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { getAllLearningPaths } from "@/lib/content/learningPaths";
import { calculatePathProgress } from "@/lib/learning/progressManager";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import { PathProgressSummary } from "@/types/learningPath";
import { PrismLogoCompact } from "@/components/branding/PrismLogo";
import HamburgerButton from "@/components/navigation/HamburgerButton";

export default function LearningPathsPage() {
  const paths = getAllLearningPaths();
  const [progressMap, setProgressMap] = useState<Record<string, PathProgressSummary>>({});
  const toggleDrawer = useNavDrawerStore((state) => state.toggleDrawer);
  const isDrawerOpen = useNavDrawerStore((state) => state.isOpen);

  useEffect(() => {
    const map: Record<string, PathProgressSummary> = {};
    for (const path of paths) {
      map[path.id] = calculatePathProgress(path);
    }
    setProgressMap(map);
  }, [paths]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500/30 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 px-4 flex items-center justify-between z-20 shadow-xs select-none">
        <div
          className={`flex items-center gap-3 shrink-0 transition-opacity duration-200 ${
            isDrawerOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <HamburgerButton
            isOpen={isDrawerOpen}
            onClick={toggleDrawer}
            ariaLabel="Navigation menu"
            title="Navigation Menu"
          />
          <Link href="/" className="flex items-center group">
            <PrismLogoCompact size="sm" />
          </Link>
        </div>

        <Link
          href="/workbench"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Workbench</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-400 text-xs font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>Guided Learning Curriculums</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Structured Learning Journeys
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Move beyond disjointed algorithm snippets. Follow an intentional, step-by-step curriculum with clear conceptual intuition, prerequisites, and live execution tracing.
          </p>
        </section>

        {/* Learning Paths Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
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
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden shadow-xs hover:shadow-md"
                >
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30">
                        {path.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60">
                        <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span>{path.estimatedTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60">
                        <Layers className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span>{path.stages.length} Stages</span>
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                          <Award className="w-3 h-3" />
                          <span>Complete</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                        {path.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {path.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 dark:text-slate-400">Progression</span>
                        <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                          {progress.completed} of {progress.total} lessons ({progress.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-semibold text-sm shadow-sm transition-all group-hover:translate-x-0.5 cursor-pointer"
                    >
                      <span>{isCompleted ? "Review Path" : isStarted ? "Resume Path" : "Start Learning"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="text-xs font-mono text-slate-500 text-left sm:text-right space-y-1">
                      <div>6 Sequential Stages:</div>
                      <div className="text-slate-600 dark:text-slate-400">Arrays → Lists → Search → Sort → Trees → BST</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Alternative: Non-linear catalog banner */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Prefer an open topic directory?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Explore standalone algorithms, complexity cards, and code references in our unstructured library catalog.
            </p>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Open Algorithm Library</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
