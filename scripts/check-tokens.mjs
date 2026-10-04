#!/usr/bin/env node
/**
 * Fails if a color literal (hex or rgb/rgba) shows up outside the token
 * system — app/styles/palette.css is the only file allowed to declare one.
 *
 * This exists because the repo has no CI, no git hooks, and no stylelint;
 * without it, color drift is silent until someone notices the UI looks
 * wrong. Run with `npm run lint:tokens`.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "styles"]); // styles/ = the palette itself, checked separately

// Files permitted to contain literal color values, relative to repo root.
const ALLOWLIST = new Set([
  "app/styles/palette.css", // the one place hex is allowed to live
  "components/icons/google-icon.tsx", // Google brand guidelines mandate exact hexes
  "components/ui/chart.tsx", // matches Recharts' own SVG attribute selectors (stroke='#ccc'), not a color declaration
  "app/opengraph-image.tsx", // ImageResponse renders outside the CSS cascade; cannot read var(--token)
  "lib/theme/tokens.ts", // doc-comment example only
]);

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
// No leading \b: Tailwind arbitrary values glue tokens with underscores
// (e.g. "shadow-[0_32px_80px_rgba(0,0,0,0.6)]"), and "_" counts as a word
// character, so a \b boundary before "rgba(" silently fails to match.
const RGB_RE = /rgba?\(/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (EXTENSIONS.has(extname(entry))) {
      out.push(rel);
    }
  }
  return out;
}

let failures = [];

for (const dir of SCAN_DIRS) {
  const full = join(ROOT, dir);
  try {
    statSync(full);
  } catch {
    continue;
  }
  for (const rel of walk(full)) {
    if (ALLOWLIST.has(rel)) continue;

    const text = readFileSync(join(ROOT, rel), "utf8");
    const lines = text.split("\n");

    lines.forEach((line, i) => {
      // Skip anchor/id/href-only lines and obvious non-color '#': crude but
      // effective — a real color literal is virtually never inside a plain
      // string like "#product" or "#pricing" without adjacent hex digits
      // forming a 3/4/6/8-digit run, which HEX_RE already requires.
      const hexHits = line.match(HEX_RE);
      const rgbHits = line.match(RGB_RE);
      if (hexHits) {
        failures.push({ file: rel, line: i + 1, match: hexHits[0], text: line.trim() });
      }
      if (rgbHits) {
        failures.push({ file: rel, line: i + 1, match: rgbHits[0], text: line.trim() });
      }
    });
  }
}

if (failures.length > 0) {
  console.error(`\n✗ lint:tokens found ${failures.length} color literal(s) outside the token system:\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}  ${f.match}`);
    console.error(`    ${f.text}`);
  }
  console.error(
    `\nUse a semantic token from app/styles/semantic.css instead (var(--primary), text-success, etc).` +
      `\nIf this is a legitimate exception (e.g. a third-party brand mark), add it to ALLOWLIST in scripts/check-tokens.mjs.\n`
  );
  process.exit(1);
} else {
  console.log("✓ lint:tokens — no color literals outside app/styles/palette.css");
}
