"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Bug,
  Eye,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Compass,
  Target,
  Filter,
  Search,
} from "lucide-react";
import {
  getAllChallenges,
  searchChallenges,
} from "@/lib/content/challenges";
import {
  getChallengeProgress,
} from "@/lib/practice/challengeProgressManager";
import { Challenge, ChallengeTopic, ChallengeDifficulty, ChallengeType, ChallengeProgressState } from "@/types/challenge";

const TOPIC_LABELS: Record<ChallengeTopic | "all", string> = {
  all: "All Topics",
  arrays: "Arrays",
  "linked-lists": "Linked Lists",
  searching: "Searching",
  sorting: "Sorting",
  trees: "Trees",
  complexity: "Complexity",
};

const DIFFICULTY_LABELS: Record<ChallengeDifficulty | "all", string> = {
  all: "All Difficulties",
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
};

const TYPE_LABELS: Record<ChallengeType | "all", string> = {
  all: "All Types",
  "code-completion": "Code Completion",
  debugging: "Debugging",
  "trace-prediction": "Trace Prediction",
  complexity: "Complexity",
};

const TYPE_ICONS: Record<ChallengeType, React.ReactNode> = {
  "code-completion": <Code2 className="w-3.5 h-3.5" />,
  debugging: <Bug className="w-3.5 h-3.5" />,
  "trace-prediction": <Eye className="w-3.5 h-3.5" />,
  complexity: <BarChart3 className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<ChallengeType, string> = {
  "code-completion": "bg-cyan-950/60 border-cyan-500/30 text-cyan-300",
  debugging: "bg-rose-950/60 border-rose-500/30 text-rose-300",
  "trace-prediction": "bg-violet-950/60 border-violet-500/30 text-violet-300",
  complexity: "bg-amber-950/60 border-amber-500/30 text-amber-300",
};

const DIFFICULTY_COLORS: Record<ChallengeDifficulty, string> = {
  Beginner: "text-emerald-400",
  Intermediate: "text-amber-400",
  Advanced: "text-rose-400",
};

function ChallengeCard({ challenge, progress }: { challenge: Challenge; progress: ChallengeProgressState }) {
  const attempt = progress.attempts[challenge.id];
  const isPassed = attempt?.passed === true;
  const isAttempted = !!attempt && !isPassed;

  return (
    <Link
      href={`/practice/${challenge.slug}`}
      className="group block bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all"
      aria-label={`${challenge.title} — ${challenge.difficulty} ${challenge.type} challenge`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${TYPE_COLORS[challenge.type]}`}>
            {TYPE_ICONS[challenge.type]}
            {TYPE_LABELS[challenge.type]}
          </span>
          <span className={`text-xs font-semibold ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
        </div>
        <div className="shrink-0">
          {isPassed ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Passed
            </span>
          ) : isAttempted ? (
            <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <Clock className="w-4 h-4" />
              In Progress
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white mb-1.5 transition-colors">
        {challenge.title}
      </h3>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{challenge.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 capitalize">{TOPIC_LABELS[challenge.topic]}</span>
        {challenge.timeComplexity && (
          <span className="text-xs font-mono text-slate-500">{challenge.timeComplexity}</span>
        )}
      </div>
    </Link>
  );
}

export default function PracticeDashboard() {
  const allChallenges = getAllChallenges();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<ChallengeTopic | "all">("all");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "all">("all");
  const [type, setType] = useState<ChallengeType | "all">("all");
  const [progress, setProgress] = useState<ChallengeProgressState>({ attempts: {}, lastUpdated: 0 });

  useEffect(() => {
    setProgress(getChallengeProgress());
  }, []);

  const filtered = searchChallenges(query, topic, difficulty, type);

  const passedCount = allChallenges.filter((c) => progress.attempts[c.id]?.passed).length;
  const attemptedCount = allChallenges.filter((c) => progress.attempts[c.id] && !progress.attempts[c.id].passed).length;

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
                Practice
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-medium" aria-label="Main Navigation">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <Code2 className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </Link>
          <Link href="/library" className="flex items-center gap-1.5 px-3 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Algorithm Library</span>
          </Link>
          <Link href="/paths" className="flex items-center gap-1.5 px-3 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <Compass className="w-3.5 h-3.5" />
            <span>Learning Paths</span>
          </Link>
          <Link href="/practice" className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold transition-colors">
            <Target className="w-3.5 h-3.5" />
            <span>Practice</span>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Practice Challenges</h1>
            <p className="text-slate-400 text-sm">Test your DSA understanding with real Python execution.</p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-emerald-400 font-semibold">{passedCount} passed</span>
          {attemptedCount > 0 && <span className="text-amber-400">{attemptedCount} in progress</span>}
          <span className="text-slate-500">{allChallenges.length} total challenges</span>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 pb-4 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search challenges…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              aria-label="Search challenges"
            />
          </div>

          {/* Topic */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as ChallengeTopic | "all")}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60"
              aria-label="Filter by topic"
            >
              {(Object.keys(TOPIC_LABELS) as (ChallengeTopic | "all")[]).map((t) => (
                <option key={t} value={t}>{TOPIC_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty | "all")}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60"
            aria-label="Filter by difficulty"
          >
            {(Object.keys(DIFFICULTY_LABELS) as (ChallengeDifficulty | "all")[]).map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ChallengeType | "all")}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60"
            aria-label="Filter by challenge type"
          >
            {(Object.keys(TYPE_LABELS) as (ChallengeType | "all")[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Challenge grid */}
      <main className="px-6 pb-16 max-w-5xl mx-auto w-full flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No challenges match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} progress={progress} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
