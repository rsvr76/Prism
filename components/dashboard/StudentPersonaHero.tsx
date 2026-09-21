"use client";

import React from "react";
import Link from "next/link";
import { Award, Flame, ArrowRight, Sparkles, CheckCircle2, Terminal } from "lucide-react";
import { UnifiedStudentProgress } from "@/types/progress";
import NumberTicker from "@/components/ui/NumberTicker";
import BorderBeam from "@/components/ui/BorderBeam";

interface StudentPersonaHeroProps {
  progress: UnifiedStudentProgress;
}

export default function StudentPersonaHero({ progress }: StudentPersonaHeroProps) {
  const { learning, practice, overallPercentage, lastActiveTimestamp } = progress;
  const isNewStudent = learning.completedCount === 0 && practice.attemptedCount === 0;

  // Derive Persona Title and Level
  const getPersona = () => {
    if (overallPercentage < 25) return { rank: "Level 1", title: "Algorithmic Initiate", nextMilestone: "Complete Array Foundations" };
    if (overallPercentage < 50) return { rank: "Level 2", title: "Pointer Navigator", nextMilestone: "Master Linked Lists" };
    if (overallPercentage < 75) return { rank: "Level 3", title: "Tree Architect", nextMilestone: "Binary Search Tree Traversal" };
    return { rank: "Level 4", title: "Algorithm Artisan", nextMilestone: "Mastered All Curriculums" };
  };

  const persona = getPersona();

  const getActiveStatus = () => {
    if (!lastActiveTimestamp) return "Ready to start";
    const diffHours = (Date.now() - lastActiveTimestamp) / (1000 * 60 * 60);
    if (diffHours < 24) return "Active Today";
    if (diffHours < 48) return "Active Yesterday";
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-cyan-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/30 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm dark:shadow-xl">
      <BorderBeam size={280} duration={12} colorFrom="#06b6d4" colorTo="#a855f7" />
      {/* Subtle Ambient Watermark */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3.5 max-w-2xl">
          {/* Persona Header Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300">
              <Award className="w-3.5 h-3.5" />
              <span>{persona.rank}</span>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span>{persona.title}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>{getActiveStatus()}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              <Terminal className="w-3 h-3" />
              <span>Python 3.12 WASM</span>
            </span>
          </div>

          {/* Heading strictly preserves E2E test regex: /Start Your DSA Learning Journey|Continue:/i */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {isNewStudent
              ? "Start Your DSA Learning Journey"
              : learning.isCurriculumComplete
              ? "DSA Foundations Completed! 🎉"
              : `Continue: ${learning.nextLesson?.title || "DSA Foundations"}`}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isNewStudent
              ? "Welcome to Prism. Master Data Structures and Algorithms with verified Python execution, interactive memory visualizers, and guided practice challenges."
              : learning.isCurriculumComplete
              ? "You have completed all 10 foundational lessons. Solidify your skills with interactive coding challenges and trace prediction practice."
              : `Next up in Stage ${learning.nextLesson?.stageId.replace("stage-", "")}: ${learning.nextLesson?.subtitle}`}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
            <span>Overall Mastery: <strong className="text-cyan-600 dark:text-cyan-400"><NumberTicker value={overallPercentage} suffix="%" /></strong></span>
            <span>·</span>
            <span>Lessons: <strong className="text-slate-800 dark:text-slate-200">{learning.completedCount}/{learning.totalCount}</strong></span>
            <span>·</span>
            <span>Challenges: <strong className="text-slate-800 dark:text-slate-200">{practice.passedCount}/{practice.totalCount}</strong></span>
          </div>
        </div>

        {/* Hero Actions (Preserves 'Continue Learning' button for E2E tests) */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {learning.nextLesson ? (
            <Link
              href={`/paths/dsa-foundations/${learning.nextLesson.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-semibold text-sm transition-all shadow-md hover:shadow-cyan-500/25 cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white dark:bg-purple-500 dark:hover:bg-purple-400 dark:text-slate-950 font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              <span>Explore Practice</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/workbench"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <span>Open Workbench</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
