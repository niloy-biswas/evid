"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { PrimaryCta } from "@/components/marketing/primary-cta";
import { MARKETING_NAV } from "@/components/marketing/config";
import { marketingPrimaryCta } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Powder-style minimal chrome: logo + CTA, light over the landscape. */
export function LandingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const primary = marketingPrimaryCta(isLoggedIn);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "transition-[background-color,backdrop-filter,border-color] duration-200",
          scrolled || open
            ? "border-b border-white/10 bg-[color-mix(in_srgb,var(--powder-bg)_82%,transparent)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
            <BrandMark />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm text-white/55">
            {MARKETING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <PrimaryCta
              {...primary}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white text-[var(--powder-bg)] text-sm font-semibold hover:bg-white/90 active:scale-[0.96] transition-[transform,background-color] duration-150"
              iconClassName="h-3.5 w-3.5"
            />
            <button
              type="button"
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/15 text-white/80 hover:text-white hover:bg-white/10"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-nav" className="lg:hidden px-4 pb-4">
            <nav className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-[var(--powder-surface)]/95 p-2">
              {MARKETING_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm text-white hover:bg-white/[0.05]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <PrimaryCta
                {...primary}
                className="mt-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-full bg-white text-[var(--powder-bg)] text-sm font-semibold"
                iconClassName="h-3.5 w-3.5"
                onClick={() => setOpen(false)}
              />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
