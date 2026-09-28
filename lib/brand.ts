/**
 * Product brand. Change here when renaming. UI and landing copy import from this module.
 */
export const BRAND = {
  name: "Evid",
  tagline: "Ask your data. Get answers backed by evidence.",
  description:
    "Ask questions in plain English and get charts, explanations, and SQL grounded in approved dashboards, tables, and business rules.",
  ogDescription:
    "Governed AI analytics with published context, approved tables, and inspectable SQL. Live on BigQuery.",
  /** Short line under the name in product chrome */
  productLabel: "Governed AI analytics",
  supportEmail: "hello@evid.cc",
  githubUrl: "https://github.com/niloy-biswas/evid",
  footerLine: "Evid. Governed answers from your own data.",
} as const;

/** Canonical public origin. Override with NEXT_PUBLIC_SITE_URL for previews. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://evid.cc").replace(
  /\/+$/,
  ""
);

export function contactMailto(subject?: string): string {
  if (!subject) return `mailto:${BRAND.supportEmail}`;
  return `mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(subject)}`;
}

/**
 * Optional calendar link (Cal.com, Calendly, Google Appointment schedules, …).
 * Set `NEXT_PUBLIC_DEMO_BOOKING_URL` to an https URL; /book-demo embeds it when allowed.
 */
export function demoBookingUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_DEMO_BOOKING_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function bookingHost(raw: string): string | null {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Google Appointment / Calendar share links refuse iframes (X-Frame-Options).
 * Cal.com / Calendly can be embedded.
 */
export function demoBookingAllowsEmbed(url = demoBookingUrl()): boolean {
  if (!url) return false;
  const host = bookingHost(url);
  if (!host) return false;
  // calendar.app.google is not under *.google.com
  return host !== "calendar.app.google" && !host.endsWith(".google.com");
}

/** Embed URL with provider-specific query params. Null when the host blocks iframes. */
export function demoBookingEmbedUrl(): string | null {
  const raw = demoBookingUrl();
  if (!raw || !demoBookingAllowsEmbed(raw)) return null;
  try {
    const url = new URL(raw);
    const host = bookingHost(raw);
    if (!host) return raw;
    if (host === "cal.com" || host.endsWith(".cal.com")) {
      url.searchParams.set("embed", "true");
      if (!url.searchParams.has("theme")) url.searchParams.set("theme", "dark");
    } else if (host === "calendly.com" || host.endsWith(".calendly.com")) {
      url.searchParams.set("embed_domain", "evid");
      url.searchParams.set("embed_type", "Inline");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

/** Primary marketing CTA: open product (signed in) vs book a demo (signed out). */
export function marketingPrimaryCta(isLoggedIn: boolean): {
  href: string;
  label: string;
  external: boolean;
} {
  return isLoggedIn
    ? { href: "/app", label: "Open app", external: false }
    : { href: "/book-demo", label: "Book a demo", external: false };
}
