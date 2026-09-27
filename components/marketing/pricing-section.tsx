import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import {
  PRICING_PLANS,
  TRUST_LABELS,
  type PricingFeature,
} from "@/components/marketing/config";
import { SectionLabel } from "@/components/marketing/section-label";
import { BRAND, contactMailto } from "@/lib/brand";
import { cn } from "@/lib/utils";

function FeatureRow({ feature }: { feature: PricingFeature }) {
  if (feature.kind === "metric") {
    return (
      <li className="flex items-baseline justify-between gap-3 text-sm leading-relaxed">
        <span className="text-muted-foreground">{feature.label}</span>
        <span className="text-foreground font-medium text-right">{feature.value}</span>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2.5 text-sm leading-relaxed">
      {feature.included ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      ) : (
        <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
      )}
      <span className={feature.included ? "text-foreground/90" : "text-muted-foreground/70"}>
        {feature.label}
      </span>
    </li>
  );
}

function PlanCta({
  href,
  external,
  label,
  className,
}: {
  href: string;
  external: boolean;
  label: string;
  className: string;
}) {
  const children = (
    <>
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/cta:translate-x-0.5" />
    </>
  );

  if (external) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function PricingContactSection() {
  return (
    <section id="pricing" className="border-b border-border/30 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-balance leading-[1.15]">
            Clear pricing paths that scale with you
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
            No public price list yet. Pick a path and we will talk numbers at{" "}
            <a href={contactMailto()} className="text-primary hover:underline font-medium">
              {BRAND.supportEmail}
            </a>
            .
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-5 items-stretch pt-3">
          {PRICING_PLANS.map((plan) => {
            const href =
              plan.cta.type === "demo" ? "/book-demo" : contactMailto(plan.cta.subject);

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5 sm:p-6",
                  plan.highlighted
                    ? "border-primary/45 bg-card/80 shadow-[0_24px_48px_var(--overlay-shadow)]"
                    : "border-border/60 bg-card/50"
                )}
              >
                {plan.highlighted ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-primary/40 bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Popular
                  </span>
                ) : null}

                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                  {plan.name}
                </p>

                <div className="flex items-end gap-2 mb-1">
                  <h3 className="text-3xl sm:text-[2rem] font-bold tracking-tight text-foreground leading-none">
                    {plan.priceLabel}
                  </h3>
                  {plan.priceHint ? (
                    <span className="mb-0.5 text-xs font-medium text-muted-foreground">
                      {plan.priceHint}
                    </span>
                  ) : null}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-5">
                  {plan.blurb}
                </p>

                <PlanCta
                  href={href}
                  external={plan.cta.type === "mailto"}
                  label={plan.ctaLabel}
                  className={cn(
                    "group/cta inline-flex items-center justify-center gap-1.5 h-11 w-full rounded-full text-sm font-semibold active:scale-[0.98] transition-[transform,background-color,border-color,color] duration-150 mb-6",
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/70 bg-background/50 text-foreground hover:bg-white/[0.06] hover:border-primary/35"
                  )}
                />

                <ul className="space-y-2.5 mt-auto border-t border-border/40 pt-5">
                  {plan.features.map((feature) => (
                    <FeatureRow key={feature.label} feature={feature} />
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-14 sm:mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-5">Built for teams that need evidence</p>
          <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRUST_LABELS.map((label) => (
              <li
                key={label}
                className="text-xs font-medium text-muted-foreground border border-border/50 rounded-full px-3.5 py-1.5 bg-card/40"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 sm:mt-16 text-center max-w-lg mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-balance">
            Get started today
          </h3>
          <p className="text-sm text-muted-foreground mb-5 text-pretty">
            Book a short demo and we will map which path fits your warehouse and team.
          </p>
          <Link
            href="/book-demo"
            className="group/cta inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-[transform,background-color] duration-150"
          >
            Book a demo
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
