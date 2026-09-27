"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { HeroSky } from "@/components/marketing/hero-landscape";
import { PrimaryCta } from "@/components/marketing/primary-cta";
import { BRAND, marketingPrimaryCta } from "@/lib/brand";

/**
 * Powder hero: slate sky, copy, and product demo card.
 * No hill overlays or scroll-cover behavior.
 */
export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const primary = marketingPrimaryCta(isLoggedIn);

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

          <h1 className="text-[2.15rem] sm:text-[2.75rem] lg:text-[3.15rem] font-bold tracking-[-0.03em] leading-[1.08] text-balance mb-3.5 text-white">
            {BRAND.tagline}
          </h1>

          <p className="text-[15px] sm:text-base text-white/65 leading-relaxed text-pretty max-w-lg mx-auto mb-6">
            Ask in plain English. Get charts, explanations, and SQL grounded in approved
            dashboards, tables, and business rules.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10">
            <PrimaryCta
              {...primary}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-[var(--powder-bg)] text-sm font-semibold hover:bg-white/90 active:scale-[0.96] transition-[transform,background-color] duration-150"
            />
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 active:scale-[0.96] transition-[transform,background-color] duration-150"
              aria-label="See how it works"
            >
              <span className="ml-0.5 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white" />
            </a>
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
