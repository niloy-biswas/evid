import Script from "next/script";

/** GA4 Measurement ID shape, e.g. G-L05LE5EGD7. */
const GA4_ID_RE = /^G-[A-Z0-9]+$/i;
/** Clarity project id (alphanumeric). */
const CLARITY_ID_RE = /^[a-z0-9]+$/i;

/**
 * Marketing-only tags for public pages (not root layout).
 * Read `NEXT_PUBLIC_*` literally so Next can inline them; skip invalid ids.
 */
export function MarketingAnalytics() {
  const rawGa4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  const rawClarity = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  const ga4Id = rawGa4 && GA4_ID_RE.test(rawGa4) ? rawGa4 : null;
  const clarityId = rawClarity && CLARITY_ID_RE.test(rawClarity) ? rawClarity : null;

  if (!ga4Id && !clarityId) return null;

  return (
    <>
      {ga4Id ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      ) : null}
      {clarityId ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      ) : null}
    </>
  );
}
