import React from "react";
import Link from "next/link";
import { Home, Code2, BookOpen, Compass, Target } from "lucide-react";
import { PrismLogoMark } from "@/components/branding/PrismLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        {/* Prism Brand Icon */}
        <div className="mx-auto flex justify-center">
          <PrismLogoMark className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            404
          </span>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The requested page does not exist or has been moved. Explore our core DSA learning modules below:
          </p>
        </div>

        {/* Destination Cards */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono">
          <Link
            href="/workbench"
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-800/80 transition-all text-slate-800 dark:text-slate-200"
          >
            <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>Workbench</span>
          </Link>

          <Link
            href="/library"
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-800/80 transition-all text-slate-800 dark:text-slate-200"
          >
            <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
            <span>Library</span>
          </Link>

          <Link
            href="/paths"
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-800/80 transition-all text-slate-800 dark:text-slate-200"
          >
            <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Paths</span>
          </Link>

          <Link
            href="/practice"
            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-800/80 transition-all text-slate-800 dark:text-slate-200"
          >
            <Target className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Practice</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
