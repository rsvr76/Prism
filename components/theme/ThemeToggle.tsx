"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg transition-colors cursor-pointer border ${
        isDark
          ? "bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-amber-400 hover:text-amber-300"
          : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-600 hover:text-indigo-700 shadow-xs"
      } ${className}`}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 duration-200" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-medium font-mono">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
