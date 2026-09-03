"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Code2,
  Search,
  ArrowRight,
  Play,
  Layers,
  Cpu,
  Eye,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { ALGORITHM_REGISTRY, searchAlgorithms } from "@/lib/content/algorithms";
import { useExecutionStore } from "@/store/useExecutionStore";
import { AlgorithmDefinition } from "@/types/content";

export default function AlgorithmLibraryPage() {
  const router = useRouter();
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);
  const loadedAlgorithmTitle = useExecutionStore((state) => state.loadedAlgorithmTitle);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredAlgorithms = useMemo(() => {
    return searchAlgorithms(searchQuery, selectedCategory, selectedDifficulty);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleTryInPrism = (algo: AlgorithmDefinition) => {
    loadAlgorithmCode(algo.name, algo.pythonCode);
    router.push(`/?algo=${algo.slug}`);
  };

  const getVisualizationLabel = (target: string) => {
    switch (target) {
      case "1d_array":
        return "1D Array Visualizer";
      case "singly_linked_list":
        return "Linked List Visualizer";
      case "binary_tree":
        return "BST / Tree Visualizer";
      default:
        return "Structure Visualizer";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              PRISM
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
              DSA Learning Environment
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-medium">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Algorithm Library</span>
          </Link>
        </nav>

        {loadedAlgorithmTitle && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="text-slate-400">Active in Workbench:</span>
            <span className="font-semibold text-cyan-200">{loadedAlgorithmTitle}</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 md:p-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phase 8A: Structured DSA Learning</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              Algorithm & Data Structure Library
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Explore foundational computer science topics through beginner-friendly explanations,
              expected complexity metrics, and Python implementations you can launch and step through
              directly in the Prism workbench.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Filter & Search Controls */}
        <section aria-label="Search and Filter Controls" className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, tag, or keyword (e.g. 'Binary Search', 'pointers', 'sort')..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          {/* Category & Difficulty Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCategory === "all"
                    ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({ALGORITHM_REGISTRY.length})
              </button>
              <button
                onClick={() => setSelectedCategory("data-structures")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  selectedCategory === "data-structures"
                    ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Structures</span>
              </button>
              <button
                onClick={() => setSelectedCategory("algorithms")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  selectedCategory === "algorithms"
                    ? "bg-purple-950 text-purple-300 font-bold border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Algorithms</span>
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-mono font-semibold"
              >
                <option value="all" className="bg-slate-900">All</option>
                <option value="beginner" className="bg-slate-900">Beginner</option>
                <option value="intermediate" className="bg-slate-900">Intermediate</option>
              </select>
            </div>
          </div>
        </section>

        {/* Algorithm Cards Grid */}
        <section aria-label="Algorithm Grid" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Showing {filteredAlgorithms.length} of {ALGORITHM_REGISTRY.length} topics</span>
            {(searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filteredAlgorithms.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No matching algorithms found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for another topic like &quot;Array&quot;, &quot;Sort&quot;, or clear your active filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAlgorithms.map((algo) => {
                const isDataStructure = algo.category === "data-structures";
                const isBeginner = algo.difficulty === "Beginner";

                return (
                  <article
                    key={algo.id}
                    className="flex flex-col justify-between bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 transition-all shadow-lg hover:shadow-cyan-500/10 group"
                  >
                    <div className="space-y-3">
                      {/* Category & Difficulty Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            isDataStructure
                              ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/30"
                              : "bg-purple-950/80 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {isDataStructure ? "Data Structure" : "Algorithm"}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isBeginner
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-950/80 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {algo.difficulty}
                        </span>
                      </div>

                      {/* Topic Name & Description */}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {algo.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {algo.description}
                        </p>
                      </div>

                      {/* Visualizer Target & Complexity Metrics */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Eye className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{getVisualizationLabel(algo.visualizationType)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Time: <span className="text-cyan-300">{algo.timeComplexity.worst}</span></span>
                          <span>Space: <span className="text-purple-300">{algo.spaceComplexity.worst}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-800/80">
                      <Link
                        href={`/library/${algo.slug}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span>Learn</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleTryInPrism(algo)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                        title="Load into Workbench"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Try in Prism</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
