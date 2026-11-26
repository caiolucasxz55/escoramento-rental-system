import { Check, X } from "lucide-react";

import { progressSteps } from "@/lib/rental-request-status";
import { cn } from "@/lib/utils";
import type { RentalRequestStatus } from "@/types";

export function StatusProgress({ status, className }: { status: RentalRequestStatus; className?: string }) {
  const steps = progressSteps(status);

  return (
    <ol className={cn("flex items-start", className)} aria-label="Andamento da solicitação">
      {steps.map((step, i) => {
        const cancelled = step.status === "CANCELLED";
        return (
          <li key={step.status} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2",
                  step.state === "upcoming" ? "bg-line" : cancelled ? "bg-danger" : "bg-brand-500",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                step.state === "done" && !cancelled && "border-brand-600 bg-brand-600 text-white",
                step.state === "done" && cancelled && "border-danger bg-danger text-white",
                step.state === "current" && "border-brand-600 bg-brand-50 text-brand-700",
                step.state === "upcoming" && "border-line bg-surface text-ink-muted",
              )}
              aria-current={step.state === "current" ? "step" : undefined}
            >
              {step.state === "done" ? (
                cancelled ? <X className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "mt-2 text-xs font-medium",
                step.state === "upcoming" ? "text-ink-muted" : "text-ink",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
