"use client";

import { INTEGRATION_LABELS, PROBLEM_SECTION } from "@/components/marketing/config";
import { ProblemContrastDemo } from "@/components/marketing/problem-contrast-demo";
import { SectionLabel } from "@/components/marketing/section-label";
import { ScrollWordReveal } from "@/components/marketing/scroll-word-reveal";

export function CredibilityStrip() {
  return (
    <section className="border-y border-border/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        <p className="text-sm text-muted-foreground text-center mb-6">
          Governed AI analytics for teams that need BigQuery answers they can defend.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {INTEGRATION_LABELS.map((label) => (
            <li
              key={label}
              className="text-xs font-medium text-muted-foreground border border-border/50 rounded-full px-3.5 py-1.5 bg-card/50"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const PROBLEM_COPY_BLOCKS = [
  {
    as: "h2" as const,
    text: `${PROBLEM_SECTION.headlineLead} ${PROBLEM_SECTION.headlineMute}`,
    className:
      "text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-balance leading-[1.15]",
  },
  {
    as: "p" as const,
    text: PROBLEM_SECTION.body,
    className: "max-w-2xl leading-relaxed text-pretty text-base sm:text-[1.05rem]",
  },
];

export function ProblemSection() {
  return (
    <section id="product" className="border-b border-border/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mb-10 sm:mb-12">
          <SectionLabel>{PROBLEM_SECTION.eyebrow}</SectionLabel>
          <ScrollWordReveal className="space-y-4" blocks={PROBLEM_COPY_BLOCKS} />
        </div>

        <ProblemContrastDemo />
      </div>
    </section>
  );
}
