import { CHANGELOG_ITEMS } from "@/components/marketing/config";
import { SectionLabel } from "@/components/marketing/section-label";

export function ChangelogSection() {
  return (
    <section className="border-b border-border/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
        <SectionLabel>Changelog</SectionLabel>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-balance">
          <span className="text-foreground">Actively built,</span>{" "}
          <span className="text-muted-foreground">not abandoned.</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mb-10 leading-relaxed">
          A running log of what shipped recently.
        </p>

        <ul className="rounded-2xl border border-border/50 bg-card/40 divide-y divide-border/40">
          {CHANGELOG_ITEMS.map((item) => (
            <li
              key={item.date + item.title}
              className="py-5 sm:py-6 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6"
            >
              <span className="shrink-0 text-xs font-mono text-muted-foreground sm:w-24 tabular-nums">
                {item.date}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5 text-pretty">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
