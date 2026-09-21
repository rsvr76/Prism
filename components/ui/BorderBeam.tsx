"use client";

import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export default function BorderBeam({
  className = "",
  size = 250,
  duration = 8,
  borderWidth = 1.5,
  colorFrom = "#06b6d4",
  colorTo = "#a855f7",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          "--size": `${size}px`,
          "--duration": `${duration}s`,
          "--delay": `-${delay}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width))_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] [animation:borderBeamRotate_var(--duration)_linear_infinite_var(--delay)] [background:radial-gradient(circle,var(--color-from)_0%,var(--color-to)_50%,transparent_100%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80"
      />
    </div>
  );
}
