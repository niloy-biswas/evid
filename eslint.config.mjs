import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Surface color-literal drift in the editor at edit time. The
  // authoritative check is `npm run lint:tokens` (scripts/check-tokens.mjs),
  // which also catches template-literal and CSS cases this AST rule can't;
  // this rule exists purely so a hardcoded hex/rgb shows up as you type it.
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    ignores: [
      "components/auth/google-icon.tsx", // Google brand guidelines mandate exact hexes
      "components/ui/chart.tsx", // matches Recharts' own SVG attribute selectors, not a color
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Hardcoded hex color — use a semantic token from app/styles/semantic.css instead (e.g. var(--primary), text-success, bg-warning/15).",
        },
        {
          selector: "Literal[value=/rgba?\\(/]",
          message:
            "Hardcoded rgb()/rgba() color — use a semantic token from app/styles/semantic.css instead (e.g. var(--glow-primary), color-mix(in srgb, var(--foreground) 10%, transparent)).",
        },
      ],
    },
  },
]);

export default eslintConfig;
