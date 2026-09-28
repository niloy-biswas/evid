import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPageView } from "@/components/marketing/landing-page";
import { BRAND, SITE_URL } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    absolute: `${BRAND.name}: Governed AI Analytics`,
  },
  description: BRAND.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: BRAND.tagline,
    description: BRAND.ogDescription,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.tagline,
    description: BRAND.ogDescription,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: BRAND.name,
      url: SITE_URL,
      email: BRAND.supportEmail,
      sameAs: [BRAND.githubUrl],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: BRAND.name,
      url: SITE_URL,
      description: BRAND.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <script
        type="application/ld+json"
        // Static, first-party JSON only; "<" escaped so it cannot close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
      />
      <LandingPageView isLoggedIn={!!user} />
    </>
  );
}
