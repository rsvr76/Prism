"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { PrismLogo } from "./PrismLogo";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import HamburgerButton from "@/components/navigation/HamburgerButton";

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
  const isDrawerOpen = useNavDrawerStore((state) => state.isOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-14 border-b transition-colors duration-300 ${
        scrolled
          ? "border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#070a13]/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="w-full h-full px-4 flex items-center justify-between">
        {/* Left Side: Hamburger & Brand Logo (Positioned exactly matching sidebar down to the pixel) */}
        <div
          className={`flex items-center gap-3 shrink-0 transition-opacity duration-200 ${
            isDrawerOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <HamburgerButton
            isOpen={isDrawerOpen}
            onClick={openDrawer}
            ariaLabel="Open navigation drawer"
            title="Open Navigation Drawer"
          />

          <Link href="/" className="flex items-center">
            <PrismLogo variant="compact" size="sm" />
          </Link>
        </div>

        {/* Desktop Nav Links (Clean text links, centered) */}
        <nav aria-label="Quick Links" className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors tracking-tight relative py-1"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA: Open Editor (ThemeToggle removed completely from header) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
      </div>

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
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-500/20"
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
