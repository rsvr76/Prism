"use client";

import React from "react";
import Link from "next/link";

interface PrismLogoProps {
  className?: string;
  variant?: "mark" | "compact" | "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  onClick?: () => void;
}

/**
 * High-precision vector crystal tetrahedron prism mark matching the approved brand artwork.
 * Facets: Cyan (top-left), Deep Blue (bottom-left), Violet/Magenta (top-right), Amber/Gold (bottom-right), Deep Indigo (core).
 * No spectral beams, input rays, or output rays.
 */
export function PrismVectorMark({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_0_10px_rgba(6,182,212,0.35)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Top-Left Cyan Facet Gradient */}
        <linearGradient id="prism-facet-cyan" x1="50" y1="5" x2="10" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Bottom-Left Deep Blue Facet Gradient */}
        <linearGradient id="prism-facet-blue" x1="10" y1="78" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="60%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Top-Right Purple / Magenta Facet Gradient */}
        <linearGradient id="prism-facet-purple" x1="50" y1="5" x2="90" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Bottom-Right Amber / Golden Orange Facet Gradient */}
        <linearGradient id="prism-facet-amber" x1="50" y1="52" x2="90" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="85%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Inner Core Deep Indigo Facet */}
        <linearGradient id="prism-facet-core" x1="50" y1="28" x2="50" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Glowing Rim Stroke Gradient */}
        <linearGradient id="prism-rim-glow" x1="50" y1="4" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="80%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>

      {/* Background/Facet Base: Equilateral Tetrahedron */}
      <polygon points="50,6 8,80 50,28" fill="url(#prism-facet-cyan)" />
      <polygon points="50,6 92,80 50,28" fill="url(#prism-facet-purple)" />
      <polygon points="50,28 35,62 65,62" fill="url(#prism-facet-core)" />
      <polygon points="8,80 50,78 35,62" fill="url(#prism-facet-blue)" />
      <polygon points="50,78 92,80 65,62" fill="url(#prism-facet-amber)" />
      <polygon points="35,62 65,62 50,78" fill="url(#prism-facet-amber)" opacity="0.9" />

      {/* Internal Crystal Ridge Highlights */}
      <line x1="50" y1="6" x2="50" y2="28" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      <line x1="50" y1="28" x2="8" y2="80" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="50" y1="28" x2="92" y2="80" stroke="#e879f9" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="35" y1="62" x2="65" y2="62" stroke="#fda4af" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <line x1="50" y1="78" x2="35" y2="62" stroke="#67e8f9" strokeWidth="1" opacity="0.6" />
      <line x1="50" y1="78" x2="65" y2="62" stroke="#fbbf24" strokeWidth="1" opacity="0.7" />

      {/* Outer Glowing Rim */}
      <polygon
        points="50,6 8,80 92,80"
        fill="none"
        stroke="url(#prism-rim-glow)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Renders the standalone transparent crystal mark with responsive dark/light support.
 */
export function PrismLogoMark({
  className = "w-8 h-8",
  useImage = true,
}: {
  className?: string;
  useImage?: boolean;
}) {
  if (useImage) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        {/* Dark Mode Mark */}
        <img
          src="/brand/prism-mark-dark.png"
          alt="Prism Brand Mark"
          className="hidden dark:block w-full h-full object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]"
        />
        {/* Light Mode Mark */}
        <img
          src="/brand/prism-mark-light.png"
          alt="Prism Brand Mark"
          className="block dark:hidden w-full h-full object-contain drop-shadow-[0_0_6px_rgba(8,145,178,0.25)]"
        />
      </div>
    );
  }

  return <PrismVectorMark className={className} />;
}

/**
 * Compact Logo: Mark + "PRISM" wordmark.
 */
export function PrismLogoCompact({
  className = "",
  size = "md",
  asHeading = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  asHeading?: boolean;
}) {
  const sizeMap = {
    sm: { mark: "w-6 h-6", text: "text-xs", sub: "text-[9px]" },
    md: { mark: "w-7 h-7", text: "text-sm", sub: "text-[10px]" },
    lg: { mark: "w-8 h-8", text: "text-base", sub: "text-[11px]" },
  };

  const s = sizeMap[size];
  const HeadingTag = asHeading ? "h1" : "span";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <PrismLogoMark className={s.mark} />
      <div className="flex flex-col justify-center">
        <HeadingTag
          className={`font-black tracking-wider text-slate-900 dark:text-white leading-none ${s.text}`}
          style={{ letterSpacing: "0.08em" }}
        >
          PRISM
        </HeadingTag>
        <span
          className={`font-mono font-medium tracking-widest text-cyan-600 dark:text-cyan-400 uppercase leading-none mt-1 ${s.sub}`}
        >
          DSA Learning
        </span>
      </div>
    </div>
  );
}

/**
 * Full Brand Logo: Mark + Wordmark + Full Tagline.
 */
export function PrismLogoFull({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <PrismLogoMark className="w-8 h-8 md:w-9 md:h-9" />
      <div className="flex flex-col justify-center">
        <span
          className="font-black text-base md:text-lg tracking-widest text-slate-900 dark:text-white leading-none"
          style={{ letterSpacing: "0.1em" }}
        >
          PRISM
        </span>
        <span className="font-mono text-[10px] md:text-[11px] font-semibold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase leading-none mt-1">
          DSA Learning Environment
        </span>
      </div>
    </div>
  );
}

/**
 * Primary Brand Logo component with auto-routing Link option and variant control.
 */
export function PrismLogo({
  className = "",
  variant = "compact",
  size = "md",
  href = "/",
  onClick,
}: PrismLogoProps) {
  let content: React.ReactNode;

  switch (variant) {
    case "mark":
    case "icon":
      content = <PrismLogoMark className={className || "w-7 h-7"} />;
      break;
    case "full":
      content = <PrismLogoFull className={className} />;
      break;
    case "compact":
    default:
      content = <PrismLogoCompact className={className} size={size === "xl" ? "lg" : size} />;
      break;
  }

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center group transition-transform hover:opacity-95"
        aria-label="Prism Home"
      >
        {content}
      </Link>
    );
  }

  return <div className="inline-flex items-center">{content}</div>;
}

export default PrismLogo;
