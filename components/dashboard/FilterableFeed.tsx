"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Compass,
  Target,
  Code2,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { ALGORITHM_REGISTRY } from "@/lib/content/algorithms";
import { ALL_CHALLENGES } from "@/lib/content/challenges";
import { getAllLessonsForPath, DSA_FOUNDATIONS_PATH } from "@/lib/content/learningPaths";

type FilterTab = "all" | "high-yield" | "lessons" | "challenges" | "algorithms";

interface FeedItem {
  id: string;
  type: FilterTab;
  categoryLabel: string;
  title: string;
  subtitle: string;
  difficulty: string;
  href: string;
  rationale: string;
}

export default function FilterableFeed() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];

    // Lessons
    const lessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);
    lessons.forEach((l) => {
      items.push({
        id: `lesson-${l.slug}`,
        type: "lessons",
        categoryLabel: "Curriculum Lesson",
        title: l.title,
        subtitle: l.subtitle,
        difficulty: "Core Path",
        href: `/paths/dsa-foundations/${l.slug}`,
        rationale: "Step-by-step memory model progression",
      });
    });

    // Challenges
    ALL_CHALLENGES.forEach((ch) => {
      const isHighYield = ch.difficulty === "Beginner" || ch.topic === "arrays";
      items.push({
        id: `ch-${ch.slug}`,
        type: isHighYield ? "high-yield" : "challenges",
        categoryLabel: isHighYield ? "⚡ High Yield Practice" : "Practice Challenge",
        title: ch.title,
        subtitle: ch.description,
        difficulty: ch.difficulty,
        href: `/practice/${ch.slug}`,
        rationale: `Targeted ${ch.topic.replace("-", " ")} challenge with test cases`,
      });
    });

    // Algorithms
    ALGORITHM_REGISTRY.slice(0, 6).forEach((algo) => {
      items.push({
        id: `algo-${algo.slug}`,
        type: "algorithms",
        categoryLabel: "Algorithm Lab",
        title: algo.name,
        subtitle: algo.description,
        difficulty: algo.difficulty,
        href: `/library/${algo.slug}`,
        rationale: `Interactive ${algo.visualizationType.replace("_", " ")} visualization`,
      });
    });

    return items;
  }, []);

  const tabCounts = useMemo(() => {
    return {
      all: allItems.length,
      "high-yield": allItems.filter((i) => i.type === "high-yield").length,
      lessons: allItems.filter((i) => i.type === "lessons").length,
      challenges: allItems.filter((i) => i.type === "challenges").length,
      algorithms: allItems.filter((i) => i.type === "algorithms").length,
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        item.type === activeTab ||
        (activeTab === "challenges" && item.type === "high-yield");
      const matchesQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [allItems, activeTab, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {(
            [
              { id: "all", label: "All Items" },
              { id: "high-yield", label: "⚡ High Yield" },
              { id: "lessons", label: "Curriculum" },
              { id: "challenges", label: "Challenges" },
              { id: "algorithms", label: "Algorithm Lab" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter feed..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-300/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Feed List Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.slice(0, 9).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 shadow-2xs hover:shadow-sm transition-all group flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-cyan-600 dark:text-cyan-400">
                  {item.categoryLabel}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {item.difficulty}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.subtitle}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
              <span className="truncate pr-2">{item.rationale}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
