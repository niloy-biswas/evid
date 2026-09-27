import { cn } from "@/lib/utils";

/** Powder-style eyebrow pill used above section headlines. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground mb-5",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />
      {children}
    </p>
  );
}
