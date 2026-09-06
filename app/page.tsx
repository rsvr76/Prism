"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReveal } from "@/hooks/useReveal";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import ProblemSolution from "@/components/landing/ProblemSolution";
import FeatureRows from "@/components/landing/FeatureRows";
import InteractiveTeaser from "@/components/landing/InteractiveTeaser";
import PathsPreview from "@/components/landing/PathsPreview";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

function QueryRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let qs = searchParams.toString();
    if (!qs && typeof window !== "undefined") {
      qs = window.location.search.replace(/^\?/, "");
    }
    const params = new URLSearchParams(qs);
    const algo = params.get("algo") || params.get("example");
    const lesson = params.get("lesson");
    if (algo || lesson) {
      router.replace(`/workbench${qs ? `?${qs}` : ""}`);
    }
  }, [router, searchParams]);

  return null;
}

export default function LandingPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <Suspense fallback={null}>
        <QueryRedirectHandler />
      </Suspense>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <LandingNav />

      <main id="main">
        <HeroSection />
        <TrustBar />
        <ProblemSolution />
        <FeatureRows />
        <InteractiveTeaser />
        <PathsPreview />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
