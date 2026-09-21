"use client";

import React from "react";
import Link from "next/link";
import { Zap, Target, ArrowRight, Flame, Clock, Award } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";

const OPPORTUNITIES = [
  {
    id: "opp-1",
    tag: "⚡ High Yield",
    tagClass: "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/40",
    icon: Zap,
    iconClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60",
    title: "Master Two-Pointer Swapping",
    description: "Learn in-place element reversal without auxiliary allocations. Boosts array algorithm score by +15%.",
    duration: "8 mins",
    difficulty: "Beginner",
    href: "/practice/reverse-array-in-place",
    cta: "Start Challenge",
  },
  {
    id: "opp-2",
    tag: "🎯 Weak Spot",
    tagClass: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/40",
    icon: Target,
    iconClass: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60",
    title: "Pointer Boundary Invariants",
    description: "Eliminate infinite loops in linked lists by tracking None terminations across node hops.",
    duration: "10 mins",
    difficulty: "Intermediate",
    href: "/paths/dsa-foundations/linked-lists-pointers",
    cta: "Review Lesson",
  },
  {
    id: "opp-3",
    tag: "🔥 Daily Momentum",
    tagClass: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40",
    icon: Flame,
    iconClass: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60",
    title: "Binary Search Tree Search",
    description: "Verify logarithmic halving in real time. Observe how BST eliminates half the tree each step.",
    duration: "12 mins",
    difficulty: "Intermediate",
    href: "/library/binary-search-tree",
    cta: "Inspect Trace",
  },
];

export default function OpportunityCardsSection() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            High-Yield Opportunities
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Personalized AI Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPPORTUNITIES.map((opp) => {
          const Icon = opp.icon;

          return (
            <SpotlightCard
              key={opp.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Top Tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${opp.tagClass}`}>
                    {opp.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{opp.duration}</span>
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {opp.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {opp.description}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <Link
                href={opp.href}
                className="inline-flex items-center justify-between w-full pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>{opp.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
