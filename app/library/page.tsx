"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Compass,
  Target,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { ALGORITHM_REGISTRY, searchAlgorithms } from "@/lib/content/algorithms";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import { AlgorithmDefinition } from "@/types/content";
import { PrismLogoCompact } from "@/components/branding/PrismLogo";
import HamburgerButton from "@/components/navigation/HamburgerButton";

export default function AlgorithmLibraryPage() {
  const router = useRouter();
  const loadAlgorithmCode = useExecutionStore((state) => state.loadAlgorithmCode);
  const loadedAlgorithmTitle = useExecutionStore((state) => state.loadedAlgorithmTitle);
  const toggleDrawer = useNavDrawerStore((state) => state.toggleDrawer);
  const isDrawerOpen = useNavDrawerStore((state) => state.isOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredAlgorithms = useMemo(() => {
    return searchAlgorithms(searchQuery, selectedCategory, selectedDifficulty);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleTryInPrism = (algo: AlgorithmDefinition) => {
    loadAlgorithmCode(algo.name, algo.pythonCode);
    router.push(`/workbench?algo=${algo.slug}`);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between gap-3 px-4 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-20 shadow-xs select-none">
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
            <PrismLogoCompact size="sm" asHeading />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {loadedAlgorithmTitle && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Active:</span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-200">{loadedAlgorithmTitle}</span>
            </div>
          )}

          <Link
            href="/workbench"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workbench</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Guided Learning Path Callout */}
        <section className="rounded-xl border border-purple-200 dark:border-purple-500/30 bg-gradient-to-r from-purple-50 via-white to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/60 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-700 dark:text-purple-400 uppercase tracking-wider font-semibold">Guided Curriculum</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">Interactive</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-200">
                Prefer a structured, step-by-step roadmap?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Follow our sequential DSA Foundations path: Arrays → Lists → Search → Sort → Trees → BST.
              </p>
            </div>
          </div>
          <Link
            href="/paths/dsa-foundations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
          >
            <span>Start Guided Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/40 border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-xs dark:shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
              <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Interactive DSA Catalog</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Algorithm & Data Structure Library
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore foundational computer science topics through beginner-friendly explanations,
              expected complexity metrics, and Python implementations you can launch and step through
              directly in the Prism workbench.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Filter & Search Controls */}
        <section aria-label="Search and Filter Controls" className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, tag, or keyword (e.g. 'Binary Search', 'pointers', 'sort')..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          {/* Category & Difficulty Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedCategory === "all"
                    ? "bg-white text-cyan-800 font-bold border border-slate-300 shadow-xs dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/30"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                All ({ALGORITHM_REGISTRY.length})
              </button>
              <button
                onClick={() => setSelectedCategory("data-structures")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  selectedCategory === "data-structures"
                    ? "bg-white text-cyan-800 font-bold border border-slate-300 shadow-xs dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/30"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Structures</span>
              </button>
              <button
                onClick={() => setSelectedCategory("algorithms")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  selectedCategory === "algorithms"
                    ? "bg-white text-purple-800 font-bold border border-slate-300 shadow-xs dark:bg-purple-950 dark:text-purple-300 dark:border-purple-500/30"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Algorithms</span>
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-mono font-semibold"
              >
                <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">All</option>
                <option value="beginner" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Beginner</option>
                <option value="intermediate" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Intermediate</option>
              </select>
            </div>
          </div>
        </section>

        {/* Algorithm Cards Grid */}
        <section aria-label="Algorithm Grid" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
            <span>Showing {filteredAlgorithms.length} of {ALGORITHM_REGISTRY.length} topics</span>
            {(searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filteredAlgorithms.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3 shadow-xs">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">No matching algorithms found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
                    className="flex flex-col justify-between bg-white hover:bg-slate-50/80 dark:bg-slate-900/70 dark:hover:bg-slate-900 border border-slate-200 hover:border-cyan-400 dark:border-slate-800 dark:hover:border-cyan-500/50 rounded-xl p-5 transition-all shadow-xs hover:shadow-md group"
                  >
                    <div className="space-y-3">
                      {/* Category & Difficulty Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            isDataStructure
                              ? "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/30"
                              : "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/30"
                          }`}
                        >
                          {isDataStructure ? "Data Structure" : "Algorithm"}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isBeginner
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-500/30"
                              : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-500/30"
                          }`}
                        >
                          {algo.difficulty}
                        </span>
                      </div>

                      {/* Topic Name & Description */}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {algo.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {algo.description}
                        </p>
                      </div>

                      {/* Visualizer Target & Complexity Metrics */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Eye className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">{getVisualizationLabel(algo.visualizationType)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span>Time: <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{algo.timeComplexity.worst}</span></span>
                          <span>Space: <span className="text-purple-700 dark:text-purple-300 font-semibold">{algo.spaceComplexity.worst}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                      <Link
                        href={`/library/${algo.slug}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span>Learn</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleTryInPrism(algo)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
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
