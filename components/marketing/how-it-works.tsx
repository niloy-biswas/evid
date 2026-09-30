"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Database, Lock, Shield, Sparkles, X } from "lucide-react";
import { CycleBar, useAutoCycle } from "@/components/marketing/auto-cycle";
import { SectionLabel } from "@/components/marketing/section-label";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5500;

const STEPS = [
  {
    id: "publish",
    title: "Publish context",
    body: "Rules, caveats, and instructions. Draft until ready.",
  },
  {
    id: "access",
    title: "Control access",
    body: "Approved tables only, on your own data source.",
  },
  {
    id: "ask",
    title: "Ask naturally",
    body: "Users ask inside the published dashboard.",
  },
  {
    id: "inspect",
    title: "Inspect the answer",
    body: "Chart, SQL, and the context that shaped it.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function StepVisual({ id }: { id: StepId }) {
  if (id === "publish") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium">Context editor</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
            Draft
          </span>
        </div>
        {["Net revenue excludes refunds", "Caveat · campaign ended mid-month"].map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-foreground/90"
          >
            {line}
          </motion.div>
        ))}
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
        >
          <Shield className="h-3.5 w-3.5" />
          Publish
        </motion.span>
      </div>
    );
  }

  if (id === "access") {
    return (
      <div className="space-y-2">
        {[
          { name: "orders_fact", ok: true },
          { name: "campaigns", ok: true },
          { name: "tmp_refunds", ok: false },
        ].map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-mono flex items-center justify-between",
              t.ok
                ? "border-primary/30 bg-primary/5 text-foreground"
                : "border-border/50 text-muted-foreground/60 line-through"
            )}
          >
            {t.name}
            {t.ok ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5" />}
          </motion.div>
        ))}
        <p className="pt-1 inline-flex items-center gap-1.5 text-[11px] text-primary">
          <Database className="h-3 w-3" />
          BigQuery · Production
          <Lock className="h-3 w-3" />
        </p>
      </div>
    );
  }

  if (id === "ask") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3 py-2 text-xs ml-auto max-w-[85%]">
          Why did revenue fall last month?
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5"
        >
          <p className="text-[11px] text-primary font-medium">Evid found something</p>
          <p className="text-xs text-foreground leading-relaxed">
            Net revenue −12.4%, mostly Enterprise after the campaign ended.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {["Answer", "Chart", "SQL", "Context"].map((t) => (
          <span
            key={t}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-md border",
              t === "SQL"
                ? "bg-primary/15 text-primary border-primary/30"
                : "border-border/60 text-muted-foreground"
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <motion.pre
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ delay: 0.15 }}
        className="rounded-lg border border-border/60 bg-muted/20 p-3 text-[11px] leading-relaxed font-mono text-foreground/90 overflow-x-auto"
      >
        {`SELECT month, SUM(net_amount)\nFROM analytics.orders_fact\nWHERE is_refunded = FALSE\nGROUP BY 1`}
      </motion.pre>
    </div>
  );
}

export function HowItWorksSection() {
  const cycle = useAutoCycle(STEPS.length, CYCLE_MS);
  const step = STEPS[cycle.active];

  return (
    <section id="how-it-works" className="border-b border-border/30 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10 text-balance">
          <span className="text-foreground">Governance before conversation.</span>{" "}
          <span className="text-muted-foreground">Define the rules once.</span>
        </h2>

        {/* Desktop stepper */}
        <div
          ref={cycle.ref}
          {...cycle.hoverProps}
          className="hidden md:grid md:grid-cols-[260px_1fr] gap-8"
        >
          <ol className="flex h-full flex-col justify-between gap-2">
            {STEPS.map((s, i) => {
              const active = cycle.active === i;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => cycle.select(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "relative w-full overflow-hidden text-left rounded-xl border px-4 py-2.5 transition-colors",
                      active
                        ? "border-primary/40 bg-card/50"
                        : "border-border/50 bg-card/50 hover:bg-white/[0.04]"
                    )}
                  >
                    {active ? <CycleBar running={cycle.running} ms={CYCLE_MS} /> : null}
                    <span className="relative text-[11px] font-mono text-muted-foreground">0{i + 1}</span>
                    <p className="relative text-sm font-semibold mt-0.5">{s.title}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-sm text-muted-foreground mb-6">{step.body}</p>
                <StepVisual id={step.id} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden space-y-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-mono text-muted-foreground">0{i + 1}</span>
                <span className="text-sm font-semibold">{s.title}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{s.body}</p>
              <StepVisual id={s.id} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
