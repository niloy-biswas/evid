"use client";

import { motion } from "framer-motion";
import { BRAND, contactMailto, marketingPrimaryCta } from "@/lib/brand";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";
import { PrimaryCta } from "@/components/marketing/primary-cta";

export function FinalCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  const primary = marketingPrimaryCta(isLoggedIn);
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/30">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--glow-warm),transparent_65%)] opacity-60"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance"
        >
          <span className="text-foreground">Your data already knows</span>{" "}
          <span className="text-muted-foreground">the answer.</span>
        </motion.h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-pretty">
          Ask Evid, or run it on your own infrastructure.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrimaryCta
            {...primary}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.96] transition-[transform,background-color] duration-150 shadow-[0_0_28px_var(--glow-primary)]"
          />
          <a
            href={BRAND.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-border/70 bg-card/50 text-sm font-medium hover:bg-white/[0.06] active:scale-[0.96] transition-[transform,background-color] duration-150"
          >
            View on GitHub
          </a>
          <a
            href={contactMailto("Evid implementation")}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Contact for implementation
          </a>
        </div>
      </div>
    </section>
  );
}
