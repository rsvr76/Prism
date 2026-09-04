import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
          <span>Loading Prism...</span>
        </div>
      </div>
    </div>
  );
}
