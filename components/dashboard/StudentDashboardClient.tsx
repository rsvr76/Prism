"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Compass,
  Target,
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
  Sparkles,
  Activity,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  getUnifiedStudentProgress,
  resetAllStudentProgress,
} from "@/lib/progress/studentProgress";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import { UnifiedStudentProgress } from "@/types/progress";
import { PrismLogoCompact } from "@/components/branding/PrismLogo";
import HamburgerButton from "@/components/navigation/HamburgerButton";

const FALLBACK_PROGRESS: UnifiedStudentProgress = {
  learning: {
    completedCount: 0,
    totalCount: 10,
    percentage: 0,
    currentLesson: null,
    nextLesson: null,
    stageBreakdown: [],
    isCurriculumComplete: false,
  },
  practice: {
    attemptedCount: 0,
    passedCount: 0,
    totalCount: 12,
    remainingCount: 12,
    percentage: 0,
    accuracyPercentage: 0,
    topicBreakdown: {
      arrays: { passed: 0, total: 2 },
      'linked-lists': { passed: 0, total: 2 },
      searching: { passed: 0, total: 2 },
      sorting: { passed: 0, total: 2 },
      trees: { passed: 0, total: 2 },
      complexity: { passed: 0, total: 2 },
    },
    nextChallenge: null,
  },
  overallPercentage: 0,
  recentActivity: [],
  recentExecutions: [],
  lastActiveTimestamp: 0,
};

/**
 * Circular arc progress ring with animated SVG stroke.
 */
function CircularProgress({
  percentage,
  size = 110,
  strokeWidth = 9,
  gradientId,
  gradientFrom,
  gradientTo,
  children,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  gradientFrom: string;
  gradientTo: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200/80 dark:text-slate-800/80"
        />
        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        {children || (
          <span className="font-mono font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboardClient() {
  const [progress, setProgress] = useState<UnifiedStudentProgress>(() => {
    try {
      return getUnifiedStudentProgress();
    } catch {
      return FALLBACK_PROGRESS;
    }
  });
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const toggleDrawer = useNavDrawerStore((state) => state.toggleDrawer);
  const isDrawerOpen = useNavDrawerStore((state) => state.isOpen);

  const refreshProgress = () => {
    try {
      const data = getUnifiedStudentProgress();
      if (data) setProgress(data);
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
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

  const { learning, practice, overallPercentage, recentActivity, recentExecutions, lastActiveTimestamp } = progress;
  const isNewStudent = learning.completedCount === 0 && practice.attemptedCount === 0;

  // Active status label
  const getActiveStatus = () => {
    if (!lastActiveTimestamp) return "Ready to start";
    const diffHours = (Date.now() - lastActiveTimestamp) / (1000 * 60 * 60);
    if (diffHours < 24) return "Active Today";
    if (diffHours < 48) return "Active Yesterday";
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500/30 font-sans">
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-slate-300 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 px-4 flex items-center justify-between z-20 shadow-xs select-none">
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

        <div className="flex items-center gap-3">
          <Link
            href="/workbench"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workbench</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Reset Success Toast */}
        {resetSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-sm shadow-md animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All student progress has been reset successfully.</span>
            </div>
            <button
              onClick={() => setResetSuccess(false)}
              className="text-xs text-emerald-400/80 hover:text-emerald-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Command Bar Status Row */}
        <section aria-label="Student Command Bar" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Capsule 1: Overall Mastery */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 transition-all hover:border-slate-400 dark:hover:border-slate-700">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                Overall Mastery
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {overallPercentage}%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  combined
                </span>
              </div>
            </div>
          </div>

          {/* Capsule 2: Foundations Path */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 transition-all hover:border-slate-400 dark:hover:border-slate-700">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                Foundations Path
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {learning.completedCount}/{learning.totalCount}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  lessons
                </span>
              </div>
            </div>
          </div>

          {/* Capsule 3: Practice Challenges */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 transition-all hover:border-slate-400 dark:hover:border-slate-700">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                Practice Challenges
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {practice.passedCount}/{practice.totalCount}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  passed
                </span>
              </div>
            </div>
          </div>

          {/* Capsule 4: Student Momentum */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 transition-all hover:border-slate-400 dark:hover:border-slate-700">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                Student Status
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {getActiveStatus()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Hero Mission Control Card */}
        <section className="bg-gradient-to-br from-white via-slate-50 to-cyan-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/30 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm dark:shadow-xl">
          {/* Subtle Ambient Watermark */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-8 w-48 h-48 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-900 dark:text-white">
              <polygon points="50,15 90,85 10,85" />
            </svg>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                  Student Progress & Journey
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
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
                  ? "Welcome to Prism. Master Data Structures and Algorithms with verified Python execution, interactive memory visualizers, and guided practice challenges."
                  : learning.isCurriculumComplete
                  ? "You have completed all 10 foundational lessons. Solidify your skills with interactive coding challenges and trace prediction practice."
                  : `Next up in Stage ${learning.nextLesson?.stageId.replace('stage-', '')}: ${learning.nextLesson?.subtitle}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {learning.nextLesson ? (
                <Link
                  href={`/paths/dsa-foundations/${learning.nextLesson.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-semibold text-sm transition-all shadow-sm hover:shadow-cyan-500/25 cursor-pointer"
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
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-sm font-medium transition-colors cursor-pointer shadow-2xs"
              >
                <span>Curriculum Outline</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Bento Grid: Learning, Practice & Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card A: Learning Progress (4 cols) */}
          <section className="lg:col-span-4 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
            <div className="space-y-5">
              {/* Header with Arc Ring */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      Learning Progress
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">DSA Foundations Path</p>
                </div>

                <CircularProgress
                  percentage={learning.percentage}
                  size={76}
                  strokeWidth={7}
                  gradientId="learning-ring"
                  gradientFrom="#06b6d4"
                  gradientTo="#3b82f6"
                />
              </div>

              {/* Progress Summary and Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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

              {/* Stage Progression Milestones */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Stage Milestones
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {learning.stageBreakdown.map(({ stage, completed, total, isComplete }) => (
                    <div
                      key={stage.id}
                      className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                        isComplete
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : completed > 0
                          ? "bg-cyan-50 border-cyan-300 text-cyan-800 dark:bg-cyan-950/20 dark:border-cyan-500/40 dark:text-cyan-300"
                          : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/40 dark:border-slate-800/80 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-medium truncate text-[11px]">
                          {stage.title.split(':')[1]?.trim() || stage.title}
                        </span>
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
              className="text-xs font-mono text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1.5 transition-colors self-start pt-2 font-medium"
            >
              <span>View Full Learning Path</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </section>

          {/* Card B: Practice Progress (4 cols) */}
          <section className="lg:col-span-4 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
            <div className="space-y-5">
              {/* Header with Arc Ring */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      Practice Progress
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive Coding & Tracing Challenges
                  </p>
                </div>

                <CircularProgress
                  percentage={practice.percentage}
                  size={76}
                  strokeWidth={7}
                  gradientId="practice-ring"
                  gradientFrom="#a855f7"
                  gradientTo="#ec4899"
                />
              </div>

              {/* Progress Summary and Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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

              {/* Topic Mastery Pills */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Topic Mastery
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(practice.topicBreakdown).map(([topic, { passed, total }]) => (
                    <div
                      key={topic}
                      className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                        passed > 0 && passed === total
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : passed > 0
                          ? "bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-950/20 dark:border-purple-500/40 dark:text-purple-300"
                          : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/40 dark:border-slate-800/80 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-medium capitalize truncate text-[11px]">
                          {topic.replace('-', ' ')}
                        </span>
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
              className="text-xs font-mono text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1.5 transition-colors self-start pt-2 font-medium"
            >
              <span>Explore All Challenges</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </section>

          {/* Card C: Recent Activity Timeline Stream (4 cols) */}
          <section className="lg:col-span-4 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {recentActivity.length} events logged
                </span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    No recent learning activity yet.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Start your first lesson in{" "}
                    <Link href="/paths/dsa-foundations" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                      DSA Foundations
                    </Link>{" "}
                    to log your progress.
                  </p>
                </div>
              ) : (
                <div className="relative pl-3 space-y-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {recentActivity.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer relative"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10 ${
                            item.type === "lesson-completed"
                              ? "bg-emerald-500 text-white"
                              : item.type === "challenge-passed"
                              ? "bg-purple-500 text-white"
                              : item.type === "challenge-attempted"
                              ? "bg-amber-500 text-white"
                              : "bg-cyan-500 text-white"
                          }`}
                        >
                          {item.type === "lesson-completed" || item.type === "challenge-passed" ? (
                            <Check className="w-3 h-3" />
                          ) : item.type === "challenge-attempted" ? (
                            <Target className="w-3 h-3" />
                          ) : (
                            <Play className="w-2.5 h-2.5 fill-current" />
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-500 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                Verified execution events synchronized with local runtime
              </span>
            </div>
          </section>
        </div>

        {/* 4. Action Dock: Next Lesson & Recommended Practice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action A: Continue Learning Next Milestone */}
          <section className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Next Lesson in Journey</span>
                </div>
                {learning.nextLesson && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 uppercase">
                    Stage {learning.nextLesson.stageId.replace('stage-', '')}
                  </span>
                )}
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-semibold transition-all shadow-sm self-start cursor-pointer hover:shadow-cyan-500/20"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/paths/dsa-foundations"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold transition-all self-start cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <span>Review Curriculum</span>
              </Link>
            )}
          </section>

          {/* Action B: Recommended Practice Challenge */}
          <section className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Practice Next</span>
                </div>
                {practice.nextChallenge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 font-mono capitalize">
                    {practice.nextChallenge.difficulty}
                  </span>
                )}
              </div>

              {practice.nextChallenge ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {practice.nextChallenge.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {practice.nextChallenge.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Challenges Completed!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Outstanding achievement. You have mastered all available practice challenges.
                  </p>
                </div>
              )}
            </div>

            {practice.nextChallenge ? (
              <Link
                href={`/practice/${practice.nextChallenge.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white dark:bg-purple-500 dark:hover:bg-purple-400 dark:text-slate-950 text-xs font-semibold transition-all shadow-sm self-start cursor-pointer hover:shadow-purple-500/20"
              >
                <span>Start Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/practice"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold transition-all self-start cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <span>View Practice Catalog</span>
              </Link>
            )}
          </section>
        </div>

        {/* 5. Recent Executions / Workbench History */}
        {recentExecutions.length > 0 && (
          <section className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Recent Workbench Runs
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {recentExecutions.length} sessions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="space-y-1 truncate pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{exec.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-mono">
                        {exec.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {exec.totalSteps} steps - {new Date(exec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Link
                    href={`/?snippet=${exec.id}`}
                    className="shrink-0 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-cyan-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-cyan-400 font-medium transition-colors cursor-pointer border border-slate-300/80 dark:border-transparent"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Settings & Reset Progress Action */}
        <section className="pt-6 border-t border-slate-300 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Deterministic progress tracked via verified Python WASM execution traces</span>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 dark:text-rose-400 dark:border-rose-500/30 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer font-medium"
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
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
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
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors border border-rose-700/60 shadow-xs cursor-pointer"
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
