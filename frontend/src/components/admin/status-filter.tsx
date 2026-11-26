"use client";

import { STATUS_LABEL, STATUS_OPTIONS } from "@/lib/rental-request-status";
import { cn } from "@/lib/utils";
import type { RentalRequestStatus } from "@/types";

interface StatusFilterProps {
  value?: RentalRequestStatus;
  onChange: (status?: RentalRequestStatus) => void;
}

const OPTIONS: { value?: RentalRequestStatus; label: string }[] = [
  { label: "Todas" },
  ...STATUS_OPTIONS.map((value) => ({ value, label: STATUS_LABEL[value] })),
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filtrar por status" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
              active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-surface text-ink-muted hover:border-brand-500 hover:text-brand-600",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
