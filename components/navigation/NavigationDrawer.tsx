"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Code2,
  BookOpen,
  Compass,
  Target,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import { PrismLogoCompact } from "@/components/branding/PrismLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import HamburgerButton from "@/components/navigation/HamburgerButton";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    description: "Overview, interactive demos & learning paths",
  },
  {
    label: "Workbench",
    href: "/workbench",
    icon: Code2,
    description: "Interactive Python execution & memory visualizers",
  },
  {
    label: "Algorithm Library",
    href: "/library",
    icon: BookOpen,
    description: "Curated DSA implementations & reference traces",
  },
  {
    label: "Learning Paths",
    href: "/paths",
    icon: Compass,
    description: "Structured curriculum & guided lesson progressions",
  },
  {
    label: "Practice",
    href: "/practice",
    icon: Target,
    description: "Coding & trace prediction challenges",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Unified learning metrics & recent activity",
  },
];

export default function NavigationDrawer() {
  const isOpen = useNavDrawerStore((state) => state.isOpen);
  const closeDrawer = useNavDrawerStore((state) => state.closeDrawer);
  const openDrawer = useNavDrawerStore((state) => state.openDrawer);
  const pathname = usePathname();

  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Left-screen edge swipe-to-open gesture (pull from left screen edge)
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleEdgeTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0].clientX < 28) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else {
        startX = 0;
      }
    };

    const handleEdgeTouchMove = (e: TouchEvent) => {
      if (startX > 0 && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = Math.abs(e.touches[0].clientY - startY);
        if (deltaX > 45 && deltaX > deltaY && !isOpen) {
          openDrawer();
          startX = 0;
        }
      }
    };

    window.addEventListener("touchstart", handleEdgeTouchStart, { passive: true });
    window.addEventListener("touchmove", handleEdgeTouchMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleEdgeTouchStart);
      window.removeEventListener("touchmove", handleEdgeTouchMove);
    };
  }, [isOpen, openDrawer]);

  // Swipe left to close gesture on the drawer panel
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      const currentX = e.touches[0].clientX;
      const diff = currentX - touchStartX;
      if (diff < -50) {
        closeDrawer();
        setTouchStartX(null);
      }
    }
  };

  const handlePanelTouchEnd = () => {
    setTouchStartX(null);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] font-sans ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? "true" : undefined}
      aria-label={isOpen ? "Navigation Drawer" : undefined}
      aria-hidden={!isOpen}
    >
      {/* Butter-Smooth Backdrop Scrim */}
      <div
        className={`fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer will-change-[opacity,backdrop-filter] ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Butter-Smooth Drawer Panel Slide-Out */}
      <aside
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white/98 dark:bg-[#0b101e]/98 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 shadow-[0_0_50px_-5px_rgba(0,0,0,0.15),0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_60px_-5px_rgba(0,0,0,0.7),0_25px_50px_-12px_rgba(0,0,0,0.9)] z-[60] flex flex-col will-change-transform ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          transform: isOpen ? "translate3d(0, 0, 0)" : "translate3d(-100%, 0, 0)",
          transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Drawer Header (Hamburger + PRISM Logo — EXACT same positioning as homepage & all headers) */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <HamburgerButton
              isOpen={isOpen}
              onClick={closeDrawer}
              ariaLabel="Close navigation menu"
              title="Close navigation menu"
            />

            <Link href="/" onClick={closeDrawer} className="flex items-center group">
              <PrismLogoCompact size="sm" asHeading={false} />
            </Link>
          </div>

          <button
            onClick={closeDrawer}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links (Main Navigation) */}
        <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <div
                  className={`p-1 rounded-md transition-colors ${
                    isActive
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 ml-auto" />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-slate-200 dark:border-slate-800/80" />

          {/* Quick Curriculum Link */}
          <div className="px-3 py-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold block mb-2">
              Featured Path
            </span>
            <Link
              href="/paths/dsa-foundations"
              onClick={closeDrawer}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 block hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  DSA Foundations
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-mono">
                  10 Lessons
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Core memory models, arrays, pointer manipulation & sorting.
              </p>
            </Link>
          </div>
        </nav>

        {/* Drawer Footer (Theme Toggle & Brand Tagline) */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0 text-xs">
          <ThemeToggle showLabel />
          <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
        </div>
      </aside>
    </div>
  );
}
