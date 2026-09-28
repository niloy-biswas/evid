"use client";

import { LandingHeader } from "@/components/marketing/landing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProblemSection } from "@/components/marketing/problem-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works";
import { CapabilitiesSection } from "@/components/marketing/capabilities-section";
import { AnalyticsShowcase } from "@/components/marketing/analytics-showcase";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { PricingContactSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { ChangelogSection } from "@/components/marketing/changelog-section";
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
    { key: "problem", node: <ProblemSection /> },
    { key: "how", node: <HowItWorksSection /> },
    { key: "capabilities", node: <CapabilitiesSection /> },
    { key: "showcase", node: <AnalyticsShowcase /> },
    { key: "compare", node: <ComparisonSection /> },
    { key: "pricing", node: <PricingContactSection /> },
    { key: "faq", node: <FaqSection /> },
    { key: "changelog", node: <ChangelogSection /> },
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
