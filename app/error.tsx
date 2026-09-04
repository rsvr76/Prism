"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Prism Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-5">
        {/* Prism Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono break-words bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            {error.message || "An unexpected error occurred while rendering this page."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Workbench</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
