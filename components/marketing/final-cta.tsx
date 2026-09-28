"use client";

import { motion } from "framer-motion";
import { MarketingCtaPair } from "@/components/marketing/marketing-cta-pair";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";

export function FinalCta({ isLoggedIn }: { isLoggedIn: boolean }) {
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
        <div className="flex justify-center">
          <MarketingCtaPair isLoggedIn={isLoggedIn} tone="surface" />
        </div>
      </div>
    </section>
  );
}
