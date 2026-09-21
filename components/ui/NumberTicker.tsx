"use client";

import React, { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number; // in milliseconds
  className?: string;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export default function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  duration = 1500,
  className = "",
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState<number>(direction === "down" ? value : 0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = direction === "down" ? value : 0;
          const end = value;
          const startTime = performance.now() + delay * 1000;

          const step = (currentTime: number) => {
            if (currentTime < startTime) {
              requestAnimationFrame(step);
              return;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic: 1 - Math.pow(1 - progress, 3)
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOutProgress;

            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(end);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, direction, delay, duration, hasAnimated]);

  const formattedValue = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(displayValue.toFixed(decimalPlaces)));

  return (
    <span ref={elementRef} className={`inline-block tabular-nums font-mono ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
