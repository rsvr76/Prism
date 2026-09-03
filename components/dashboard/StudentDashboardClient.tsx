"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Compass,
  Target,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  RotateCcw,
  Clock,
  Play,
  Check,
  AlertTriangle,
  Flame,
  Award,
  BookMarked,
  Activity,
  Layers,
} from "lucide-react";
import {
  getUnifiedStudentProgress,
  resetAllStudentProgress,
} from "@/lib/progress/studentProgress";
import { UnifiedStudentProgress } from "@/types/progress";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function StudentDashboardClient() {
  const [progress, setProgress] = useState<UnifiedStudentProgress | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const refreshProgress = () => {
    const data = getUnifiedStudentProgress();
    setProgress(data);
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  const handleConfirmReset = () => {
    resetAllStudentProgress();
    refreshProgress();
    setShowResetModal(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-mono">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span>Loading student progress…</span>
        </div>
      </div>
    );
  }

  const { learning, practice, overallPercentage, recentActivity, recentExecutions } = progress;
  const isNewStudent = learning.completedCount === 0 && practice.attemptedCount === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500/30 font-sans">
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur sticky top-0 px-4 sm:px-6 flex items-center justify-between z-20 shadow-xs dark:shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Prism
              </span>
              <span className="text-[10px] text-cyan-800 dark:text-cyan-400 font-mono ml-1.5 px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/30">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg text-xs font-medium">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Algorithm Library</span>
            <span className="sm:hidden">Library</span>
          </Link>
          <Link
            href="/paths"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Learning Paths</span>
            <span className="sm:hidden">Paths</span>
          </Link>
          <Link
            href="/practice"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Practice</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-all bg-white border border-slate-300 text-cyan-800 font-semibold shadow-xs dark:bg-cyan-950 dark:border-cyan-500/40 dark:text-cyan-300"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </nav>

        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Reset Success Toast */}
        {resetSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All student progress has been reset successfully.</span>
            </div>
            <button
              onClick={() => setResetSuccess(false)}
              className="text-xs text-emerald-400/80 hover:text-emerald-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Welcome & Primary Continue Learning Action */}
        <section className="bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs dark:shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                  Student Progress & Journey
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isNewStudent
                  ? "Start Your DSA Learning Journey"
                  : learning.isCurriculumComplete
                  ? "DSA Foundations Completed! 🎉"
                  : `Continue: ${learning.nextLesson?.title || "DSA Foundations"}`}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {isNewStudent
                  ? "Welcome to Prism! Master Data Structures and Algorithms with verified Python execution, interactive memory visualizers, and guided practice challenges."
                  : learning.isCurriculumComplete
                  ? "You have completed all 10 foundational lessons! Solidify your skills with interactive coding challenges and trace prediction practice."
                  : `Next up in Stage ${learning.nextLesson?.stageId.replace('stage-', '')}: ${learning.nextLesson?.subtitle}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {learning.nextLesson ? (
                <Link
                  href={`/paths/dsa-foundations/${learning.nextLesson.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-semibold text-sm transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white dark:bg-purple-500 dark:hover:bg-purple-400 dark:text-slate-950 font-semibold text-sm transition-all shadow-sm cursor-pointer"
                >
                  <span>Explore Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/paths/dsa-foundations"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-sm font-medium transition-colors cursor-pointer"
              >
                <span>Curriculum Outline</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Unified Metrics Overview: Learning vs Practice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Learning Progress */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Learning Progress</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">DSA Foundations Path</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-400">
                  {learning.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${learning.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{learning.completedCount} of {learning.totalCount} Lessons Complete</span>
                  <span>{learning.totalCount - learning.completedCount} Remaining</span>
                </div>
              </div>

              {/* Stage Progression Pills */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Stage Milestones
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {learning.stageBreakdown.map(({ stage, completed, total, isComplete }) => (
                    <div
                      key={stage.id}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                        isComplete
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : completed > 0
                          ? "bg-cyan-50 border-cyan-300 text-cyan-800 dark:bg-cyan-950/20 dark:border-cyan-500/40 dark:text-cyan-300"
                          : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950/40 dark:border-slate-800/80 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-medium truncate">{stage.title.split(':')[1]?.trim() || stage.title}</span>
                        {isComplete ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {completed}/{total} lessons
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/paths/dsa-foundations"
              className="text-xs font-mono text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors self-start"
            >
              <span>View Full Learning Path</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </section>

          {/* Card B: Practice Progress */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Practice Progress</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Interactive Coding & Tracing Challenges</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-400">
                  {practice.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${practice.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{practice.passedCount} of {practice.totalCount} Challenges Passed</span>
                  <span>{practice.attemptedCount} Attempted</span>
                </div>
              </div>

              {/* Topic Breakdown Pills */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Topic Mastery
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(practice.topicBreakdown).map(([topic, { passed, total }]) => (
                    <div
                      key={topic}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                        passed > 0 && passed === total
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : passed > 0
                          ? "bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-950/20 dark:border-purple-500/40 dark:text-purple-300"
                          : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950/40 dark:border-slate-800/80 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-medium capitalize truncate">{topic.replace('-', ' ')}</span>
                        {passed === total && total > 0 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {passed}/{total} passed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/practice"
              className="text-xs font-mono text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 transition-colors self-start"
            >
              <span>Explore All Challenges</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </section>
        </div>

        {/* 3. Next Action Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action A: Continue Learning */}
          <section className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Next Lesson in Journey</span>
              </div>
              {learning.nextLesson ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {learning.nextLesson.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {learning.nextLesson.whyItMatters}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Lessons Completed!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You have finished every lesson in DSA Foundations. Review any topic or dive into challenges.
                  </p>
                </div>
              )}
            </div>

            {learning.nextLesson ? (
              <Link
                href={`/paths/dsa-foundations/${learning.nextLesson.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-semibold transition-all shadow-sm self-start cursor-pointer"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/paths/dsa-foundations"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold transition-all self-start cursor-pointer"
              >
                <span>Review Curriculum</span>
              </Link>
            )}
          </section>

          {/* Action B: Recommended Practice Challenge */}
          <section className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Practice Next</span>
              </div>
              {practice.nextChallenge ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {practice.nextChallenge.title}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 font-mono capitalize">
                      {practice.nextChallenge.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {practice.nextChallenge.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Challenges Completed!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Outstanding achievement! You have mastered all available practice challenges.
                  </p>
                </div>
              )}
            </div>

            {practice.nextChallenge ? (
              <Link
                href={`/practice/${practice.nextChallenge.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white dark:bg-purple-500 dark:hover:bg-purple-400 dark:text-slate-950 text-xs font-semibold transition-all shadow-sm self-start cursor-pointer"
              >
                <span>Start Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/practice"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold transition-all self-start cursor-pointer"
              >
                <span>View Practice Catalog</span>
              </Link>
            )}
          </section>
        </div>

        {/* 4. Recent Activity Stream */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {recentActivity.length} events logged
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">No recent learning activity yet.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start your first lesson in{" "}
                <Link href="/paths/dsa-foundations" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                  DSA Foundations
                </Link>{" "}
                to log your progress.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentActivity.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        item.type === "lesson-completed"
                          ? "bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : item.type === "challenge-passed"
                          ? "bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400"
                          : item.type === "challenge-attempted"
                          ? "bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : "bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400"
                      }`}
                    >
                      {item.type === "lesson-completed" || item.type === "challenge-passed" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : item.type === "challenge-attempted" ? (
                        <Target className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.subtitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 5. Recent Executions / Workbench History */}
        {recentExecutions.length > 0 && (
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Workbench Runs</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {recentExecutions.length} sessions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1 truncate pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{exec.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-mono">
                        {exec.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {exec.totalSteps} steps · {new Date(exec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="shrink-0 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-cyan-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-cyan-400 font-medium transition-colors cursor-pointer"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Settings & Reset Progress Action */}
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-300">Student Progress Persistence</p>
            <p className="text-slate-500 dark:text-slate-400">
              Stored securely in your local browser storage (<code className="text-cyan-700 dark:text-cyan-400">prism_progress</code>).
            </p>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Progress</span>
          </button>
        </section>

        {/* Confirmation Modal */}
        {showResetModal && (
          <div
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="reset-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Reset Student Progress?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">This action will clear all progress records.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This will reset your completed lessons in <strong>DSA Foundations</strong>, clear your challenge attempts and passes in <strong>Practice</strong>, and remove recent activity logs.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your application code files, environment configuration, and execution sandboxes will not be affected.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
