"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { HeroSky } from "@/components/marketing/hero-landscape";
import { MarketingCtaPair } from "@/components/marketing/marketing-cta-pair";
import { BRAND } from "@/lib/brand";

/**
 * Powder hero: slate sky, copy, and product demo card.
 * No hill overlays or scroll-cover behavior.
 */
export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative isolate overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <HeroSky className="absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-2xl text-center"
        >
          <a
            href="#product"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-3.5 py-1.5 text-[12px] font-medium text-white/90 hover:bg-black/40 transition-colors mb-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />
            New: governed answers with inspectable SQL
            <ArrowRight className="h-3 w-3 opacity-70" />
          </a>

          <h1 className="font-heading text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] font-bold tracking-[-0.035em] leading-none text-balance mb-3.5 text-white">
            {BRAND.tagline}
          </h1>

          <p className="text-[15px] sm:text-base text-white/90 font-medium leading-relaxed text-pretty max-w-lg mx-auto mb-8">
            Ask in plain English. Get charts, explanations, and SQL grounded in approved
            dashboards, tables, and business rules.
          </p>

          <div className="flex justify-center mb-8 sm:mb-10">
            <MarketingCtaPair isLoggedIn={isLoggedIn} tone="hero" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="relative z-10 mx-auto max-w-5xl px-3 sm:px-6 pb-16 sm:pb-24"
      >
        <div
          className="relative rounded-[1.35rem] sm:rounded-[1.75rem] border border-white/14 overflow-hidden shadow-[0_40px_100px_var(--overlay-shadow)]"
          style={{
            background: "var(--powder-glass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <HeroDemo embedded />
        </div>
      </motion.div>
    </section>
  );
}
