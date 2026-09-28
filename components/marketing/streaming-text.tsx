"use client";

import { useEffect, useState } from "react";

/** Shared typewriter used by landing demos (hero, problem contrast). */
export function useTypewriter(
  text: string,
  reduced: boolean,
  charsPerSec = 48,
  active = true
) {
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!active) {
      setOut("");
      return;
    }
    if (reduced) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    const stepMs = Math.max(12, Math.round(1000 / charsPerSec));
    const id = window.setInterval(() => {
      i += 1;
      if (i >= text.length) {
        setOut(text);
        window.clearInterval(id);
        return;
      }
      setOut(text.slice(0, i));
    }, stepMs);
    return () => window.clearInterval(id);
  }, [text, active, reduced, charsPerSec]);

  return out;
}

export function StreamingText({
  text,
  reduced,
  charsPerSec = 48,
  active = true,
  className,
  as: Tag = "p",
}: {
  text: string;
  reduced: boolean;
  charsPerSec?: number;
  active?: boolean;
  className?: string;
  as?: "p" | "pre" | "span";
}) {
  const out = useTypewriter(text, reduced, charsPerSec, active);
  const done = active && out.length >= text.length;

  return (
    <Tag className={className} aria-label={text}>
      {out}
      {active && !reduced && !done && (
        <span
          className="inline-block w-[0.5ch] h-[1em] align-[-0.1em] bg-primary/70 animate-pulse ml-0.5"
          aria-hidden
        />
      )}
    </Tag>
  );
}

/** Ease a numeric metric from 0 → target once `active` flips true. */
export function useCountUp(
  target: number,
  active: boolean,
  reduced: boolean,
  durationMs = 900
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (reduced) {
      setValue(target);
      return;
    }

    let cancelled = false;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Number((target * eased).toFixed(2)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [target, active, reduced, durationMs]);

  return value;
}
