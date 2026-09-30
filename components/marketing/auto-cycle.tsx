"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";

/**
 * Auto-advancing index for tabs and steppers. Runs only while the block is on
 * screen and not hovered or focused, and never under reduced motion. Manual
 * selection restarts the timer from the chosen item.
 */
export function useAutoCycle(count: number, ms: number) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const running = inView && !paused && !reduced;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % count), ms);
    return () => clearTimeout(t);
  }, [running, active, count, ms]);

  return {
    ref,
    active,
    running,
    select: setActive,
    hoverProps: {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onFocus: () => setPaused(true),
      onBlur: () => setPaused(false),
    },
  };
}

/** Fills the active item's own background as its timer progresses. */
export function CycleBar({ running, ms }: { running: boolean; ms: number }) {
  return (
    <motion.span
      aria-hidden
      key={String(running)}
      className="pointer-events-none absolute inset-0 origin-left bg-primary/15"
      initial={{ scaleX: running ? 0 : 1 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: running ? ms / 1000 : 0, ease: "linear" }}
    />
  );
}
