"use client";

import type { StatusCounts } from "@/hooks/use-status-counts";
import { STATUS_LABEL, STATUS_OPTIONS } from "@/lib/rental-request-status";
import { cn } from "@/lib/utils";
import type { RentalRequestStatus } from "@/types";

// mesma cor do badge de cada status, para ligar filtro e tabela de relance
const DOT: Record<RentalRequestStatus, string> = {
  PENDING: "bg-warning",
  UNDER_REVIEW: "bg-info",
  APPROVED: "bg-success",
  CANCELLED: "bg-danger",
};

const OPTIONS: { value?: RentalRequestStatus; label: string }[] = [
  { label: "Todas" },
  ...STATUS_OPTIONS.map((value) => ({ value, label: STATUS_LABEL[value] })),
];

interface StatusFilterProps {
  value?: RentalRequestStatus;
  onChange: (status?: RentalRequestStatus) => void;
  counts: StatusCounts | null;
}

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filtrar por status" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        const count = counts ? counts[option.value ?? "all"] : null;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
              active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-surface text-ink hover:border-brand-500 hover:bg-brand-50/60",
            )}
          >
            {option.value && (
              <span
                aria-hidden
                className={cn("size-2 rounded-full", DOT[option.value], active && "ring-2 ring-white/70")}
              />
            )}
            {option.label}
            {count !== null && (
              <span
                className={cn(
                  "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-canvas text-ink-muted",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
