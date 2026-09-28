import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { BRAND } from "@/lib/brand";

/** Bump when either legal page changes materially. */
export const LEGAL_UPDATED = "29 September 2026";

export function SupportEmailLink() {
  return (
    <a href={`mailto:${BRAND.supportEmail}`} className="text-primary hover:underline">
      {BRAND.supportEmail}
    </a>
  );
}

export type LegalSection = { heading: string; body: ReactNode };

/** Shared shell for /privacy and /terms: dark marketing theme, one readable column. */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div
      data-theme="powder"
      className="dark min-h-screen flex flex-col bg-background text-foreground"
    >
      <header className="mx-auto w-full max-w-3xl px-4 sm:px-6 h-14 flex items-center">
        <Link href="/" aria-label="Evid home">
          <BrandMark />
        </Link>
      </header>
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated {updated}</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold mb-2">{s.heading}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
