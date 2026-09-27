"use client";

import { ArrowRight } from "lucide-react";
import { PRICING_PLANS } from "@/components/marketing/config";
import { StatusPill } from "@/components/marketing/status-pill";
import { SectionLabel } from "@/components/marketing/section-label";
import { BRAND, contactMailto } from "@/lib/brand";

export function PricingContactSection() {
  return (
    <section id="pricing" className="border-b border-border/30 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-balance">
          <span className="text-foreground">Pick a path.</span>{" "}
          <span className="text-muted-foreground">We will talk numbers by email.</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mb-10 leading-relaxed">
          No public price list yet. Tell us which option fits, and we will reply at{" "}
          <a href={contactMailto()} className="text-primary hover:underline font-medium">
            {BRAND.supportEmail}
          </a>
          .
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className="rounded-2xl border border-border/60 bg-card/60 p-5 sm:p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-foreground">{plan.title}</h3>
                <StatusPill status={plan.status} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{plan.blurb}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.points.map((point) => (
                  <li key={point} className="text-sm text-foreground/90 flex gap-2 leading-relaxed">
                    <span
                      className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <a
                href={contactMailto(plan.subject)}
                className="inline-flex items-center justify-center gap-1.5 h-10 w-full rounded-full border border-border bg-background/60 text-sm font-medium text-foreground hover:bg-white/[0.06] hover:border-primary/40 active:scale-[0.98] transition-[transform,background-color,border-color] duration-150"
              >
                {plan.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
