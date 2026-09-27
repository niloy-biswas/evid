"use client";

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";

type Block = {
  as?: ElementType;
  text: string;
  className?: string;
};

type Token =
  | { type: "space"; value: string }
  | { type: "word"; value: string; index: number };

function tokenize(text: string): Array<{ type: "word" | "space"; value: string }> {
  return text.split(/(\s+)/).filter(Boolean).map((value) => ({
    type: /\s/.test(value) ? "space" : "word",
    value,
  }));
}

/**
 * Powder-style scroll highlight, but per word: dim → full as the block
 * travels through the viewport.
 */
export function ScrollWordReveal({
  blocks,
  className,
}: {
  blocks: Block[];
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.38"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduced) setProgress(v);
  });

  useEffect(() => {
    if (reduced) setProgress(1);
  }, [reduced]);

  const prepared = useMemo(() => {
    let wordIndex = 0;
    return blocks.map((block) => {
      const tokens: Token[] = tokenize(block.text).map((token): Token => {
        if (token.type === "space") {
          return { type: "space", value: token.value };
        }
        const indexed: Token = {
          type: "word",
          value: token.value,
          index: wordIndex,
        };
        wordIndex += 1;
        return indexed;
      });
      return { ...block, tokens };
    });
  }, [blocks]);

  const wordCount = prepared.reduce(
    (n, block) => n + block.tokens.filter((t) => t.type === "word").length,
    0
  );

  return (
    <div ref={ref} className={className}>
      {prepared.map((block, bi) => {
        const Tag = (block.as ?? "p") as ElementType;
        return (
          <Tag key={bi} className={block.className}>
            {block.tokens.map((token, ti) => {
              if (token.type === "space") {
                return <span key={`s-${bi}-${ti}`}>{token.value}</span>;
              }

              const t = wordLitProgress(progress, token.index, wordCount, reduced);

              return (
                <span
                  key={`w-${bi}-${ti}`}
                  className="inline transition-[color,opacity] duration-150 ease-out"
                  style={{
                    opacity: 0.22 + t * 0.78,
                    color: `color-mix(in srgb, var(--foreground) ${Math.round(t * 100)}%, var(--muted-foreground))`,
                  }}
                >
                  {token.value}
                </span>
              );
            })}
          </Tag>
        );
      })}
    </div>
  );
}

function wordLitProgress(
  scrollProgress: number,
  wordIndex: number,
  wordCount: number,
  reduced: boolean
): number {
  if (reduced || wordCount <= 1) return 1;
  const center = wordIndex / (wordCount - 1);
  const window = 1.15 / wordCount;
  const start = center - window * 0.35;
  const end = center + window * 0.65;
  if (scrollProgress <= start) return 0;
  if (scrollProgress >= end) return 1;
  return (scrollProgress - start) / (end - start);
}
