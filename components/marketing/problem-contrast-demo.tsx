"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Table2 } from "lucide-react";
import { PROBLEM_SECTION } from "@/components/marketing/config";
import {
  StreamingText,
  useCountUp,
  useTypewriter,
} from "@/components/marketing/streaming-text";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";
import { cn } from "@/lib/utils";

type Stage = "idle" | "question" | "compare" | "result";

function formatMetric(
  value: number,
  decimals: number,
  prefix: string,
  suffix: string
): string {
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

/** Streaming same-question contrast: ungoverned text-to-SQL vs Evid. */
export function ProblemContrastDemo() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [tablesVisible, setTablesVisible] = useState(0);
  const [contextVisible, setContextVisible] = useState(0);
  const [leftMetricOn, setLeftMetricOn] = useState(false);
  const [rightMetricOn, setRightMetricOn] = useState(false);
  const [leftFootnoteOn, setLeftFootnoteOn] = useState(false);
  const [rightFootnoteOn, setRightFootnoteOn] = useState(false);

  const { ungoverned, governed, question } = PROBLEM_SECTION;
  const questionTyped = useTypewriter(
    question,
    reduced,
    52,
    stage === "question" || stage === "compare" || stage === "result"
  );
  const questionDone =
    reduced || (stage !== "idle" && questionTyped.length >= question.length);

  const leftMetric = useCountUp(ungoverned.metricTarget, leftMetricOn, reduced, 850);
  const rightMetric = useCountUp(governed.metricTarget, rightMetricOn, reduced, 900);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setStage("result");
      setTablesVisible(ungoverned.tables.length);
      setContextVisible(governed.contextLines.length);
      setLeftMetricOn(true);
      setRightMetricOn(true);
      setLeftFootnoteOn(true);
      setRightFootnoteOn(true);
      return;
    }

    setStage("idle");
    setTablesVisible(0);
    setContextVisible(0);
    setLeftMetricOn(false);
    setRightMetricOn(false);
    setLeftFootnoteOn(false);
    setRightFootnoteOn(false);

    const t = window.setTimeout(() => setStage("question"), 120);
    return () => window.clearTimeout(t);
  }, [inView, reduced, ungoverned.tables.length, governed.contextLines.length]);

  useEffect(() => {
    if (!inView || reduced || !questionDone) return;

    let cancelled = false;
    const timers: number[] = [];
    setStage("compare");

    ungoverned.tables.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setTablesVisible(i + 1);
        }, 180 + i * 320)
      );
    });

    const leftMetricAt = 180 + ungoverned.tables.length * 320 + 200;
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setLeftMetricOn(true);
      }, leftMetricAt)
    );
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setLeftFootnoteOn(true);
      }, leftMetricAt + 700)
    );

    governed.contextLines.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setContextVisible(i + 1);
        }, 520 + i * 420)
      );
    });

    const rightMetricAt = 520 + governed.contextLines.length * 420 + 280;
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setRightMetricOn(true);
      }, rightMetricAt)
    );
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) {
          setRightFootnoteOn(true);
          setStage("result");
        }
      }, rightMetricAt + 750)
    );

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [inView, reduced, questionDone, ungoverned.tables, governed.contextLines]);

  return (
    <div
      ref={rootRef}
      className="rounded-[1.35rem] border border-border/60 bg-card/40 overflow-hidden shadow-[0_24px_64px_var(--overlay-shadow)]"
      aria-label="Same analytics question answered with and without published context"
    >
      <div className="flex items-center gap-3 border-b border-border/50 bg-muted/20 px-4 sm:px-5 py-3.5 min-h-[3.25rem]">
        <span
          className={cn(
            "hidden sm:inline-flex h-2 w-2 rounded-full shrink-0 transition-colors duration-300",
            stage === "idle" ? "bg-border" : "bg-primary/80"
          )}
          aria-hidden
        />
        <p className="text-sm text-foreground/90 font-medium text-pretty">
          <span className="text-muted-foreground font-normal">Same question · </span>
          <span aria-label={question}>
            {stage === "idle" ? null : questionTyped}
            {stage === "question" && !reduced && !questionDone && (
              <span
                className="inline-block w-[0.5ch] h-[1em] align-[-0.1em] bg-primary/70 animate-pulse ml-0.5"
                aria-hidden
              />
            )}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 md:divide-x divide-border/50">
        <div className="relative flex flex-col p-5 sm:p-6 bg-warning/[0.04] min-h-[22rem]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warning">
              {ungoverned.label}
            </p>
            <span className="text-[10px] font-medium text-warning/90 border border-warning/30 rounded-full px-2 py-0.5">
              Undefended
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground mb-2">Tables the model touched</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-5">
            {ungoverned.tables.map((table, i) => {
              const risky = (ungoverned.riskyTableIndexes as readonly number[]).includes(i);
              const visible = i < tablesVisible;
              return (
                <div
                  key={table}
                  className={cn(
                    "flex h-8 items-center rounded-md border px-2 text-[10px] font-mono truncate transition-opacity duration-200",
                    risky
                      ? "border-warning/45 bg-warning/10 text-foreground"
                      : "border-border/55 bg-background/40 text-foreground/75",
                    visible ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden={!visible}
                >
                  <Table2 className="h-3 w-3 shrink-0 mr-1 opacity-45" aria-hidden />
                  <span className="truncate">{table}</span>
                </div>
              );
            })}
          </div>

          <div
            className={cn(
              "mt-auto flex h-[9.25rem] flex-col rounded-xl border border-warning/35 bg-background/50 px-4 py-3.5 transition-opacity duration-300",
              leftMetricOn ? "opacity-100" : "opacity-40"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1 shrink-0">{ungoverned.metricLabel}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground shrink-0">
              {leftMetricOn
                ? formatMetric(
                    leftMetric,
                    ungoverned.metricDecimals,
                    ungoverned.metricPrefix,
                    ungoverned.metricSuffix
                  )
                : "—"}
            </p>
            <div className="mt-2.5 h-[2.75rem] overflow-hidden">
              {leftFootnoteOn ? (
                <p className="text-xs text-warning leading-snug flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                  <StreamingText
                    text={ungoverned.footnote}
                    reduced={reduced}
                    charsPerSec={56}
                    as="span"
                  />
                </p>
              ) : (
                <p className="text-xs text-warning/40 leading-snug inline-flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                  Waiting for query…
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col p-5 sm:p-6 bg-primary/[0.05] min-h-[22rem]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {governed.label}
            </p>
            <span className="text-[10px] font-medium text-primary border border-primary/35 rounded-full px-2 py-0.5 bg-primary/10">
              Defensible
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground mb-2">Published context applied</p>
          <ul className="space-y-1.5 mb-5">
            {governed.contextLines.map((line, i) => {
              const visible = i < contextVisible;
              return (
                <li
                  key={line}
                  className={cn(
                    "flex h-8 items-center gap-2 text-xs text-foreground/90 rounded-md border border-border/45 bg-background/40 px-3 transition-opacity duration-200",
                    visible ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden={!visible}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
                  <span className="truncate">{line}</span>
                </li>
              );
            })}
          </ul>

          <div
            className={cn(
              "mt-auto flex h-[9.25rem] flex-col rounded-xl border border-primary/35 bg-background/50 px-4 py-3.5 transition-opacity duration-300",
              rightMetricOn ? "opacity-100" : "opacity-40"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1 shrink-0">{governed.metricLabel}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground shrink-0">
              {rightMetricOn
                ? formatMetric(
                    rightMetric,
                    governed.metricDecimals,
                    governed.metricPrefix,
                    governed.metricSuffix
                  )
                : "—"}
            </p>
            <div className="mt-2.5 h-[2.75rem] overflow-hidden">
              {rightFootnoteOn ? (
                <p className="text-xs text-primary leading-snug flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                  <StreamingText
                    text={governed.footnote}
                    reduced={reduced}
                    charsPerSec={56}
                    as="span"
                  />
                </p>
              ) : (
                <p className="text-xs text-primary/40 leading-snug inline-flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                  Applying published context…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
