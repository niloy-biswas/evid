/**
 * Runtime token resolution. Browser-only.
 *
 * The app renders color entirely through CSS custom properties — this file
 * exists only for the one consumer that can't: the chart PNG/SVG export in
 * components/chat/chart-block.tsx, which serializes an SVG into a new
 * <img>/<canvas> document that has no access to the page's custom
 * properties. Everything else (Recharts props, ChartConfig in
 * components/ui/chart.tsx, Tailwind classes) should keep using var(...)
 * directly rather than importing from here.
 */

/** The categorical chart scale, in series order. Mirrors --chart-1..6 in
 *  app/styles/semantic.css. */
export const VIZ_TOKENS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
] as const;

/**
 * Resolve a CSS custom property to a concrete color string (e.g. "rgb(12, 106, 128)").
 *
 * Custom properties are substitution-only: reading one back with
 * getComputedStyle(el).getPropertyValue('--x') returns its *declaration
 * text* verbatim, so a color-mix(...) or var(--a) chain comes back as that
 * literal source string, not a resolved color. To force real resolution we
 * assign the property to a real CSS color property (`color`) on a detached
 * probe element and read the computed value of that property instead.
 *
 * Pass `scope` to resolve a variable that's only defined in a scoped
 * context — e.g. the --color-<key> vars that components/ui/chart.tsx's
 * ChartStyle injects under `[data-chart=id]` rather than :root.
 */
export function resolveToken(name: string, scope?: Element): string {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color:var(${name})`;
  const host = scope ?? document.body;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}
