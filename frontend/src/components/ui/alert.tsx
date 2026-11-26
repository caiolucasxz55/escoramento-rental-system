import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm", {
  variants: {
    tone: {
      error: "bg-danger-soft text-danger",
      success: "bg-success-soft text-success",
      info: "bg-brand-50 text-brand-700",
    },
  },
  defaultVariants: { tone: "info" },
});

const ICONS = { error: CircleAlert, success: CircleCheck, info: Info };

interface AlertProps extends VariantProps<typeof alertVariants> {
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", children, className }: AlertProps) {
  const Icon = ICONS[tone ?? "info"];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn(alertVariants({ tone }), className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
