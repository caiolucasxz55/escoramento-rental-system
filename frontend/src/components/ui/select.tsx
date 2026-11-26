import * as React from "react";

import { cn } from "@/lib/utils";

import { controlClass } from "./input";

// <select> nativo: acessivel de graca e suficiente para listas curtas
export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(controlClass, "h-10 pr-8", className)} {...props} />
  ),
);
Select.displayName = "Select";
