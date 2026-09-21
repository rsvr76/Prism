"use client";

import React, { useRef, useState, useCallback } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
  enableSpotlight?: boolean;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor,
  spotlightSize = 400,
  enableSpotlight = true,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setCoords({ x: -1000, y: -1000 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Ambient Spotlight Layer */}
      {enableSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-1"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${spotlightSize}px circle at ${coords.x}px ${coords.y}px, ${
              spotlightColor || "var(--prism-spotlight-color, rgba(6, 182, 212, 0.12))"
            }, transparent 75%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-2 h-full flex flex-col">{children}</div>
    </div>
  );
}
