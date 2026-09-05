import React from "react";
import { Loader2 } from "lucide-react";
import { PrismLogoMark } from "@/components/branding/PrismLogo";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <PrismLogoMark className="w-12 h-12" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
          <span>Loading Prism...</span>
        </div>
      </div>
    </div>
  );
}
