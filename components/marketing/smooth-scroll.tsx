"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";

/**
 * Lenis window smoothing for the landing page (Powder ships Lenis defaults:
 * lerp 0.1, smooth wheel, anchor links). Under reduced motion the wheel stays
 * native; Lenis re-inits on option change, so children never remount.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: !reduced, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
