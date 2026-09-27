"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Check, Copy, ExternalLink } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { HeroSky } from "@/components/marketing/hero-landscape";
import {
  BRAND,
  demoBookingAllowsEmbed,
  demoBookingEmbedUrl,
  demoBookingUrl,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

function SupportEmailLine({
  prefix,
  suffix = "",
  className,
}: {
  prefix: string;
  suffix?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(BRAND.supportEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className={cn("text-sm text-white/78 leading-relaxed text-pretty", className)}>
      {prefix}
      <a
        href={`mailto:${BRAND.supportEmail}`}
        className="font-medium text-white hover:underline underline-offset-2"
      >
        {BRAND.supportEmail}
      </a>
      <button
        type="button"
        onClick={() => void copyEmail()}
        className="ml-2 inline-flex align-middle items-center gap-1 h-7 px-2 rounded-md border border-white/20 bg-black/25 text-xs font-medium text-white/85 hover:bg-black/40 transition-colors"
        aria-label={copied ? "Email copied" : `Copy ${BRAND.supportEmail}`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-primary" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden />
            Copy
          </>
        )}
      </button>
      {suffix}
    </p>
  );
}

function BookingAction() {
  const href = demoBookingUrl();
  if (!href) {
    return (
      <SupportEmailLine
        prefix="Email "
        suffix=" — we usually reply within a day."
      />
    );
  }

  const embedSrc = demoBookingEmbedUrl();
  if (embedSrc) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md overflow-hidden">
          <iframe
            title="Book a demo time"
            src={embedSrc}
            className="w-full min-h-[720px] sm:min-h-[780px] border-0 bg-transparent"
            loading="lazy"
          />
        </div>
        <SupportEmailLine
          prefix="Can't find a slot? Email "
          suffix=" and we'll find a time."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-[var(--powder-bg)] text-sm font-semibold hover:bg-white/90 active:scale-[0.96] transition-[transform,background-color] duration-150"
      >
        <Calendar className="h-4 w-4" aria-hidden />
        Open calendar
        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </a>
      <SupportEmailLine
        prefix="Can't find a slot? Email "
        suffix=" and we'll find a time."
      />
    </div>
  );
}

/** Powder book-demo: same hero sky as landing, calendar CTA + email line only. */
export function BookDemoView() {
  const bookingUrl = demoBookingUrl();
  const embeds = Boolean(bookingUrl) && demoBookingAllowsEmbed(bookingUrl);

  return (
    <div
      data-theme="powder"
      className="dark relative min-h-screen flex flex-col overflow-x-clip bg-background text-foreground"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <HeroSky className="absolute inset-0" />
      </div>

      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" aria-label={`${BRAND.name} home`}>
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="text-sm text-white/75 hover:text-white transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20",
            embeds ? "max-w-3xl" : "max-w-xl"
          )}
        >
          <p className="text-xs font-medium tracking-wide text-white/70 mb-3">Book a demo</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance mb-3.5 text-white">
            See {BRAND.name} on your kind of questions.
          </h1>
          <p className="text-white/78 leading-relaxed mb-8 text-pretty max-w-lg">
            {embeds
              ? "Pick a time below. We will confirm by email."
              : bookingUrl
                ? "Open the calendar to choose a slot — we will get the invite automatically."
                : "Tell us what you want to cover and we will find a time."}
          </p>
          <BookingAction />
        </div>
      </main>
    </div>
  );
}
