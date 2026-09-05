"use client";

import { useEffect } from "react";

/**
 * Lightweight IntersectionObserver hook that adds .visible to any
 * .reveal / .reveal-stagger element that scrolls into view.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    const els = document.querySelectorAll(".reveal, .reveal-stagger");
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
