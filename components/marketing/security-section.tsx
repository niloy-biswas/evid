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
        <SectionLabel>Security</SectionLabel>
        <h2 className="mb-10 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          <span className="text-foreground">Your data</span>{" "}
          <span className="text-muted-foreground">never leaves your warehouse.</span>
        </h2>

        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--foreground) 14%, transparent) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative flex items-center justify-between border-b border-border/50 px-6 py-3 font-mono text-[11px] tracking-wider text-muted-foreground sm:px-8">
            <span>DATA BOUNDARY</span>
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
              SECURE
            </span>
          </div>

          <div className="relative grid lg:grid-cols-2">
            <div className="border-b border-border/50 px-6 py-8 sm:px-8 lg:border-r lg:border-b-0">
              <ul>
                {SECURITY_POINTS.map((p, i) => {
                  const Icon = POINT_ICONS[p.icon]
                  return (
                    <li
                      key={p.id}
                      className={cn(
                        "flex items-center gap-4 py-4",
                        i > 0 && "border-t border-border/40"
                      )}
                    >
                      <span className="w-4 shrink-0 font-mono text-[11px] text-muted-foreground/70">
                        0{i + 1}
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="flex-1 text-sm text-foreground/90">
                        {p.title}
                      </span>
                      <span className="shrink-0 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
                        {p.spec}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div
              ref={cycle.ref}
              {...cycle.hoverProps}
              className="px-6 py-8 sm:px-8"
            >
              <ol aria-label="How a question flows through Evid">
                {SECURITY_FLOW.map((node, i) => {
                  const Icon = FLOW_ICONS[node.icon]
                  const active = cycle.active === i
                  return (
                    <li key={node.id}>
                      <div
                        className={cn(
                          "relative flex items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-2.5 transition-colors duration-300",
                          active
                            ? "border-primary/40 bg-card/50"
                            : "border-border/50 bg-card/50"
                        )}
                      >
                        {active ? (
                          <CycleBar running={cycle.running} ms={CYCLE_MS} />
                        ) : null}
                        <span className="relative w-4 shrink-0 font-mono text-[11px] text-muted-foreground/70">
                          0{i + 1}
                        </span>
                        <Icon
                          className={cn(
                            "relative h-4 w-4 shrink-0 transition-colors duration-300",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                          aria-hidden
                        />
                        <p className="relative min-w-0 truncate text-sm">
                          <span className="font-semibold">{node.title}</span>{" "}
                          <span className="text-muted-foreground">· {node.hint}</span>
                        </p>
                      </div>
                      {i < SECURITY_FLOW.length - 1 && (
                        <div
                          className={cn(
                            "ml-[34px] h-3 border-l border-dashed transition-colors duration-300",
                            cycle.active > i ? "border-primary/60" : "border-border/50"
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
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] tracking-wider text-muted-foreground">
            CONNECTORS
          </span>
          {DATA_SOURCES.map((s) => (
            <span
              key={s.name}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs",
                s.live
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/50 bg-transparent text-muted-foreground"
              )}
            >
              {s.name}
              <span
                className={s.live ? "text-primary" : "text-muted-foreground/60"}
              >
                {s.live ? "LIVE" : "SOON"}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
