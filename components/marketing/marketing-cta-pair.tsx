"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GitHubIcon } from "@/components/marketing/github-icon";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";
import { BRAND, marketingPrimaryCta } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Tone = "hero" | "surface";
type Size = "md" | "sm";
type Variant = "solid" | "outline";

/**
 * FeatDev-style rolling letters (text-shadow duplicate + staggered translateY).
 * @see https://featdev.framer.website/
 */
function RollingText({
  text,
  className,
  reduced,
}: {
  text: string;
  className?: string;
  reduced: boolean;
}) {
  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  const chars = Array.from(text);

  return (
    <span className={cn("relative inline-flex overflow-hidden leading-[1.25]", className)}>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden
        className="inline-flex"
        style={{ textShadow: "0 1.25em 0 currentColor" }}
      >
        {chars.map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="inline-block whitespace-pre transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0,0,1)] motion-safe:group-hover/cta:-translate-y-[1.25em]"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </span>
    </span>
  );
}

function AnimatedCta({
  href,
  label,
  external,
  variant,
  tone,
  size,
  icon,
  reduced,
  onNavigate,
}: {
  href: string;
  label: string;
  external?: boolean;
  variant: Variant;
  tone: Tone;
  size: Size;
  icon?: "arrow" | "github";
  reduced: boolean;
  onNavigate?: () => void;
}) {
  const compact = size === "sm";

  const shell =
    variant === "solid"
      ? tone === "hero"
        ? "bg-white text-[var(--powder-bg)] hover:text-white"
        : "bg-primary text-primary-foreground hover:text-background"
      : tone === "hero"
        ? "border border-white/35 bg-transparent text-white hover:text-[var(--powder-bg)]"
        : "border border-border/70 bg-transparent text-foreground hover:text-background";

  const fill =
    variant === "solid"
      ? tone === "hero"
        ? "bg-[var(--powder-bg)]"
        : "bg-foreground"
      : tone === "hero"
        ? "bg-white"
        : "bg-foreground";

  const className = cn(
    "group/cta relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold",
    "transition-colors duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
    "active:scale-[0.96]",
    compact ? "h-9 gap-1.5 px-4 text-[13px]" : "h-11 gap-2 px-5 sm:px-6 text-sm",
    shell
  );

  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  const content = (
    <>
      {/* Liquid fill — fully off-canvas until hover (avoids rest-state edge hairline) */}
      {!reduced ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            "translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)]",
            "motion-safe:group-hover/cta:translate-y-0",
            fill
          )}
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {icon === "github" ? (
          <GitHubIcon className={cn(iconClass, "opacity-85")} />
        ) : null}
        <RollingText text={label} reduced={reduced} />
        {icon === "arrow" ? <ArrowRight className={iconClass} aria-hidden /> : null}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

/**
 * Book a demo + View on GitHub with FeatDev CTA hover (rolling type + liquid fill).
 */
export function MarketingCtaPair({
  isLoggedIn,
  tone = "hero",
  size = "md",
  className,
  onNavigate,
}: {
  isLoggedIn: boolean;
  tone?: Tone;
  size?: Size;
  className?: string;
  onNavigate?: () => void;
}) {
  const primary = marketingPrimaryCta(isLoggedIn);
  const reduced = usePrefersReducedMotion();

  return (
    <div className={cn("inline-flex flex-wrap items-center justify-center gap-3", className)}>
      <AnimatedCta
        href={primary.href}
        label={primary.label}
        external={primary.external}
        variant="solid"
        tone={tone}
        size={size}
        icon="arrow"
        reduced={reduced}
        onNavigate={onNavigate}
      />
      <AnimatedCta
        href={BRAND.githubUrl}
        label={size === "sm" ? "GitHub" : "View on GitHub"}
        external
        variant="outline"
        tone={tone}
        size={size}
        icon="github"
        reduced={reduced}
        onNavigate={onNavigate}
      />
    </div>
  );
}
