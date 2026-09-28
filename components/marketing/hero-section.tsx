"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { MarketingCtaPair } from "@/components/marketing/marketing-cta-pair";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Framer-style parallax speeds (100 = page speed). Lower values lag the page,
 * so the hills and card sink behind the foreground, which moves with it.
 * Powder uses far 69 / near 83 on a much taller hero; on ours that buries the
 * hills halfway through, so the lag is scaled until the foreground only
 * covers them as the hero nears the top of the viewport.
 * The card lags least so its answer stays readable above the trees longer.
 */
const PARALLAX_SPEED = { far: 83, near: 91, card: 92 } as const;

/** Powder's hill entrance: each layer rises from below on a 1s spring. */
const HILL_ENTER = { far: 72, near: 48, foreground: 36 } as const;
const HILL_SPRING = { type: "spring", bounce: 0, duration: 1 } as const;

/**
 * Powder hero: slate sky, copy, and product demo card over a 3-layer hill
 * parallax. Far and near hills rise from mid-card behind it; the foreground
 * hill sits on the section's bottom edge in front of it.
 */
export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();

  const lag = (speed: number) => (v: number) => (reduced ? 0 : v * (1 - speed / 100));
  const farHillY = useTransform(scrollY, lag(PARALLAX_SPEED.far));
  const nearHillY = useTransform(scrollY, lag(PARALLAX_SPEED.near));
  const cardY = useTransform(scrollY, lag(PARALLAX_SPEED.card));

  return (
    <section className="relative isolate overflow-clip">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Powder sky: slate at the top warming to horizon pink behind the hills. */}
        <div className="powder-hero-glow absolute inset-0" />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl text-center"
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

      <div className="relative z-10">
        {/* Background hills, behind the card. The far ridge starts at the card's
            vertical middle, measured from its top: HeroDemo reserves a fixed
            card height (41px header + 532/572px body). The near ridge sits a
            small width-proportional step (3vw) below it. */}
        <HillLayer
          y={farHillY}
          enterFrom={reduced ? 0 : HILL_ENTER.far}
          fadeIn
          className="-z-10 -inset-x-60 top-[286px] sm:top-[306px]"
          src="/marketing/hero/hero-hill-far.webp"
          width={2048}
          height={756}
        >
          {/* Horizon light: sky glow above the ridge continues as haze over it. */}
          <div className="powder-hero-horizon absolute inset-x-0 bottom-full h-[45vh]" />
          <div className="powder-hero-haze absolute inset-0" />
        </HillLayer>
        <HillLayer
          y={nearHillY}
          enterFrom={reduced ? 0 : HILL_ENTER.near}
          className="-z-10 -inset-x-38 top-[calc(286px+3vw)] sm:top-[calc(306px+3vw)]"
          src="/marketing/hero/hero-hill-near.webp"
          width={2464}
          height={848}
        />

        <motion.div style={{ y: cardY }}>
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mx-auto max-w-5xl px-3 sm:px-6 pb-16 sm:pb-24"
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
        </motion.div>
      </div>

      {/* Foreground hill: moves with the page, painted over the sinking card. */}
      <HillLayer
        enterFrom={reduced ? 0 : HILL_ENTER.foreground}
        className="z-20 -inset-x-30 md:inset-x-0 -bottom-[3vw]"
        src="/marketing/hero/hero-hill-foreground.webp"
        width={2464}
        height={488}
      >
        {/* Fade to page background well above the section's clip line (see
            --powder-hero-foreground-fade), so the image — which still has
            ~3vw hanging past the section edge, per the -bottom offset above —
            reads as solid background before that overhang gets cropped. */}
        <div className="powder-hero-foreground-fade absolute inset-x-0 bottom-0 h-1/2" />
      </HillLayer>
    </section>
  );
}

/** One parallax hill: scroll-driven `y` outside, entrance spring inside. */
function HillLayer({
  y,
  enterFrom,
  fadeIn = false,
  className,
  src,
  width,
  height,
  children,
}: {
  y?: MotionValue<number>;
  enterFrom: number;
  fadeIn?: boolean;
  className: string;
  src: string;
  width: number;
  height: number;
  children?: ReactNode;
}) {
  return (
    <motion.div style={{ y }} className={cn("pointer-events-none absolute", className)} aria-hidden>
      <motion.div
        initial={{ opacity: fadeIn ? 0 : 1, y: enterFrom }}
        animate={{ opacity: 1, y: 0 }}
        transition={HILL_SPRING}
        className="relative"
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          priority
          sizes="100vw"
          className="w-full h-auto select-none"
        />
        {children}
      </motion.div>
    </motion.div>
  );
}
