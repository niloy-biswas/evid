"use client";

import { LandingHeader } from "@/components/marketing/landing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProblemSection } from "@/components/marketing/problem-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works";
import { AnalyticsShowcase } from "@/components/marketing/analytics-showcase";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { DeploymentSection } from "@/components/marketing/deployment-section";
import { SecuritySection } from "@/components/marketing/security-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";

/**
 * Marketing landing — fixed Powder dusk theme.
 * Atmosphere lives in the hero; later sections reveal on scroll.
 */
export function LandingPageView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const afterHero = [
    { key: "showcase", node: <AnalyticsShowcase /> },
    { key: "problem", node: <ProblemSection /> },
    { key: "how", node: <HowItWorksSection /> },
    { key: "security", node: <SecuritySection /> },
    { key: "compare", node: <ComparisonSection /> },
    { key: "deployment", node: <DeploymentSection /> },
    { key: "faq", node: <FaqSection /> },
    { key: "final-cta", node: <FinalCta isLoggedIn={isLoggedIn} /> },
  ];

  return (
    <SmoothScroll>
      <div
        data-theme="powder"
        className="dark min-h-screen flex flex-col relative overflow-x-clip bg-background text-foreground"
      >
        <LandingHeader isLoggedIn={isLoggedIn} />

        <main className="relative z-10 flex-1">
          <HeroSection isLoggedIn={isLoggedIn} />
          {afterHero.map(({ key, node }) => (
            <ScrollReveal key={key}>{node}</ScrollReveal>
          ))}
        </main>

        <div className="relative z-10">
          <LandingFooter />
        </div>
      </div>
    </SmoothScroll>
  );
}
