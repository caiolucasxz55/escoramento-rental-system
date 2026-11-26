"use client";

import { Select } from "@/components/ui/select";
import { STATUS_LABEL, STATUS_OPTIONS, isStatus } from "@/lib/rental-request-status";
import type { RentalRequestStatus } from "@/types";

interface StatusFilterProps {
  value?: RentalRequestStatus;
  onChange: (status?: RentalRequestStatus) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      Status
      <Select
        className="w-44"
        value={value ?? ""}
        onChange={(e) => onChange(isStatus(e.target.value) ? e.target.value : undefined)}
      >
        <option value="">Todos</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABEL[status]}
          </option>
        ))}
      </Select>
    </label>
  );
}
