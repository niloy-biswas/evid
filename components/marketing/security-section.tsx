"use client"

import {
  Code2,
  Database,
  Lock,
  MessageSquare,
  Shield,
  Sparkles,
  Table2,
  type LucideIcon,
} from "lucide-react"
import { CycleBar, useAutoCycle } from "@/components/marketing/auto-cycle"
import {
  DATA_SOURCES,
  SECURITY_FLOW,
  SECURITY_POINTS,
} from "@/components/marketing/config"
import { SectionLabel } from "@/components/marketing/section-label"
import { cn } from "@/lib/utils"

const CYCLE_MS = 1600

const POINT_ICONS: Record<
  (typeof SECURITY_POINTS)[number]["icon"],
  LucideIcon
> = {
  database: Database,
  table: Table2,
  lock: Lock,
  code: Code2,
}

const FLOW_ICONS: Record<(typeof SECURITY_FLOW)[number]["icon"], LucideIcon> = {
  message: MessageSquare,
  spark: Sparkles,
  shield: Shield,
  database: Database,
}

export function SecuritySection() {
  const cycle = useAutoCycle(SECURITY_FLOW.length, CYCLE_MS)

  return (
    <section id="security" className="scroll-mt-24 border-b border-border/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>Security</SectionLabel>
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              <span className="text-foreground">Your warehouse</span>{" "}
              <span className="text-muted-foreground">
                stays your warehouse.
              </span>
            </h2>
            <ul className="space-y-4">
              {SECURITY_POINTS.map((p) => {
                const Icon = POINT_ICONS[p.icon]
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 text-foreground/90"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card/60">
                      <Icon className="h-4 w-4 text-primary" aria-hidden />
                    </span>
                    {p.title}
                  </li>
                )
              })}
            </ul>
          </div>

          <div
            ref={cycle.ref}
            {...cycle.hoverProps}
            className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-5"
          >
            <ol aria-label="How a question flows through Evid">
              {SECURITY_FLOW.map((node, i) => {
                const Icon = FLOW_ICONS[node.icon]
                const active = cycle.active === i
                return (
                  <li key={node.id}>
                    <div
                      className={cn(
                        "relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 transition-colors duration-300",
                        active
                          ? "border-primary/40 bg-muted/10"
                          : "border-border/50 bg-muted/10"
                      )}
                    >
                      {active ? (
                        <CycleBar running={cycle.running} ms={CYCLE_MS} />
                      ) : null}
                      <Icon
                        className={cn(
                          "relative h-4 w-4 shrink-0 transition-colors duration-300",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <div className="relative min-w-0">
                        <p className="text-sm font-semibold">{node.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {node.hint}
                        </p>
                      </div>
                    </div>
                    {i < SECURITY_FLOW.length - 1 && (
                      <div
                        className={cn(
                          "ml-7 h-4 w-px transition-colors duration-300",
                          cycle.active > i ? "bg-primary/60" : "bg-border/60"
                        )}
                        aria-hidden
                      />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2.5 sm:mt-16">
          <span className="mr-1 text-sm text-muted-foreground">
            Data sources
          </span>
          {DATA_SOURCES.map((s) => (
            <span
              key={s.name}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium",
                s.live
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/50 bg-card/40 text-muted-foreground"
              )}
            >
              {s.name}
              <span
                className={s.live ? "text-primary" : "text-muted-foreground/70"}
              >
                {s.live ? "Live" : "Coming soon"}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
