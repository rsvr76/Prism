"use client";

import React from "react";

export interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  title?: string;
  className?: string;
}

/**
 * HamburgerButton
 *
 * Implements the smooth McButton velocity morph animation:
 * - 3 horizontal bars smoothly collapse to center (Phase 1)
 * - Rotates into a clean, symmetrical "X" with spring physics (Phase 2)
 * - Reverses smoothly on close, unrolling back to 3 horizontal bars
 *
 * Designed to sit at pixel-identical coordinates across all navigation headers.
 */
export function HamburgerButton({
  isOpen,
  onClick,
  ariaLabel,
  title,
  className = "p-2 -ml-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0",
}: HamburgerButtonProps) {
  const label = ariaLabel || (isOpen ? "Close navigation menu" : "Navigation menu");
  const tooltip = title || label;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={isOpen}
      title={tooltip}
      className={className}
    >
      <div className={`mc-button ${isOpen ? "active" : ""}`} aria-hidden="true">
        <b className="mc-bar-1" />
        <b className="mc-bar-2" />
        <b className="mc-bar-3" />
      </div>
    </button>
  );
}

export default HamburgerButton;
