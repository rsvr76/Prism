"use client";

import React from "react";
import Link from "next/link";
import { PrismLogo } from "./PrismLogo";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <PrismLogo variant="compact" size="md" />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <Link href="/library" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">
            Library
          </Link>
          <Link href="/paths" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">
            Paths
          </Link>
          <Link href="/practice" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">
            Practice
          </Link>
          <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-cyan-400 transition-colors">
            Dashboard
          </Link>
        </nav>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 dark:border-slate-800 pt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
        <span>© {new Date().getFullYear()} Prism</span>
        <span aria-hidden="true">·</span>
        <span>DSA Learning, Reimagined</span>
        <span aria-hidden="true">·</span>
        <span>Runs In-Browser via Pyodide WASM</span>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}

export default Footer;
