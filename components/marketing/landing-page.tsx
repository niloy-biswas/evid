"use client";

import { LandingHeader } from "@/components/marketing/landing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import {
  CredibilityStrip,
  ProblemSection,
} from "@/components/marketing/problem-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works";
import { CapabilitiesSection } from "@/components/marketing/capabilities-section";
import { AnalyticsShowcase } from "@/components/marketing/analytics-showcase";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { PricingContactSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { ChangelogSection } from "@/components/marketing/changelog-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { LandingFooter } from "@/components/marketing/landing-footer";

/**
 * Marketing landing — fixed Powder dusk theme.
 * Atmosphere lives in the hero; no theme toggle on this page.
 */
export function LandingPageView({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div
      data-theme="powder"
      className="dark min-h-screen flex flex-col relative overflow-x-clip bg-background text-foreground"
    >
      <LandingHeader isLoggedIn={isLoggedIn} />

      <main className="relative z-10 flex-1">
        <HeroSection isLoggedIn={isLoggedIn} />
        <CredibilityStrip />
        <ProblemSection />
        <HowItWorksSection />
        <CapabilitiesSection />
        <AnalyticsShowcase />
        <ComparisonSection />
        <PricingContactSection />
        <FaqSection />
        <ChangelogSection />
        <FinalCta isLoggedIn={isLoggedIn} />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
