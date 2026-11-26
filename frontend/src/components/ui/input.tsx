import * as React from "react";

import { cn } from "@/lib/utils";

export const controlClass =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted aria-invalid:border-danger";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlClass, "h-10", className)} {...props} />
  ),
);
Input.displayName = "Input";
