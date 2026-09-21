"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Code2,
  BookOpen,
  Compass,
  Target,
  LayoutDashboard,
  Sun,
  Moon,
  RotateCcw,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCommandPaletteStore } from "@/store/useCommandPaletteStore";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ALGORITHM_REGISTRY } from "@/lib/content/algorithms";
import { ALL_CHALLENGES } from "@/lib/content/challenges";
import { getAllLessonsForPath, DSA_FOUNDATIONS_PATH } from "@/lib/content/learningPaths";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Algorithms" | "Lessons" | "Challenges" | "Actions";
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  keywords?: string[];
  action: () => void;
}

export default function CommandPalette() {
  const isOpen = useCommandPaletteStore((state) => state.isOpen);
  const close = useCommandPaletteStore((state) => state.close);
  const open = useCommandPaletteStore((state) => state.open);
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K, or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) close();
        else open();
      } else if (e.key === "/" && !isOpen) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl?.tagName === "INPUT" ||
          activeEl?.tagName === "TEXTAREA" ||
          activeEl?.getAttribute("contenteditable") === "true";
        if (!isInput) {
          e.preventDefault();
          open();
        }
      } else if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Build items catalog
  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Primary Navigation
      {
        id: "nav-workbench",
        title: "Open Full Workbench",
        category: "Navigation",
        icon: Code2,
        description: "Interactive Python execution & visualizer canvas",
        keywords: ["editor", "code", "run", "workbench", "canvas"],
        action: () => {
          router.push("/workbench");
          close();
        },
      },
      {
        id: "nav-dashboard",
        title: "Student Dashboard & Mission Control",
        category: "Navigation",
        icon: LayoutDashboard,
        description: "Unified learning metrics, momentum & workbench runs",
        keywords: ["home", "dashboard", "metrics", "progress", "streak"],
        action: () => {
          router.push("/dashboard");
          close();
        },
      },
      {
        id: "nav-library",
        title: "Browse Algorithm Library",
        category: "Navigation",
        icon: BookOpen,
        description: "Explore curated DSA implementations & traces",
        keywords: ["algorithms", "library", "catalog", "search"],
        action: () => {
          router.push("/library");
          close();
        },
      },
      {
        id: "nav-paths",
        title: "View Learning Paths",
        category: "Navigation",
        icon: Compass,
        description: "Structured curriculum & guided progressions",
        keywords: ["paths", "curriculum", "lessons", "stages"],
        action: () => {
          router.push("/paths");
          close();
        },
      },
      {
        id: "nav-practice",
        title: "Practice DSA Challenges",
        category: "Navigation",
        icon: Target,
        description: "Hands-on coding challenges & test cases",
        keywords: ["practice", "challenges", "tests", "problems"],
        action: () => {
          router.push("/practice");
          close();
        },
      },
      // Theme Action
      {
        id: "action-theme",
        title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "Actions",
        icon: isDark ? Sun : Moon,
        description: isDark ? "Tactile high-contrast light surfaces" : "Obsidian dark developer surfaces",
        keywords: ["theme", "light", "dark", "mode", "color"],
        action: () => {
          toggleTheme();
          close();
        },
      },
    ];

    // Add Algorithm Registry Items
    ALGORITHM_REGISTRY.forEach((algo) => {
      items.push({
        id: `algo-${algo.slug}`,
        title: algo.name,
        category: "Algorithms",
        icon: Code2,
        description: `${algo.difficulty} - ${algo.visualizationType.replace("_", " ")}`,
        keywords: [algo.slug, algo.category, ...algo.tags],
        action: () => {
          router.push(`/library/${algo.slug}`);
          close();
        },
      });
    });

    // Add Lessons
    const lessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);
    lessons.forEach((lesson) => {
      items.push({
        id: `lesson-${lesson.slug}`,
        title: lesson.title,
        category: "Lessons",
        icon: Compass,
        description: lesson.subtitle,
        keywords: [lesson.slug, "lesson", "stage"],
        action: () => {
          router.push(`/paths/dsa-foundations/${lesson.slug}`);
          close();
        },
      });
    });

    // Add Challenges
    ALL_CHALLENGES.forEach((ch) => {
      items.push({
        id: `ch-${ch.slug}`,
        title: ch.title,
        category: "Challenges",
        icon: Target,
        description: `${ch.difficulty} - ${ch.topic.replace("-", " ")}`,
        keywords: [ch.slug, ch.topic, ch.difficulty],
        action: () => {
          router.push(`/practice/${ch.slug}`);
          close();
        },
      });
    });

    return items;
  }, [router, close, isDark, toggleTheme]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Default to Navigation & Top Actions
      return allItems.slice(0, 10);
    }
    const q = query.toLowerCase();
    return allItems
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
      .slice(0, 12);
  }, [allItems, query]);

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0b101e] border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800/80">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type an algorithm, lesson, challenge, or command..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 select-none">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching algorithms, lessons, or commands found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/10 text-cyan-900 dark:text-cyan-200 border border-cyan-500/30 font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block font-semibold truncate">{item.title}</span>
                      {item.description && (
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate font-normal">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-3 h-3" />
            <span>Prism Quick Nav</span>
          </div>
        </div>
      </div>
    </div>
  );
}
