"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  BookOpen,
  Code2,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Play,
  RotateCcw,
  AlertCircle,
  Menu,
} from "lucide-react";
import { LearningPath, LearningLesson } from "@/types/learningPath";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import {
  getProgress,
  calculatePathProgress,
  resetPathProgress,
} from "@/lib/learning/progressManager";
import { getAllLessonsForPath } from "@/lib/content/learningPaths";

interface PathOverviewClientProps {
  path: LearningPath;
}

export default function PathOverviewClient({ path }: PathOverviewClientProps) {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressSummary, setProgressSummary] = useState({ completed: 0, total: 10, percentage: 0 });
  const toggleDrawer = useNavDrawerStore((state) => state.toggleDrawer);

  useEffect(() => {
    const progress = getProgress();
    setCompletedLessonIds(progress.completedLessonIds);
    setProgressSummary(calculatePathProgress(path));
  }, [path]);

  const allLessons = getAllLessonsForPath(path);
  const firstIncompleteLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0];

  const handleReset = () => {
    if (confirm("Reset progress for this path?")) {
      resetPathProgress();
      setCompletedLessonIds([]);
      setProgressSummary(calculatePathProgress(path));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 px-4 flex items-center justify-between z-20 shadow-xs select-none">
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/paths" className="hover:text-slate-200 transition-colors">
            Learning Paths
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-medium">{path.title}</span>
        </nav>

        {/* Path Hero & Progress Banner */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
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
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {path.title}
              </h1>
              <p className="text-sm text-slate-300 font-medium">
                {path.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
                {path.description}
              </p>
            </div>

            {/* Resume / Start CTA Button */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <Link
                href={`/paths/${path.slug}/${firstIncompleteLesson.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>
                  {progressSummary.completed === 0
                    ? "Start First Lesson"
                    : progressSummary.completed === progressSummary.total
                    ? "Review First Lesson"
                    : "Resume Next Lesson"}
                </span>
              </Link>

              {progressSummary.completed > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-400 transition-colors"
                  title="Clear completed lessons"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Progress</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar Component */}
          <div className="border-t border-slate-800/80 pt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Curriculum Progress</span>
              <span className="text-cyan-400 font-semibold">
                {progressSummary.completed} of {progressSummary.total} Lessons Completed ({progressSummary.percentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressSummary.percentage}%` }}
              />
            </div>
          </div>

          {/* Prerequisites Pill List */}
          {path.prerequisites.length > 0 && (
            <div className="text-xs space-y-1.5 pt-1">
              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                Recommended Prerequisites:
              </span>
              <div className="flex flex-wrap gap-2">
                {path.prerequisites.map((req, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Stages & Lessons Curriculum Timeline */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Path Stages</span>
          </h2>

          <div className="space-y-6">
            {path.stages.map((stage) => {
              const stageCompletedCount = stage.lessons.filter((l) =>
                completedLessonIds.includes(l.id)
              ).length;
              const isStageComplete =
                stageCompletedCount === stage.lessons.length && stage.lessons.length > 0;

              return (
                <div
                  key={stage.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-200">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {stage.description}
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {stageCompletedCount} / {stage.lessons.length} Completed
                    </span>
                  </div>

                  {/* Lessons List in Stage */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {stage.lessons.map((lesson) => {
                      const isComplete = completedLessonIds.includes(lesson.id);
                      const isNextUp = lesson.id === firstIncompleteLesson.id && !isComplete;

                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                            isComplete
                              ? "bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/30"
                              : isNextUp
                              ? "bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400"
                              : "bg-slate-900/20 border-slate-800/40 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Status Icon */}
                            <div className="shrink-0">
                              {isComplete ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : isNextUp ? (
                                <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-pulse">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                </div>
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600" />
                              )}
                            </div>

                            {/* Lesson Title & Subtitle */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500">
                                  Lesson {lesson.order}:
                                </span>
                                <Link
                                  href={`/paths/${path.slug}/${lesson.slug}`}
                                  className="text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors truncate"
                                >
                                  {lesson.title}
                                </Link>
                                {isNextUp && (
                                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {lesson.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Action Links */}
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <Link
                              href={`/?algo=${lesson.algorithmSlug}&lesson=${lesson.slug}&path=${path.slug}`}
                              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
                              title="Try code immediately in Workbench"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>Try</span>
                            </Link>

                            <Link
                              href={`/paths/${path.slug}/${lesson.slug}`}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                            >
                              <span>{isComplete ? "Review" : "Learn"}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
