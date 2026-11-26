import * as React from "react";

import { cn } from "@/lib/utils";

import { controlClass } from "./input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlClass, "min-h-28 py-2", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
