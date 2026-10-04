import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Title + description at the top of every admin screen; `actions` sits on the right. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  const heading = (
    <div>
      <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
      {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
    </div>
  );
  if (!actions) return heading;
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      {heading}
      {actions}
    </div>
  );
}

/** Uppercase label above a form control (dashboard editor, data sources, models). */
export function Field({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const bannerBase = "rounded-lg border px-4 py-3 text-sm";

export function FormError({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(bannerBase, "border-destructive/30 bg-destructive/10 text-destructive", className)}
      {...props}
    />
  );
}

export function FormSuccess({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(bannerBase, "border-success/30 bg-success/10 text-success", className)}
      {...props}
    />
  );
}
