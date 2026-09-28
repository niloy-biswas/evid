/* eslint-disable no-restricted-syntax -- ImageResponse cannot read CSS variables; allowlisted in scripts/check-tokens.mjs */
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name}: ${BRAND.productLabel}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Values mirror --powder-sky-top / --powder-horizon / --primary in palette.css.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#ffffff",
          background: "linear-gradient(180deg, #1b2228 0%, #353f44 62%, #d39794 130%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          {BRAND.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 980,
            }}
          >
            {BRAND.tagline}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.72)" }}>
            {BRAND.productLabel} for BigQuery
          </div>
        </div>
      </div>
    ),
    size
  );
}
