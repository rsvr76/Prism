"use client";

import React from "react";
import Image from "next/image";

interface PrismLogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export function PrismLogo({ className = "h-8 w-auto", variant = "full" }: PrismLogoProps) {
  if (variant === "icon") {
    return (
      <div className={`relative aspect-square inline-flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src="/brand/prism-logo.png"
          alt="Prism Logo"
          className="h-full w-auto max-w-none object-cover object-left"
          style={{ width: "260%", maxWidth: "none" }}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/brand/prism-logo.png"
        alt="Prism - DSA Learning, Reimagined"
        className="h-full w-auto max-h-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]"
      />
    </div>
  );
}

export default PrismLogo;
