"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Code2,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Eye,
  MessageSquare,
  Zap,
  Target,
} from "lucide-react";
import { LearningPath, LearningStage, LearningLesson } from "@/types/learningPath";
import { AlgorithmDefinition } from "@/types/content";
import {
  getProgress,
  toggleLessonComplete,
  isLessonCompleted,
  setCurrentLesson,
} from "@/lib/learning/progressManager";
import { getChallengesForLesson } from "@/lib/content/challenges";
import { logActivity } from "@/lib/progress/studentProgress";

interface LessonViewClientProps {
  path: LearningPath;
  stage: LearningStage;
  lesson: LearningLesson;
  algorithm?: AlgorithmDefinition;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
}

export default function LessonViewClient({
  path,
  stage,
  lesson,
  algorithm,
  prevLesson,
  nextLesson,
}: LessonViewClientProps) {
  const [completed, setCompleted] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    setCompleted(isLessonCompleted(lesson.id));
    const progress = getProgress();
    setCompletedIds(progress.completedLessonIds);
    setCurrentLesson(lesson.id);
    logActivity({
      type: 'lesson-started',
      title: lesson.title,
      subtitle: `Stage: ${stage.title}`,
      href: `/paths/${path.slug}/${lesson.slug}`,
    });
  }, [lesson.id, lesson.title, stage.title, path.slug, lesson.slug]);

  const handleToggleComplete = () => {
    const nextState = toggleLessonComplete(lesson.id);
    setCompleted(nextState);
    const progress = getProgress();
    setCompletedIds(progress.completedLessonIds);
    if (nextState) {
      logActivity({
        type: 'lesson-completed',
        title: lesson.title,
        subtitle: `Completed · ${stage.title}`,
        href: `/paths/${path.slug}/${lesson.slug}`,
      });
    }
  };

  const handleCopyCode = () => {
    if (!algorithm) return;
    navigator.clipboard.writeText(algorithm.pythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const totalLessons = path.stages.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedCount = completedIds.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);
  const lessonChallenges = getChallengesForLesson(lesson.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PRISM
              </span>
              <span className="ml-2 text-[10px] text-purple-400 font-mono tracking-wider uppercase">
                Guided Lesson
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
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
        </nav>
      </header>

      {/* Main Layout: Sidebar + Lesson Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Left Stage/Lesson Navigation Sidebar */}
        <aside className="w-full lg:w-72 lg:border-r border-b lg:border-b-0 border-slate-800/80 bg-slate-900/30 p-4 lg:p-6 shrink-0 space-y-6">
          <div className="space-y-2">
            <Link
              href={`/paths/${path.slug}`}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to {path.title}</span>
            </Link>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Curriculum Outline
            </h2>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Progress</span>
                <span className="text-cyan-400">{completedCount}/{totalLessons} ({progressPct}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stages Accordion / Lesson Links */}
          <nav aria-label="Path Lessons" className="space-y-4">
            {path.stages.map((stg) => (
              <div key={stg.id} className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                  {stg.title}
                </div>
                <div className="space-y-1">
                  {stg.lessons.map((lsn) => {
                    const isCurrent = lsn.id === lesson.id;
                    const isDone = completedIds.includes(lsn.id);

                    return (
                      <Link
                        key={lsn.id}
                        href={`/paths/${path.slug}/${lsn.slug}`}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                          isCurrent
                            ? "bg-purple-950/80 text-purple-200 border border-purple-500/40 font-semibold"
                            : isDone
                            ? "text-slate-300 hover:bg-slate-800/60"
                            : "text-slate-400 hover:bg-slate-800/40"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <div className="w-3.5 h-3.5 rounded-full border border-purple-400 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          </div>
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className="truncate">{lsn.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Lesson Body */}
        <main className="flex-1 p-6 sm:p-10 space-y-8 max-w-4xl">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-400">
            <Link href="/paths" className="hover:text-slate-200 transition-colors">
              Learning Paths
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href={`/paths/${path.slug}`} className="hover:text-slate-200 transition-colors">
              {path.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-400">{stage.title.split(":")[0]}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-purple-400 font-medium">{lesson.title}</span>
          </nav>

          {/* Lesson Title Header & Mark Complete Action */}
          <section className="space-y-4 border-b border-slate-800/80 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
                  Lesson {lesson.order} of {totalLessons}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {lesson.title}
                </h1>
                <p className="text-sm text-slate-300">
                  {lesson.subtitle}
                </p>
              </div>

              {/* Completion Toggle */}
              <button
                onClick={handleToggleComplete}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                  completed
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${completed ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{completed ? "Completed" : "Mark as Complete"}</span>
              </button>
            </div>
          </section>

          {/* Why Am I Learning This? */}
          <section className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Why Am I Learning This?</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lesson.whyItMatters}
            </p>
          </section>

          {/* Learning Objectives & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Objectives */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Learning Objectives</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {lesson.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Prerequisites */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono uppercase tracking-wider">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Prerequisites</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {lesson.prerequisites.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Concept Explanation & Mental Model */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Concept & Mental Model</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lesson.conceptExplanation}
            </p>
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 italic border-l-4 border-l-cyan-500">
              <strong className="text-cyan-400 not-italic block mb-1">Intuitive Mental Model:</strong>
              &ldquo;{lesson.mentalModel}&rdquo;
            </div>
          </section>

          {/* Interactive Python Example & Try in Prism CTA */}
          {algorithm && (
            <section className="rounded-xl border border-cyan-500/30 bg-slate-900/60 overflow-hidden space-y-0">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Workbench Example: {algorithm.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target visualizer: <span className="text-cyan-300 font-mono">{algorithm.visualizationType}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>

                  <Link
                    href={`/?algo=${algorithm.slug}&lesson=${lesson.slug}&path=${path.slug}`}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Try in Prism</span>
                  </Link>
                </div>
              </div>

              {/* Code Preview */}
              <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto text-slate-300 max-h-72">
                <pre>{algorithm.pythonCode}</pre>
              </div>

              {/* Complexity Summary */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">BEST TIME</span>
                  <span className="text-emerald-400 font-bold">{algorithm.timeComplexity.best}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">AVG TIME</span>
                  <span className="text-cyan-400 font-bold">{algorithm.timeComplexity.average}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">WORST TIME</span>
                  <span className="text-amber-400 font-bold">{algorithm.timeComplexity.worst}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">AUX SPACE</span>
                  <span className="text-purple-400 font-bold">{algorithm.spaceComplexity.worst}</span>
                </div>
              </div>
            </section>
          )}

          {/* What to Watch & Ask AI Tutor */}
          {algorithm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visualizer Cues */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>What to Watch in Prism</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {algorithm.whatToWatch.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* AI Tutor Prompts */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Ask the AI Tutor in Workbench</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {algorithm.suggestedTutorQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">?</span>
                      <span>&ldquo;{q}&rdquo;</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {/* Practice Challenges for this Lesson */}
          {lessonChallenges.length > 0 && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Practice This Concept</h3>
                    <p className="text-xs text-slate-400">Test your understanding with hands-on challenges</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lessonChallenges.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/practice/${ch.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-white block">{ch.title}</span>
                      <span className="text-slate-500 capitalize">{ch.difficulty} · {ch.type.replace('-', ' ')}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Traversal Navigation & Next Guidance */}
          <section className="border-t border-slate-800 pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/paths/${path.slug}/${prevLesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous: {prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/paths/${path.slug}/${nextLesson.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all ml-auto"
                >
                  <span>Next: {nextLesson.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href={`/paths/${path.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all ml-auto"
                >
                  <span>Complete Curriculum</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
