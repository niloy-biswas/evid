"use client";

/**
 * Powder hero sky — structure only.
 * Colors / gradients / contour ink live in app/styles/marketing-powder.css
 * (primitives in app/styles/palette.css).
 */

const CONTOURS = [
  {
    className: "powder-contour-1",
    d: "M0 28 C200 -8 400 75 620 25 C840 -15 1040 70 1240 30 C1360 8 1410 40 1440 22",
    width: 1.25,
  },
  {
    className: "powder-contour-2",
    d: "M0 72 C230 115 430 28 650 78 C870 125 1070 32 1270 82 C1370 108 1420 78 1440 88",
    width: 1.1,
  },
  {
    className: "powder-contour-3",
    d: "M0 118 C190 85 400 155 600 112 C820 68 1020 150 1220 118 C1340 98 1410 132 1440 122",
    width: 1.05,
  },
  {
    className: "powder-contour-4",
    d: "M0 168 C170 140 380 200 580 162 C780 125 980 205 1180 170 C1320 148 1400 185 1440 175",
    width: 1,
  },
  {
    className: "powder-contour-5",
    d: "M0 218 C150 195 360 250 560 218 C760 185 960 255 1160 225 C1300 205 1400 240 1440 230",
    width: 1,
  },
] as const;

/** Five faded hill contour lines — low in the hero, near the card seam. */
function HorizonContours() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-[72svh] sm:top-[75svh] h-[36svh] w-full"
      viewBox="0 0 1440 260"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="powder-contour-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--neutral-0)" stopOpacity="1" />
          <stop offset="60%" stopColor="var(--neutral-0)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--neutral-0)" stopOpacity="0" />
        </linearGradient>
        <mask id="powder-contour-mask">
          <rect width="1440" height="260" fill="url(#powder-contour-fade)" />
        </mask>
      </defs>
      <g mask="url(#powder-contour-mask)" fill="none" strokeLinecap="round">
        {CONTOURS.map((line) => (
          <path
            key={line.className}
            className={line.className}
            d={line.d}
            strokeWidth={line.width}
          />
        ))}
      </g>
    </svg>
  );
}

/** Powder dusk sky + dissolve into near-dark page bg. */
export function HeroSky({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="powder-hero-sky absolute inset-x-0 top-0 h-[140svh] min-h-[860px]" />
      <div className="powder-hero-dissolve absolute inset-x-0 top-[48svh] h-[70svh]" />
      <HorizonContours />
    </div>
  );
}
