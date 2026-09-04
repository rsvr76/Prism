"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  Code2,
  BookOpen,
  Compass,
  Target,
  LayoutDashboard,
} from "lucide-react";
import { useNavDrawerStore } from "@/store/useNavDrawerStore";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Workbench",
    href: "/",
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
      className={`fixed inset-0 z-50 font-sans pointer-events-none`}
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? "true" : undefined}
      aria-label={isOpen ? "Navigation Drawer" : undefined}
      aria-hidden={!isOpen}
    >
      {/* Transparent Click-Outside Dismissal Area (Preserves original screen 100%, does not darken or blank out) */}
      <div
        className={`fixed inset-0 cursor-pointer ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel (YouTube Style Slide-Out / Pull Screen) */}
      <aside
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-[#0b101e] border-r border-slate-200 dark:border-slate-800/90 shadow-2xl z-50 flex flex-col will-change-transform ${
          isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        }`}
        style={{
          transition: "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Drawer Header (Hamburger + PRISM Logo) */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="p-2 -ml-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" onClick={closeDrawer} className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  PRISM
                </span>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono tracking-wider uppercase leading-none mt-1">
                  DSA Learning Environment
                </p>
              </div>
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
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-500/40 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-cyan-600 dark:bg-cyan-400 shrink-0" />
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Toggle Theme</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
        </div>
      </aside>
    </div>
  );
}
