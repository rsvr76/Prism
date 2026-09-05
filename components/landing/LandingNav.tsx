"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { PrismLogo } from "./PrismLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";

const LINKS = [
  { href: "/library", label: "Library" },
  { href: "/paths", label: "Paths" },
  { href: "/practice", label: "Practice" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openDrawer = useNavDrawerStore((state) => state.openDrawer);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#070a13]/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Slide-out drawer trigger */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Open navigation drawer"
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <PrismLogo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/workbench"
            className="btn-base btn-primary hidden sm:inline-flex text-xs md:text-sm font-bold shadow-md shadow-purple-500/20"
          >
            Open Editor <ArrowRight className="size-4" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 md:hidden"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a13] px-5 py-4 md:hidden animate-fade-in-subtle">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/workbench"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-base btn-primary mt-3 w-full justify-center"
            >
              Open Editor <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingNav;
