import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { DEPLOY_OPTIONS } from "@/components/marketing/config";
import { SectionLabel } from "@/components/marketing/section-label";
import { contactMailto } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function DeploymentSection() {
  return (
    <section id="deployment" className="border-b border-border/30 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionLabel>Deployment</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            <span className="text-foreground">Choose how you</span>{" "}
            <span className="text-muted-foreground">run Evid.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {DEPLOY_OPTIONS.map((opt) => {
            const href = opt.cta.type === "demo" ? "/book-demo" : contactMailto(opt.cta.subject);
            const ctaClass = cn(
              "group/cta inline-flex items-center justify-center gap-1.5 h-11 w-full rounded-full text-sm font-semibold active:scale-[0.98] transition-[transform,background-color,border-color,color] duration-150",
              opt.highlighted
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border/70 bg-background/50 text-foreground hover:bg-white/[0.06] hover:border-primary/35"
            );
            const cta = (
              <>
                {opt.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/cta:translate-x-0.5" />
              </>
            );

            return (
              <article
                key={opt.id}
                className={cn(
                  "flex flex-col rounded-2xl border p-5 sm:p-6 transition-colors",
                  opt.highlighted
                    ? "border-primary/45 bg-card/80 shadow-[0_24px_48px_var(--overlay-shadow)]"
                    : "border-border/60 bg-card/50 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold tracking-tight">{opt.name}</h3>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      opt.available
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground"
                    )}
                  >
                    {opt.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{opt.blurb}</p>

                <ul className="space-y-2.5 mb-6 text-sm">
                  {opt.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-foreground/90">
                      <Check className="h-3.5 w-3.5 mt-1 shrink-0 text-primary" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>

                {opt.cta.type === "mailto" ? (
                  <a href={href} className={cn(ctaClass, "mt-auto")}>
                    {cta}
                  </a>
                ) : (
                  <Link href={href} className={cn(ctaClass, "mt-auto")}>
                    {cta}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
